import { NextRequest, NextResponse } from 'next/server';
import { verifyPartnerToken } from '@/lib/jwt';
import { db } from '@/lib/db';
import { getPlatformSettings } from '@/lib/commission';
import { effectiveQrPercent, getOrCreateReferralQrCode } from '@/lib/partnerQr';

/* ── GET /api/partner/referral-qr — this clinic's permanent referral QR code (created on first
 * open), its current discount %, the SuperAdmin cap on that %, and how many bookings used it. ── */
export async function GET(req: NextRequest) {
  const token = req.cookies.get('partner_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyPartnerToken(token);
  if (!payload?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const [code, settings, usageCount] = await Promise.all([
      getOrCreateReferralQrCode(payload.clinicId),
      getPlatformSettings(),
      db.partnerQrRedemption.count({ where: { clinicId: payload.clinicId } }),
    ]);
    if (!code) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    const clinic = await db.clinic.findUnique({ where: { id: payload.clinicId }, select: { referralQrDiscountPercent: true } });
    const maxPercent = settings.partnerQrDiscountPercent;
    return NextResponse.json({
      code, usageCount, maxPercent,
      percent: effectiveQrPercent(clinic?.referralQrDiscountPercent ?? null, maxPercent),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── PATCH /api/partner/referral-qr — set this clinic's own QR discount %, 0 up to the
 * SuperAdmin-set maximum. ── */
export async function PATCH(req: NextRequest) {
  const token = req.cookies.get('partner_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyPartnerToken(token);
  if (!payload?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { percent } = await req.json();
    const { partnerQrDiscountPercent: maxPercent } = await getPlatformSettings();
    if (!Number.isInteger(percent) || percent < 0 || percent > maxPercent) {
      return NextResponse.json({ error: `Percent must be a whole number between 0 and ${maxPercent}.` }, { status: 400 });
    }
    await db.clinic.update({ where: { id: payload.clinicId }, data: { referralQrDiscountPercent: percent } });
    return NextResponse.json({ percent, maxPercent });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
