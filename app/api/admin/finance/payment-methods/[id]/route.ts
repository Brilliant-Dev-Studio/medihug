import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAudit } from '@/lib/audit';

/** These keys drive real payment-processing code paths elsewhere (MMQR QR display, CB Pay's
 * PIN-redirect + webhook flow) — renaming their key or deleting them would silently break
 * that integration, so they're protected here even though their fee/label/order/active stay
 * editable like any other row. */
const PROTECTED_KEYS = ['mmqr', 'cb'];

/* ── PATCH /api/admin/finance/payment-methods/[id] ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { label, kind, accountNumber, accountName, feePercent, feeFixed, order, active } = await req.json();

  const before = await db.paymentMethodConfig.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const nextKind = kind !== undefined ? kind : before.kind;
  if (nextKind === 'BANK_TRANSFER') {
    const nextAccountNumber = accountNumber !== undefined ? accountNumber : before.accountNumber;
    const nextAccountName   = accountName   !== undefined ? accountName   : before.accountName;
    if (!nextAccountNumber?.trim() || !nextAccountName?.trim()) {
      return NextResponse.json({ error: 'accountNumber and accountName are required for a bank transfer method.' }, { status: 400 });
    }
  }

  const method = await db.paymentMethodConfig.update({
    where: { id },
    data: {
      ...(label         !== undefined && { label }),
      ...(kind          !== undefined && { kind }),
      ...(accountNumber !== undefined && { accountNumber: accountNumber?.trim() || null }),
      ...(accountName   !== undefined && { accountName: accountName?.trim() || null }),
      ...(feePercent    !== undefined && { feePercent }),
      ...(feeFixed      !== undefined && { feeFixed }),
      ...(order         !== undefined && { order }),
      ...(active         !== undefined && { active }),
    },
  });
  logAudit({ admin, action: 'UPDATE', entityType: 'PaymentMethodConfig', entityId: id, before, after: method });
  return NextResponse.json({ method });
}

/* ── DELETE /api/admin/finance/payment-methods/[id] ── */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'pos.delete');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const before = await db.paymentMethodConfig.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (PROTECTED_KEYS.includes(before.key)) {
    return NextResponse.json({ error: `"${before.label}" powers a real payment integration and can't be deleted — disable it instead.` }, { status: 403 });
  }

  await db.paymentMethodConfig.delete({ where: { id } });
  logAudit({ admin, action: 'DELETE', entityType: 'PaymentMethodConfig', entityId: id, before });
  return NextResponse.json({ ok: true });
}
