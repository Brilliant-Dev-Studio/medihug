import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { uploadChatFileToS3 } from '@/lib/s3-upload';

async function ownConfirmedAppointment(id: string, phone: string) {
  const appt = await db.appointment.findUnique({ where: { id }, select: { status: true, user: { select: { phone: true } } } });
  if (!appt || !phone || phone !== appt.user.phone || !['CONFIRMED', 'COMPLETED'].includes(appt.status)) return null;
  return appt;
}

/* ── POST /api/patient/appointments/[id]/messages/upload — chat attachment, own confirmed appointment ── */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formData = await req.formData();
  const phone = formData.get('phone');
  const file = formData.get('file');

  if (typeof phone !== 'string') {
    return NextResponse.json({ error: 'phone is required' }, { status: 400 });
  }
  const appt = await ownConfirmedAppointment(id, phone);
  if (!appt) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const result = await uploadChatFileToS3(file);
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ url: result.url, name: file.name, type: file.type });
}
