import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/admin/healthcare-programs/[id] ── */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const program = await db.healthcareProgram.findUnique({
      where: { id },
      include: { doctors: { select: { doctorId: true } } },
    });
    if (!program) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ program });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── PATCH /api/admin/healthcare-programs/[id] ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { imageUrl, titleMm, titleEn, descMm, descEn, ctaLink, price, order, isActive, doctorIds } = body;

    const data: Record<string, unknown> = {};
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (titleMm  !== undefined) data.titleMm  = titleMm;
    if (titleEn  !== undefined) data.titleEn  = titleEn || null;
    if (descMm   !== undefined) data.descMm   = descMm || null;
    if (descEn   !== undefined) data.descEn   = descEn || null;
    if (ctaLink  !== undefined) data.ctaLink  = ctaLink || null;
    if (price    !== undefined) data.price    = price;
    if (order    !== undefined) data.order    = order;
    if (isActive !== undefined) data.isActive = isActive;

    const program = await db.$transaction(async tx => {
      const updated = await tx.healthcareProgram.update({ where: { id }, data });
      if (Array.isArray(doctorIds)) {
        await tx.programDoctor.deleteMany({ where: { programId: id } });
        if (doctorIds.length > 0) {
          await tx.programDoctor.createMany({ data: doctorIds.map((doctorId: string) => ({ programId: id, doctorId })) });
        }
      }
      return updated;
    });

    return NextResponse.json({ program });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── DELETE /api/admin/healthcare-programs/[id] ── */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.healthcareProgram.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
