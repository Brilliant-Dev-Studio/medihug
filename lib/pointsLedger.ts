import { db } from '@/lib/db';
import type { Prisma } from '@/app/generated/prisma/client';
import { NO_EXPIRY, simulate, type ExpiryConfig, type LedgerRow } from '@/lib/pointsExpiry';

type SourceType = 'CONSULTATION' | 'PROGRAM' | 'PRODUCT';

/** Reads (or lazily creates) the singleton Points settings row. */
export async function getPointsSettings(client: Prisma.TransactionClient | typeof db = db) {
  return client.pointsSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton' },
  });
}

type Client = typeof db | Prisma.TransactionClient;

export function expiryConfigOf(s: { expiryEnabled: boolean; expiryValue: number; expiryUnit: 'DAYS' | 'MONTHS' }): ExpiryConfig {
  return s.expiryEnabled ? { enabled: true, value: s.expiryValue, unit: s.expiryUnit } : NO_EXPIRY;
}

export async function getExpiryConfig(client: Client = db): Promise<ExpiryConfig> {
  return expiryConfigOf(await getPointsSettings(client));
}

/** The non-deleted ledger rows for these patients, grouped by patient, in the shape the expiry
 * engine wants. Deleted (voided) entries never count. */
export async function loadLedgerRows(client: Client, userIds?: string[]): Promise<Map<string, LedgerRow[]>> {
  const rows = await client.pointsLedger.findMany({
    where: { voidedAt: null, ...(userIds ? { userId: { in: userIds } } : {}) },
    select: { id: true, userId: true, points: true, createdAt: true, noExpiry: true },
  });
  const byUser = new Map<string, LedgerRow[]>();
  for (const r of rows) {
    const list = byUser.get(r.userId) ?? [];
    list.push({ id: r.id, points: r.points, createdAt: r.createdAt, noExpiry: r.noExpiry });
    byUser.set(r.userId, list);
  }
  return byUser;
}

async function balanceFor(client: Client, userId: string): Promise<number> {
  const cfg = await getExpiryConfig(client);
  if (!cfg.enabled) {
    const result = await client.pointsLedger.aggregate({ where: { userId, voidedAt: null }, _sum: { points: true } });
    return result._sum.points ?? 0;
  }
  const rows = (await loadLedgerRows(client, [userId])).get(userId) ?? [];
  return simulate(rows, cfg).balance;
}

/** Current points balance for a patient — no cached column, always computed from the ledger
 * (one source of truth, nothing to drift). Deleted entries don't count, and neither do points
 * that have passed their expiry date. */
export async function getPointsBalance(userId: string): Promise<number> {
  return balanceFor(db, userId);
}

export async function getPointsBalanceTx(tx: Prisma.TransactionClient, userId: string): Promise<number> {
  return balanceFor(tx, userId);
}

/** Balances for many patients at once (report list). */
export async function getBalances(userIds: string[]): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  if (userIds.length === 0) return out;
  const cfg = await getExpiryConfig();
  if (!cfg.enabled) {
    const groups = await db.pointsLedger.groupBy({ by: ['userId'], where: { userId: { in: userIds }, voidedAt: null }, _sum: { points: true } });
    for (const g of groups) out.set(g.userId, g._sum.points ?? 0);
    return out;
  }
  const rows = await loadLedgerRows(db, userIds);
  for (const id of userIds) out.set(id, simulate(rows.get(id) ?? [], cfg).balance);
  return out;
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
      create: { userId: input.userId, type: 'EARNED', points, sourceType: input.sourceType, sourceId: input.sourceId, amountKs: input.netAmountKs, rateKs: settings.kyatPerPointEarn },
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
  // Points can only be spent on online doctor appointments (earning them elsewhere is unchanged).
  if (input.sourceType !== 'CONSULTATION') return { pointsRedeemed: 0, discountAmount: 0 };
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
    data: { userId: input.userId, type: 'REDEEMED', points: -pointsRedeemed, sourceType: input.sourceType, sourceId: input.sourceId, amountKs: discountAmount, rateKs: settings.kyatPerPointRedeem },
  });

  return { pointsRedeemed, discountAmount };
}
