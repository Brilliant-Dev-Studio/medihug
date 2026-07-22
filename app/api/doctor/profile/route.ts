import { NextRequest, NextResponse } from 'next/server';
import { verifyDoctorToken } from '@/lib/jwt';
import { db } from '@/lib/db';

async function requireDoctorId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('doctor_token')?.value;
  if (!token) return null;
  const payload = await verifyDoctorToken(token);
  return payload?.doctorId ?? null;
}

/* ── GET /api/doctor/profile — own info + weekly slots ── */
export async function GET(req: NextRequest) {
  try {
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
  } catch (e) {
    console.error('GET /api/doctor/profile failed:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Fields a doctor may edit on their own profile. Identity (name/specialty), login phone,
// pricing/experience and weekly slots stay admin-controlled — those go through the admin panel.
const EDITABLE_FIELDS = [
  'imageUrl', 'coverUrl', 'bio', 'phoneSecondary', 'viber', 'location',
  'careerMm', 'careerEn', 'qualifications',
  'clinicNote', 'clinicNoteEn', 'languages', 'clinicTypesMm', 'clinicTypesEn',
  'isAvailable',
] as const;

/* ── PATCH /api/doctor/profile — self-edit a limited set of fields ── */
export async function PATCH(req: NextRequest) {
  try {
    const doctorId = await requireDoctorId(req);
    if (!doctorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data: Record<string, unknown> = {};
    for (const key of EDITABLE_FIELDS) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const doctor = await db.doctor.update({ where: { id: doctorId }, data });
    return NextResponse.json({ doctor });
  } catch (e) {
    console.error('PATCH /api/doctor/profile failed:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
