import { NextRequest, NextResponse } from 'next/server';
import { verifyPartnerToken } from '@/lib/jwt';
import { db } from '@/lib/db';

/* ── GET /api/partner/orders — orders containing at least one of this clinic's products ── */
export async function GET(req: NextRequest) {
  const token = req.cookies.get('partner_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyPartnerToken(token);
  if (!payload?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const search   = searchParams.get('search') ?? '';
  const status   = searchParams.get('status') ?? '';
  const page     = parseInt(searchParams.get('page')     ?? '1');
  const pageSize = parseInt(searchParams.get('pageSize') ?? '10');

  const where: Record<string, unknown> = {
    items: { some: { product: { clinics: { some: { clinicId: payload.clinicId } } } } },
  };
  if (search) {
    where.OR = [
      { user: { name:  { contains: search, mode: 'insensitive' } } },
      { user: { phone: { contains: search } } },
    ];
  }
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      include: {
        user:  { select: { name: true, phone: true } },
        items: { include: { product: { select: { name: true, nameEn: true, imageUrl: true, clinics: { select: { clinicId: true } } } } } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.order.count({ where }),
  ]);

  // Each order may mix products from several partners — only surface this clinic's own items/subtotal.
  const scoped = orders.map(o => {
    const items = o.items.filter(i => i.product.clinics.some(c => c.clinicId === payload.clinicId));
    return {
      id: o.id,
      status: o.status,
      paymentMethod: o.paymentMethod,
      createdAt: o.createdAt,
      user: o.user,
      items: items.map(i => ({ id: i.id, quantity: i.quantity, price: i.price, product: { name: i.product.name, nameEn: i.product.nameEn, imageUrl: i.product.imageUrl } })),
      subtotal: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    };
  });

  return NextResponse.json({ orders: scoped, total, page, pageSize });
}
