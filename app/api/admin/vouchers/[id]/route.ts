import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAudit } from '@/lib/audit';

/* ── PATCH /api/admin/vouchers/[id] ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const before = await db.voucher.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    const body = await req.json();
    const {
      code, label, serviceType, discountType, discountValue,
      maxDiscountKs, minPurchaseKs, clinicId, doctorId, productId, programId,
      maxUses, expiresAt, active,
    } = body;

    if (discountType !== undefined && !['PERCENT', 'FIXED'].includes(discountType)) {
      return NextResponse.json({ error: 'discountType must be PERCENT or FIXED.' }, { status: 400 });
    }
    if (discountValue !== undefined && (typeof discountValue !== 'number' || discountValue <= 0)) {
      return NextResponse.json({ error: 'discountValue must be a positive number.' }, { status: 400 });
    }

    const voucher = await db.voucher.update({
      where: { id },
      data: {
        ...(code           !== undefined && { code: code.trim().toUpperCase() }),
        ...(label          !== undefined && { label: label?.trim() || null }),
        ...(serviceType    !== undefined && { serviceType }),
        ...(discountType   !== undefined && { discountType }),
        ...(discountValue  !== undefined && { discountValue }),
        ...(maxDiscountKs  !== undefined && { maxDiscountKs: maxDiscountKs ?? null }),
        ...(minPurchaseKs  !== undefined && { minPurchaseKs }),
        ...(clinicId       !== undefined && { clinicId: clinicId || null }),
        ...(doctorId       !== undefined && { doctorId: doctorId || null }),
        ...(productId      !== undefined && { productId: productId || null }),
        ...(programId      !== undefined && { programId: programId || null }),
        ...(maxUses        !== undefined && { maxUses: maxUses ?? null }),
        ...(expiresAt      !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
        ...(active         !== undefined && { active }),
      },
    });
    logAudit({ admin, action: 'UPDATE', entityType: 'Voucher', entityId: id, before, after: voucher });
    return NextResponse.json({ voucher });
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
      return NextResponse.json({ error: 'This code is already in use.' }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── DELETE /api/admin/vouchers/[id] ── */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const before = await db.voucher.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await db.voucher.delete({ where: { id } });
  logAudit({ admin, action: 'DELETE', entityType: 'Voucher', entityId: id, before });
  return NextResponse.json({ ok: true });
}
