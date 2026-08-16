import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAudit } from '@/lib/audit';

/* Maps a DeletionRequest.entityType to the Prisma delegate + logAudit entityType string
 * used by the direct-delete routes it stands in for. */
async function executeDelete(entityType: string, entityId: string): Promise<unknown> {
  switch (entityType) {
    case 'Expense': {
      const before = await db.expense.findUnique({ where: { id: entityId } });
      await db.expense.delete({ where: { id: entityId } });
      return before;
    }
    case 'ExpenseCategory': {
      const before = await db.expenseCategory.findUnique({ where: { id: entityId } });
      await db.expenseCategory.delete({ where: { id: entityId } });
      return before;
    }
    case 'CommissionRule': {
      const before = await db.commissionRule.findUnique({ where: { id: entityId } });
      await db.commissionRule.delete({ where: { id: entityId } });
      return before;
    }
    case 'PaymentMethodConfig': {
      const before = await db.paymentMethodConfig.findUnique({ where: { id: entityId } });
      await db.paymentMethodConfig.delete({ where: { id: entityId } });
      return before;
    }
    case 'Order': {
      const before = await db.order.findUnique({ where: { id: entityId } });
      await db.order.delete({ where: { id: entityId } });
      return before;
    }
    case 'Refund': {
      const before = await db.refund.findUnique({ where: { id: entityId } });
      await db.refund.delete({ where: { id: entityId } });
      return before;
    }
    default:
      throw new Error(`Unsupported entityType: ${entityType}`);
  }
}

/* ── PATCH /api/admin/deletion-requests/[id] { action: 'approve' | 'reject' } ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'pos.delete');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { action } = await req.json();
  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'action must be "approve" or "reject".' }, { status: 400 });
  }

  const existing = await db.deletionRequest.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (existing.status !== 'PENDING') {
    return NextResponse.json({ error: 'Request already reviewed.' }, { status: 409 });
  }

  if (action === 'reject') {
    const request = await db.deletionRequest.update({
      where: { id },
      data: { status: 'REJECTED', reviewedBy: admin.id, reviewedAt: new Date() },
    });
    return NextResponse.json({ request });
  }

  let before: unknown;
  try {
    before = await executeDelete(existing.entityType, existing.entityId);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to delete the underlying record.' }, { status: 500 });
  }

  const request = await db.deletionRequest.update({
    where: { id },
    data: { status: 'APPROVED', reviewedBy: admin.id, reviewedAt: new Date() },
  });
  logAudit({ admin, action: 'DELETE', entityType: existing.entityType, entityId: existing.entityId, before });

  return NextResponse.json({ request });
}
