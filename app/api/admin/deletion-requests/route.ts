import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { notify } from '@/lib/notify';
import { DELETION_APPROVER_ROLES } from '@/lib/permissions';

const SUPPORTED_ENTITY_TYPES = ['Expense', 'ExpenseCategory', 'CommissionRule', 'PaymentMethodConfig', 'Order', 'Refund'];

/* ── GET /api/admin/deletion-requests — review queue (SUPER_ADMIN/CO_ADMIN only) ── */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req, 'pos.delete');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const requests = await db.deletionRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      requester: { select: { name: true, phone: true } },
      reviewer: { select: { name: true } },
    },
  });
  return NextResponse.json({ requests });
}

/* ── POST /api/admin/deletion-requests { entityType, entityId, entityLabel?, reason? } —
 * POS_ADMIN's stand-in for a direct delete: creates a pending request and notifies
 * every SUPER_ADMIN/CO_ADMIN instead of touching the record. ── */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { entityType, entityId, entityLabel, reason } = await req.json();
  if (!entityType || !entityId || !SUPPORTED_ENTITY_TYPES.includes(entityType)) {
    return NextResponse.json({ error: 'Invalid entityType.' }, { status: 400 });
  }

  const request = await db.deletionRequest.create({
    data: { entityType, entityId, entityLabel: entityLabel ?? null, requestedBy: admin.id, reason: reason ?? null },
  });

  const approvers = await db.user.findMany({
    where: { role: { in: DELETION_APPROVER_ROLES }, isActive: true },
    select: { id: true },
  });
  for (const approver of approvers) {
    notify({
      userId: approver.id,
      type: 'deletion-request',
      title: admin.name,
      body: `requested to delete ${entityType}${entityLabel ? ` — ${entityLabel}` : ''}`,
      actionUrl: `/admin/deletion-requests`,
      actorName: admin.name,
    });
  }

  return NextResponse.json({ request }, { status: 201 });
}
