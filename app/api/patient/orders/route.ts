import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { notify } from '@/lib/notify';

/* ── POST /api/patient/orders ── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, items, paymentMethod, receiptUrl, note, deliveryAddress, pointsToRedeem, voucherCode } = body;

    if (!name || !phone || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'name, phone, items are required.' }, { status: 400 });
    }
    // Points and discount coupons are for online doctor appointments only.
    if ((typeof voucherCode === 'string' && voucherCode.trim()) || (pointsToRedeem ?? 0) > 0) {
      return NextResponse.json(
        { error: 'Points and discount coupons can only be used on online doctor appointments.', code: 'DISCOUNT_NOT_ALLOWED' },
        { status: 400 },
      );
    }

    const order = await db.$transaction(async (tx) => {
      const productIds = items.map((i: { productId: string }) => i.productId);
      const products = await tx.product.findMany({ where: { id: { in: productIds } }, include: { sizes: true } });
      const productMap = new Map(products.map(p => [p.id, p]));

      let totalAmount = 0;
      const itemsData = items.map((i: { productId: string; sizeId?: string | null; quantity: number }) => {
        const product = productMap.get(i.productId);
        if (!product) throw new Error('PRODUCT_NOT_FOUND');

        // A product with sizes must be bought by size — its base stock/price don't apply.
        const size = i.sizeId ? product.sizes.find(s => s.id === i.sizeId) : null;
        if (i.sizeId && !size) throw new Error('PRODUCT_NOT_FOUND');
        if (product.sizes.length > 0 && !size) throw new Error('SIZE_REQUIRED');

        const stock = size ? size.stock : product.stock;
        const price = size?.priceOverride ?? product.price;
        if (stock < i.quantity) throw new Error('OUT_OF_STOCK');

        totalAmount += price * i.quantity;
        return { productId: i.productId, sizeId: size?.id ?? null, sizeLabel: size?.label ?? null, quantity: i.quantity, price };
      });

      let user = await tx.user.findUnique({ where: { phone } });
      if (!user) {
        const hashedPassword = await bcrypt.hash(phone, 12);
        user = await tx.user.create({ data: { name, phone, password: hashedPassword, role: 'PATIENT' } });
      }

      await Promise.all(
        itemsData.map(i => i.sizeId
          ? tx.productSize.update({ where: { id: i.sizeId }, data: { stock: { decrement: i.quantity } } })
          : tx.product.update({ where: { id: i.productId }, data: { stock: { decrement: i.quantity } } })
        )
      );

      const created = await tx.order.create({
        data: {
          userId: user.id,
          totalAmount,
          paymentMethod: paymentMethod ?? null,
          receiptUrl: receiptUrl ?? null,
          note: note ?? null,
          deliveryAddress: deliveryAddress ?? null,
          items: { create: itemsData },
        },
      });

      return tx.order.findUniqueOrThrow({
        where: { id: created.id },
        include: { items: { include: { product: true } }, user: true },
      });
    }, { maxWait: 15000, timeout: 15000 });

    const admins = await db.user.findMany({
      where:  { role: 'SUPER_ADMIN', isActive: true },
      select: { id: true, name: true },
    });

    for (const admin of admins) {
      notify({
        userId: admin.id,
        type: 'new-order-placed',
        title: order.user.name,
        body: `placed an order for ${order.totalAmount.toLocaleString()} MMK.`,
        actionUrl: `/admin/orders/${order.id}`,
        actorName: order.user.name,
        actorAvatar: order.user.profileImage,
      });
    }

    const productIds = order.items.map(i => i.productId);
    const clinics = await db.clinic.findMany({
      where: { ownerId: { not: null }, products: { some: { productId: { in: productIds } } } },
      select: { ownerId: true },
    });
    const seenOwners = new Set<string>();
    for (const c of clinics) {
      if (!c.ownerId || seenOwners.has(c.ownerId)) continue;
      seenOwners.add(c.ownerId);
      notify({
        userId: c.ownerId,
        type: 'new-order-placed',
        title: order.user.name,
        body: `placed an order for ${order.totalAmount.toLocaleString()} MMK.`,
        actionUrl: `/partner/orders`,
        actorName: order.user.name,
        actorAvatar: order.user.profileImage,
      });
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === 'OUT_OF_STOCK') {
      return NextResponse.json({ error: 'One or more items are out of stock.', code: 'OUT_OF_STOCK' }, { status: 409 });
    }
    if (e instanceof Error && e.message === 'SIZE_REQUIRED') {
      return NextResponse.json({ error: 'Please choose a size for one or more items.', code: 'SIZE_REQUIRED' }, { status: 400 });
    }
    if (e instanceof Error && e.message === 'PRODUCT_NOT_FOUND') {
      return NextResponse.json({ error: 'One or more products no longer exist.', code: 'PRODUCT_NOT_FOUND' }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
