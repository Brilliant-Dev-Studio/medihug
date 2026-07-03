import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/special-offers ── */
export async function GET() {
  try {
    const offers = await db.specialOffer.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json({ offers });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
