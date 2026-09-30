import { NextRequest, NextResponse } from 'next/server';
import { verifyPartnerToken } from '@/lib/jwt';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('partner_token')?.value;
  if (!token) return NextResponse.json({ clinic: null }, { status: 401 });

  const payload = await verifyPartnerToken(token);
  if (!payload?.clinicId) return NextResponse.json({ clinic: null }, { status: 401 });

  const clinic = await db.clinic.findUnique({
    where: { id: payload.clinicId },
    select: { id: true, name: true, nameEn: true, type: true, imageUrl: true, isInternational: true },
  });
  if (!clinic) return NextResponse.json({ clinic: null }, { status: 404 });

  // The "International Partner" section is only relevant to partner types the SuperAdmin has
  // flagged as international (Partner Types → International) — everyone else never sees it.
  // A clinic that already switched it on under an older/renamed type keeps access regardless,
  // so re-labelling a PartnerType later can't lock someone out of their own data.
  const internationalType = await db.partnerType.findFirst({
    where: { name: clinic.type, isInternational: true },
    select: { id: true },
  });
  const internationalEligible = !!internationalType || clinic.isInternational;

  return NextResponse.json({ clinic: { ...clinic, userId: payload.id, internationalEligible }, ownerName: payload.name });
}
