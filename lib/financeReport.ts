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

/** Just the bottom-line totals for a window — revenue, cost of sales, gross/operating/net
 * profit — with none of the breakdown tables. Used to compute "vs previous period" growth
 * without re-running the full report twice. */
async function getPnlTotals(since: Date, until: Date) {
  const [appointments, orders, opexExpenses, refunds, programEnrollments, purchaseItemCosts] = await Promise.all([
    db.appointment.findMany({
      where: { status: 'COMPLETED', date: { gte: since, lte: until } },
      select: { fee: true, doctorPayoutAmount: true, paymentMethod: true },
    }),
    db.order.findMany({
      where: { status: 'COMPLETED', createdAt: { gte: since, lte: until } },
      select: { paymentMethod: true, items: { select: { productId: true, price: true, quantity: true } } },
    }),
    db.expense.findMany({ where: { date: { gte: since, lte: until }, category: { isCapital: false } }, select: { amount: true } }),
    db.refund.aggregate({ where: { createdAt: { gte: since, lte: until } }, _sum: { amount: true } }),
    db.programEnrollment.findMany({ where: { status: 'APPROVED', createdAt: { gte: since, lte: until } }, select: { amount: true } }),
    db.purchaseItem.groupBy({ by: ['productId'], _sum: { lineTotal: true, receivedQty: true } }),
  ]);

  const avgCostByProduct = new Map<string, number>();
  for (const p of purchaseItemCosts) {
    const qty = p._sum.receivedQty ?? 0;
    if (qty > 0) avgCostByProduct.set(p.productId, (p._sum.lineTotal ?? 0) / qty);
  }
  const consultationRevenue = appointments.reduce((s, a) => s + (a.fee ?? 0), 0);
  const doctorPayout = appointments.reduce((s, a) => s + (a.doctorPayoutAmount ?? 0), 0);
  const productRevenue = orders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.price * i.quantity, 0), 0);
  const productCogs = Math.round(orders.reduce((s, o) => s + o.items.reduce((si, i) => si + (avgCostByProduct.get(i.productId) ?? 0) * i.quantity, 0), 0));
  const programRevenue = programEnrollments.reduce((s, e) => s + e.amount, 0);

  let gatewayFee = 0;
  const methodVolumes = new Map<string, number>();
  for (const a of appointments) { if (a.paymentMethod && a.fee) methodVolumes.set(a.paymentMethod, (methodVolumes.get(a.paymentMethod) ?? 0) + a.fee); }
  for (const o of orders) { const total = o.items.reduce((s, i) => s + i.price * i.quantity, 0); if (o.paymentMethod) methodVolumes.set(o.paymentMethod, (methodVolumes.get(o.paymentMethod) ?? 0) + total); }
  for (const [method, volume] of methodVolumes) {
    const { feePercent, feeFixed } = await getPaymentMethodFee(method);
    const methodTxnCount = appointments.filter(a => a.paymentMethod === method).length + orders.filter(o => o.paymentMethod === method).length;
    gatewayFee += Math.round(volume * feePercent / 100) + feeFixed * methodTxnCount;
  }

  const totalOpex = opexExpenses.reduce((s, e) => s + e.amount, 0);
  const totalRefunds = refunds._sum.amount ?? 0;
  const totalRevenue = consultationRevenue + productRevenue + programRevenue;
  const costOfSales = doctorPayout + productCogs;
  const grossProfit = totalRevenue - costOfSales;
  const operatingExpenses = gatewayFee + totalOpex + totalRefunds;
  const operatingProfit = grossProfit - operatingExpenses;

  return { revenue: totalRevenue, grossProfit, operatingExpenses, operatingProfit, netProfit: operatingProfit };
}

/** Percent change from `prev` to `curr`, rounded to one decimal. null when `prev` is 0 (no
 * meaningful percent to show — the UI renders "new" instead of a number). */
function growthPct(curr: number, prev: number): number | null {
  if (prev === 0) return curr === 0 ? 0 : null;
  return Math.round(((curr - prev) / Math.abs(prev)) * 1000) / 10;
}

/** The platform-wide P&L for a date window: Sales → Cost of Sales → Gross Profit → Operating
 * Expenses → Net Profit, plus business-type, doctor and partner breakdowns. Shared by the P&L
 * page's API, the Dashboard's summary widget, and the Excel export — one computation, several
 * presentations. Only COMPLETED appointments/orders and APPROVED program enrollments count as
 * realized revenue. */
