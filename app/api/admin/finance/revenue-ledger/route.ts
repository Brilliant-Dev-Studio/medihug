import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';

/* ── GET /api/admin/finance/revenue-ledger?sourceType=&ownershipType=&clinicId=&settlementStatus=&page= ──
 * Read-only view of the automatic Patient Paid → Revenue Ownership → Medihug Share →
 * Partner Referral Fee → Net Medihug Revenue breakdown, one row per completed transaction. */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = req.nextUrl;
    const sourceType       = searchParams.get('sourceType') ?? '';
    const ownershipType     = searchParams.get('ownershipType') ?? '';
    const clinicId          = searchParams.get('clinicId') ?? '';
    const settlementStatus  = searchParams.get('settlementStatus') ?? '';
    const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit  = 20;
    const skip   = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (sourceType)      where.sourceType = sourceType;
    if (ownershipType)   where.ownershipType = ownershipType;
    if (clinicId)        where.clinicId = clinicId;
    if (settlementStatus) where.settlementStatus = settlementStatus;

    const [entries, total, totals] = await Promise.all([
      db.revenueLedger.findMany({
        where, orderBy: { createdAt: 'desc' }, skip, take: limit,
        include: {
          clinic: { select: { id: true, name: true, nameEn: true } },
          referralClinic: { select: { id: true, name: true, nameEn: true } },
        },
      }),
      db.revenueLedger.count({ where }),
      db.revenueLedger.aggregate({
        where,
        _sum: {
          patientPaid: true, medihugShareAmount: true, partnerShareAmount: true, partnerReferralFeeAmount: true,
          gatewayFeeAmount: true, providerShareAmount: true, netMedihugRevenue: true,
        },
      }),
    ]);

    return NextResponse.json({
      entries, total, page, totalPages: Math.ceil(total / limit),
      totals: {
        patientPaid: totals._sum.patientPaid ?? 0,
        medihugShareAmount: totals._sum.medihugShareAmount ?? 0,
        partnerShareAmount: totals._sum.partnerShareAmount ?? 0,
        partnerReferralFeeAmount: totals._sum.partnerReferralFeeAmount ?? 0,
        gatewayFeeAmount: totals._sum.gatewayFeeAmount ?? 0,
        providerShareAmount: totals._sum.providerShareAmount ?? 0,
        netMedihugRevenue: totals._sum.netMedihugRevenue ?? 0,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
