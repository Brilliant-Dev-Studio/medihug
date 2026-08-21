import { NextRequest, NextResponse } from 'next/server';
import { verifyDoctorToken } from '@/lib/jwt';
import { db } from '@/lib/db';

async function requireDoctorId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('doctor_token')?.value;
  if (!token) return null;
  const payload = await verifyDoctorToken(token);
  return payload?.doctorId ?? null;
}

/* ── GET /api/doctor/programs/[id] — one approved enrollment's medical record.
 * Scoped: only visible if this doctor is attached to the program AND it's approved. ── */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const doctorId = await requireDoctorId(req);
  if (!doctorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const enrollment = await db.programEnrollment.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, phone: true, profileImage: true } },
        program: { select: { id: true, titleMm: true, titleEn: true, imageUrl: true, doctors: { select: { doctorId: true } } } },
      },
    });
    if (!enrollment || enrollment.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (!enrollment.program.doctors.some(d => d.doctorId === doctorId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json({ enrollment });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
