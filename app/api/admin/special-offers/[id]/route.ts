import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/admin/special-offers/[id] ── */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const offer = await db.specialOffer.findUnique({ where: { id } });
    if (!offer) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ offer });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── PATCH /api/admin/special-offers/[id] ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      imageUrl, badgeMm, badgeEn, titleMm, titleEn, descMm, descEn,
      ctaMm, ctaEn, ctaLink, ctaColor, order, isActive,
    } = body;

    const data: Record<string, unknown> = {};
    if (imageUrl  !== undefined) data.imageUrl  = imageUrl;
    if (badgeMm   !== undefined) data.badgeMm   = badgeMm;
    if (badgeEn   !== undefined) data.badgeEn   = badgeEn || null;
    if (titleMm   !== undefined) data.titleMm   = titleMm;
    if (titleEn   !== undefined) data.titleEn   = titleEn || null;
    if (descMm    !== undefined) data.descMm    = descMm || null;
    if (descEn    !== undefined) data.descEn    = descEn || null;
    if (ctaMm     !== undefined) data.ctaMm     = ctaMm;
    if (ctaEn     !== undefined) data.ctaEn     = ctaEn || null;
    if (ctaLink   !== undefined) data.ctaLink   = ctaLink || null;
    if (ctaColor  !== undefined) data.ctaColor  = ctaColor;
    if (order     !== undefined) data.order     = order;
    if (isActive  !== undefined) data.isActive  = isActive;

    const offer = await db.specialOffer.update({ where: { id }, data });
    return NextResponse.json({ offer });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── DELETE /api/admin/special-offers/[id] ── */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.specialOffer.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
