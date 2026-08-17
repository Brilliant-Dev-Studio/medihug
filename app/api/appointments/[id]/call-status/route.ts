import { NextRequest, NextResponse } from 'next/server';
import { verifyDoctorToken } from '@/lib/jwt';
import { db } from '@/lib/db';

/* ── PATCH /api/appointments/[id]/call-status { active, role, phone? } —
 * Doctor/patient side of VideoCallRoom flips this on successful join and back off on leave.
 * Drives the admin appointments list "Join" button (only shown while a call is actually live).
 * Not role-scoped under /api/doctor or /api/patient since VideoCallRoom is shared across both. ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { active, role, phone } = await req.json();

  if (typeof active !== 'boolean' || (role !== 'doctor' && role !== 'patient')) {
    return NextResponse.json({ error: 'Invalid body.' }, { status: 400 });
  }

  const appt = await db.appointment.findUnique({
    where: { id },
    select: { doctorId: true, user: { select: { phone: true } } },
  });
  if (!appt) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (role === 'doctor') {
    const token = req.cookies.get('doctor_token')?.value;
    const payload = token ? await verifyDoctorToken(token) : null;
    if (!payload || payload.doctorId !== appt.doctorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } else {
    if (!phone || phone !== appt.user.phone) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  await db.appointment.update({ where: { id }, data: { callActive: active } });
  return NextResponse.json({ success: true });
}
