import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/admin/program-enrollments ── */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const status   = searchParams.get('status')   ?? '';
    const search   = searchParams.get('search')   ?? '';
    const page     = parseInt(searchParams.get('page')     ?? '1');
    const pageSize = parseInt(searchParams.get('pageSize') ?? '15');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { user:    { name:  { contains: search, mode: 'insensitive' } } },
        { user:    { phone: { contains: search } } },
        { program: { titleMm: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [enrollments, total] = await Promise.all([
      db.programEnrollment.findMany({
        where,
        include: {
          user: { select: { name: true, phone: true, profileImage: true } },
          program: { select: { id: true, titleMm: true, titleEn: true, imageUrl: true, price: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.programEnrollment.count({ where }),
    ]);

    return NextResponse.json({ enrollments, total, page, pageSize });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
