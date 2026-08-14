import { db } from '@/lib/db';

/** Doctor's own override, else the platform-wide default. */
export function effectiveCommissionPercent(doctorPercent: number | null, defaultPercent: number): number {
  return doctorPercent ?? defaultPercent;
}

/** What the patient pays: base rate + commission on top. Doctor's own `price` is never touched. */
export function computePatientPrice(basePrice: number, percent: number): number {
  return Math.round(basePrice * (1 + percent / 100));
}

/** The platform's cut of a single base-rate session. */
export function computePlatformCut(basePrice: number, percent: number): number {
  return Math.round(basePrice * percent / 100);
}

/** Reads (or lazily creates) the singleton platform settings row. */
export async function getPlatformSettings() {
  return db.platformSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton' },
  });
}

type ResolveCommissionParams = {
  serviceType: 'CONSULTATION' | 'PRODUCT';
  doctorId?: string | null;
  clinicId?: string | null;
  paymentMethod?: string | null;
};

/**
 * Picks the most specific active CommissionRule matching the given
 * service/doctor/clinic/payment-method, scored by how many non-null rule
 * dimensions matched a non-null param. Falls back to the legacy
 * doctor-override-or-global-default behavior when no rule matches, so
 * nothing breaks before an admin has created any rules.
 */
export async function resolveCommission(
  params: ResolveCommissionParams
): Promise<{ percent: number; fixedFee: number; ruleId: string | null }> {
  const now = new Date();
  const doctorOr = params.doctorId ? [{ doctorId: null }, { doctorId: params.doctorId }] : [{ doctorId: null }];
  const clinicOr = params.clinicId ? [{ clinicId: null }, { clinicId: params.clinicId }] : [{ clinicId: null }];
  const paymentOr = params.paymentMethod
    ? [{ paymentMethod: null }, { paymentMethod: params.paymentMethod }]
    : [{ paymentMethod: null }];

  const rules = await db.commissionRule.findMany({
    where: {
      serviceType: params.serviceType,
      active: true,
      effectiveFrom: { lte: now },
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }],
      AND: [{ OR: doctorOr }, { OR: clinicOr }, { OR: paymentOr }],
    },
  });

  let best: (typeof rules)[number] | null = null;
  let bestScore = -1;
  for (const rule of rules) {
    let score = 0;
    if (rule.doctorId && rule.doctorId === params.doctorId) score++;
    if (rule.clinicId && rule.clinicId === params.clinicId) score++;
    if (rule.paymentMethod && rule.paymentMethod === params.paymentMethod) score++;
    if (score > bestScore) {
      bestScore = score;
      best = rule;
    }
  }

  if (best) {
    return { percent: best.percent, fixedFee: best.fixedFee, ruleId: best.id };
  }

  // Legacy fallback: doctor override -> platform default (no fixed fee concept there).
  const settings = await getPlatformSettings();
  let doctorPercent: number | null = null;
  if (params.doctorId) {
    const doctor = await db.doctor.findUnique({
      where: { id: params.doctorId },
      select: { commissionPercent: true },
    });
    doctorPercent = doctor?.commissionPercent ?? null;
  }
  return {
    percent: effectiveCommissionPercent(doctorPercent, settings.defaultCommissionPercent),
    fixedFee: 0,
    ruleId: null,
  };
}

/** Reads the configured gateway fee for a payment method key, 0/0 if unset. */
export async function getPaymentMethodFee(
  key: string | null | undefined
): Promise<{ feePercent: number; feeFixed: number }> {
  if (!key) return { feePercent: 0, feeFixed: 0 };
  const config = await db.paymentMethodConfig.findUnique({ where: { key } });
  if (!config || !config.active) return { feePercent: 0, feeFixed: 0 };
  return { feePercent: config.feePercent, feeFixed: config.feeFixed };
}
