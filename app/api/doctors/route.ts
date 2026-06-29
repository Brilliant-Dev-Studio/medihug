import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const specialty = searchParams.get('specialty') ?? '';
    const search    = searchParams.get('search')    ?? '';
    const limit     = parseInt(searchParams.get('limit') ?? '20');

    const where: Record<string, unknown> = { isActive: true, isAvailable: true };

    if (specialty) where.specialty = { contains: specialty, mode: 'insensitive' };
    if (search)    where.OR = [
      { name:   { contains: search, mode: 'insensitive' } },
      { nameEn: { contains: search, mode: 'insensitive' } },
      { specialty: { contains: search, mode: 'insensitive' } },
    ];

    const doctors = await db.doctor.findMany({
      where,
      include: { slots: { orderBy: { dayOfWeek: 'asc' } } },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    return NextResponse.json({ doctors });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
