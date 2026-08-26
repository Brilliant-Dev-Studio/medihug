import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAudit } from '@/lib/audit';

/* ── PATCH /api/admin/finance/revenue-ledger/[id] { settlementStatus } — mark a ledger
 * row SETTLED (paid out to the partner) / HELD / back to PENDING. Manual, one row at a time —
 * no automatic payout integration exists. ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const { settlementStatus, paymentReference } = await req.json();
    if (settlementStatus !== undefined && !['PENDING', 'APPROVED', 'SETTLED', 'HELD'].includes(settlementStatus)) {
      return NextResponse.json({ error: 'Invalid settlementStatus.' }, { status: 400 });
    }
    if (settlementStatus === undefined && paymentReference === undefined) {
      return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
    }

    const before = await db.revenueLedger.findUnique({ where: { id }, select: { settlementStatus: true, paymentReference: true } });
    if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const data: Record<string, unknown> = {};
    if (settlementStatus !== undefined) {
      data.settlementStatus = settlementStatus;
      data.settledAt = settlementStatus === 'SETTLED' ? new Date() : null;
    }
    if (paymentReference !== undefined) {
      data.paymentReference = paymentReference || null;
    }

    const entry = await db.revenueLedger.update({ where: { id }, data });

    logAudit({
      admin, action: 'UPDATE', entityType: 'RevenueLedger', entityId: id,
      before, after: { settlementStatus: entry.settlementStatus, paymentReference: entry.paymentReference },
    });

    return NextResponse.json({ entry });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
