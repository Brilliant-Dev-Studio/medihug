import { NextRequest, NextResponse } from 'next/server';
import { verifyPartnerToken } from '@/lib/jwt';
import { db } from '@/lib/db';

async function validateOwnScope(clinicId: string, doctorId?: string | null, productId?: string | null, programId?: string | null): Promise<string | null> {
  if (doctorId) {
    const link = await db.clinicDoctor.findUnique({ where: { clinicId_doctorId: { clinicId, doctorId } } });
    if (!link) return 'That doctor is not linked to your clinic.';
  }
  if (productId) {
    const link = await db.clinicProduct.findUnique({ where: { clinicId_productId: { clinicId, productId } } });
    if (!link) return 'That product is not linked to your clinic.';
  }
  if (programId) {
    const program = await db.healthcareProgram.findUnique({ where: { id: programId }, select: { clinicId: true } });
    if (program?.clinicId !== clinicId) return 'That program does not belong to your clinic.';
  }
  return null;
}

/* ── PATCH /api/partner/vouchers/[id] — only this clinic's own vouchers ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get('partner_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyPartnerToken(token);
  if (!payload?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = await db.voucher.findUnique({ where: { id } });
  if (!existing || existing.clinicId !== payload.clinicId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    const body = await req.json();
    const {
      label, discountType, discountValue, maxDiscountKs, minPurchaseKs,
      doctorId, productId, programId, maxUses, expiresAt, active,
    } = body;

    if (discountType !== undefined && !['PERCENT', 'FIXED'].includes(discountType)) {
      return NextResponse.json({ error: 'discountType must be PERCENT or FIXED.' }, { status: 400 });
    }
    if (discountValue !== undefined && (typeof discountValue !== 'number' || discountValue <= 0)) {
      return NextResponse.json({ error: 'discountValue must be a positive number.' }, { status: 400 });
    }

    if (doctorId !== undefined || productId !== undefined || programId !== undefined) {
      const scopeError = await validateOwnScope(
        payload.clinicId,
        doctorId  !== undefined ? doctorId  : existing.doctorId,
        productId !== undefined ? productId : existing.productId,
        programId !== undefined ? programId : existing.programId,
      );
      if (scopeError) return NextResponse.json({ error: scopeError }, { status: 400 });
    }

    const voucher = await db.voucher.update({
      where: { id },
      data: {
        ...(label          !== undefined && { label: label?.trim() || null }),
        ...(discountType   !== undefined && { discountType }),
        ...(discountValue  !== undefined && { discountValue }),
        ...(maxDiscountKs  !== undefined && { maxDiscountKs: maxDiscountKs ?? null }),
        ...(minPurchaseKs  !== undefined && { minPurchaseKs }),
        ...(doctorId       !== undefined && { doctorId: doctorId || null }),
        ...(productId      !== undefined && { productId: productId || null }),
        ...(programId      !== undefined && { programId: programId || null }),
        ...(maxUses        !== undefined && { maxUses: maxUses ?? null }),
        ...(expiresAt      !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
        ...(active         !== undefined && { active }),
      },
    });
    return NextResponse.json({ voucher });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── DELETE /api/partner/vouchers/[id] — only this clinic's own vouchers ── */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get('partner_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyPartnerToken(token);
  if (!payload?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = await db.voucher.findUnique({ where: { id } });
  if (!existing || existing.clinicId !== payload.clinicId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await db.voucher.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
