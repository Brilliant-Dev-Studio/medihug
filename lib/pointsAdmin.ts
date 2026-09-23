import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { Prisma } from '@/app/generated/prisma/client';
import { logAudit } from '@/lib/audit';
import { getExpiryConfig, loadLedgerRows } from '@/lib/pointsLedger';
import { simulate, type LedgerRow } from '@/lib/pointsExpiry';
import { patientWhere } from '@/lib/roleAccess';

/* SuperAdmin-side changes to a patient's points. Every change runs in one transaction that
 * re-reads the live balance and refuses to leave it negative, and is written to the audit log.
 * "Delete" never removes a row — it voids it (kept on record, excluded from the balance), so the
 * history stays auditable and an already-awarded purchase can't be re-awarded. */

export class PointsAdminError extends Error {
  constructor(public code: 'NOT_FOUND' | 'INVALID' | 'INSUFFICIENT_BALANCE' | 'ALREADY_VOIDED' | 'NOT_VOIDED', message: string, public balance?: number) {
    super(message);
  }
}

/** Maps a PointsAdminError to the JSON response the admin UI shows in its confirm box / toast. */
export function pointsErrorResponse(e: unknown) {
  if (e instanceof PointsAdminError) {
    const status = e.code === 'NOT_FOUND' ? 404 : e.code === 'INVALID' ? 400 : 409;
    return NextResponse.json({ error: e.message, code: e.code, balance: e.balance }, { status });
  }
  console.error(e);
  return NextResponse.json({ error: 'Server error' }, { status: 500 });
}

interface Admin { id: string; name: string }

/** Every operation is one transaction. A caller that already owns a transaction (tests) can pass
 * it via `tx`; in that case the audit row is skipped, since the caller may roll everything back. */
type Tx = Prisma.TransactionClient;
const TX_OPTS = { maxWait: 15000, timeout: 30000 };
function inTx<T>(tx: Tx | undefined, fn: (t: Tx) => Promise<T>): Promise<T> {
  return tx ? fn(tx) : db.$transaction(fn, TX_OPTS);
}

const MAX_POINTS = 1_000_000;

function cleanNote(note: unknown, label: string): string {
  const n = typeof note === 'string' ? note.trim() : '';
  if (n.length < 3) throw new PointsAdminError('INVALID', `${label} is required (at least 3 characters).`);
  if (n.length > 200) throw new PointsAdminError('INVALID', `${label} must be 200 characters or fewer.`);
  return n;
}

function cleanPoints(points: unknown): number {
  if (typeof points !== 'number' || !Number.isInteger(points) || points === 0 || Math.abs(points) > MAX_POINTS) {
    throw new PointsAdminError('INVALID', `Points must be a whole number other than 0 (max ${MAX_POINTS.toLocaleString()}).`);
  }
  return points;
}

/** What this change would do to the patient's spendable balance, judged against the live ledger
 * and expiry setting. A change is refused if it would leave points that were already used with no
 * unexpired points behind them (e.g. deleting a credit that has since been spent). */
async function impact(tx: Tx, userId: string, mutate: (rows: LedgerRow[]) => LedgerRow[]) {
  const cfg = await getExpiryConfig(tx);
  const rows = (await loadLedgerRows(tx, [userId])).get(userId) ?? [];
  const now = new Date();
  const before = simulate(rows, cfg, now);
  const after = simulate(mutate(rows), cfg, now);
  return { before: before.balance, after: after.balance, overdrawn: after.unmatched > before.unmatched };
}

function assertNoOverdraw(i: { before: number; overdrawn: boolean }, what: string) {
  if (i.overdrawn) {
    throw new PointsAdminError('INSUFFICIENT_BALANCE', `${what} (current balance: ${i.before.toLocaleString()}).`, i.before);
  }
}

/** Manual credit (+) or debit (−) with no purchase behind it. */
export async function adjustPoints(admin: Admin, input: { userId: string; points: unknown; note: unknown; noExpiry?: unknown }, tx?: Tx) {
  const points = cleanPoints(input.points);
  const note = cleanNote(input.note, 'A reason');

  const entry = await inTx(tx, async tx => {
    const user = await tx.user.findFirst({ where: { AND: [{ id: input.userId }, patientWhere] }, select: { id: true } });
    if (!user) throw new PointsAdminError('NOT_FOUND', 'Patient not found.');
    const noExpiry = input.noExpiry === true && points > 0;
    assertNoOverdraw(
      await impact(tx, user.id, rows => [...rows, { id: '__new', points, createdAt: new Date(), noExpiry }]),
      'The patient does not have enough unexpired points to deduct that many',
    );
    return tx.pointsLedger.create({
      data: {
        userId: user.id, type: 'ADJUSTED', points, sourceType: null, sourceId: null, amountKs: 0,
        note, noExpiry, createdByAdminId: admin.id, createdByAdminName: admin.name,
      },
    });
  });

  if (!tx) logAudit({ admin, action: 'CREATE', entityType: 'PointsLedger', entityId: entry.id, after: { userId: entry.userId, points, note } });
  return entry;
}

