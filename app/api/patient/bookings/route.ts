import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

/* ── POST /api/patient/bookings ── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, phone, doctorId, date, time, reason, note,
      paymentMethod, fee, intake,
    } = body;

    if (!name || !phone || !doctorId || !date) {
      return NextResponse.json({ error: 'name, phone, doctorId, date are required.' }, { status: 400 });
    }

    const doctor = await db.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found.' }, { status: 404 });
    }

    const appointment = await db.$transaction(async (tx) => {
      let user = await tx.user.findUnique({ where: { phone } });
      if (!user) {
        const hashedPassword = await bcrypt.hash(phone, 12);
        user = await tx.user.create({
          data: { name, phone, password: hashedPassword, role: 'PATIENT' },
        });
      }

      return tx.appointment.create({
        data: {
          userId:        user.id,
          doctorId,
          date:          new Date(date),
          time:          time ?? null,
          reason:        reason ?? null,
          note:          note ?? null,
          paymentMethod: paymentMethod ?? null,
          fee:           fee ?? null,
          intake:        intake ?? undefined,
        },
        include: { doctor: true, user: true },
      });
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
