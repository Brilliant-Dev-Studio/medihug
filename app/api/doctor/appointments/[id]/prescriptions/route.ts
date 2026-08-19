import { NextRequest, NextResponse } from 'next/server';
import { verifyDoctorToken } from '@/lib/jwt';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function requireDoctorId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('doctor_token')?.value;
  if (!token) return null;
  const payload = await verifyDoctorToken(token);
  return payload?.doctorId ?? null;
}

async function loadOwnAppointment(id: string, doctorId: string) {
  const appointment = await db.appointment.findUnique({ where: { id }, select: { doctorId: true, status: true } });
  if (!appointment || appointment.doctorId !== doctorId || !['CONFIRMED', 'COMPLETED'].includes(appointment.status)) return null;
  return appointment;
}

/* ── GET /api/doctor/appointments/[id]/prescriptions — list all rounds ── */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const doctorId = await requireDoctorId(req);
  if (!doctorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!(await loadOwnAppointment(id, doctorId))) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const prescriptions = await db.prescription.findMany({
    where: { appointmentId: id },
    include: { medicines: { orderBy: { order: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ prescriptions }, { headers: { 'Cache-Control': 'no-store' } });
}

/* ── POST /api/doctor/appointments/[id]/prescriptions — start a new round ── */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const doctorId = await requireDoctorId(req);
  if (!doctorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!(await loadOwnAppointment(id, doctorId))) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const existingDraft = await db.prescription.findFirst({ where: { appointmentId: id, status: 'DRAFT' } });
  const prescription = existingDraft
    ? await db.prescription.findUniqueOrThrow({ where: { id: existingDraft.id }, include: { medicines: { orderBy: { order: 'asc' } } } })
    : await db.prescription.create({ data: { appointmentId: id }, include: { medicines: { orderBy: { order: 'asc' } } } });

  return NextResponse.json({ prescription });
}
