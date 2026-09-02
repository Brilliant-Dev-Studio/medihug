import { NextRequest, NextResponse } from 'next/server';
import { validateVoucher } from '@/lib/voucherLedger';

/* ── GET /api/patient/vouchers/validate — live "Apply" preview at checkout. Read-only;
 * the actual redemption is re-validated from scratch inside the purchase's own transaction,
 * this never trusts what it returns as the final word. ── */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const code           = searchParams.get('code') ?? '';
    const sourceType      = searchParams.get('sourceType') as 'CONSULTATION' | 'PROGRAM' | 'PRODUCT' | null;
    const doctorId        = searchParams.get('doctorId');
    const programId       = searchParams.get('programId');
    const productIds      = searchParams.get('productIds');
    const purchaseAmount  = Number(searchParams.get('purchaseAmount') ?? '0');

    if (!sourceType || !['CONSULTATION', 'PROGRAM', 'PRODUCT'].includes(sourceType)) {
      return NextResponse.json({ error: 'sourceType is required.' }, { status: 400 });
    }

    const result = await validateVoucher({
      code, sourceType,
      doctorId: doctorId || null,
      programId: programId || null,
      productIds: productIds ? productIds.split(',').filter(Boolean) : [],
      purchaseAmount,
    });

    if (!result.ok) return NextResponse.json({ ok: false, reason: result.reason });
    return NextResponse.json({ ok: true, discountAmount: result.discountAmount });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
