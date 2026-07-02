import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

/* ── GET /api/patient/favorites/products?phone=xxx&full=true ── */
export async function GET(req: NextRequest) {
  try {
    const phone = req.nextUrl.searchParams.get('phone') ?? '';
    const full  = req.nextUrl.searchParams.get('full') === 'true';
    if (!phone) return NextResponse.json({ error: 'phone is required.' }, { status: 400 });

    const user = await db.user.findUnique({ where: { phone } });
    if (!user) return NextResponse.json(full ? { products: [] } : { ids: [] });

    const favorites = await db.favoriteProduct.findMany({
      where: { userId: user.id },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });

    if (full) return NextResponse.json({ products: favorites.map(f => f.product) });
    return NextResponse.json({ ids: favorites.map(f => f.productId) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── POST /api/patient/favorites/products ── */
export async function POST(req: NextRequest) {
  try {
    const { phone, name, productId } = await req.json();
    if (!phone || !name || !productId) {
      return NextResponse.json({ error: 'phone, name, productId are required.' }, { status: 400 });
    }

    let user = await db.user.findUnique({ where: { phone } });
    if (!user) {
      const hashedPassword = await bcrypt.hash(phone, 12);
      user = await db.user.create({ data: { name, phone, password: hashedPassword, role: 'PATIENT' } });
    }

    await db.favoriteProduct.upsert({
      where: { userId_productId: { userId: user.id, productId } },
      create: { userId: user.id, productId },
      update: {},
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── DELETE /api/patient/favorites/products ── */
export async function DELETE(req: NextRequest) {
  try {
    const { phone, productId } = await req.json();
    if (!phone || !productId) {
      return NextResponse.json({ error: 'phone, productId are required.' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { phone } });
    if (!user) return NextResponse.json({ success: true });

    await db.favoriteProduct.deleteMany({ where: { userId: user.id, productId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
