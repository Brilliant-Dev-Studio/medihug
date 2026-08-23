import { NextRequest, NextResponse } from 'next/server';
import { verifyPartnerToken } from '@/lib/jwt';
import { db } from '@/lib/db';

async function requireClinicId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('partner_token')?.value;
  if (!token) return null;
  const payload = await verifyPartnerToken(token);
  return payload?.clinicId ?? null;
}

/* ── GET /api/partner/products — read-only, products attached to own clinic ── */
export async function GET(req: NextRequest) {
  const clinicId = await requireClinicId(req);
  if (!clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const links = await db.clinicProduct.findMany({
    where: { clinicId },
    include: { product: true },
  });
  return NextResponse.json({ products: links.map(l => l.product) });
}

/* ── POST /api/partner/products — partner creates their own product, auto-linked to their clinic ── */
export async function POST(req: NextRequest) {
  const clinicId = await requireClinicId(req);
  if (!clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { name, nameEn, description, price, stock, imageUrl, images, category,
      brand, type, strength, packSize, tags, keyBenefits, isActive } = body;

    if (!name) return NextResponse.json({ error: 'name လိုအပ်သည်။' }, { status: 400 });

    const product = await db.product.create({
      data: {
        name,
        nameEn:      nameEn      || null,
        description: description || null,
        price:       price       ?? 0,
        stock:       stock       ?? 0,
        imageUrl:    imageUrl    || null,
        images:      Array.isArray(images) ? images.slice(0, 5) : [],
        category:    category    || null,
        brand:       brand       || null,
        type:        type        || null,
        strength:    strength    || null,
        packSize:    packSize    || null,
        tags:        Array.isArray(tags)        ? tags        : [],
        keyBenefits: Array.isArray(keyBenefits) ? keyBenefits : [],
        isActive:    isActive    ?? true,
      },
    });

    await db.clinicProduct.create({ data: { clinicId, productId: product.id } });

    return NextResponse.json({ product }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
