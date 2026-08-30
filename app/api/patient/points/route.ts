import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getPointsBalance, getPointsSettings } from '@/lib/pointsLedger';

/* ── GET /api/patient/points?phone=xxx — balance + ledger history ── */
export async function GET(req: NextRequest) {
  try {
    const phone = req.nextUrl.searchParams.get('phone') ?? '';
    if (!phone) return NextResponse.json({ error: 'phone is required.' }, { status: 400 });

    const user = await db.user.findUnique({ where: { phone }, select: { id: true } });
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const page  = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') ?? '1'));
    const limit = 20;

    const [entries, total, balance, settings] = await Promise.all([
      db.pointsLedger.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.pointsLedger.count({ where: { userId: user.id } }),
      getPointsBalance(user.id),
      getPointsSettings(),
    ]);

    return NextResponse.json({
      balance, entries, total, page, totalPages: Math.ceil(total / limit),
      kyatPerPointRedeem: settings.kyatPerPointRedeem,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
