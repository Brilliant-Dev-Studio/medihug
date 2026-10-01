import { db } from '@/lib/db';
import { getPaymentMethodFee } from '@/lib/commission';

export type FinanceRange = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export function rangeStart(range: FinanceRange): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (range === 'daily') d.setDate(d.getDate() - 29);
  else if (range === 'weekly') d.setDate(d.getDate() - 7 * 11);
  else if (range === 'monthly') { d.setDate(1); d.setMonth(d.getMonth() - 11); }
  else { d.setMonth(0, 1); d.setFullYear(d.getFullYear() - 4); }
  return d;
}

export function resolveWindow(range: FinanceRange, fromParam: string | null, toParam: string | null): { since: Date; until: Date } {
  const since = fromParam ? new Date(fromParam) : rangeStart(range === 'custom' ? 'monthly' : range);
  const until = toParam ? new Date(toParam) : new Date();
  return { since, until };
}

// The one ProgramCategory the client tracks as its own business line today; every other
// HealthcareProgram category rolls up into "Other Programs" until more categories are split out.
const WEIGHT_PROGRAM_CATEGORY_NAME_EN = 'Comprehensive Weight Management Program';

/** The platform-wide P&L for a date window: Sales → Cost of Sales → Gross Profit → Operating
 * Expenses → Net Profit, plus business-type, doctor and partner breakdowns. Shared by the P&L
 * page's API, the Dashboard's summary widget, and the Excel export — one computation, several
 * presentations. Only COMPLETED appointments/orders and APPROVED program enrollments count as
 * realized revenue. */
