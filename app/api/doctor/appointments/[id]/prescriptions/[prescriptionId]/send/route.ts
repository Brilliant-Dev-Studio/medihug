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

/* ── POST /api/doctor/appointments/[id]/prescriptions/[prescriptionId]/send — locks the round and notifies the patient ── */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; prescriptionId: string }> }) {
  const doctorId = await requireDoctorId(req);
  if (!doctorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, prescriptionId } = await params;
  const appointment = await db.appointment.findUnique({
    where: { id },
    select: { doctorId: true, status: true, userId: true, doctor: { select: { name: true, nameEn: true, imageUrl: true } } },
  });
  if (!appointment || appointment.doctorId !== doctorId || !['CONFIRMED', 'COMPLETED'].includes(appointment.status)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const existing = await db.prescription.findUnique({ where: { id: prescriptionId }, select: { appointmentId: true, diagnosis: true, status: true } });
  if (!existing || existing.appointmentId !== id) return NextResponse.json({ error: 'No prescription draft to send' }, { status: 400 });
  if (existing.status === 'SENT') return NextResponse.json({ error: 'Already sent' }, { status: 409 });
  if (!existing.diagnosis?.trim()) return NextResponse.json({ error: 'Diagnosis is required' }, { status: 400 });

  const prescription = await db.prescription.update({
    where: { id: prescriptionId },
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

  const admins = await db.user.findMany({
    where:  { role: 'SUPER_ADMIN', isActive: true },
    select: { id: true },
  });
  for (const admin of admins) {
    notify({
      userId: admin.id,
      type: 'appointment-prescription',
      title: `Dr. ${doctorName}`,
      body: 'sent a prescription.',
      actionUrl: `/admin/appointments/${id}`,
      actorName: doctorName,
      actorAvatar: appointment.doctor.imageUrl,
    });
  }

  return NextResponse.json({ prescription });
}
