import { NextRequest, NextResponse } from 'next/server';
import { verifyPartnerToken } from '@/lib/jwt';
import { db } from '@/lib/db';

async function requireClinicId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('partner_token')?.value;
  if (!token) return null;
  const payload = await verifyPartnerToken(token);
  return payload?.clinicId ?? null;
}

/* ── GET /api/partner/programs — own clinic's listed programs ── */
export async function GET(req: NextRequest) {
  const clinicId = await requireClinicId(req);
  if (!clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const programs = await db.healthcareProgram.findMany({
    where: { clinicId },
    include: { doctors: { select: { doctor: { select: { id: true, name: true, nameEn: true, specialty: true, imageUrl: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ programs });
}

/* ── POST /api/partner/programs — partner lists a new sellable program under their own clinic.
 * Doctors attached must belong to the partner's own clinic (checked via ClinicDoctor). ── */
export async function POST(req: NextRequest) {
  const clinicId = await requireClinicId(req);
  if (!clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { imageUrl, titleMm, titleEn, descMm, descEn, price, doctorIds, categoryId } = body;

    if (!imageUrl || !titleMm) {
      return NextResponse.json({ error: 'imageUrl, titleMm are required.' }, { status: 400 });
    }

    let ownDoctorIds: string[] = [];
    if (Array.isArray(doctorIds) && doctorIds.length > 0) {
      const owned = await db.clinicDoctor.findMany({
        where: { clinicId, doctorId: { in: doctorIds } },
        select: { doctorId: true },
      });
      ownDoctorIds = owned.map(o => o.doctorId);
    }

    const program = await db.healthcareProgram.create({
      data: {
        imageUrl, titleMm, titleEn: titleEn || null,
        descMm: descMm || null, descEn: descEn || null,
        price: price ?? 0,
        clinicId,
        categoryId: categoryId || null,
        isActive: true,
        doctors: ownDoctorIds.length > 0 ? { create: ownDoctorIds.map(doctorId => ({ doctorId })) } : undefined,
      },
    });

    return NextResponse.json({ program }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
