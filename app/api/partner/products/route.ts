import { NextRequest, NextResponse } from 'next/server';
import { verifyPartnerToken } from '@/lib/jwt';
import { db } from '@/lib/db';

/* ── GET /api/partner/products — read-only, products attached to own clinic ── */
export async function GET(req: NextRequest) {
  const token = req.cookies.get('partner_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyPartnerToken(token);
  if (!payload?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const links = await db.clinicProduct.findMany({
    where: { clinicId: payload.clinicId },
    include: { product: true },
  });
  return NextResponse.json({ products: links.map(l => l.product) });
}
