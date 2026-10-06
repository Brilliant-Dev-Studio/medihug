import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';

type Range = 'daily' | 'weekly' | 'monthly' | 'yearly';

function rangeStart(range: Range): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (range === 'daily') d.setDate(d.getDate() - 29);
  else if (range === 'weekly') d.setDate(d.getDate() - 7 * 11);
  else if (range === 'monthly') { d.setDate(1); d.setMonth(d.getMonth() - 11); }
  else { d.setMonth(0, 1); d.setFullYear(d.getFullYear() - 4); }
  return d;
}

/* ── GET /api/admin/finance/cashflow?range=daily|weekly|monthly|yearly ──
   Cash in (completed appointment/product-order/approved-program amounts) vs cash out
   (doctor payouts + supplier purchases + expenses + refunds — CAPEX reported separately
   from Operating cash out), with a running cumulative balance across the selected range —
   distinct from P&L's accrual profit view. */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const range = (['daily', 'weekly', 'monthly', 'yearly'].includes(req.nextUrl.searchParams.get('range') || '')
      ? req.nextUrl.searchParams.get('range')
      : 'monthly') as Range;
    const since = rangeStart(range);
    const until = new Date();

    const [appointments, orders, programEnrollments, purchases, expenses, refunds] = await Promise.all([
      db.appointment.findMany({
        where: { status: 'COMPLETED', date: { gte: since, lte: until } },
        select: { date: true, fee: true, doctorPayoutAmount: true },
      }),
      db.order.findMany({
        where: { status: 'COMPLETED', createdAt: { gte: since, lte: until } },
        select: { createdAt: true, totalAmount: true },
      }),
      // Real program cash-in source (RevenueEntry is never written for programs).
      db.programEnrollment.findMany({
        where: { status: 'APPROVED', createdAt: { gte: since, lte: until } },
        select: { createdAt: true, amount: true },
      }),
      // Supplier purchases actually paid for (RECEIVED/PARTIAL) — the "Product purchase"
      // cash-out line. ORDERED-but-not-yet-received purchases haven't moved cash yet.
      db.purchase.findMany({
        where: { status: { in: ['RECEIVED', 'PARTIAL'] }, purchaseDate: { gte: since, lte: until } },
        select: { purchaseDate: true, totalAmount: true },
      }),
      db.expense.findMany({
        where: { date: { gte: since, lte: until } },
        select: { date: true, amount: true, category: { select: { isCapital: true } } },
      }),
      db.refund.findMany({
        where: { createdAt: { gte: since, lte: until } },
        select: { createdAt: true, amount: true },
      }),
    ]);

    const opexExpenses = expenses.filter(e => !e.category.isCapital);
    const capexExpenses = expenses.filter(e => e.category.isCapital);

    const buckets: { label: string; start: Date; end: Date }[] = [];
    if (range === 'daily') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
        const end = new Date(d); end.setDate(end.getDate() + 1);
        buckets.push({ label: d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }), start: d, end });
      }
    } else if (range === 'weekly') {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - 7 * i);
        const end = new Date(d); end.setDate(end.getDate() + 7);
        buckets.push({ label: d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }), start: d, end });
      }
    } else if (range === 'monthly') {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); d.setMonth(d.getMonth() - i);
        const end = new Date(d); end.setMonth(end.getMonth() + 1);
        buckets.push({ label: d.toLocaleDateString('en-US', { month: 'short' }), start: d, end });
      }
    } else {
      for (let i = 4; i >= 0; i--) {
        const d = new Date(); d.setMonth(0, 1); d.setHours(0, 0, 0, 0); d.setFullYear(d.getFullYear() - i);
        const end = new Date(d); end.setFullYear(end.getFullYear() + 1);
        buckets.push({ label: String(d.getFullYear()), start: d, end });
      }
    }

    let cumulative = 0;
    const series = buckets.map(({ label, start, end }) => {
      const cashIn = appointments.filter(a => a.date >= start && a.date < end).reduce((s, a) => s + (a.fee ?? 0), 0)
        + orders.filter(o => o.createdAt >= start && o.createdAt < end).reduce((s, o) => s + o.totalAmount, 0)
        + programEnrollments.filter(p => p.createdAt >= start && p.createdAt < end).reduce((s, p) => s + p.amount, 0);
      const cashOut = appointments.filter(a => a.date >= start && a.date < end).reduce((s, a) => s + (a.doctorPayoutAmount ?? 0), 0)
        + purchases.filter(p => p.purchaseDate >= start && p.purchaseDate < end).reduce((s, p) => s + p.totalAmount, 0)
        + opexExpenses.filter(e => e.date >= start && e.date < end).reduce((s, e) => s + e.amount, 0)
        + capexExpenses.filter(e => e.date >= start && e.date < end).reduce((s, e) => s + e.amount, 0)
        + refunds.filter(r => r.createdAt >= start && r.createdAt < end).reduce((s, r) => s + r.amount, 0);
      const net = cashIn - cashOut;
      cumulative += net;
      return { label, cashIn, cashOut, net, cumulative };
    });

    const totalCashIn = series.reduce((s, b) => s + b.cashIn, 0);
    const totalCashOut = series.reduce((s, b) => s + b.cashOut, 0);

    const cashInByType = {
      consultation: appointments.reduce((s, a) => s + (a.fee ?? 0), 0),
      product: orders.reduce((s, o) => s + o.totalAmount, 0),
      program: programEnrollments.reduce((s, p) => s + p.amount, 0),
    };
    const cashOutByType = {
      doctorPayout: appointments.reduce((s, a) => s + (a.doctorPayoutAmount ?? 0), 0),
      productPurchase: purchases.reduce((s, p) => s + p.totalAmount, 0),
      operatingExpenses: opexExpenses.reduce((s, e) => s + e.amount, 0),
      capex: capexExpenses.reduce((s, e) => s + e.amount, 0),
      refunds: refunds.reduce((s, r) => s + r.amount, 0),
    };

    return NextResponse.json({
      range, series,
      totalCashIn, totalCashOut,
      netCashFlow: totalCashIn - totalCashOut,
      closingBalance: cumulative,
      cashInByType, cashOutByType,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
