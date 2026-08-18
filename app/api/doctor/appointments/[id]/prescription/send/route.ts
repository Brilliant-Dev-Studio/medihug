import { NextRequest, NextResponse } from 'next/server';
import { verifyDoctorToken } from '@/lib/jwt';
import { db } from '@/lib/db';
import { notify } from '@/lib/notify';

async function requireDoctorId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('doctor_token')?.value;
  if (!token) return null;
  const payload = await verifyDoctorToken(token);
  return payload?.doctorId ?? null;
}

/* ── POST /api/doctor/appointments/[id]/prescription/send — locks the draft and notifies the patient ── */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const doctorId = await requireDoctorId(req);
  if (!doctorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const appointment = await db.appointment.findUnique({
    where: { id },
    select: { doctorId: true, status: true, userId: true, doctor: { select: { name: true, nameEn: true, imageUrl: true } } },
  });
  if (!appointment || appointment.doctorId !== doctorId || !['CONFIRMED', 'COMPLETED'].includes(appointment.status)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const existing = await db.prescription.findUnique({ where: { appointmentId: id }, select: { id: true, diagnosis: true } });
  if (!existing) return NextResponse.json({ error: 'No prescription draft to send' }, { status: 400 });
  if (!existing.diagnosis?.trim()) return NextResponse.json({ error: 'Diagnosis is required' }, { status: 400 });

  const prescription = await db.prescription.update({
    where: { appointmentId: id },
    data: { status: 'SENT', sentAt: new Date() },
    include: { medicines: { orderBy: { order: 'asc' } } },
  });

  const doctorName = appointment.doctor.nameEn ?? appointment.doctor.name;
  notify({
    userId: appointment.userId,
    type: 'appointment-prescription',
    title: `Dr. ${doctorName}`,
    body: 'sent you a prescription.',
    actionUrl: `/patient/appointments`,
    actorName: doctorName,
    actorAvatar: appointment.doctor.imageUrl,
  });

  return NextResponse.json({ prescription });
}
