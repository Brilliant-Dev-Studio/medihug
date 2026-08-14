import { NextRequest, NextResponse } from 'next/server';
import { verifyDoctorToken } from '@/lib/jwt';
import { db } from '@/lib/db';
import { notify } from '@/lib/notify';
import { publish } from '@/lib/realtime';

async function requireDoctorId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('doctor_token')?.value;
  if (!token) return null;
  const payload = await verifyDoctorToken(token);
  return payload?.doctorId ?? null;
}

async function ownConfirmedAppointment(id: string, doctorId: string) {
  const appt = await db.appointment.findUnique({
    where: { id },
    select: {
      doctorId: true, status: true, userId: true,
      user: { select: { name: true } },
      doctor: { select: { name: true, nameEn: true, imageUrl: true } },
    },
  });
  if (!appt || appt.doctorId !== doctorId || !['CONFIRMED', 'COMPLETED'].includes(appt.status)) return null;
  return appt;
}

/* ── GET /api/doctor/appointments/[id]/messages — own appointment chat, CONFIRMED/COMPLETED only ── */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const doctorId = await requireDoctorId(req);
  if (!doctorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const appt = await ownConfirmedAppointment(id, doctorId);
  if (!appt) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [messages] = await Promise.all([
    db.appointmentMessage.findMany({ where: { appointmentId: id }, orderBy: { createdAt: 'asc' } }),
    db.appointment.update({ where: { id }, data: { unreadDoctorChat: false } }),
  ]);

  return NextResponse.json({ messages });
}

/* ── POST /api/doctor/appointments/[id]/messages { body } ── */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const doctorId = await requireDoctorId(req);
  if (!doctorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const appt = await ownConfirmedAppointment(id, doctorId);
  if (!appt) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { body, attachmentUrl, attachmentName, attachmentType } = await req.json();
  const text = typeof body === 'string' ? body.trim() : '';
  if (!text && !attachmentUrl) {
    return NextResponse.json({ error: 'Message body is required.' }, { status: 400 });
  }

  const [message] = await Promise.all([
    db.appointmentMessage.create({
      data: {
        appointmentId: id, sender: 'DOCTOR', body: text,
        attachmentUrl: attachmentUrl || null, attachmentName: attachmentName || null, attachmentType: attachmentType || null,
      },
    }),
    db.appointment.update({ where: { id }, data: { unreadPatientChat: true, lastChatMessageAt: new Date() } }),
  ]);

  const doctorName = appt.doctor.nameEn ?? appt.doctor.name;
  const preview = text || (attachmentUrl ? '📎 Sent a file' : '');
  notify({
    userId: appt.userId,
    type: 'appointment-message',
    title: doctorName,
    body: preview,
    actionUrl: `/patient/appointments/${id}/form`,
    actorName: doctorName,
    actorAvatar: appt.doctor.imageUrl,
  });
  publish(`user:${appt.userId}`, { kind: 'chat-message', appointmentId: id, message });

  return NextResponse.json({ message }, { status: 201 });
}
