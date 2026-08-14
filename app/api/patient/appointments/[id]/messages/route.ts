import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notify } from '@/lib/notify';
import { publish } from '@/lib/realtime';

async function ownConfirmedAppointment(id: string, phone: string) {
  const appt = await db.appointment.findUnique({
    where: { id },
    select: {
      status: true, userId: true,
      user: { select: { phone: true, name: true, profileImage: true } },
      doctor: { select: { userId: true, name: true, nameEn: true } },
    },
  });
  if (!appt || !phone || phone !== appt.user.phone || !['CONFIRMED', 'COMPLETED'].includes(appt.status)) return null;
  return appt;
}

/* ── GET /api/patient/appointments/[id]/messages?phone= — CONFIRMED/COMPLETED only, own appointment ── */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const phone = req.nextUrl.searchParams.get('phone') ?? '';
  const appt = await ownConfirmedAppointment(id, phone);
  if (!appt) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [messages] = await Promise.all([
    db.appointmentMessage.findMany({ where: { appointmentId: id }, orderBy: { createdAt: 'asc' } }),
    db.appointment.update({ where: { id }, data: { unreadPatientChat: false } }),
  ]);

  return NextResponse.json({ messages });
}

/* ── POST /api/patient/appointments/[id]/messages { phone, body } ── */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { phone, body, attachmentUrl, attachmentName, attachmentType } = await req.json();
  const appt = await ownConfirmedAppointment(id, phone);
  if (!appt) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const text = typeof body === 'string' ? body.trim() : '';
  if (!text && !attachmentUrl) {
    return NextResponse.json({ error: 'Message body is required.' }, { status: 400 });
  }

  const [message] = await Promise.all([
    db.appointmentMessage.create({
      data: {
        appointmentId: id, sender: 'PATIENT', body: text,
        attachmentUrl: attachmentUrl || null, attachmentName: attachmentName || null, attachmentType: attachmentType || null,
      },
    }),
    db.appointment.update({ where: { id }, data: { unreadDoctorChat: true, lastChatMessageAt: new Date() } }),
  ]);

  if (appt.doctor.userId) {
    const preview = text || (attachmentUrl ? '📎 Sent a file' : '');
    notify({
      userId: appt.doctor.userId,
      type: 'appointment-message',
      title: appt.user.name,
      body: preview,
      actionUrl: `/doctor/appointments/${id}`,
      actorName: appt.user.name,
      actorAvatar: appt.user.profileImage,
    });
    publish(`user:${appt.doctor.userId}`, { kind: 'chat-message', appointmentId: id, message });
  }

  return NextResponse.json({ message }, { status: 201 });
}
