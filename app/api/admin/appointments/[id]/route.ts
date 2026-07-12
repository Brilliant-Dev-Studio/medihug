import { NextRequest, NextResponse } from 'next/server';
import { Knock } from '@knocklabs/node';
import { db } from '@/lib/db';

const knock = new Knock({ apiKey: process.env.KNOCK_API_KEY! });

/* ── GET /api/admin/appointments/[id] ── */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
  try {
    const { id } = await params;
    const { status } = await req.json();

    if (!['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
    }

    const before = await db.appointment.findUnique({ where: { id }, select: { status: true } });

    const appointment = await db.appointment.update({
      where: { id },
      data:  { status },
      include: {
        user:   { select: { name: true, phone: true, profileImage: true } },
        doctor: { select: { name: true, nameEn: true, specialty: true, specialtyEn: true, imageUrl: true, userId: true } },
      },
    });

    // Notify the doctor only on the PENDING → CONFIRMED transition (admin approval).
    if (status === 'CONFIRMED' && before?.status !== 'CONFIRMED' && appointment.doctor.userId) {
      try {
        await knock.workflows.trigger('appointment-confirmed-doctor', {
          recipients: [{ id: appointment.doctor.userId, name: appointment.doctor.nameEn ?? appointment.doctor.name }],
          actor: { id: appointment.userId, name: appointment.user.name },
          data: {
            patientName:   appointment.user.name,
            appointmentId: appointment.id,
            date:          appointment.date.toISOString(),
            message:       `Your appointment with ${appointment.user.name} has been approved.`,
            actionUrl:     `/doctor/appointments`,
          },
        });
      } catch (notifyErr) {
        // Status update itself succeeded — don't fail the request over a notification hiccup.
        console.error('Knock trigger (appointment-confirmed-doctor) failed:', notifyErr);
      }
    }

    return NextResponse.json({ appointment });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
