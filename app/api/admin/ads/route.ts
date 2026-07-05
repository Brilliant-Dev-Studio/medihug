import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/admin/ads ── */
export async function GET() {
  try {
    const ads = await db.ad.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] });
    return NextResponse.json({ ads });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── POST /api/admin/ads ── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageUrl, alt, link, order, isActive } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'imageUrl is required.' }, { status: 400 });
    }

    const ad = await db.ad.create({
      data: {
        imageUrl, alt: alt || null, link: link || null,
        order: order ?? 0,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({ ad }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
