import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { Knock } from '@knocklabs/node';
import { db } from '@/lib/db';
import { parseSlotTimes, maxPerSlotFor, dayBounds } from '@/lib/timeSlots';

const knock = new Knock({ apiKey: process.env.KNOCK_API_KEY! });

/* ── POST /api/patient/bookings ── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, phone, doctorId, date, time, reason, note,
      paymentMethod, fee, receiptUrl, intake,
    } = body;

    if (!name || !phone || !doctorId || !date) {
      return NextResponse.json({ error: 'name, phone, doctorId, date are required.' }, { status: 400 });
    }

    const doctor = await db.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found.' }, { status: 404 });
    }

    const appointment = await db.$transaction(async (tx) => {
      if (time) {
        const requestedSlots = parseSlotTimes(time);
        const { start, end } = dayBounds(date);
        const dayOfWeek = start.getDay();

        const [firstH, firstM] = requestedSlots[0].split(':').map(Number);
        const target = new Date(start); target.setHours(firstH, firstM, 0, 0);
        // Grace period: the intake form can take several minutes to fill out between
        // picking a slot and final submit, so don't reject a slot that only just ticked past.
        const GRACE_MS = 5 * 60 * 1000;
        if (target.getTime() < Date.now() - GRACE_MS) throw new Error('PAST_SLOT');

        const [windows, existing] = await Promise.all([
          tx.doctorSlot.findMany({ where: { doctorId, dayOfWeek, isActive: true }, select: { startTime: true, endTime: true, maxPerSlot: true } }),
          tx.appointment.findMany({ where: { doctorId, date: { gte: start, lt: end }, status: { not: 'CANCELLED' } }, select: { time: true } }),
        ]);

        const counts: Record<string, number> = {};
        for (const a of existing) {
          if (!a.time) continue;
          for (const slot of parseSlotTimes(a.time)) counts[slot] = (counts[slot] ?? 0) + 1;
        }

        const isFull = requestedSlots.some(slot => (counts[slot] ?? 0) >= maxPerSlotFor(slot, windows));
        if (isFull) throw new Error('SLOT_TAKEN');
      }

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
          receiptUrl:    receiptUrl ?? null,
          intake:        intake ?? undefined,
        },
        include: { doctor: true, user: true },
      });
    });

    const admins = await db.user.findMany({
      where:  { role: 'SUPER_ADMIN', isActive: true },
      select: { id: true, name: true },
    });

    if (admins.length > 0) {
      try {
        await knock.workflows.trigger('new-appointment-booked', {
          recipients: admins.map((a) => ({ id: a.id, name: a.name })),
          actor: { id: appointment.userId, name: appointment.user.name },
          data: {
            patientName:   appointment.user.name,
            doctorName:    appointment.doctor.name,
            appointmentId: appointment.id,
            date:          appointment.date.toISOString(),
            message:       `${appointment.user.name} booked an appointment with Dr. ${appointment.doctor.name}.`,
            actionUrl:     `/admin/appointments/${appointment.id}`,
          },
        });
      } catch (notifyErr) {
        // Booking itself succeeded — don't fail the request over a notification hiccup.
        console.error('Knock trigger (new-appointment-booked) failed:', notifyErr);
      }
    }

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === 'SLOT_TAKEN') {
      return NextResponse.json({ error: 'This time slot was just booked by someone else. Please choose another.', code: 'SLOT_TAKEN' }, { status: 409 });
    }
    if (e instanceof Error && e.message === 'PAST_SLOT') {
      return NextResponse.json({ error: 'This time slot has already passed. Please choose another.', code: 'PAST_SLOT' }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
