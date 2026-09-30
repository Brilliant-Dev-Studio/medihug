import { NextRequest, NextResponse } from 'next/server';
import { verifyPartnerToken } from '@/lib/jwt';
import { db } from '@/lib/db';
import type { MedicalRequestStatus } from '@/app/generated/prisma/enums';

async function requireClinicId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('partner_token')?.value;
  if (!token) return null;
  const payload = await verifyPartnerToken(token);
  return payload?.clinicId ?? null;
}

/* ── GET /api/partner/medical-requests — this partner's own International Hospital
 * Representative pipeline (their clinic, or any of their sub-clinic "Hospitals"). ── */
export async function GET(req: NextRequest) {
  const clinicId = await requireClinicId(req);
  if (!clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const status = searchParams.get('status') ?? '';

  const requests = await db.medicalRequest.findMany({
    where: { ownerClinicId: clinicId, ...(status ? { status: status as MedicalRequestStatus } : {}) },
    orderBy: { createdAt: 'desc' },
    include: { hospitalClinic: { select: { id: true, name: true, nameEn: true, country: true, countryEn: true } } },
  });
  return NextResponse.json({ requests });
}
