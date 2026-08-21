import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/admin/healthcare-programs ── */
export async function GET() {
  try {
    const programs = await db.healthcareProgram.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] });
    return NextResponse.json({ programs });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── POST /api/admin/healthcare-programs ── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageUrl, titleMm, titleEn, descMm, descEn, ctaLink, price, order, isActive, doctorIds } = body;

    if (!imageUrl || !titleMm) {
      return NextResponse.json({ error: 'imageUrl, titleMm are required.' }, { status: 400 });
    }

    const program = await db.healthcareProgram.create({
      data: {
        imageUrl, titleMm, titleEn: titleEn || null,
        descMm: descMm || null, descEn: descEn || null,
        ctaLink: ctaLink || null,
        price: price ?? 0,
        order: order ?? 0,
        isActive: isActive ?? true,
        doctors: Array.isArray(doctorIds) && doctorIds.length > 0
          ? { create: doctorIds.map((doctorId: string) => ({ doctorId })) }
          : undefined,
      },
    });

    return NextResponse.json({ program }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
