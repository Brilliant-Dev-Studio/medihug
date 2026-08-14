import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAudit } from '@/lib/audit';
import { notify } from '@/lib/notify';

/* ── GET /api/admin/appointments/[id] ── */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const appointment = await db.appointment.findUnique({
      where: { id },
      include: {
        user:   { select: { name: true, phone: true, profileImage: true } },
        doctor: { select: { name: true, nameEn: true, specialty: true, specialtyEn: true, imageUrl: true } },
      },
    });
    if (!appointment) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ appointment });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── PATCH /api/admin/appointments/[id] ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const { status, reason } = await req.json();

    if (!['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
    }

    const before = await db.appointment.findUnique({ where: { id }, select: { status: true } });

    const appointment = await db.appointment.update({
      where: { id },
      data:  {
        status,
        ...(status === 'CANCELLED' && before?.status !== 'CANCELLED' && {
          cancelReason: reason || null,
          cancelledAt: new Date(),
        }),
      },
      include: {
        user:   { select: { name: true, phone: true, profileImage: true } },
        doctor: { select: { name: true, nameEn: true, specialty: true, specialtyEn: true, imageUrl: true, userId: true } },
      },
    });

    logAudit({
      admin, action: 'UPDATE', entityType: 'Appointment', entityId: id,
      before: { status: before?.status }, after: { status: appointment.status, cancelReason: appointment.cancelReason },
    });

    // Notify the doctor only on the PENDING → CONFIRMED transition (admin approval).
    if (status === 'CONFIRMED' && before?.status !== 'CONFIRMED' && appointment.doctor.userId) {
      notify({
        userId: appointment.doctor.userId,
        type: 'appointment-confirmed-doctor',
        title: appointment.user.name,
        body: `Your appointment with ${appointment.user.name} has been approved.`,
        actionUrl: `/doctor/appointments`,
        actorName: appointment.user.name,
        actorAvatar: appointment.user.profileImage,
      });
    }

    return NextResponse.json({ appointment });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
