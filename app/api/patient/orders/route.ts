import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { Knock } from '@knocklabs/node';
import { db } from '@/lib/db';

const knock = new Knock({ apiKey: process.env.KNOCK_API_KEY! });

/* ── POST /api/patient/orders ── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, items, paymentMethod, receiptUrl, note } = body;

    if (!name || !phone || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'name, phone, items are required.' }, { status: 400 });
    }

    const order = await db.$transaction(async (tx) => {
      const productIds = items.map((i: { productId: string }) => i.productId);
      const products = await tx.product.findMany({ where: { id: { in: productIds } } });
      const productMap = new Map(products.map(p => [p.id, p]));

      let totalAmount = 0;
      const itemsData = items.map((i: { productId: string; quantity: number }) => {
        const product = productMap.get(i.productId);
        if (!product) throw new Error('PRODUCT_NOT_FOUND');
        if (product.stock < i.quantity) throw new Error('OUT_OF_STOCK');
        totalAmount += product.price * i.quantity;
        return { productId: i.productId, quantity: i.quantity, price: product.price };
      });

      let user = await tx.user.findUnique({ where: { phone } });
      if (!user) {
        const hashedPassword = await bcrypt.hash(phone, 12);
        user = await tx.user.create({ data: { name, phone, password: hashedPassword, role: 'PATIENT' } });
      }

      await Promise.all(
        itemsData.map(i => tx.product.update({ where: { id: i.productId }, data: { stock: { decrement: i.quantity } } }))
      );

      return tx.order.create({
        data: {
          userId: user.id,
          totalAmount,
          paymentMethod: paymentMethod ?? null,
          receiptUrl: receiptUrl ?? null,
          note: note ?? null,
          items: { create: itemsData },
        },
        include: { items: { include: { product: true } }, user: true },
      });
    }, { maxWait: 15000, timeout: 15000 });

    const admins = await db.user.findMany({
      where:  { role: 'SUPER_ADMIN', isActive: true },
      select: { id: true, name: true },
    });

    if (admins.length > 0) {
      try {
        await knock.workflows.trigger('new-order-placed', {
          recipients: admins.map((a) => ({ id: a.id, name: a.name })),
          actor: { id: order.userId, name: order.user.name },
          data: {
            patientName: order.user.name,
            orderId:     order.id,
            totalAmount: order.totalAmount,
            message:     `${order.user.name} placed an order for ${order.totalAmount.toLocaleString()} MMK.`,
            actionUrl:   `/admin/orders/${order.id}`,
          },
        });
      } catch (notifyErr) {
        console.error('Knock trigger (new-order-placed) failed:', notifyErr);
      }
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === 'OUT_OF_STOCK') {
      return NextResponse.json({ error: 'One or more items are out of stock.', code: 'OUT_OF_STOCK' }, { status: 409 });
    }
    if (e instanceof Error && e.message === 'PRODUCT_NOT_FOUND') {
      return NextResponse.json({ error: 'One or more products no longer exist.', code: 'PRODUCT_NOT_FOUND' }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
