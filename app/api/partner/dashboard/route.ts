import { NextRequest, NextResponse } from 'next/server';
import { verifyPartnerToken } from '@/lib/jwt';
import { db } from '@/lib/db';

/* ── GET /api/partner/dashboard — 14-day trend for Appointments, Orders, Revenue, Referrals ── */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('partner_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyPartnerToken(token);
    const clinicId = payload?.clinicId;
    if (!clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const rangeStart = new Date(todayStart);
    rangeStart.setDate(rangeStart.getDate() - 13); // 14 days inclusive

    const [appointments, orders, referrals, revenueEntries, doctorCount, productCount] = await Promise.all([
      db.appointment.findMany({
        where: { clinicId, createdAt: { gte: rangeStart, lte: todayEnd } },
        select: { createdAt: true },
      }),
      db.order.findMany({
        where: {
          createdAt: { gte: rangeStart, lte: todayEnd },
          items: { some: { product: { clinics: { some: { clinicId } } } } },
        },
        select: {
          createdAt: true,
          items: { select: { quantity: true, price: true, product: { select: { clinics: { select: { clinicId: true } } } } } },
        },
      }),
      db.clinicReferral.findMany({
        where: { clinicId, createdAt: { gte: rangeStart, lte: todayEnd } },
        select: { createdAt: true, verifiedAt: true },
      }),
      db.revenueEntry.findMany({
        where: { clinicId, date: { gte: rangeStart, lte: todayEnd } },
        select: { date: true, partnerAmount: true, amount: true },
      }),
      db.clinicDoctor.count({ where: { clinicId } }),
      db.clinicProduct.count({ where: { clinicId } }),
    ]);

    // Bucket into the last 14 calendar days
    const days: { key: string; label: string }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(todayStart);
      d.setDate(d.getDate() - i);
      days.push({ key: d.toDateString(), label: d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }) });
    }

    const orderRevenueByDay = (key: string) => orders
      .filter(o => o.createdAt.toDateString() === key)
      .reduce((sum, o) => sum + o.items
        .filter(i => i.product.clinics.some(c => c.clinicId === clinicId))
        .reduce((s, i) => s + i.price * i.quantity, 0), 0);

    const revenueEntryByDay = (key: string) => revenueEntries
      .filter(r => r.date.toDateString() === key)
      .reduce((sum, r) => sum + (r.partnerAmount ?? r.amount), 0);

    const trend = days.map(({ key, label }) => ({
      day: label,
      appointments: appointments.filter(a => a.createdAt.toDateString() === key).length,
      orders: orders.filter(o => o.createdAt.toDateString() === key).length,
      referrals: referrals.filter(r => r.createdAt.toDateString() === key).length,
      revenue: orderRevenueByDay(key) + revenueEntryByDay(key),
    }));

    const totals = trend.reduce((acc, t) => ({
      appointments: acc.appointments + t.appointments,
      orders: acc.orders + t.orders,
      referrals: acc.referrals + t.referrals,
      revenue: acc.revenue + t.revenue,
    }), { appointments: 0, orders: 0, referrals: 0, revenue: 0 });

    return NextResponse.json({
      trend, totals,
      counts: { doctors: doctorCount, products: productCount },
    });
  } catch (e) {
    console.error('GET /api/partner/dashboard failed:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
