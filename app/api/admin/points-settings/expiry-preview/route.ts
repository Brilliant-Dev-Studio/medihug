import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { getExpiryConfig, loadLedgerRows } from '@/lib/pointsLedger';
import { expiringSoon, simulate, type ExpiryConfig } from '@/lib/pointsExpiry';

/* ── POST /api/admin/points-settings/expiry-preview { enabled, value, unit }
 * What saving this expiry setting would do to patients' points RIGHT NOW — so a SuperAdmin sees
 * the impact before confirming. Read-only: nothing is changed. ── */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req, 'settings.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { enabled, value, unit } = await req.json();
    if (typeof enabled !== 'boolean' || (unit !== 'DAYS' && unit !== 'MONTHS') || !Number.isInteger(value) || value < 1) {
      return NextResponse.json({ error: 'enabled, value and unit are required.' }, { status: 400 });
    }
    const candidate: ExpiryConfig = { enabled, value, unit };
    const current = await getExpiryConfig();

    const now = new Date();
    const rowsByUser = await loadLedgerRows(db);
    let usersAffected = 0, pointsLost = 0, pointsRestored = 0, soonPoints = 0, soonUsers = 0, balanceBefore = 0, balanceAfter = 0;

    for (const rows of rowsByUser.values()) {
      const before = simulate(rows, current, now);
      const after = simulate(rows, candidate, now);
      balanceBefore += before.balance; balanceAfter += after.balance;
      if (after.balance < before.balance) { usersAffected++; pointsLost += before.balance - after.balance; }
      else if (after.balance > before.balance) { usersAffected++; pointsRestored += after.balance - before.balance; }
      const soon = expiringSoon(after.lots, 30, now);
      if (soon.points > 0) { soonPoints += soon.points; soonUsers++; }
    }

    return NextResponse.json({ usersAffected, pointsLost, pointsRestored, balanceBefore, balanceAfter, expiringSoon30: { points: soonPoints, users: soonUsers } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