export async function getPnlReport(range: FinanceRange, since: Date, until: Date) {
  const [
    appointments, orders, expenses, refunds, revenueEntries, clinicReferrals,
    programEnrollments, medicalRequests, purchaseItemCosts, appointmentStatusCounts,
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
    // Every appointment in the window regardless of status — Appointment Performance counts
    // bookings, not just realized revenue.
    db.appointment.groupBy({ by: ['status'], where: { date: { gte: since, lte: until } }, _count: true }),
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

  // Operating cost vs Investment/CAPEX — orthogonal to the FIXED/VARIABLE/ONE_TIME `type`,
  // driven by ExpenseCategory.isCapital. A big one-off build-cost month shouldn't read as an
  // operating loss, so CAPEX is reported separately and never subtracted into Net Profit.
  const opexExpenses = expenses.filter(e => !e.category.isCapital);
  const capexExpenses = expenses.filter(e => e.category.isCapital);
  const totalOpex = opexExpenses.reduce((s, e) => s + e.amount, 0);
  const totalCapex = capexExpenses.reduce((s, e) => s + e.amount, 0);
  const expensesByCategory = new Map<string, { name: string; type: string; isCapital: boolean; amount: number }>();
  for (const e of expenses) {
    const existing = expensesByCategory.get(e.categoryId);
    if (existing) existing.amount += e.amount;
    else expensesByCategory.set(e.categoryId, { name: e.category.name, type: e.category.type, isCapital: e.category.isCapital, amount: e.amount });
  }

  const totalRefunds = refunds._sum.amount ?? 0;
  const adsRevenue = revenueEntries.reduce((s, r) => s + r.amount, 0);
  // No partner revenue-split model exists for Programs/Ads yet — 0 until one is built.
  const programAdsPartnerPayout = revenueEntries.reduce((s, r) => s + (r.partnerAmount ?? 0), 0);

  const totalRevenue = consultationRevenue + productRevenue + programRevenue + adsRevenue;
  const costOfSales = doctorPayout + productCogs + programAdsPartnerPayout;
  const grossProfit = totalRevenue - costOfSales;
  const operatingExpenses = gatewayFee + totalOpex + totalRefunds;
  const operatingProfit = grossProfit - operatingExpenses;
  // Other Income/Expense (interest, one-off write-offs, ...) has no tracked source yet —
  // kept as an explicit zero stage rather than folded silently into Operating Profit, so the
  // chain matches the standard P&L shape and is ready the day one exists.
  const otherIncome = 0;
  const otherExpense = 0;
  const netProfit = operatingProfit + otherIncome - otherExpense;
  const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 1000) / 10 : 0;

  const marginOf = (revenue: number, cost: number) => revenue > 0 ? Math.round(((revenue - cost) / revenue) * 1000) / 10 : 0;

  // vs previous period — the immediately preceding window of the same length.
  const periodMs = until.getTime() - since.getTime();
  const prevUntil = new Date(since.getTime() - 1);
  const prevSince = new Date(prevUntil.getTime() - periodMs);
  const prevTotals = await getPnlTotals(prevSince, prevUntil);
  const growth = {
    revenue: growthPct(totalRevenue, prevTotals.revenue),
    grossProfit: growthPct(grossProfit, prevTotals.grossProfit),
    operatingExpenses: growthPct(operatingExpenses, prevTotals.operatingExpenses),
    netProfit: growthPct(netProfit, prevTotals.netProfit),
  };

  const apptStatus = { PENDING: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0 } as Record<string, number>;
  for (const c of appointmentStatusCounts) apptStatus[c.status] = c._count;
  const totalBookings = Object.values(apptStatus).reduce((a, b) => a + b, 0);
  const appointmentPerformance = {
    total: totalBookings,
    completed: apptStatus.COMPLETED,
    pending: apptStatus.PENDING + apptStatus.CONFIRMED,
    cancelled: apptStatus.CANCELLED,
    completionRate: totalBookings > 0 ? Math.round((apptStatus.COMPLETED / totalBookings) * 1000) / 10 : 0,
    cancellationRate: totalBookings > 0 ? Math.round((apptStatus.CANCELLED / totalBookings) * 1000) / 10 : 0,
  };

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
    cost: { doctorPayout, productCogs, gatewayFee, opex: totalOpex, capex: totalCapex, refunds: totalRefunds, partnerPayout: programAdsPartnerPayout, costOfSales, operatingExpenses, txnCount },
    // Revenue → Cost of Sales → Gross Profit → Operating Expenses → Operating Profit →
    // (Other Income/Expense) → Net Profit. CAPEX is reported but never subtracted here.
    result: { grossProfit, operatingProfit, otherIncome, otherExpense, netProfit, profitMargin, platformCommission },
    growth,
    appointmentPerformance,
    serviceBreakdown,
    doctorProfitability,
    clinicProfitability,
    expensesByCategory: [...expensesByCategory.values()],
    series,
  };
}

