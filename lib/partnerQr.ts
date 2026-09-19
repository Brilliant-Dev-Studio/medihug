import crypto from 'crypto';
import { db } from '@/lib/db';
import { getPlatformSettings } from '@/lib/commission';
import { VoucherRedemptionError, type VoucherErrorReason } from '@/lib/voucherLedger';
import type { Prisma } from '@/app/generated/prisma/client';

export const PARTNER_QR_PREFIX = 'MHQ-';

type DbClient = typeof db | Prisma.TransactionClient;

/** Partner QR codes share the checkout voucher input, so the prefix is what routes a typed/
 * scanned code to this flow instead of the Voucher table. */
export function isPartnerQrCode(code: string): boolean {
  return code.trim().toUpperCase().startsWith(PARTNER_QR_PREFIX);
}

/** A partner may lower their QR's discount but never exceed the SuperAdmin-set platform
 * maximum — and if the admin later lowers the maximum, existing partner values clamp down. */
export function effectiveQrPercent(clinicPercent: number | null, platformPercent: number): number {
  return clinicPercent === null ? platformPercent : Math.min(clinicPercent, platformPercent);
}

function generateQrCode(): string {
  return `${PARTNER_QR_PREFIX}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

/** Returns the partner's permanent referral QR code, creating it on first access. */
export async function getOrCreateReferralQrCode(clinicId: string): Promise<string | null> {
  const clinic = await db.clinic.findUnique({ where: { id: clinicId }, select: { referralQrCode: true } });
  if (!clinic) return null;
  if (clinic.referralQrCode) return clinic.referralQrCode;

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      // `referralQrCode: null` in the filter keeps a concurrent first-open from overwriting.
      await db.clinic.updateMany({
        where: { id: clinicId, referralQrCode: null },
        data: { referralQrCode: generateQrCode() },
      });
      break;
    } catch {
      // unique collision on the random code — retry with a fresh one
    }
  }
  const fresh = await db.clinic.findUnique({ where: { id: clinicId }, select: { referralQrCode: true } });
  return fresh?.referralQrCode ?? null;
}

interface CheckInput {
  code: string;
  sourceType: 'CONSULTATION' | 'PROGRAM' | 'PRODUCT';
  purchaseAmount: number;
}

type CheckResult =
  | { ok: true; clinicId: string; clinicName: string; percent: number; discountAmount: number }
  | { ok: false; reason: VoucherErrorReason };

/** Doctor-booking-only discount: any other purchase type is rejected as out of scope. */
async function checkPartnerQr(client: DbClient, input: CheckInput): Promise<CheckResult> {
  const code = input.code.trim().toUpperCase();
  const clinic = await client.clinic.findUnique({
    where: { referralQrCode: code },
    select: { id: true, name: true, nameEn: true, isActive: true, referralQrDiscountPercent: true },
  });
  if (!clinic) return { ok: false, reason: 'NOT_FOUND' };
  if (!clinic.isActive) return { ok: false, reason: 'INACTIVE' };
  if (input.sourceType !== 'CONSULTATION') return { ok: false, reason: 'SCOPE_MISMATCH' };

  const { partnerQrDiscountPercent } = await getPlatformSettings();
  const percent = effectiveQrPercent(clinic.referralQrDiscountPercent, partnerQrDiscountPercent);
  if (percent <= 0) return { ok: false, reason: 'INACTIVE' };

  const discountAmount = Math.max(0, Math.min(Math.round(input.purchaseAmount * percent / 100), input.purchaseAmount));
  return { ok: true, clinicId: clinic.id, clinicName: clinic.nameEn ?? clinic.name, percent, discountAmount };
}

/** Read-only preview for the checkout "Apply" button. */
export async function validatePartnerQr(input: CheckInput) {
  return checkPartnerQr(db, input);
}

/** Re-validates and records the redemption inside the booking's own transaction — mirrors
 * `redeemVoucher`, and throws the same `VoucherRedemptionError` so the booking route's
 * existing error handling covers it. */
export async function redeemPartnerQr(
  tx: Prisma.TransactionClient,
  userId: string,
  appointmentId: string,
  input: { code: string; doctorId: string; purchaseAmount: number },
): Promise<{ voucherCode: string; discountAmount: number }> {
  const result = await checkPartnerQr(tx, { code: input.code, sourceType: 'CONSULTATION', purchaseAmount: input.purchaseAmount });
  if (!result.ok) throw new VoucherRedemptionError(result.reason);

  const code = input.code.trim().toUpperCase();
  await tx.partnerQrRedemption.create({
    data: {
      clinicId: result.clinicId, userId, doctorId: input.doctorId, appointmentId,
      code, percent: result.percent, discountAmount: result.discountAmount,
    },
  });
  return { voucherCode: code, discountAmount: result.discountAmount };
}
