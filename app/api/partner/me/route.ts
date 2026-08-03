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
    select: { id: true, name: true, nameEn: true, type: true, imageUrl: true },
  });
  if (!clinic) return NextResponse.json({ clinic: null }, { status: 404 });

  return NextResponse.json({ clinic, ownerName: payload.name });
}
