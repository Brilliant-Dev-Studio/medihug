import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/admin/custom-time-requests ── */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const search   = searchParams.get('search')   ?? '';
    const status   = searchParams.get('status')   ?? '';
    const page     = parseInt(searchParams.get('page')     ?? '1');
    const pageSize = parseInt(searchParams.get('pageSize') ?? '10');

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { user:   { name:  { contains: search, mode: 'insensitive' } } },
        { user:   { phone: { contains: search } } },
        { doctor: { name:  { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (status) where.status = status;

    const [requests, total, pending, approved, rejected] = await Promise.all([
      db.customTimeRequest.findMany({
        where,
        include: {
          user:   { select: { name: true, phone: true } },
          doctor: { select: { name: true, nameEn: true, specialty: true, imageUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip:  (page - 1) * pageSize,
        take:  pageSize,
      }),
      db.customTimeRequest.count({ where }),
      db.customTimeRequest.count({ where: { status: 'PENDING' } }),
      db.customTimeRequest.count({ where: { status: 'APPROVED' } }),
      db.customTimeRequest.count({ where: { status: 'REJECTED' } }),
    ]);

    return NextResponse.json({ requests, total, page, pageSize, pending, approved, rejected });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
