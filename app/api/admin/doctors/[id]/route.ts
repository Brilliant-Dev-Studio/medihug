import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/admin/doctors/[id] ── */
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const doctor = await db.doctor.findUnique({
      where:   { id },
      include: {
        slots:   { orderBy: { dayOfWeek: 'asc' } },
        gallery: { orderBy: { order: 'asc' } },
        user:    { select: { phone: true, isActive: true } },
      },
    });
    if (!doctor) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ doctor });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── PATCH /api/admin/doctors/[id] ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id }  = await params;
    const body    = await req.json();
    const { slots, gallery, ...doctorData } = body;

    const doctor = await db.$transaction(async (tx) => {
      const updated = await tx.doctor.update({ where: { id }, data: doctorData });

      if (slots !== undefined) {
        await tx.doctorSlot.deleteMany({ where: { doctorId: id } });
        if (slots.length > 0) {
          await tx.doctorSlot.createMany({
            data: slots.map((s: { dayOfWeek: number; startTime: string; endTime: string; duration: number; maxPerSlot: number }) => ({
              doctorId: id, dayOfWeek: s.dayOfWeek, startTime: s.startTime,
              endTime: s.endTime, duration: s.duration ?? 15, maxPerSlot: s.maxPerSlot ?? 1,
            })),
          });
        }
      }

      if (gallery !== undefined) {
        await tx.doctorGallery.deleteMany({ where: { doctorId: id } });
        if (gallery.length > 0) {
          await tx.doctorGallery.createMany({
            data: gallery.map((g: { imageUrl: string; captionMm?: string; captionEn?: string }, i: number) => ({
              doctorId: id, imageUrl: g.imageUrl,
              captionMm: g.captionMm ?? '', captionEn: g.captionEn ?? '',
              order: i,
            })),
          });
        }
      }

      return tx.doctor.findUnique({
        where:   { id: updated.id },
        include: {
          slots:   { orderBy: { dayOfWeek: 'asc' } },
          gallery: { orderBy: { order: 'asc' } },
          user:    { select: { phone: true, isActive: true } },
        },
      });
    });

    return NextResponse.json({ doctor });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── DELETE /api/admin/doctors/[id] ── */
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.doctor.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
