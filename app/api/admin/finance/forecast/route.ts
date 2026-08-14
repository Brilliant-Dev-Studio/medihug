import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';

const MONTHS_BACK = 3;

/* ── GET /api/admin/finance/forecast ──
   Naive 3-month moving-average projection for next month, plus break-even revenue
   based on current average margin. */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const now = new Date();
  const months: { label: string; start: Date; end: Date }[] = [];
  for (let i = MONTHS_BACK - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    months.push({ label: start.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), start, end });
  }
  const rangeStart = months[0].start;
  const rangeEnd = months[months.length - 1].end;

  const [appointments, orders, expenses] = await Promise.all([
    db.appointment.findMany({
      where: { status: 'COMPLETED', date: { gte: rangeStart, lt: rangeEnd } },
      select: { date: true, fee: true },
    }),
    db.order.findMany({
      where: { status: 'COMPLETED', createdAt: { gte: rangeStart, lt: rangeEnd } },
      select: { createdAt: true, totalAmount: true },
    }),
    db.expense.findMany({
      where: { date: { gte: rangeStart, lt: rangeEnd } },
      select: { date: true, amount: true },
    }),
  ]);

  const history = months.map(({ label, start, end }) => {
    const revenue = appointments.filter(a => a.date >= start && a.date < end).reduce((s, a) => s + (a.fee ?? 0), 0)
      + orders.filter(o => o.createdAt >= start && o.createdAt < end).reduce((s, o) => s + o.totalAmount, 0);
    const expense = expenses.filter(e => e.date >= start && e.date < end).reduce((s, e) => s + e.amount, 0);
    return { month: label, revenue, expense };
  });

  const avgRevenue = Math.round(history.reduce((s, h) => s + h.revenue, 0) / history.length);
  const avgExpense = Math.round(history.reduce((s, h) => s + h.expense, 0) / history.length);
  const projectedProfit = avgRevenue - avgExpense;

  // Break-even: revenue needed to cover average costs (profit = 0), holding avg expense constant.
  const breakEvenRevenue = avgExpense;

  return NextResponse.json({
    history,
    projectedRevenue: avgRevenue,
    projectedExpense: avgExpense,
    projectedProfit,
    breakEvenRevenue,
  });
}
