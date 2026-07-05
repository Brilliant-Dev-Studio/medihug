import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/clinics ── */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const limit = parseInt(searchParams.get('limit') ?? '10');

    const clinics = await db.clinic.findMany({
      where: { isActive: true, isPartner: true },
      orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });

    return NextResponse.json({ clinics });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
