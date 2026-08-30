import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';

/* ── GET /api/admin/points-report — which patient has how many points ── */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req, 'dashboard.view');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = req.nextUrl;
    const search   = searchParams.get('search') ?? '';
    const page     = Math.max(1, parseInt(searchParams.get('page')     ?? '1'));
    const pageSize = parseInt(searchParams.get('pageSize') ?? '15');

    const where: Record<string, unknown> = { role: 'PATIENT' };
    if (search) {
      where.OR = [
        { name:  { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: { id: true, name: true, phone: true, isActive: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.user.count({ where }),
    ]);

    const balances = await db.pointsLedger.groupBy({
      by: ['userId'],
      where: { userId: { in: users.map(u => u.id) } },
      _sum: { points: true },
    });
    const balanceMap = new Map(balances.map(b => [b.userId, b._sum.points ?? 0]));

    const patients = users.map(u => ({ ...u, balance: balanceMap.get(u.id) ?? 0 }));

    return NextResponse.json({ patients, total, page, pageSize });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
