import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { getPaymentMethodFee } from '@/lib/commission';

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

/* ── GET /api/admin/finance/pnl?range=daily|weekly|monthly|yearly&from=&to= ──
   Revenue - payout - gateway fees - expenses = net profit, plus service/partner
   profitability breakdowns. Only COMPLETED appointments/orders count as realized revenue. */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const range = (['daily', 'weekly', 'monthly', 'yearly'].includes(searchParams.get('range') || '')
      ? searchParams.get('range')
      : 'monthly') as Range;
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    const since = fromParam ? new Date(fromParam) : rangeStart(range);
    const until = toParam ? new Date(toParam) : new Date();

    const [appointments, orders, expenses, refunds, revenueEntries, clinicReferrals] = await Promise.all([
      db.appointment.findMany({
        where: { status: 'COMPLETED', date: { gte: since, lte: until } },
        select: {
          date: true, fee: true, platformFeeAmount: true, doctorPayoutAmount: true,
          paymentMethod: true, doctorId: true, clinicId: true,
          doctor: { select: { id: true, name: true, nameEn: true, imageUrl: true } },
          clinic: { select: { id: true, name: true, nameEn: true, imageUrl: true } },
        },
      }),
      db.order.findMany({
        where: { status: 'COMPLETED', createdAt: { gte: since, lte: until } },
        select: {
          createdAt: true, paymentMethod: true,
          items: { select: { price: true, quantity: true } },
        },
      }),
      db.expense.findMany({
        where: { date: { gte: since, lte: until } },
        include: { category: true },
      }),
      db.refund.aggregate({ where: { createdAt: { gte: since, lte: until } }, _sum: { amount: true } }),
      db.revenueEntry.findMany({
        where: { date: { gte: since, lte: until } },
        select: { serviceType: true, amount: true, platformAmount: true, partnerAmount: true, clinicId: true },
      }),
      db.clinicReferral.findMany({
        where: { createdAt: { gte: since, lte: until } },
        select: { clinicId: true },
      }),
    ]);

    const consultationRevenue = appointments.reduce((s, a) => s + (a.fee ?? 0), 0);
    const doctorPayout = appointments.reduce((s, a) => s + (a.doctorPayoutAmount ?? 0), 0);
    const platformCommission = appointments.reduce((s, a) => s + (a.platformFeeAmount ?? 0), 0);
    const productRevenue = orders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.price * i.quantity, 0), 0);

    // Gateway fee estimated per distinct payment method present in range, applied to that method's volume.
    const methodVolumes = new Map<string, number>();
    for (const a of appointments) {
      if (!a.paymentMethod || !a.fee) continue;
      methodVolumes.set(a.paymentMethod, (methodVolumes.get(a.paymentMethod) ?? 0) + a.fee);
    }
    for (const o of orders) {
      if (!o.paymentMethod) continue;
      const total = o.items.reduce((s, i) => s + i.price * i.quantity, 0);
      methodVolumes.set(o.paymentMethod, (methodVolumes.get(o.paymentMethod) ?? 0) + total);
    }
    let gatewayFee = 0;
    const txnCount = appointments.filter(a => a.paymentMethod).length + orders.filter(o => o.paymentMethod).length;
    for (const [method, volume] of methodVolumes) {
      const { feePercent, feeFixed } = await getPaymentMethodFee(method);
      const methodTxnCount = appointments.filter(a => a.paymentMethod === method).length
        + orders.filter(o => o.paymentMethod === method).length;
      gatewayFee += Math.round(volume * feePercent / 100) + feeFixed * methodTxnCount;
    }

    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const expensesByCategory = new Map<string, { name: string; type: string; amount: number }>();
    for (const e of expenses) {
      const existing = expensesByCategory.get(e.categoryId);
      if (existing) existing.amount += e.amount;
      else expensesByCategory.set(e.categoryId, { name: e.category.name, type: e.category.type, amount: e.amount });
    }

    const totalRefunds = refunds._sum.amount ?? 0;

    const programRevenue = revenueEntries.filter(r => r.serviceType === 'PROGRAM').reduce((s, r) => s + r.amount, 0);
    const adsRevenue = revenueEntries.filter(r => r.serviceType === 'ADS').reduce((s, r) => s + r.amount, 0);
    // Partner clinic's payout share when a program/ads entry is split via a commission rule (null = 100% platform).
    const programAdsPartnerPayout = revenueEntries.reduce((s, r) => s + (r.partnerAmount ?? 0), 0);

    const totalRevenue = consultationRevenue + productRevenue + programRevenue + adsRevenue;
    const grossProfit = totalRevenue - doctorPayout - programAdsPartnerPayout;
    const netProfit = grossProfit - gatewayFee - totalExpenses - totalRefunds;
    const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 1000) / 10 : 0;

    // Service-wise profitability
    const serviceBreakdown = [
      {
        serviceType: 'CONSULTATION',
        sales: appointments.length,
        revenue: consultationRevenue,
        cost: doctorPayout,
        netProfit: consultationRevenue - doctorPayout,
        margin: consultationRevenue > 0 ? Math.round(((consultationRevenue - doctorPayout) / consultationRevenue) * 1000) / 10 : 0,
      },
      {
        serviceType: 'PRODUCT',
        sales: orders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0), 0),
        revenue: productRevenue,
        cost: 0,
        netProfit: productRevenue,
        margin: productRevenue > 0 ? 100 : 0,
      },
      {
        serviceType: 'PROGRAM',
        sales: revenueEntries.filter(r => r.serviceType === 'PROGRAM').length,
        revenue: programRevenue,
        cost: revenueEntries.filter(r => r.serviceType === 'PROGRAM').reduce((s, r) => s + (r.partnerAmount ?? 0), 0),
        netProfit: programRevenue - revenueEntries.filter(r => r.serviceType === 'PROGRAM').reduce((s, r) => s + (r.partnerAmount ?? 0), 0),
        margin: programRevenue > 0 ? Math.round(((programRevenue - revenueEntries.filter(r => r.serviceType === 'PROGRAM').reduce((s, r) => s + (r.partnerAmount ?? 0), 0)) / programRevenue) * 1000) / 10 : 0,
      },
      {
        serviceType: 'ADS',
        sales: revenueEntries.filter(r => r.serviceType === 'ADS').length,
        revenue: adsRevenue,
        cost: revenueEntries.filter(r => r.serviceType === 'ADS').reduce((s, r) => s + (r.partnerAmount ?? 0), 0),
        netProfit: adsRevenue - revenueEntries.filter(r => r.serviceType === 'ADS').reduce((s, r) => s + (r.partnerAmount ?? 0), 0),
        margin: adsRevenue > 0 ? Math.round(((adsRevenue - revenueEntries.filter(r => r.serviceType === 'ADS').reduce((s, r) => s + (r.partnerAmount ?? 0), 0)) / adsRevenue) * 1000) / 10 : 0,
      },
    ];

    // Partner/clinic profitability
    const clinicMap = new Map<string, {
      clinic: { id: string; name: string; nameEn: string | null; imageUrl: string | null } | null;
      appointments: number; revenue: number; platformCommission: number; programRevenue: number; referralsReceived: number;
    }>();
    for (const a of appointments) {
      if (!a.clinicId) continue;
      const existing = clinicMap.get(a.clinicId);
      if (existing) {
        existing.appointments += 1;
        existing.revenue += a.fee ?? 0;
        existing.platformCommission += a.platformFeeAmount ?? 0;
      } else {
        clinicMap.set(a.clinicId, {
          clinic: a.clinic, appointments: 1,
          revenue: a.fee ?? 0, platformCommission: a.platformFeeAmount ?? 0,
          programRevenue: 0, referralsReceived: 0,
        });
      }
    }
    for (const r of revenueEntries) {
      if (!r.clinicId) continue;
      const existing = clinicMap.get(r.clinicId);
      if (existing) existing.programRevenue += r.amount;
      else clinicMap.set(r.clinicId, {
        clinic: null, appointments: 0, revenue: 0, platformCommission: 0,
        programRevenue: r.amount, referralsReceived: 0,
      });
    }
    for (const ref of clinicReferrals) {
      const existing = clinicMap.get(ref.clinicId);
      if (existing) existing.referralsReceived += 1;
    }
    const clinicProfitability = [...clinicMap.values()]
      .sort((a, b) => (b.revenue + b.programRevenue) - (a.revenue + a.programRevenue))
      .slice(0, 20);

    // Partner/doctor profitability
    const doctorMap = new Map<string, {
      doctor: { id: string; name: string; nameEn: string | null; imageUrl: string | null } | null;
      patients: number; revenue: number; payout: number; commission: number;
    }>();
    for (const a of appointments) {
      const existing = doctorMap.get(a.doctorId);
      if (existing) {
        existing.patients += 1;
        existing.revenue += a.fee ?? 0;
        existing.payout += a.doctorPayoutAmount ?? 0;
        existing.commission += a.platformFeeAmount ?? 0;
      } else {
        doctorMap.set(a.doctorId, {
          doctor: a.doctor, patients: 1,
          revenue: a.fee ?? 0, payout: a.doctorPayoutAmount ?? 0, commission: a.platformFeeAmount ?? 0,
        });
      }
    }
    const doctorProfitability = [...doctorMap.values()]
      .map(d => ({ ...d, net: d.commission }))
      .sort((a, b) => b.commission - a.commission)
      .slice(0, 20);

    // Chart series bucketed by range
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

    const series = buckets.map(({ label, start, end }) => {
      const apptInBucket = appointments.filter(a => a.date >= start && a.date < end);
      const ordersInBucket = orders.filter(o => o.createdAt >= start && o.createdAt < end);
      const revenue = apptInBucket.reduce((s, a) => s + (a.fee ?? 0), 0)
        + ordersInBucket.reduce((s, o) => s + o.items.reduce((si, i) => si + i.price * i.quantity, 0), 0);
      const payout = apptInBucket.reduce((s, a) => s + (a.doctorPayoutAmount ?? 0), 0);
      return { label, revenue, netProfit: revenue - payout };
    });

    return NextResponse.json({
      range, since, until,
      revenue: { consultation: consultationRevenue, product: productRevenue, program: programRevenue, ads: adsRevenue, total: totalRevenue },
      cost: { doctorPayout, gatewayFee, expenses: totalExpenses, refunds: totalRefunds, partnerPayout: programAdsPartnerPayout, txnCount },
      result: { grossProfit, netProfit, profitMargin, platformCommission },
      serviceBreakdown,
      doctorProfitability,
      clinicProfitability,
      expensesByCategory: [...expensesByCategory.values()],
      series,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
