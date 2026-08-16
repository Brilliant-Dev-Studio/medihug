import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';

function dayBounds(dateStr: string) {
  const start = new Date(dateStr);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

/* ── GET /api/admin/finance/reconciliation?date=YYYY-MM-DD ──
   System sales per payment method for the day, joined with any saved bank-received amount. */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dateStr = req.nextUrl.searchParams.get('date') ?? new Date().toISOString().slice(0, 10);
  const { start, end } = dayBounds(dateStr);

  const [appointments, orders, entries] = await Promise.all([
    db.appointment.findMany({
      where: { status: 'COMPLETED', date: { gte: start, lt: end }, paymentMethod: { not: null } },
      select: { fee: true, paymentMethod: true },
    }),
    db.order.findMany({
      where: { status: 'COMPLETED', createdAt: { gte: start, lt: end }, paymentMethod: { not: null } },
      select: { totalAmount: true, paymentMethod: true },
    }),
    db.reconciliationEntry.findMany({ where: { date: start } }),
  ]);

  const systemByMethod = new Map<string, number>();
  for (const a of appointments) {
    if (!a.paymentMethod) continue;
    systemByMethod.set(a.paymentMethod, (systemByMethod.get(a.paymentMethod) ?? 0) + (a.fee ?? 0));
  }
  for (const o of orders) {
    if (!o.paymentMethod) continue;
    systemByMethod.set(o.paymentMethod, (systemByMethod.get(o.paymentMethod) ?? 0) + o.totalAmount);
  }

  const entryByMethod = new Map(entries.map(e => [e.paymentMethod, e]));
  const methods = new Set([...systemByMethod.keys(), ...entryByMethod.keys()]);

  const rows = [...methods].map(paymentMethod => {
    const systemAmount = systemByMethod.get(paymentMethod) ?? 0;
    const entry = entryByMethod.get(paymentMethod);
    const bankAmount = entry?.bankAmount ?? 0;
    return {
      paymentMethod,
      systemAmount,
      bankAmount,
      difference: systemAmount - bankAmount,
      note: entry?.note ?? null,
      saved: !!entry,
    };
  }).sort((a, b) => a.paymentMethod.localeCompare(b.paymentMethod));

  return NextResponse.json({ date: dateStr, rows });
}

/* ── POST /api/admin/finance/reconciliation ── */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { date, paymentMethod, bankAmount, note } = await req.json();
    if (!date || !paymentMethod || typeof bankAmount !== 'number' || bankAmount < 0) {
      return NextResponse.json({ error: 'date, paymentMethod, and a non-negative bankAmount are required.' }, { status: 400 });
    }
    const { start, end } = dayBounds(date);

    const [appointments, orders] = await Promise.all([
      db.appointment.findMany({
        where: { status: 'COMPLETED', date: { gte: start, lt: end }, paymentMethod },
        select: { fee: true },
      }),
      db.order.findMany({
        where: { status: 'COMPLETED', createdAt: { gte: start, lt: end }, paymentMethod },
        select: { totalAmount: true },
      }),
    ]);
    const systemAmount = appointments.reduce((s, a) => s + (a.fee ?? 0), 0)
      + orders.reduce((s, o) => s + o.totalAmount, 0);

    const entry = await db.reconciliationEntry.upsert({
      where: { date_paymentMethod: { date: start, paymentMethod } },
      update: { systemAmount, bankAmount, note: note || null, createdBy: admin.name },
      create: { date: start, paymentMethod, systemAmount, bankAmount, note: note || null, createdBy: admin.name },
    });
    return NextResponse.json({ entry });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
