import { NextRequest, NextResponse } from 'next/server';
import { verifyDoctorToken } from '@/lib/jwt';
import { db } from '@/lib/db';

async function requireDoctorId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('doctor_token')?.value;
  if (!token) return null;
  const payload = await verifyDoctorToken(token);
  return payload?.doctorId ?? null;
}

/* ── GET /api/doctor/programs — approved medical records for programs this doctor is on ── */
export async function GET(req: NextRequest) {
  const doctorId = await requireDoctorId(req);
  if (!doctorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const enrollments = await db.programEnrollment.findMany({
      where: { status: 'APPROVED', program: { doctors: { some: { doctorId } } } },
      include: {
        user: { select: { name: true, phone: true, profileImage: true } },
        program: { select: { id: true, titleMm: true, titleEn: true, imageUrl: true } },
      },
      orderBy: { reviewedAt: 'desc' },
    });
    return NextResponse.json({ enrollments });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
