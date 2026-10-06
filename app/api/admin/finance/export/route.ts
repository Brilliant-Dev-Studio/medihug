import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { requireAdmin } from '@/lib/adminAuth';
import { getPnlReport, getPartnerReport, getProductReport, getCashFlowTotals, resolveWindow, type FinanceRange } from '@/lib/financeReport';

const HEADER_FILL = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFE6F7F7' } };
const HEADER_FONT = { bold: true, color: { argb: 'FF2AB5AD' } };

/* ── GET /api/admin/finance/export?range=&from=&to= — the Business Management Dashboard as a
 * real multi-sheet .xlsx workbook: Summary, Business Types, P&L (cost detail), Cash Flow,
 * Doctor Detail, Partner Detail, Product Detail, Expense Detail. Same computations as the
 * individual report pages — see lib/financeReport.ts. ── */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = req.nextUrl;
    const range = (['daily', 'weekly', 'monthly', 'yearly', 'custom'].includes(searchParams.get('range') || '')
      ? searchParams.get('range')
      : 'monthly') as FinanceRange;
    const { since, until } = resolveWindow(range, searchParams.get('from'), searchParams.get('to'));
    const [report, partners, products, cashFlow] = await Promise.all([
      getPnlReport(range, since, until),
      getPartnerReport(since, until),
      getProductReport(since, until),
      getCashFlowTotals(since, until),
    ]);

    const wb = new ExcelJS.Workbook();
    wb.creator = 'MediHug';
    wb.created = new Date();
    const styleHeader = (sheet: ExcelJS.Worksheet) => sheet.getRow(1).eachCell(c => { c.fill = HEADER_FILL; c.font = HEADER_FONT; });

    const summary = wb.addWorksheet('Summary');
    summary.columns = [{ header: 'Metric', key: 'metric', width: 30 }, { header: 'Amount (Ks)', key: 'amount', width: 18 }];
    styleHeader(summary);
    summary.addRows([
      { metric: 'Period', amount: `${since.toISOString().slice(0, 10)} to ${until.toISOString().slice(0, 10)}` },
      { metric: '', amount: '' },
      { metric: 'Revenue (Sales)', amount: report.revenue.total },
      { metric: `  vs previous period`, amount: report.growth.revenue === null ? 'new' : `${report.growth.revenue}%` },
      { metric: 'Cost of Sales', amount: report.cost.costOfSales },
      { metric: 'Gross Profit', amount: report.result.grossProfit },
      { metric: 'Operating Expenses', amount: report.cost.operatingExpenses },
      { metric: 'Operating Profit', amount: report.result.operatingProfit },
      { metric: 'Other Income/Expense', amount: report.result.otherIncome - report.result.otherExpense },
      { metric: 'Net Profit', amount: report.result.netProfit },
      { metric: 'Net Profit Margin', amount: `${report.result.profitMargin}%` },
      { metric: '', amount: '' },
      { metric: 'Investment / CAPEX (not in Net Profit)', amount: report.cost.capex },
      { metric: 'Cash Balance (period net)', amount: cashFlow.netCashFlow },
      { metric: '', amount: '' },
      { metric: 'Total Appointment Bookings', amount: report.appointmentPerformance.total },
      { metric: 'Completed', amount: report.appointmentPerformance.completed },
      { metric: 'Cancelled', amount: report.appointmentPerformance.cancelled },
      { metric: 'Completion Rate', amount: `${report.appointmentPerformance.completionRate}%` },
      { metric: 'Cancellation Rate', amount: `${report.appointmentPerformance.cancellationRate}%` },
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
    styleHeader(types);
    types.addRows(report.serviceBreakdown.map(s => ({
      label: s.label, sales: s.sales, revenue: s.revenue, cost: s.cost, netProfit: s.netProfit, margin: s.margin,
      note: s.noDataSource ? 'No data source yet' : (s.note ?? ''),
    })));

    const cash = wb.addWorksheet('Cash Flow');
    cash.columns = [{ header: 'Line', key: 'line', width: 30 }, { header: 'Amount (Ks)', key: 'amount', width: 18 }];
    styleHeader(cash);
    cash.addRows([
      { line: 'CASH IN', amount: '' },
      { line: 'Doctor Consultation', amount: cashFlow.cashInByType.consultation },
      { line: 'Product / E-commerce', amount: cashFlow.cashInByType.product },
      { line: 'Weight / Other Programs', amount: cashFlow.cashInByType.program },
      { line: 'Total Cash In', amount: cashFlow.totalCashIn },
      { line: '', amount: '' },
      { line: 'CASH OUT', amount: '' },
      { line: 'Doctor Payout', amount: cashFlow.cashOutByType.doctorPayout },
      { line: 'Product Purchase (Suppliers)', amount: cashFlow.cashOutByType.productPurchase },
      { line: 'Operating Expenses', amount: cashFlow.cashOutByType.operatingExpenses },
      { line: 'Investment / CAPEX', amount: cashFlow.cashOutByType.capex },
      { line: 'Refunds', amount: cashFlow.cashOutByType.refunds },
      { line: 'Total Cash Out', amount: cashFlow.totalCashOut },
      { line: '', amount: '' },
      { line: 'Net Cash Flow', amount: cashFlow.netCashFlow },
    ]);

    const doctors = wb.addWorksheet('Doctor Detail');
    doctors.columns = [
      { header: 'Doctor', key: 'doctor', width: 24 },
      { header: 'Patients', key: 'patients', width: 10 },
      { header: 'Gross Revenue (Ks)', key: 'revenue', width: 18 },
      { header: 'Doctor Payout (Ks)', key: 'payout', width: 18 },
      { header: 'Platform Net (Ks)', key: 'commission', width: 16 },
    ];
    styleHeader(doctors);
    doctors.addRows(report.doctorProfitability.map(d => ({
      doctor: d.doctor?.nameEn ?? d.doctor?.name ?? 'Unknown', patients: d.patients, revenue: d.revenue, payout: d.payout, commission: d.commission,
    })));

    const partnerSheet = wb.addWorksheet('Partner Detail');
    partnerSheet.columns = [
      { header: 'Partner', key: 'clinic', width: 24 },
      { header: 'Type', key: 'type', width: 18 },
      { header: 'Sales (Ks)', key: 'sales', width: 14 },
      { header: 'Referrals', key: 'referrals', width: 10 },
      { header: 'Commission (Ks)', key: 'commission', width: 16 },
      { header: 'Payable (Ks)', key: 'payable', width: 14 },
      { header: 'Settled (Ks)', key: 'settled', width: 14 },
      { header: 'Partner Profit (Ks)', key: 'profit', width: 16 },
      { header: 'Programs Listed', key: 'programsListed', width: 14 },
    ];
    styleHeader(partnerSheet);
    partnerSheet.addRows(partners.map(p => ({
      clinic: p.clinic?.nameEn ?? p.clinic?.name ?? 'Unknown', type: p.clinic?.type ?? '',
      sales: p.sales, referrals: p.referrals, commission: p.commission,
      payable: p.payableUnsettled, settled: p.settled, profit: p.profit, programsListed: p.programsListed,
    })));

    const productSheet = wb.addWorksheet('Product Detail');
    productSheet.columns = [
      { header: 'Product', key: 'product', width: 28 },
      { header: 'Purchase Price (Ks)', key: 'purchasePrice', width: 18 },
      { header: 'Selling Price (Ks)', key: 'sellingPrice', width: 16 },
      { header: 'Qty Sold', key: 'qtySold', width: 10 },
      { header: 'Stock Balance', key: 'stockBalance', width: 14 },
      { header: 'Revenue (Ks)', key: 'revenue', width: 14 },
      { header: 'COGS (Ks)', key: 'cogs', width: 14 },
      { header: 'Gross Profit (Ks)', key: 'grossProfit', width: 16 },
      { header: 'Margin %', key: 'margin', width: 10 },
    ];
    styleHeader(productSheet);
    productSheet.addRows(products.map(p => ({
      product: p.nameEn ?? p.name, purchasePrice: p.purchasePrice, sellingPrice: p.sellingPrice,
      qtySold: p.qtySold, stockBalance: p.stockBalance, revenue: p.revenue, cogs: p.cogs, grossProfit: p.grossProfit, margin: p.margin,
    })));

    const expenseSheet = wb.addWorksheet('Expense Detail');
    expenseSheet.columns = [
      { header: 'Category', key: 'name', width: 28 },
      { header: 'Classification', key: 'classification', width: 16 },
      { header: 'Type', key: 'type', width: 14 },
      { header: 'Amount (Ks)', key: 'amount', width: 16 },
    ];
    styleHeader(expenseSheet);
    expenseSheet.addRows([...report.expensesByCategory].sort((a, b) => b.amount - a.amount).map(e => ({
      name: e.name, classification: e.isCapital ? 'CAPEX' : 'OPEX', type: e.type, amount: e.amount,
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
