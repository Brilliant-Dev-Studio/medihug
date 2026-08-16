import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';

/* ── GET /api/admin/users — list PATIENT accounts ── */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req, 'dashboard.view');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = req.nextUrl;
    const search   = searchParams.get('search') ?? '';
    const gender   = searchParams.get('gender') ?? '';
    const isActive = searchParams.get('isActive') ?? '';
    const state    = searchParams.get('state') ?? '';
    const page     = parseInt(searchParams.get('page')     ?? '1');
    const pageSize = parseInt(searchParams.get('pageSize') ?? '10');

    const where: Record<string, unknown> = { role: 'PATIENT' };
    if (search) {
      where.OR = [
        { name:  { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }
    if (gender)          where.gender   = gender;
    if (isActive !== '') where.isActive = isActive === 'true';
    if (state)            where.state   = state;

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true, name: true, phone: true, gender: true, birthday: true,
          state: true, township: true, isActive: true, createdAt: true,
          _count: { select: { appointments: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({ users, total, page, pageSize });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
