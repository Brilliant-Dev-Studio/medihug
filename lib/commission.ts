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
