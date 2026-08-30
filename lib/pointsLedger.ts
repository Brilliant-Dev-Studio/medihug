import { db } from '@/lib/db';
import type { Prisma } from '@/app/generated/prisma/client';

type SourceType = 'CONSULTATION' | 'PROGRAM' | 'PRODUCT';

/** Reads (or lazily creates) the singleton Points settings row. */
export async function getPointsSettings() {
  return db.pointsSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton' },
  });
}

/** Current points balance for a patient — no cached column, always the live sum, same
 * append-only-ledger philosophy as RevenueLedger (one source of truth, nothing to drift). */
export async function getPointsBalance(userId: string): Promise<number> {
  const result = await db.pointsLedger.aggregate({ where: { userId }, _sum: { points: true } });
  return result._sum.points ?? 0;
}

async function getPointsBalanceTx(tx: Prisma.TransactionClient, userId: string): Promise<number> {
  const result = await tx.pointsLedger.aggregate({ where: { userId }, _sum: { points: true } });
  return result._sum.points ?? 0;
}

interface AwardPointsInput {
  userId: string;
  sourceType: SourceType;
  sourceId: string;
  /** Amount actually paid — already net of any points discount applied to this same
   * purchase, so redeeming points never lets a patient re-earn the value back. */
  netAmountKs: number;
}

/** Awards points for a completed purchase at the platform's current earn rate. Idempotent —
 * safe to call again for the same (sourceType, sourceId); a repeat call is a no-op via the
 * @@unique([sourceType, sourceId, type]) constraint. Never throws — a ledger failure must
 * not block the status update that triggered it (mirrors recordRevenueLedger). */
export async function awardPoints(input: AwardPointsInput): Promise<void> {
  try {
    const settings = await getPointsSettings();
    if (!settings.isActive || input.netAmountKs <= 0) return;

    const points = Math.floor(input.netAmountKs / settings.kyatPerPointEarn);
    if (points <= 0) return;

    await db.pointsLedger.upsert({
      where: { sourceType_sourceId_type: { sourceType: input.sourceType, sourceId: input.sourceId, type: 'EARNED' } },
      create: { userId: input.userId, type: 'EARNED', points, sourceType: input.sourceType, sourceId: input.sourceId, amountKs: input.netAmountKs },
      update: {},
    });
  } catch (err) {
    console.error(`awardPoints failed (sourceType=${input.sourceType}, sourceId=${input.sourceId}):`, err);
  }
}

interface RedeemPointsInput {
  userId: string;
  sourceType: SourceType;
  sourceId: string;
  pointsToRedeem: number;
}

/** Deducts points at checkout time and returns the Ks discount value, clamped to both the
 * caller-supplied max (the purchase's own pre-discount amount) and the patient's live
 * balance. Must run inside the caller's existing $transaction (takes `tx`, not the global
 * `db`) — reads the balance and writes the REDEEMED row in the same transaction as the
 * purchase's own create/update, so two concurrent checkouts from the same patient can't
 * both spend the same points. */
export async function redeemPoints(
  tx: Prisma.TransactionClient,
  input: RedeemPointsInput,
  maxDiscountKs: number,
): Promise<{ pointsRedeemed: number; discountAmount: number }> {
  if (input.pointsToRedeem <= 0 || maxDiscountKs <= 0) return { pointsRedeemed: 0, discountAmount: 0 };

  const settings = await getPointsSettings();
  if (!settings.isActive) return { pointsRedeemed: 0, discountAmount: 0 };

  const balance = await getPointsBalanceTx(tx, input.userId);
  const points = Math.min(input.pointsToRedeem, balance);
  if (points <= 0) return { pointsRedeemed: 0, discountAmount: 0 };

  const rawDiscount = points * settings.kyatPerPointRedeem;
  const discountAmount = Math.min(rawDiscount, maxDiscountKs);
  // Re-derive points actually spent from the clamped discount, so redeeming more points than
  // the purchase is worth only debits the points that were actually used, e.g. redeeming 100
  // points on a 5,000 Ks item at 1,000 Ks/point only spends 5 — never more.
  const pointsRedeemed = Math.ceil(discountAmount / settings.kyatPerPointRedeem);
  if (pointsRedeemed <= 0) return { pointsRedeemed: 0, discountAmount: 0 };

  await tx.pointsLedger.create({
    data: { userId: input.userId, type: 'REDEEMED', points: -pointsRedeemed, sourceType: input.sourceType, sourceId: input.sourceId, amountKs: discountAmount },
  });

  return { pointsRedeemed, discountAmount };
}
