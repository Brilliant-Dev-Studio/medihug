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
  if (!appointment || appointment.doctorId !== doctorId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ appointment });
}

/* ── PATCH /api/doctor/appointments/[id] — status only, own appointments only ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const doctorId = await requireDoctorId(req);
  if (!doctorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();
  if (!['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const existing = await db.appointment.findUnique({ where: { id }, select: { doctorId: true } });
  if (!existing || existing.doctorId !== doctorId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const appointment = await db.appointment.update({ where: { id }, data: { status } });
  return NextResponse.json({ appointment });
}
