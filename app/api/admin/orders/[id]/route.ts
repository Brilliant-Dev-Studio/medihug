import { NextRequest, NextResponse } from 'next/server';
import { Knock } from '@knocklabs/node';
import { db } from '@/lib/db';

const knock = new Knock({ apiKey: process.env.KNOCK_API_KEY! });

const INCLUDE = {
  user:  { select: { id: true, name: true, phone: true } },
  items: { include: { product: { select: { id: true, name: true, nameEn: true, imageUrl: true, packSize: true } } } },
};

/* ── GET /api/admin/orders/[id] ── */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await db.order.findUnique({ where: { id }, include: INCLUDE });
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ order });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── PATCH /api/admin/orders/[id] — update status ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    if (!['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
    }

    const before = await db.order.findUnique({ where: { id }, select: { status: true } });
    if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Restore stock if an order is cancelled after having reserved it.
    if (status === 'CANCELLED' && before.status !== 'CANCELLED') {
      const items = await db.orderItem.findMany({ where: { orderId: id }, select: { productId: true, quantity: true } });
      await Promise.all(
        items.map(i => db.product.update({ where: { id: i.productId }, data: { stock: { increment: i.quantity } } }))
      );
    }

    const order = await db.order.update({ where: { id }, data: { status }, include: INCLUDE });

    if (status === 'CONFIRMED' && before.status !== 'CONFIRMED') {
      try {
        await knock.workflows.trigger('order-confirmed', {
          recipients: [{ id: order.userId, name: order.user.name }],
          data: {
            orderId:     order.id,
            totalAmount: order.totalAmount,
            message:     `Your order for ${order.totalAmount.toLocaleString()} MMK has been confirmed.`,
            actionUrl:   `/patient/records`,
          },
        });
      } catch (notifyErr) {
        console.error('Knock trigger (order-confirmed) failed:', notifyErr);
      }
    }

    return NextResponse.json({ order });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
