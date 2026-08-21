import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/clinics ── */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const limit  = parseInt(searchParams.get('limit') ?? '10');
    const skip   = parseInt(searchParams.get('skip')  ?? '0');
    const type   = searchParams.get('type')   ?? '';
    const search = searchParams.get('search') ?? '';

    const where: Record<string, unknown> = { isActive: true, isPartner: true };
    if (type)   where.type = { equals: type, mode: 'insensitive' };
    if (search) where.OR = [
      { name:   { contains: search, mode: 'insensitive' } },
      { nameEn: { contains: search, mode: 'insensitive' } },
      { type:   { contains: search, mode: 'insensitive' } },
    ];

    const clinics = await db.clinic.findMany({
      where,
      include: { _count: { select: { doctors: true } } },
      orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: limit,
    });

    return NextResponse.json({ clinics });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
