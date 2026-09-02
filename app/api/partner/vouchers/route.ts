import { NextRequest, NextResponse } from 'next/server';
import { verifyPartnerToken } from '@/lib/jwt';
import { db } from '@/lib/db';

/** Confirms doctorId/productId/programId (whichever the serviceType calls for) actually
 * belongs to this partner's own clinic before it can be attached to a voucher they issue —
 * a partner can never target another partner's doctor/product/program, even by guessing an
 * id. Returns an error message, or null when the scope is valid (or left unset). */
async function validateOwnScope(clinicId: string, serviceType: string, doctorId?: string | null, productId?: string | null, programId?: string | null): Promise<string | null> {
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
  if (serviceType === 'CONSULTATION' && !doctorId) return 'A doctor must be selected for a consultation voucher.';
  if (serviceType === 'PRODUCT' && !productId) return 'A product must be selected for a product voucher.';
  if (serviceType === 'PROGRAM' && !programId) return 'A program must be selected for a program voucher.';
  return null;
}

/* ── GET /api/partner/vouchers — vouchers this clinic has issued ── */
export async function GET(req: NextRequest) {
  const token = req.cookies.get('partner_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyPartnerToken(token);
  if (!payload?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const vouchers = await db.voucher.findMany({
    where: { clinicId: payload.clinicId },
    orderBy: { createdAt: 'desc' },
    include: {
      doctor:  { select: { id: true, name: true } },
      product: { select: { id: true, name: true } },
      program: { select: { id: true, titleMm: true } },
    },
  });
  return NextResponse.json({ vouchers });
}

/* ── POST /api/partner/vouchers — create a voucher scoped to this clinic only. clinicId is
 * always force-set from the session, never accepted from the client, and every doctor/
 * product/program reference is re-verified against this clinic's own links before saving. ── */
export async function POST(req: NextRequest) {
  const token = req.cookies.get('partner_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyPartnerToken(token);
  if (!payload?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const {
      code, label, serviceType, discountType, discountValue,
      maxDiscountKs, minPurchaseKs, doctorId, productId, programId,
      maxUses, expiresAt,
    } = await req.json();

    if (!code?.trim()) return NextResponse.json({ error: 'code is required.' }, { status: 400 });
    if (!['CONSULTATION', 'PROGRAM', 'PRODUCT'].includes(serviceType)) {
      return NextResponse.json({ error: 'serviceType must be CONSULTATION, PROGRAM, or PRODUCT.' }, { status: 400 });
    }
    if (!['PERCENT', 'FIXED'].includes(discountType)) {
      return NextResponse.json({ error: 'discountType must be PERCENT or FIXED.' }, { status: 400 });
    }
    if (typeof discountValue !== 'number' || discountValue <= 0) {
      return NextResponse.json({ error: 'discountValue must be a positive number.' }, { status: 400 });
    }
    if (discountType === 'PERCENT' && discountValue > 100) {
      return NextResponse.json({ error: 'A percent discount cannot exceed 100.' }, { status: 400 });
    }

    const scopeError = await validateOwnScope(payload.clinicId, serviceType, doctorId, productId, programId);
    if (scopeError) return NextResponse.json({ error: scopeError }, { status: 400 });

    const voucher = await db.voucher.create({
      data: {
        code: code.trim().toUpperCase(),
        label: label?.trim() || null,
        serviceType, discountType, discountValue,
        maxDiscountKs: maxDiscountKs ?? null,
        minPurchaseKs: minPurchaseKs ?? 0,
        clinicId: payload.clinicId,
        doctorId: doctorId || null,
        productId: productId || null,
        programId: programId || null,
        maxUses: maxUses ?? null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });
    return NextResponse.json({ voucher }, { status: 201 });
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
      return NextResponse.json({ error: 'This code is already in use.' }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
