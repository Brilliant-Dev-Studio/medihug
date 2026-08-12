import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/patient/appointments/[id] ── */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const appointment = await db.appointment.findUnique({
      where: { id },
      include: {
        user:   { select: { name: true, phone: true } },
        doctor: { select: { name: true, nameEn: true, specialty: true, specialtyEn: true, imageUrl: true } },
        referredDoctor: { select: { id: true, name: true, nameEn: true, specialty: true, specialtyEn: true, imageUrl: true } },
        referredClinic: { select: { id: true, name: true, nameEn: true, type: true, imageUrl: true } },
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    }

    return NextResponse.json({ appointment });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── PATCH /api/patient/appointments/[id] — patient accepts (callRinging:false) or declines (+ callDeclined:true) the incoming call ring ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { phone, callRinging, callDeclined } = await req.json();

    if (callRinging !== false) {
      return NextResponse.json({ error: 'Invalid callRinging' }, { status: 400 });
    }
    if (callDeclined !== undefined && callDeclined !== true) {
      return NextResponse.json({ error: 'Invalid callDeclined' }, { status: 400 });
    }

    const appointment = await db.appointment.findUnique({
      where: { id },
      select: { user: { select: { phone: true } } },
    });
    if (!appointment || !phone || phone !== appointment.user.phone) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updated = await db.appointment.update({
      where: { id },
      data: { callRinging: false, ...(callDeclined ? { callDeclined: true } : {}) },
    });
    return NextResponse.json({ appointment: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
