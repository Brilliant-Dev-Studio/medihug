import { NextRequest, NextResponse } from 'next/server';
import { verifyDoctorToken } from '@/lib/jwt';
import { db } from '@/lib/db';

async function requireDoctorId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('doctor_token')?.value;
  if (!token) return null;
  const payload = await verifyDoctorToken(token);
  return payload?.doctorId ?? null;
}

/* ── GET /api/doctor/profile — own info + weekly slots (read-only) ── */
export async function GET(req: NextRequest) {
  const doctorId = await requireDoctorId(req);
  if (!doctorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const doctor = await db.doctor.findUnique({
    where: { id: doctorId },
    include: {
      slots:   { orderBy: { dayOfWeek: 'asc' } },
      gallery: { orderBy: { order: 'asc' } },
    },
  });
  if (!doctor) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ doctor });
}