export async function getPnlReport(range: FinanceRange, since: Date, until: Date) {
  const [
    appointments, orders, expenses, refunds, revenueEntries, clinicReferrals,
    programEnrollments, medicalRequests, purchaseItemCosts,
  ] = await Promise.all([
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
        items: { select: { productId: true, price: true, quantity: true } },
      },
    }),
    db.expense.findMany({
      where: { date: { gte: since, lte: until } },
      include: { category: true },
    }),
    db.refund.aggregate({ where: { createdAt: { gte: since, lte: until } }, _sum: { amount: true } }),
    // ADS has no live writer yet (ad purchases aren't a built flow) — kept so the row exists
    // once one is, rather than inventing numbers for it now.
    db.revenueEntry.findMany({
      where: { date: { gte: since, lte: until }, serviceType: 'ADS' },
      select: { amount: true, partnerAmount: true },
    }),
    db.clinicReferral.findMany({
      where: { createdAt: { gte: since, lte: until } },
      select: { clinicId: true },
    }),
    // Real program revenue source (RevenueEntry is never written for programs) — amount is
    // already the final, post-discount charge, same convention as Appointment.fee.
    db.programEnrollment.findMany({
      where: { status: 'APPROVED', createdAt: { gte: since, lte: until } },
      select: {
        amount: true, createdAt: true,
        program: { select: { id: true, categoryId: true, category: { select: { nameEn: true } } } },
      },
    }),
    // International Hospital Representative pipeline — counted here as a business type;
    // no commission model is wired to it yet (Phase 2), so its revenue/cost stay 0.
    db.medicalRequest.count({ where: { status: 'COMPLETED', createdAt: { gte: since, lte: until } } }),
    // Historical weighted-average cost per product, from every Purchase ever received —
    // not range-filtered: cost basis predates the reporting window, same as any inventory system.
    db.purchaseItem.groupBy({ by: ['productId'], _sum: { lineTotal: true, receivedQty: true } }),
  ]);

  const consultationRevenue = appointments.reduce((s, a) => s + (a.fee ?? 0), 0);
  const doctorPayout = appointments.reduce((s, a) => s + (a.doctorPayoutAmount ?? 0), 0);
  const platformCommission = appointments.reduce((s, a) => s + (a.platformFeeAmount ?? 0), 0);
  const productRevenue = orders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.price * i.quantity, 0), 0);

  // Weighted-average unit cost per product — total received cost / total received qty.
  const avgCostByProduct = new Map<string, number>();
  for (const p of purchaseItemCosts) {
    const qty = p._sum.receivedQty ?? 0;
    if (qty > 0) avgCostByProduct.set(p.productId, (p._sum.lineTotal ?? 0) / qty);
  }
  const productCogs = Math.round(
    orders.reduce((s, o) => s + o.items.reduce((si, i) => si + (avgCostByProduct.get(i.productId) ?? 0) * i.quantity, 0), 0)
  );

  const weightProgramRevenue = programEnrollments
    .filter(e => e.program.category?.nameEn === WEIGHT_PROGRAM_CATEGORY_NAME_EN)
    .reduce((s, e) => s + e.amount, 0);
  const otherProgramRevenue = programEnrollments
    .filter(e => e.program.category?.nameEn !== WEIGHT_PROGRAM_CATEGORY_NAME_EN)
    .reduce((s, e) => s + e.amount, 0);
  const programRevenue = weightProgramRevenue + otherProgramRevenue;

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
  const adsRevenue = revenueEntries.reduce((s, r) => s + r.amount, 0);
  // No partner revenue-split model exists for Programs/Ads yet — 0 until one is built.
  const programAdsPartnerPayout = revenueEntries.reduce((s, r) => s + (r.partnerAmount ?? 0), 0);

  const totalRevenue = consultationRevenue + productRevenue + programRevenue + adsRevenue;
  const costOfSales = doctorPayout + productCogs + programAdsPartnerPayout;
  const grossProfit = totalRevenue - costOfSales;
  const operatingExpenses = gatewayFee + totalExpenses + totalRefunds;
  const netProfit = grossProfit - operatingExpenses;
  const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 1000) / 10 : 0;

  const marginOf = (revenue: number, cost: number) => revenue > 0 ? Math.round(((revenue - cost) / revenue) * 1000) / 10 : 0;

  // Business-type breakdown — the vocabulary the client reports in, not the internal
  // ServiceType enum. Types with no live data source yet are included at zero so the
  // shape of the report is ready the day each one ships, rather than silently absent.
  const serviceBreakdown = [
    { serviceType: 'CONSULTATION', label: 'Doctor Consultation', sales: appointments.length, revenue: consultationRevenue, cost: doctorPayout, netProfit: consultationRevenue - doctorPayout, margin: marginOf(consultationRevenue, doctorPayout) },
    { serviceType: 'PRODUCT', label: 'Product / E-commerce', sales: orders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0), 0), revenue: productRevenue, cost: productCogs, netProfit: productRevenue - productCogs, margin: marginOf(productRevenue, productCogs) },
    { serviceType: 'WEIGHT_PROGRAM', label: 'Weight Program', sales: programEnrollments.filter(e => e.program.category?.nameEn === WEIGHT_PROGRAM_CATEGORY_NAME_EN).length, revenue: weightProgramRevenue, cost: 0, netProfit: weightProgramRevenue, margin: weightProgramRevenue > 0 ? 100 : 0 },
    { serviceType: 'OTHER_PROGRAM', label: 'Other Programs', sales: programEnrollments.filter(e => e.program.category?.nameEn !== WEIGHT_PROGRAM_CATEGORY_NAME_EN).length, revenue: otherProgramRevenue, cost: 0, netProfit: otherProgramRevenue, margin: otherProgramRevenue > 0 ? 100 : 0 },
    { serviceType: 'INTERNATIONAL_SERVICE', label: 'International Service', sales: medicalRequests, revenue: 0, cost: 0, netProfit: 0, margin: 0, noDataSource: false, note: 'Completed hospital requests — commission not wired yet' },
    { serviceType: 'PARTNER_SERVICES', label: 'Partner Services', sales: 0, revenue: 0, cost: 0, netProfit: 0, margin: 0, noDataSource: true },
    { serviceType: 'HOME_SERVICE', label: 'Home Service', sales: 0, revenue: 0, cost: 0, netProfit: 0, margin: 0, noDataSource: true },
    { serviceType: 'ADS', label: 'Advertisement', sales: revenueEntries.length, revenue: adsRevenue, cost: 0, netProfit: adsRevenue, margin: adsRevenue > 0 ? 100 : 0 },
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

  // Chart series bucketed by range — custom range buckets by day (capped at 60 points so a
  // multi-year custom range doesn't explode the chart).
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
  } else if (range === 'yearly') {
    for (let i = 4; i >= 0; i--) {
      const d = new Date(); d.setMonth(0, 1); d.setHours(0, 0, 0, 0); d.setFullYear(d.getFullYear() - i);
      const end = new Date(d); end.setFullYear(end.getFullYear() + 1);
      buckets.push({ label: String(d.getFullYear()), start: d, end });
    }
  } else {
    const dayMs = 24 * 60 * 60 * 1000;
    const totalDays = Math.max(1, Math.round((until.getTime() - since.getTime()) / dayMs));
    const step = Math.max(1, Math.ceil(totalDays / 60));
    for (let d = new Date(since); d <= until; d.setDate(d.getDate() + step)) {
      const start = new Date(d); start.setHours(0, 0, 0, 0);
      const end = new Date(start); end.setDate(end.getDate() + step);
      buckets.push({ label: start.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }), start, end });
    }
  }

  const series = buckets.map(({ label, start, end }) => {
    const apptInBucket = appointments.filter(a => a.date >= start && a.date < end);
    const ordersInBucket = orders.filter(o => o.createdAt >= start && o.createdAt < end);
    const programsInBucket = programEnrollments.filter(e => e.createdAt >= start && e.createdAt < end);
    const revenue = apptInBucket.reduce((s, a) => s + (a.fee ?? 0), 0)
      + ordersInBucket.reduce((s, o) => s + o.items.reduce((si, i) => si + i.price * i.quantity, 0), 0)
      + programsInBucket.reduce((s, e) => s + e.amount, 0);
    const payout = apptInBucket.reduce((s, a) => s + (a.doctorPayoutAmount ?? 0), 0);
    return { label, revenue, netProfit: revenue - payout };
  });

  return {
    range, since, until,
    revenue: { consultation: consultationRevenue, product: productRevenue, program: programRevenue, weightProgram: weightProgramRevenue, ads: adsRevenue, internationalService: 0, total: totalRevenue },
    cost: { doctorPayout, productCogs, gatewayFee, expenses: totalExpenses, refunds: totalRefunds, partnerPayout: programAdsPartnerPayout, costOfSales, operatingExpenses, txnCount },
    result: { grossProfit, netProfit, profitMargin, platformCommission },
    serviceBreakdown,
    doctorProfitability,
    clinicProfitability,
    expensesByCategory: [...expensesByCategory.values()],
    series,
  };
}

export type PnlReport = Awaited<ReturnType<typeof getPnlReport>>;
