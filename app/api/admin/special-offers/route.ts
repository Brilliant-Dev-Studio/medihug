import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/admin/special-offers ── */
export async function GET() {
  try {
    const offers = await db.specialOffer.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] });
    return NextResponse.json({ offers });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── POST /api/admin/special-offers ── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      imageUrl, badgeMm, badgeEn, titleMm, titleEn, descMm, descEn,
      ctaMm, ctaEn, ctaLink, ctaColor, order, isActive,
    } = body;

    if (!imageUrl || !badgeMm || !titleMm || !ctaMm) {
      return NextResponse.json({ error: 'imageUrl, badgeMm, titleMm, ctaMm are required.' }, { status: 400 });
    }

    const offer = await db.specialOffer.create({
      data: {
        imageUrl, badgeMm, badgeEn: badgeEn || null,
        titleMm, titleEn: titleEn || null,
        descMm: descMm || null, descEn: descEn || null,
        ctaMm, ctaEn: ctaEn || null, ctaLink: ctaLink || null,
        ctaColor: ctaColor || '#0d2b6e',
        order: order ?? 0,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({ offer }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
