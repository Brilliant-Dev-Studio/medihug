import { db } from '@/lib/db';
import type { Prisma } from '@/app/generated/prisma/client';

type SourceType = 'CONSULTATION' | 'PROGRAM' | 'PRODUCT';
type DbClient = typeof db | Prisma.TransactionClient;

export type VoucherErrorReason =
  | 'NOT_FOUND' | 'INACTIVE' | 'EXPIRED' | 'MAX_USES_REACHED'
  | 'SCOPE_MISMATCH' | 'MIN_PURCHASE_NOT_MET';

interface CheckVoucherInput {
  code: string;
  sourceType: SourceType;
  doctorId?: string | null;
  productIds?: string[];
  programId?: string | null;
  purchaseAmount: number;
}

type CheckVoucherResult =
  | { ok: true; voucherId: string; discountAmount: number }
  | { ok: false; reason: VoucherErrorReason };

/** True when a partner-issued voucher's clinic actually owns the purchase's doctor/product/
 * program — re-checked here even when the voucher is already narrow-scoped to a specific
 * doctorId/productId/programId, since a partner voucher can in theory be left un-narrowed
 * (clinicId set, nothing else) and still needs this ownership gate. */
async function ownsPurchase(client: DbClient, clinicId: string, input: CheckVoucherInput): Promise<boolean> {
  if (input.sourceType === 'CONSULTATION') {
    if (!input.doctorId) return false;
    const link = await client.clinicDoctor.findUnique({ where: { clinicId_doctorId: { clinicId, doctorId: input.doctorId } } });
    return !!link;
  }
  if (input.sourceType === 'PRODUCT') {
    if (!input.productIds || input.productIds.length === 0) return false;
    const count = await client.clinicProduct.count({ where: { clinicId, productId: { in: input.productIds } } });
    return count > 0;
  }
  if (input.sourceType === 'PROGRAM') {
    if (!input.programId) return false;
    const program = await client.healthcareProgram.findUnique({ where: { id: input.programId }, select: { clinicId: true } });
    return program?.clinicId === clinicId;
  }
  return false;
}

/** Resolves a code against every eligibility rule (active/expiry/uses/scope/ownership/min
 * purchase) and computes the resulting discount, clamped to the purchase amount. Pure read —
 * used both for the checkout-time preview and re-run inside the transaction at redemption
 * time (with `tx` passed as `client` there, so the max-uses check sees in-flight state). */
async function checkVoucher(client: DbClient, input: CheckVoucherInput): Promise<CheckVoucherResult> {
  if (!input.code.trim()) return { ok: false, reason: 'NOT_FOUND' };

  const voucher = await client.voucher.findUnique({ where: { code: input.code.trim().toUpperCase() } });
  if (!voucher) return { ok: false, reason: 'NOT_FOUND' };
  if (!voucher.active) return { ok: false, reason: 'INACTIVE' };
  if (voucher.expiresAt && voucher.expiresAt.getTime() < Date.now()) return { ok: false, reason: 'EXPIRED' };
  if (voucher.maxUses !== null && voucher.usedCount >= voucher.maxUses) return { ok: false, reason: 'MAX_USES_REACHED' };
  if (voucher.serviceType !== input.sourceType) return { ok: false, reason: 'SCOPE_MISMATCH' };
  if (voucher.doctorId && voucher.doctorId !== input.doctorId) return { ok: false, reason: 'SCOPE_MISMATCH' };
  if (voucher.programId && voucher.programId !== input.programId) return { ok: false, reason: 'SCOPE_MISMATCH' };
  if (voucher.productId && !(input.productIds ?? []).includes(voucher.productId)) return { ok: false, reason: 'SCOPE_MISMATCH' };
  if (voucher.clinicId && !(await ownsPurchase(client, voucher.clinicId, input))) return { ok: false, reason: 'SCOPE_MISMATCH' };
  if (input.purchaseAmount < voucher.minPurchaseKs) return { ok: false, reason: 'MIN_PURCHASE_NOT_MET' };

  const raw = voucher.discountType === 'PERCENT'
    ? Math.round(input.purchaseAmount * voucher.discountValue / 100)
    : voucher.discountValue;
  const capped = voucher.maxDiscountKs !== null ? Math.min(raw, voucher.maxDiscountKs) : raw;
  const discountAmount = Math.max(0, Math.min(capped, input.purchaseAmount));

  return { ok: true, voucherId: voucher.id, discountAmount };
}

/** Read-only validation for the checkout-time "Apply" preview — never mutates anything. */
export async function validateVoucher(input: CheckVoucherInput) {
  return checkVoucher(db, input);
}

/** Deducts the discount and records the redemption — must run inside the caller's existing
 * `$transaction` (takes `tx`, not the global `db`) so the max-uses check and usedCount
 * increment can't race across two concurrent checkouts redeeming the same code. Re-validates
 * everything from scratch rather than trusting a client-supplied discount value, mirroring
 * `redeemPoints`. No-ops (0 discount) when `code` is empty, matching `redeemPoints`'s
 * `pointsToRedeem <= 0` short-circuit — so callers can pass an empty code unconditionally. */
export async function redeemVoucher(
  tx: Prisma.TransactionClient,
  userId: string,
  sourceId: string,
  input: CheckVoucherInput,
): Promise<{ voucherCode: string; discountAmount: number } | { voucherCode: null; discountAmount: 0 }> {
  if (!input.code.trim()) return { voucherCode: null, discountAmount: 0 };

  const result = await checkVoucher(tx, input);
  if (!result.ok) throw new VoucherRedemptionError(result.reason);

  await tx.voucherRedemption.create({
    data: {
      voucherId: result.voucherId, userId,
      sourceType: input.sourceType, sourceId,
      discountAmount: result.discountAmount,
    },
  });
  await tx.voucher.update({ where: { id: result.voucherId }, data: { usedCount: { increment: 1 } } });

  return { voucherCode: input.code.trim().toUpperCase(), discountAmount: result.discountAmount };
}

export class VoucherRedemptionError extends Error {
  constructor(public reason: VoucherErrorReason) {
    super(`Voucher redemption failed: ${reason}`);
  }
}
