import { NextRequest, NextResponse } from 'next/server';
import { verifyPartnerToken } from '@/lib/jwt';
import { db } from '@/lib/db';

async function requireClinicId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('partner_token')?.value;
  if (!token) return null;
  const payload = await verifyPartnerToken(token);
  return payload?.clinicId ?? null;
}

/* ── GET /api/partner/products/[id] — only if linked to this clinic ── */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const clinicId = await requireClinicId(req);
  if (!clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const link = await db.clinicProduct.findUnique({ where: { clinicId_productId: { clinicId, productId: id } }, include: { product: true } });
  if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ product: link.product });
}

/* ── PATCH /api/partner/products/[id] — only if linked to this clinic. Partners can't
 * reassign a product's clinic links here — that's an admin-only capability. ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const clinicId = await requireClinicId(req);
  if (!clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const link = await db.clinicProduct.findUnique({ where: { clinicId_productId: { clinicId, productId: id } } });
  if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    const body = await req.json();
    const {
      name, nameEn, description, price, priceThb, priceUsd, stock, imageUrl, images, category,
      brand, type, strength, packSize, tags, keyBenefits, isActive,
    } = body;

    const data: Record<string, unknown> = {};
    if (name        !== undefined) data.name = name;
    if (nameEn       !== undefined) data.nameEn = nameEn || null;
    if (description  !== undefined) data.description = description || null;
    if (price        !== undefined) data.price = price;
    if (priceThb     !== undefined) data.priceThb = priceThb === '' || priceThb == null ? null : Number(priceThb);
    if (priceUsd     !== undefined) data.priceUsd = priceUsd === '' || priceUsd == null ? null : Number(priceUsd);
    if (stock        !== undefined) data.stock = stock;
    if (imageUrl     !== undefined) data.imageUrl = imageUrl || null;
    if (images       !== undefined) data.images = Array.isArray(images) ? images.slice(0, 5) : [];
    if (category     !== undefined) data.category = category || null;
    if (brand        !== undefined) data.brand = brand || null;
    if (type         !== undefined) data.type = type || null;
    if (strength     !== undefined) data.strength = strength || null;
    if (packSize     !== undefined) data.packSize = packSize || null;
    if (tags         !== undefined) data.tags = Array.isArray(tags) ? tags : [];
    if (keyBenefits  !== undefined) data.keyBenefits = Array.isArray(keyBenefits) ? keyBenefits : [];
    if (isActive     !== undefined) data.isActive = isActive;

    const product = await db.product.update({ where: { id }, data });
    return NextResponse.json({ product });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
