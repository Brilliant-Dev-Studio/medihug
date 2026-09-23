import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { expiryConfigOf, getPointsSettings, loadLedgerRows } from '@/lib/pointsLedger';
import { expiringSoon, simulate } from '@/lib/pointsExpiry';

/* ── GET /api/patient/points?phone=xxx — balance + ledger history ── */
export async function GET(req: NextRequest) {
  try {
    const phone = req.nextUrl.searchParams.get('phone') ?? '';
    if (!phone) return NextResponse.json({ error: 'phone is required.' }, { status: 400 });

    const user = await db.user.findUnique({ where: { phone }, select: { id: true } });
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const page  = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') ?? '1'));
    const limit = 20;

    const [entries, total, settings, rows] = await Promise.all([
      db.pointsLedger.findMany({
        where: { userId: user.id, voidedAt: null },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: { id: true, type: true, points: true, sourceType: true, amountKs: true, note: true, createdAt: true },
      }),
      db.pointsLedger.count({ where: { userId: user.id, voidedAt: null } }),
      getPointsSettings(),
      loadLedgerRows(db, [user.id]),
    ]);

    // Balance excludes expired points; each earned entry says when it expires and how much of it is left.
    const cfg = expiryConfigOf(settings);
    const sim = simulate(rows.get(user.id) ?? [], cfg);
    const lotById = new Map(sim.lots.map(l => [l.id, l]));
    const soon = expiringSoon(sim.lots, 30);

    return NextResponse.json({
      balance: sim.balance,
      entries: entries.map(e => {
        const lot = e.points > 0 ? lotById.get(e.id) : undefined;
        return { ...e, expiry: lot && cfg.enabled ? { expiresAt: lot.expiresAt, expired: lot.expired, remaining: lot.remaining } : null };
      }),
      total, page, totalPages: Math.ceil(total / limit),
      kyatPerPointRedeem: settings.kyatPerPointRedeem,
      expiry: cfg.enabled ? { value: cfg.value, unit: cfg.unit, expiredTotal: sim.expiredTotal, expiringSoon: soon } : null,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
