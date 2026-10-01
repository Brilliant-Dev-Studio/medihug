import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { resolveWindow, type FinanceRange } from '@/lib/financeReport';

/* ── GET /api/admin/finance/partners?range=&from=&to= — per-partner rollup: how much each
 * partner clinic generated, what they're owed, what's already settled. Draws on the same
 * RevenueLedger rows the row-level Revenue Ledger / settlement page works from — this is the
 * aggregate view of the same data, not a second source of truth. Programs/Ads have no
 * per-partner split yet (no commission model exists for them), so those columns stay informational
 * (program listing revenue only) rather than contributing to Payable/Settlement. ── */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = req.nextUrl;
    const range = (['daily', 'weekly', 'monthly', 'yearly', 'custom'].includes(searchParams.get('range') || '')
      ? searchParams.get('range')
      : 'monthly') as FinanceRange;
    const { since, until } = resolveWindow(range, searchParams.get('from'), searchParams.get('to'));

    const [ledgerRows, referrals, programs] = await Promise.all([
      db.revenueLedger.findMany({
        where: {
          createdAt: { gte: since, lte: until },
          OR: [{ clinicId: { not: null } }, { referralClinicId: { not: null } }],
        },
        select: {
          clinicId: true, referralClinicId: true, patientPaid: true,
          partnerShareAmount: true, partnerReferralFeeAmount: true, settlementStatus: true,
        },
      }),
      db.clinicReferral.groupBy({ by: ['clinicId'], where: { createdAt: { gte: since, lte: until } }, _count: true }),
      db.healthcareProgram.groupBy({
        by: ['clinicId'],
        where: { clinicId: { not: null } },
        _count: true,
      }),
    ]);

    const clinicIds = new Set<string>();
    for (const r of ledgerRows) { if (r.clinicId) clinicIds.add(r.clinicId); if (r.referralClinicId) clinicIds.add(r.referralClinicId); }
    for (const r of referrals) clinicIds.add(r.clinicId);
    for (const p of programs) { if (p.clinicId) clinicIds.add(p.clinicId); }

    const clinics = await db.clinic.findMany({
      where: { id: { in: [...clinicIds] } },
      select: { id: true, name: true, nameEn: true, imageUrl: true, type: true },
    });
    const clinicMap = new Map(clinics.map(c => [c.id, c]));

    interface Row {
      clinic: { id: string; name: string; nameEn: string | null; imageUrl: string | null; type: string } | null;
      sales: number; referrals: number; commission: number;
      payableUnsettled: number; settled: number; profit: number;
      programsListed: number;
    }
    const rows = new Map<string, Row>();
    const get = (id: string): Row => {
      let r = rows.get(id);
      if (!r) { r = { clinic: clinicMap.get(id) ?? null, sales: 0, referrals: 0, commission: 0, payableUnsettled: 0, settled: 0, profit: 0, programsListed: 0 }; rows.set(id, r); }
      return r;
    };

    for (const led of ledgerRows) {
      const isSettled = led.settlementStatus === 'SETTLED';
      if (led.clinicId && led.partnerShareAmount > 0) {
        const r = get(led.clinicId);
        r.sales += led.patientPaid;
        r.commission += led.patientPaid - led.partnerShareAmount; // platform's cut on this clinic's own sales
        r.profit += led.partnerShareAmount;
        if (isSettled) r.settled += led.partnerShareAmount; else r.payableUnsettled += led.partnerShareAmount;
      }
      if (led.referralClinicId && led.partnerReferralFeeAmount > 0) {
        const r = get(led.referralClinicId);
        r.profit += led.partnerReferralFeeAmount;
        if (isSettled) r.settled += led.partnerReferralFeeAmount; else r.payableUnsettled += led.partnerReferralFeeAmount;
      }
    }
    for (const ref of referrals) get(ref.clinicId).referrals += ref._count;
    for (const p of programs) { if (p.clinicId) get(p.clinicId).programsListed += p._count; }

    const partners = [...rows.values()]
      .filter(r => r.clinic)
      .sort((a, b) => (b.sales + b.profit) - (a.sales + a.profit));

    return NextResponse.json({ range, since, until, partners });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
