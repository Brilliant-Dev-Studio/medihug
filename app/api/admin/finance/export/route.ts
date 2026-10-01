import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { requireAdmin } from '@/lib/adminAuth';
import { getPnlReport, resolveWindow, type FinanceRange } from '@/lib/financeReport';

const HEADER_FILL = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFE6F7F7' } };
const HEADER_FONT = { bold: true, color: { argb: 'FF2AB5AD' } };

/* ── GET /api/admin/finance/export?range=&from=&to= — the Business Management Dashboard's
 * summary as a real multi-sheet .xlsx workbook (Summary, Business Types, Doctor Profitability,
 * Partner Profitability). Same computation as the P&L page/API — see lib/financeReport.ts. ── */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = req.nextUrl;
    const range = (['daily', 'weekly', 'monthly', 'yearly', 'custom'].includes(searchParams.get('range') || '')
      ? searchParams.get('range')
      : 'monthly') as FinanceRange;
    const { since, until } = resolveWindow(range, searchParams.get('from'), searchParams.get('to'));
    const report = await getPnlReport(range, since, until);

    const wb = new ExcelJS.Workbook();
    wb.creator = 'MediHug';
    wb.created = new Date();

    const summary = wb.addWorksheet('Summary');
    summary.columns = [{ header: 'Metric', key: 'metric', width: 28 }, { header: 'Amount (Ks)', key: 'amount', width: 18 }];
    summary.getRow(1).eachCell(c => { c.fill = HEADER_FILL; c.font = HEADER_FONT; });
    summary.addRows([
      { metric: 'Period', amount: `${since.toISOString().slice(0, 10)} to ${until.toISOString().slice(0, 10)}` },
      { metric: '', amount: '' },
      { metric: 'Sales (Total Revenue)', amount: report.revenue.total },
      { metric: 'Cost of Sales (Payout + COGS)', amount: report.cost.costOfSales },
      { metric: 'Gross Profit', amount: report.result.grossProfit },
      { metric: 'Operating Expenses', amount: report.cost.operatingExpenses },
      { metric: 'Net Profit', amount: report.result.netProfit },
      { metric: 'Net Profit Margin', amount: `${report.result.profitMargin}%` },
      { metric: '', amount: '' },
      { metric: 'Doctor Payout', amount: report.cost.doctorPayout },
      { metric: 'Product COGS', amount: report.cost.productCogs },
      { metric: 'Partner Payout (Program/Ads)', amount: report.cost.partnerPayout },
      { metric: 'Gateway Fees', amount: report.cost.gatewayFee },
      { metric: 'Expenses', amount: report.cost.expenses },
      { metric: 'Refunds', amount: report.cost.refunds },
    ]);

    const types = wb.addWorksheet('Business Types');
    types.columns = [
      { header: 'Business Type', key: 'label', width: 24 },
      { header: 'Sales', key: 'sales', width: 10 },
      { header: 'Revenue (Ks)', key: 'revenue', width: 16 },
      { header: 'Cost (Ks)', key: 'cost', width: 16 },
      { header: 'Net Profit (Ks)', key: 'netProfit', width: 16 },
      { header: 'Margin %', key: 'margin', width: 10 },
      { header: 'Note', key: 'note', width: 30 },
    ];
    types.getRow(1).eachCell(c => { c.fill = HEADER_FILL; c.font = HEADER_FONT; });
    types.addRows(report.serviceBreakdown.map(s => ({
      label: s.label, sales: s.sales, revenue: s.revenue, cost: s.cost, netProfit: s.netProfit, margin: s.margin,
      note: s.noDataSource ? 'No data source yet' : (s.note ?? ''),
    })));

    const doctors = wb.addWorksheet('Doctor Profitability');
    doctors.columns = [
      { header: 'Doctor', key: 'doctor', width: 24 },
      { header: 'Patients', key: 'patients', width: 10 },
      { header: 'Gross Revenue (Ks)', key: 'revenue', width: 18 },
      { header: 'Doctor Payout (Ks)', key: 'payout', width: 18 },
      { header: 'Platform Net (Ks)', key: 'commission', width: 16 },
    ];
    doctors.getRow(1).eachCell(c => { c.fill = HEADER_FILL; c.font = HEADER_FONT; });
    doctors.addRows(report.doctorProfitability.map(d => ({
      doctor: d.doctor?.nameEn ?? d.doctor?.name ?? 'Unknown', patients: d.patients, revenue: d.revenue, payout: d.payout, commission: d.commission,
    })));

    const partners = wb.addWorksheet('Partner Profitability');
    partners.columns = [
      { header: 'Partner / Clinic', key: 'clinic', width: 24 },
      { header: 'Appointments', key: 'appointments', width: 12 },
      { header: 'Revenue (Ks)', key: 'revenue', width: 16 },
      { header: 'Platform Commission (Ks)', key: 'commission', width: 20 },
      { header: 'Program Revenue (Ks)', key: 'programRevenue', width: 18 },
      { header: 'Referrals Received', key: 'referrals', width: 16 },
    ];
    partners.getRow(1).eachCell(c => { c.fill = HEADER_FILL; c.font = HEADER_FONT; });
    partners.addRows(report.clinicProfitability.map(c => ({
      clinic: c.clinic?.nameEn ?? c.clinic?.name ?? 'Unknown', appointments: c.appointments, revenue: c.revenue,
      commission: c.platformCommission, programRevenue: c.programRevenue, referrals: c.referralsReceived,
    })));

    const buffer = await wb.xlsx.writeBuffer();
    const filename = `medihug-business-dashboard-${range}-${new Date().toISOString().slice(0, 10)}.xlsx`;

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
