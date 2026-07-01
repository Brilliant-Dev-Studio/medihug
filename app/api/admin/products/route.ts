import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/admin/products ── */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const search   = searchParams.get('search')   ?? '';
    const category = searchParams.get('category') ?? '';
    const isActive = searchParams.get('isActive') ?? '';
    const page     = parseInt(searchParams.get('page')     ?? '1');
    const pageSize = parseInt(searchParams.get('pageSize') ?? '12');

    const where: Record<string, unknown> = {};
    if (search)    where.OR = [
      { name:   { contains: search, mode: 'insensitive' } },
      { nameEn: { contains: search, mode: 'insensitive' } },
    ];
    if (category) where.category = { contains: category, mode: 'insensitive' };
    if (isActive !== '') where.isActive = isActive === 'true';

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({ products, total, page, pageSize });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── POST /api/admin/products ── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, nameEn, description, price, stock, imageUrl, category } = body;


    if (!name) return NextResponse.json({ error: 'name လိုအပ်သည်။' }, { status: 400 });

    const { brand, type, strength, packSize, tags, keyBenefits, rating, reviewCount, isActive, clinicIds } = body;
    const product = await db.product.create({
      data: {
        name,
        nameEn:      nameEn      || null,
        description: description || null,
        price:       price       ?? 0,
        stock:       stock       ?? 0,
        imageUrl:    imageUrl    || null,
        category:    category    || null,
        brand:       brand       || null,
        type:        type        || null,
        strength:    strength    || null,
        packSize:    packSize    || null,
        tags:        Array.isArray(tags)        ? tags        : [],
        keyBenefits: Array.isArray(keyBenefits) ? keyBenefits : [],
        rating:      rating      ?? 0,
        reviewCount: reviewCount ?? 0,
        isActive:    isActive    ?? true,
      },
    });

    if (Array.isArray(clinicIds) && clinicIds.length > 0) {
      await db.clinicProduct.createMany({
        data: clinicIds.map((clinicId: string) => ({ clinicId, productId: product.id })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
