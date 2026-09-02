import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAudit } from '@/lib/audit';

/* ── GET /api/admin/vouchers — list all vouchers, platform-wide and partner-issued ── */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const vouchers = await db.voucher.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        clinic:  { select: { id: true, name: true } },
        doctor:  { select: { id: true, name: true } },
        product: { select: { id: true, name: true } },
        program: { select: { id: true, titleMm: true } },
      },
    });
    return NextResponse.json({ vouchers });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── POST /api/admin/vouchers — create a voucher. Admin may set clinicId to issue on a
 * partner's behalf, or leave it null for a platform-wide code. ── */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const {
      code, label, serviceType, discountType, discountValue,
      maxDiscountKs, minPurchaseKs, clinicId, doctorId, productId, programId,
      maxUses, expiresAt, active,
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

    const voucher = await db.voucher.create({
      data: {
        code: code.trim().toUpperCase(),
        label: label?.trim() || null,
        serviceType, discountType, discountValue,
        maxDiscountKs: maxDiscountKs ?? null,
        minPurchaseKs: minPurchaseKs ?? 0,
        clinicId: clinicId || null,
        doctorId: doctorId || null,
        productId: productId || null,
        programId: programId || null,
        maxUses: maxUses ?? null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        active: active ?? true,
      },
    });
    logAudit({ admin, action: 'CREATE', entityType: 'Voucher', entityId: voucher.id, after: voucher });
    return NextResponse.json({ voucher }, { status: 201 });
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
      return NextResponse.json({ error: 'This code is already in use.' }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
