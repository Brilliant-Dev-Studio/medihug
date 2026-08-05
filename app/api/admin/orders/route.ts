import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/admin/orders ── */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const search   = searchParams.get('search') ?? '';
    const status   = searchParams.get('status') ?? '';
    const page     = parseInt(searchParams.get('page')     ?? '1');
    const pageSize = parseInt(searchParams.get('pageSize') ?? '10');

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { user: { name:  { contains: search, mode: 'insensitive' } } },
        { user: { phone: { contains: search } } },
      ];
    }
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          user:  { select: { name: true, phone: true } },
          items: { include: { product: { select: { name: true, nameEn: true, imageUrl: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.order.count({ where }),
    ]);

    return NextResponse.json({ orders, total, page, pageSize });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
