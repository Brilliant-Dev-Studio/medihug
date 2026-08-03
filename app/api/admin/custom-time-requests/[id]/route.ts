import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/admin/custom-time-requests/[id] ── */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const request = await db.customTimeRequest.findUnique({
      where: { id },
      include: {
        user:   { select: { name: true, phone: true } },
        doctor: { select: { name: true, nameEn: true, specialty: true, specialtyEn: true, imageUrl: true } },
      },
    });
    if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ request });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── PATCH /api/admin/custom-time-requests/[id] ──
 * status: APPROVED | REJECTED. Approving also creates a confirmed Appointment
 * for the requested date/time, so it flows into the normal appointments list.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
    }

    const existing = await db.customTimeRequest.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const request = await db.$transaction(async (tx) => {
      const updated = await tx.customTimeRequest.update({
        where: { id },
        data:  { status },
        include: {
          user:   { select: { name: true, phone: true } },
          doctor: { select: { name: true, nameEn: true, specialty: true, imageUrl: true } },
        },
      });

      if (status === 'APPROVED' && existing.status !== 'APPROVED') {
        await tx.appointment.create({
          data: {
            userId:   existing.userId,
            doctorId: existing.doctorId,
            date:     existing.requestedDate,
            time:     existing.requestedTime,
            note:     existing.note,
            status:   'CONFIRMED',
          },
        });
      }

      return updated;
    });

    return NextResponse.json({ request });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