export type PnlReport = Awaited<ReturnType<typeof getPnlReport>>;

/** Per-partner rollup: how much each partner clinic generated, what they're owed, what's
 * already settled. Draws on the same RevenueLedger rows the row-level Revenue Ledger /
 * settlement page works from — this is the aggregate view of the same data, not a second
 * source of truth. Programs/Ads have no per-partner split yet (no commission model exists for
 * them), so those columns stay informational (program listing count only). Shared by the
 * Partner P&L page's API and the Excel export. */
export async function getPartnerReport(since: Date, until: Date) {
  const [ledgerRows, referrals, programs] = await Promise.all([
    db.revenueLedger.findMany({
      where: {
        createdAt: { gte: since, lte: until },
        OR: [{ clinicId: { not: null } }, { referralClinicId: { not: null } }],
      },
      select: {
        clinicId: true, referralClinicId: true, patientPaid: true,
        partnerShareAmount: true, partnerReferralFeeAmount: true, settlementStatus: true,
      },
    }),
    db.clinicReferral.groupBy({ by: ['clinicId'], where: { createdAt: { gte: since, lte: until } }, _count: true }),
    db.healthcareProgram.groupBy({ by: ['clinicId'], where: { clinicId: { not: null } }, _count: true }),
  ]);

  const clinicIds = new Set<string>();
  for (const r of ledgerRows) { if (r.clinicId) clinicIds.add(r.clinicId); if (r.referralClinicId) clinicIds.add(r.referralClinicId); }
  for (const r of referrals) clinicIds.add(r.clinicId);
  for (const p of programs) { if (p.clinicId) clinicIds.add(p.clinicId); }

  const clinics = await db.clinic.findMany({
    where: { id: { in: [...clinicIds] } },
    select: { id: true, name: true, nameEn: true, imageUrl: true, type: true },
  });
  const clinicMap = new Map(clinics.map(c => [c.id, c]));

  interface PartnerRow {
    clinic: { id: string; name: string; nameEn: string | null; imageUrl: string | null; type: string } | null;
    sales: number; referrals: number; commission: number;
    payableUnsettled: number; settled: number; profit: number;
    programsListed: number;
  }
  const rows = new Map<string, PartnerRow>();
  const get = (id: string): PartnerRow => {
    let r = rows.get(id);
    if (!r) { r = { clinic: clinicMap.get(id) ?? null, sales: 0, referrals: 0, commission: 0, payableUnsettled: 0, settled: 0, profit: 0, programsListed: 0 }; rows.set(id, r); }
    return r;
  };

  for (const led of ledgerRows) {
    const isSettled = led.settlementStatus === 'SETTLED';
    if (led.clinicId && led.partnerShareAmount > 0) {
      const r = get(led.clinicId);
      r.sales += led.patientPaid;
      r.commission += led.patientPaid - led.partnerShareAmount;
      r.profit += led.partnerShareAmount;
      if (isSettled) r.settled += led.partnerShareAmount; else r.payableUnsettled += led.partnerShareAmount;
    }
    if (led.referralClinicId && led.partnerReferralFeeAmount > 0) {
      const r = get(led.referralClinicId);
      r.profit += led.partnerReferralFeeAmount;
      if (isSettled) r.settled += led.partnerReferralFeeAmount; else r.payableUnsettled += led.partnerReferralFeeAmount;
    }
  }
  for (const ref of referrals) get(ref.clinicId).referrals += ref._count;
  for (const p of programs) { if (p.clinicId) get(p.clinicId).programsListed += p._count; }

  return [...rows.values()].filter(r => r.clinic).sort((a, b) => (b.sales + b.profit) - (a.sales + a.profit));
}

/** Per-product rollup: purchase cost, selling price, units sold, stock on hand, COGS, gross
 * profit, margin. Cost basis is a weighted average over every Purchase ever received for that
 * product (not range-filtered — cost predates the reporting window); revenue/qty/COGS are
 * range-filtered to COMPLETED orders. Stock is the patient-facing balance checkout actually
 * checks (Product.stock, or the sum of its sizes' stock), not the separate multi-store POS
 * ProductStock ledger. Shared by the Product P&L page's API and the Excel export. */
