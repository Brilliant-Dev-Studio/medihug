import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/admin/appointments ── */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const search   = searchParams.get('search')   ?? '';
    const status   = searchParams.get('status')   ?? '';
    const doctorId = searchParams.get('doctorId') ?? '';
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
    if (status)   where.status   = status;
    if (doctorId) where.doctorId = doctorId;

    const [appointments, total] = await Promise.all([
      db.appointment.findMany({
        where,
        include: {
          user:   { select: { name: true, phone: true } },
          doctor: { select: { name: true, nameEn: true, specialty: true, specialtyEn: true, imageUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip:  (page - 1) * pageSize,
        take:  pageSize,
      }),
      db.appointment.count({ where }),
    ]);

    return NextResponse.json({ appointments, total, page, pageSize });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