/** Change an entry's points and/or note. Changing points needs a reason (the note). */
export async function updatePointsEntry(admin: Admin, id: string, input: { points?: unknown; note?: unknown }, outer?: Tx) {
  const { before, after } = await inTx(outer, async tx => {
    const entry = await tx.pointsLedger.findUnique({ where: { id } });
    if (!entry) throw new PointsAdminError('NOT_FOUND', 'Entry not found.');
    if (entry.voidedAt) throw new PointsAdminError('ALREADY_VOIDED', 'This entry is deleted — restore it before editing.');

    const data: { points?: number; note?: string; editedAt: Date; editedByAdminName: string } = { editedAt: new Date(), editedByAdminName: admin.name };

    if (input.points !== undefined && input.points !== entry.points) {
      const points = cleanPoints(input.points);
      if (entry.type === 'EARNED' && points < 0) throw new PointsAdminError('INVALID', 'An earned entry must stay positive.');
      if (entry.type === 'REDEEMED' && points > 0) throw new PointsAdminError('INVALID', 'A redeemed entry must stay negative.');
      assertNoOverdraw(
        await impact(tx, entry.userId, rows => rows.map(r => (r.id === id ? { ...r, points } : r))),
        'That change would leave points that were already used with nothing behind them',
      );
      data.points = points;
      data.note = cleanNote(input.note, 'A reason for the change');
    } else if (input.note !== undefined) {
      data.note = cleanNote(input.note, 'Note');
    }

    if (data.points === undefined && data.note === undefined) throw new PointsAdminError('INVALID', 'Nothing to change.');

    const updated = await tx.pointsLedger.update({ where: { id }, data });
    return { before: { points: entry.points, note: entry.note }, after: { points: updated.points, note: updated.note } };
  });

  if (!outer) logAudit({ admin, action: 'UPDATE', entityType: 'PointsLedger', entityId: id, before, after });
}

/** "Delete": stop the entry counting toward the balance, keeping it on record. */
export async function voidPointsEntry(admin: Admin, id: string, reason: unknown, outer?: Tx) {
  const why = cleanNote(reason, 'A reason');
  const entry = await inTx(outer, async tx => {
    const e = await tx.pointsLedger.findUnique({ where: { id } });
    if (!e) throw new PointsAdminError('NOT_FOUND', 'Entry not found.');
    if (e.voidedAt) throw new PointsAdminError('ALREADY_VOIDED', 'This entry is already deleted.');
    assertNoOverdraw(
      await impact(tx, e.userId, rows => rows.filter(r => r.id !== id)),
      'Deleting this would leave points that were already used with nothing behind them',
    );
    await tx.pointsLedger.update({ where: { id }, data: { voidedAt: new Date(), voidedByAdminName: admin.name, voidReason: why } });
    return e;
  });

  if (!outer) logAudit({ admin, action: 'DELETE', entityType: 'PointsLedger', entityId: id, before: { points: entry.points, type: entry.type }, after: { voided: true, reason: why } });
}

/** Undo a delete. */
export async function restorePointsEntry(admin: Admin, id: string, outer?: Tx) {
  const entry = await inTx(outer, async tx => {
    const e = await tx.pointsLedger.findUnique({ where: { id } });
    if (!e) throw new PointsAdminError('NOT_FOUND', 'Entry not found.');
    if (!e.voidedAt) throw new PointsAdminError('NOT_VOIDED', 'This entry is not deleted.');
    assertNoOverdraw(
      await impact(tx, e.userId, rows => [...rows, { id: e.id, points: e.points, createdAt: e.createdAt, noExpiry: e.noExpiry }]),
      'Restoring this would use more points than the patient has available',
    );
    await tx.pointsLedger.update({ where: { id }, data: { voidedAt: null, voidedByAdminName: null, voidReason: null, editedAt: new Date(), editedByAdminName: admin.name } });
    return e;
  });

  if (!outer) logAudit({ admin, action: 'UPDATE', entityType: 'PointsLedger', entityId: id, before: { voided: true }, after: { voided: false, points: entry.points } });
}