export async function getProductReport(since: Date, until: Date, search = '') {
  const [products, purchaseItemCosts, orders] = await Promise.all([
    db.product.findMany({
      where: search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { nameEn: { contains: search, mode: 'insensitive' } }] } : {},
      select: { id: true, name: true, nameEn: true, imageUrl: true, price: true, stock: true, isActive: true, sizes: { select: { stock: true } } },
      orderBy: { name: 'asc' },
    }),
    db.purchaseItem.groupBy({ by: ['productId'], _sum: { lineTotal: true, receivedQty: true } }),
    db.order.findMany({
      where: { status: 'COMPLETED', createdAt: { gte: since, lte: until } },
      select: { items: { select: { productId: true, price: true, quantity: true } } },
    }),
  ]);

  const avgCostByProduct = new Map<string, number>();
  for (const p of purchaseItemCosts) {
    const qty = p._sum.receivedQty ?? 0;
    if (qty > 0) avgCostByProduct.set(p.productId, (p._sum.lineTotal ?? 0) / qty);
  }

  const soldByProduct = new Map<string, { qty: number; revenue: number }>();
  for (const o of orders) {
    for (const i of o.items) {
      const existing = soldByProduct.get(i.productId) ?? { qty: 0, revenue: 0 };
      existing.qty += i.quantity;
      existing.revenue += i.price * i.quantity;
      soldByProduct.set(i.productId, existing);
    }
  }

  return products.map(p => {
    const sold = soldByProduct.get(p.id) ?? { qty: 0, revenue: 0 };
    const avgCost = avgCostByProduct.get(p.id) ?? 0;
    const cogs = Math.round(avgCost * sold.qty);
    const grossProfit = sold.revenue - cogs;
    const stockBalance = p.sizes.length > 0 ? p.sizes.reduce((s, sz) => s + sz.stock, 0) : p.stock;
    return {
      id: p.id, name: p.name, nameEn: p.nameEn, imageUrl: p.imageUrl, isActive: p.isActive,
      hasSizes: p.sizes.length > 0,
      purchasePrice: Math.round(avgCost), sellingPrice: p.price,
      qtySold: sold.qty, stockBalance,
      revenue: sold.revenue, cogs, grossProfit,
      margin: sold.revenue > 0 ? Math.round((grossProfit / sold.revenue) * 1000) / 10 : 0,
    };
  }).sort((a, b) => b.revenue - a.revenue);
}

/** Cash in vs cash out with a running balance — see the Cash Flow page's own API for the
 * bucketed series; this is the totals-only shape the Excel export needs. */
export async function getCashFlowTotals(since: Date, until: Date) {
  const [appointments, orders, programEnrollments, purchases, expenses, refunds] = await Promise.all([
    db.appointment.findMany({ where: { status: 'COMPLETED', date: { gte: since, lte: until } }, select: { fee: true, doctorPayoutAmount: true } }),
    db.order.findMany({ where: { status: 'COMPLETED', createdAt: { gte: since, lte: until } }, select: { totalAmount: true } }),
    db.programEnrollment.findMany({ where: { status: 'APPROVED', createdAt: { gte: since, lte: until } }, select: { amount: true } }),
    db.purchase.findMany({ where: { status: { in: ['RECEIVED', 'PARTIAL'] }, purchaseDate: { gte: since, lte: until } }, select: { totalAmount: true } }),
    db.expense.findMany({ where: { date: { gte: since, lte: until } }, select: { amount: true, category: { select: { isCapital: true } } } }),
    db.refund.aggregate({ where: { createdAt: { gte: since, lte: until } }, _sum: { amount: true } }),
  ]);

  const cashInByType = {
    consultation: appointments.reduce((s, a) => s + (a.fee ?? 0), 0),
    product: orders.reduce((s, o) => s + o.totalAmount, 0),
    program: programEnrollments.reduce((s, p) => s + p.amount, 0),
  };
  const cashOutByType = {
    doctorPayout: appointments.reduce((s, a) => s + (a.doctorPayoutAmount ?? 0), 0),
    productPurchase: purchases.reduce((s, p) => s + p.totalAmount, 0),
    operatingExpenses: expenses.filter(e => !e.category.isCapital).reduce((s, e) => s + e.amount, 0),
    capex: expenses.filter(e => e.category.isCapital).reduce((s, e) => s + e.amount, 0),
    refunds: refunds._sum.amount ?? 0,
  };
  const totalCashIn = Object.values(cashInByType).reduce((a, b) => a + b, 0);
  const totalCashOut = Object.values(cashOutByType).reduce((a, b) => a + b, 0);

  return { cashInByType, cashOutByType, totalCashIn, totalCashOut, netCashFlow: totalCashIn - totalCashOut };
}
