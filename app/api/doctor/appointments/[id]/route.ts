import { NextRequest, NextResponse } from 'next/server';
import { verifyDoctorToken } from '@/lib/jwt';
import { db } from '@/lib/db';

async function requireDoctorId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('doctor_token')?.value;
  if (!token) return null;
  const payload = await verifyDoctorToken(token);
  return payload?.doctorId ?? null;
}

/* ── GET /api/doctor/appointments/[id] — own appointments only ── */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const doctorId = await requireDoctorId(req);
  if (!doctorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const appointment = await db.appointment.findUnique({
    where: { id },
    include: {
      user:   { select: { name: true, phone: true } },
      doctor: { select: { name: true, nameEn: true, specialty: true, specialtyEn: true, imageUrl: true } },
    },
  });
  // Doctors only ever see appointments the admin has already approved.
  if (!appointment || appointment.doctorId !== doctorId || !['CONFIRMED', 'COMPLETED'].includes(appointment.status)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ appointment });
}

/* ── PATCH /api/doctor/appointments/[id] — status and/or doctorApproved, own appointments only ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const doctorId = await requireDoctorId(req);
  if (!doctorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { status, doctorApproved } = await req.json();

  const existing = await db.appointment.findUnique({ where: { id }, select: { doctorId: true, status: true } });
  if (!existing || existing.doctorId !== doctorId || !['CONFIRMED', 'COMPLETED'].includes(existing.status)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const data: { status?: 'CONFIRMED' | 'COMPLETED'; doctorApproved?: boolean } = {};

  if (status !== undefined) {
    // Doctors can only mark an admin-approved appointment as completed (or back to confirmed) —
    // approving/cancelling stays an admin-only action.
    if (!['CONFIRMED', 'COMPLETED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    data.status = status;
  }
  if (doctorApproved !== undefined) {
    if (typeof doctorApproved !== 'boolean') {
      return NextResponse.json({ error: 'Invalid doctorApproved' }, { status: 400 });
    }
    data.doctorApproved = doctorApproved;
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const appointment = await db.appointment.update({ where: { id }, data });
  return NextResponse.json({ appointment });
}
