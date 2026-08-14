import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAudit } from '@/lib/audit';

/* ── PATCH /api/admin/finance/rules/[id] ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const { percent, fixedFee, active, effectiveFrom, effectiveTo, note } = body;

    if (percent !== undefined && (typeof percent !== 'number' || percent < 0 || percent > 100)) {
      return NextResponse.json({ error: 'percent must be a number between 0 and 100.' }, { status: 400 });
    }

    const before = await db.commissionRule.findUnique({ where: { id } });

    const rule = await db.commissionRule.update({
      where: { id },
      data: {
        ...(percent !== undefined && { percent }),
        ...(fixedFee !== undefined && { fixedFee }),
        ...(active !== undefined && { active }),
        ...(effectiveFrom !== undefined && { effectiveFrom: new Date(effectiveFrom) }),
        ...(effectiveTo !== undefined && { effectiveTo: effectiveTo ? new Date(effectiveTo) : null }),
        ...(note !== undefined && { note }),
      },
    });
    logAudit({ admin, action: 'UPDATE', entityType: 'CommissionRule', entityId: id, before, after: rule });
    return NextResponse.json({ rule });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── DELETE /api/admin/finance/rules/[id] ── */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const before = await db.commissionRule.findUnique({ where: { id } });
  await db.commissionRule.delete({ where: { id } });
  logAudit({ admin, action: 'DELETE', entityType: 'CommissionRule', entityId: id, before });
  return NextResponse.json({ ok: true });
}
