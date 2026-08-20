import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { db } from '@/lib/db';
import type { HealthLogType } from '@/lib/healthLog';

/* ── GET /api/admin/health-logs?userId=&type=&page=&pageSize= ── */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req, 'dashboard.view');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = req.nextUrl;
    const userId   = searchParams.get('userId') ?? '';
    const type     = searchParams.get('type')   ?? '';
    const search   = searchParams.get('search') ?? '';
    const page     = parseInt(searchParams.get('page')     ?? '1');
    const pageSize = parseInt(searchParams.get('pageSize') ?? '20');

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (type)   where.type   = type as HealthLogType;
    if (search) where.user = { OR: [
      { name:  { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
    ] };

    const [logs, total] = await Promise.all([
      db.healthLog.findMany({
        where,
        include: { user: { select: { id: true, name: true, phone: true } } },
        orderBy: { loggedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.healthLog.count({ where }),
    ]);
    return NextResponse.json({ logs, total, page, pageSize });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
