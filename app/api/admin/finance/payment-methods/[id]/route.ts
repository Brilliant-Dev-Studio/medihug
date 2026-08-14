import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAudit } from '@/lib/audit';

/* ── PATCH /api/admin/finance/payment-methods/[id] ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { label, feePercent, feeFixed, active } = await req.json();

  const before = await db.paymentMethodConfig.findUnique({ where: { id } });

  const method = await db.paymentMethodConfig.update({
    where: { id },
    data: {
      ...(label !== undefined && { label }),
      ...(feePercent !== undefined && { feePercent }),
      ...(feeFixed !== undefined && { feeFixed }),
      ...(active !== undefined && { active }),
    },
  });
  logAudit({ admin, action: 'UPDATE', entityType: 'PaymentMethodConfig', entityId: id, before, after: method });
  return NextResponse.json({ method });
}

/* ── DELETE /api/admin/finance/payment-methods/[id] ── */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const before = await db.paymentMethodConfig.findUnique({ where: { id } });
  await db.paymentMethodConfig.delete({ where: { id } });
  logAudit({ admin, action: 'DELETE', entityType: 'PaymentMethodConfig', entityId: id, before });
  return NextResponse.json({ ok: true });
}
