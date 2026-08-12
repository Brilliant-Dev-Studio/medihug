import { NextRequest, NextResponse } from 'next/server';
import { verifyPartnerToken } from '@/lib/jwt';
import { db } from '@/lib/db';

/* ── POST /api/partner/referrals/verify — scan/enter a referral code, scoped to the logged-in clinic ── */
export async function POST(req: NextRequest) {
  const token = req.cookies.get('partner_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyPartnerToken(token);
  if (!payload?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { code } = await req.json();
  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: 'Code is required.' }, { status: 400 });
  }

  const referral = await db.clinicReferral.findUnique({
    where: { code: code.trim().toUpperCase() },
    include: {
      user: { select: { name: true, phone: true } },
      doctor: { select: { name: true, nameEn: true, specialty: true, specialtyEn: true } },
      appointment: { select: { date: true, reason: true } },
    },
  });

  if (!referral) {
    return NextResponse.json({ error: 'Invalid or unknown code.', valid: false }, { status: 404 });
  }
  // A code only verifies as legit at the clinic it was actually referred to — never leak
  // whether a code exists at all to a different clinic scanning it.
  if (referral.clinicId !== payload.clinicId) {
    return NextResponse.json({ error: 'This referral is not for your clinic.', valid: false }, { status: 404 });
  }

  const alreadyVerified = !!referral.verifiedAt;
  if (!alreadyVerified) {
    await db.clinicReferral.update({
      where: { id: referral.id },
      data: { verifiedAt: new Date(), verifiedBy: payload.id },
    });
  }

  return NextResponse.json({
    valid: true,
    alreadyVerified,
    patient: referral.user,
    doctor: referral.doctor,
    reason: referral.appointment.reason,
    appointmentDate: referral.appointment.date,
    verifiedAt: alreadyVerified ? referral.verifiedAt : new Date(),
  });
}
