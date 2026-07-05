import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/ads ── */
export async function GET() {
  try {
    const ads = await db.ad.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json({ ads });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
