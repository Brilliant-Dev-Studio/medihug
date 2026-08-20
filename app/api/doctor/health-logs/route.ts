import { NextRequest, NextResponse } from 'next/server';
import { verifyDoctorToken } from '@/lib/jwt';
import { db } from '@/lib/db';
import type { HealthLogType } from '@/lib/healthLog';

async function requireDoctorId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('doctor_token')?.value;
  if (!token) return null;
  const payload = await verifyDoctorToken(token);
  return payload?.doctorId ?? null;
}

/* ── GET /api/doctor/health-logs?phone=&type= — a patient's tracker history, only for
 * patients the doctor actually has an appointment with (privacy boundary). ── */
export async function GET(req: NextRequest) {
  const doctorId = await requireDoctorId(req);
  if (!doctorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = req.nextUrl;
    const phone = searchParams.get('phone') ?? '';
    const type  = searchParams.get('type')  ?? '';
    if (!phone) return NextResponse.json({ error: 'phone is required.' }, { status: 400 });

    const user = await db.user.findUnique({ where: { phone }, select: { id: true } });
    if (!user) return NextResponse.json({ logs: [] });

    const hasAppointment = await db.appointment.findFirst({
      where: { doctorId, userId: user.id },
      select: { id: true },
    });
    if (!hasAppointment) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const logs = await db.healthLog.findMany({
      where: { userId: user.id, ...(type ? { type: type as HealthLogType } : {}) },
      orderBy: { loggedAt: 'desc' },
      take: 100,
    });
    return NextResponse.json({ logs });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
