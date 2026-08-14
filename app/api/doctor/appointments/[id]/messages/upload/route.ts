import { NextRequest, NextResponse } from 'next/server';
import { verifyDoctorToken } from '@/lib/jwt';
import { db } from '@/lib/db';
import { uploadChatFileToS3 } from '@/lib/s3-upload';

async function requireDoctorId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('doctor_token')?.value;
  if (!token) return null;
  const payload = await verifyDoctorToken(token);
  return payload?.doctorId ?? null;
}

async function ownConfirmedAppointment(id: string, doctorId: string) {
  const appt = await db.appointment.findUnique({ where: { id }, select: { doctorId: true, status: true } });
  if (!appt || appt.doctorId !== doctorId || !['CONFIRMED', 'COMPLETED'].includes(appt.status)) return null;
  return appt;
}

/* ── POST /api/doctor/appointments/[id]/messages/upload — chat attachment, own confirmed appointment ── */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const doctorId = await requireDoctorId(req);
  if (!doctorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const appt = await ownConfirmedAppointment(id, doctorId);
  if (!appt) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const result = await uploadChatFileToS3(file);
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ url: result.url, name: file.name, type: file.type });
}
