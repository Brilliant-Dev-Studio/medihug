import { NextRequest, NextResponse } from 'next/server';
import { verifyPartnerToken } from '@/lib/jwt';
import { db } from '@/lib/db';

async function requireClinicId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('partner_token')?.value;
  if (!token) return null;
  const payload = await verifyPartnerToken(token);
  return payload?.clinicId ?? null;
}

/* ── GET /api/partner/earnings — this clinic's own slice of the Revenue Ledger.
 * Reuses the same admin Finance data (RevenueLedger), scoped to rows where this clinic is
 * either the revenue owner (clinicId) or the referrer (referralClinicId) — no separate
 * partner-earnings model, per the "reuse POS/Finance, don't build a new module" scope. ── */
export async function GET(req: NextRequest) {
  const clinicId = await requireClinicId(req);
  if (!clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = req.nextUrl;
    const sourceType = searchParams.get('sourceType') ?? '';
    const settlementStatus = searchParams.get('settlementStatus') ?? '';
    const page  = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = 20;
    const skip  = (page - 1) * limit;

    const where: Record<string, unknown> = { OR: [{ clinicId }, { referralClinicId: clinicId }] };
    if (sourceType) where.sourceType = sourceType;
    if (settlementStatus) where.settlementStatus = settlementStatus;

    const [rows, total] = await Promise.all([
      db.revenueLedger.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      db.revenueLedger.count({ where }),
    ]);

    // "Your earning" per row: revenue-share (patientPaid - medihugShareAmount) when this
    // clinic owns the transaction, plus the referral fee when this clinic referred it.
    // The two are mutually exclusive per row in practice (a transaction is either owned or
    // referred by a given clinic), summed generically in case a row somehow matches both.
    const entries = rows.map(r => {
      const ownerEarning    = r.clinicId === clinicId ? r.partnerShareAmount : 0;
      const referralEarning = r.referralClinicId === clinicId ? r.partnerReferralFeeAmount : 0;
      return { ...r, yourEarning: ownerEarning + referralEarning, role: r.clinicId === clinicId ? 'owner' : 'referrer' };
    });

    const allForTotals = await db.revenueLedger.findMany({
      where: { OR: [{ clinicId }, { referralClinicId: clinicId }] },
      select: { clinicId: true, referralClinicId: true, partnerShareAmount: true, partnerReferralFeeAmount: true, settlementStatus: true },
    });
    const totals = allForTotals.reduce((acc, r) => {
      const earning = (r.clinicId === clinicId ? r.partnerShareAmount : 0)
        + (r.referralClinicId === clinicId ? r.partnerReferralFeeAmount : 0);
      acc.totalEarning += earning;
      if (r.settlementStatus === 'SETTLED') acc.settled += earning;
      else if (r.settlementStatus === 'PENDING') acc.pending += earning;
      else acc.held += earning;
      return acc;
    }, { totalEarning: 0, settled: 0, pending: 0, held: 0 });

    return NextResponse.json({ entries, total, page, totalPages: Math.ceil(total / limit), totals });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
