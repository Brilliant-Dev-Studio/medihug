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
    const { settlementStatus } = await req.json();
    if (!['PENDING', 'SETTLED', 'HELD'].includes(settlementStatus)) {
      return NextResponse.json({ error: 'Invalid settlementStatus.' }, { status: 400 });
    }

    const before = await db.revenueLedger.findUnique({ where: { id }, select: { settlementStatus: true } });
    if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const entry = await db.revenueLedger.update({
      where: { id },
      data: {
        settlementStatus,
        settledAt: settlementStatus === 'SETTLED' ? new Date() : null,
      },
    });

    logAudit({
      admin, action: 'UPDATE', entityType: 'RevenueLedger', entityId: id,
      before: { settlementStatus: before.settlementStatus }, after: { settlementStatus: entry.settlementStatus },
    });

    return NextResponse.json({ entry });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
