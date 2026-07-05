import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/admin/ads/[id] ── */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ad = await db.ad.findUnique({ where: { id } });
    if (!ad) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ad });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── PATCH /api/admin/ads/[id] ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { imageUrl, alt, link, order, isActive } = body;

    const data: Record<string, unknown> = {};
    if (imageUrl  !== undefined) data.imageUrl  = imageUrl;
    if (alt       !== undefined) data.alt       = alt || null;
    if (link      !== undefined) data.link      = link || null;
    if (order     !== undefined) data.order     = order;
    if (isActive  !== undefined) data.isActive  = isActive;

    const ad = await db.ad.update({ where: { id }, data });
    return NextResponse.json({ ad });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── DELETE /api/admin/ads/[id] ── */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.ad.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
