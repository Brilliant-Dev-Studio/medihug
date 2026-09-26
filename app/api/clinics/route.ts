import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/clinics ── */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const limit  = parseInt(searchParams.get('limit') ?? '10');
    const skip   = parseInt(searchParams.get('skip')  ?? '0');
    const type   = searchParams.get('type')   ?? '';
    const categoryId = searchParams.get('categoryId') ?? '';
    const search = searchParams.get('search') ?? '';

    const international = searchParams.get('international') ?? '';

    const where: Record<string, unknown> = { isActive: true, isPartner: true, isInternational: false };
    if (international === 'true') where.isInternational = true;
    if (type)   where.type = { equals: type, mode: 'insensitive' };
    if (search) where.OR = [
      { name:   { contains: search, mode: 'insensitive' } },
      { nameEn: { contains: search, mode: 'insensitive' } },
      { type:   { contains: search, mode: 'insensitive' } },
    ];

    // Scoped to a landing-page category: only partners tagged onto it, in the order they were tagged.
    const clinics = categoryId
      ? await db.categoryClinic.findMany({
          where: { categoryId, clinic: where },
          orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
          include: { clinic: { include: { _count: { select: { doctors: true } } } } },
          skip,
          take: limit,
        }).then(links => links.map(l => l.clinic))
      : await db.clinic.findMany({
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
