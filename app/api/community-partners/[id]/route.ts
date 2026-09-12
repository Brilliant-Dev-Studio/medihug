import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/community-partners/[id] — public, active-only ── */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const partner = await db.communityPartner.findUnique({ where: { id } });
    if (!partner || !partner.isActive) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ partner });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
