import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/community-partners — public, active-only, ordered ── */
export async function GET() {
  try {
    const partners = await db.communityPartner.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json({ partners });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
