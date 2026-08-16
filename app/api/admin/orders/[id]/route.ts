import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAudit } from '@/lib/audit';
import { notify } from '@/lib/notify';

const INCLUDE = {
  user:  { select: { id: true, name: true, phone: true } },
  items: { include: { product: { select: { id: true, name: true, nameEn: true, imageUrl: true, packSize: true } } } },
};

/* ── GET /api/admin/orders/[id] ── */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const { status, reason } = await req.json();

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

    const order = await db.order.update({
      where: { id },
      data: {
        status,
        ...(status === 'CANCELLED' && before.status !== 'CANCELLED' && {
          cancelReason: reason || null,
          cancelledAt: new Date(),
        }),
      },
      include: INCLUDE,
    });

    logAudit({
      admin, action: 'UPDATE', entityType: 'Order', entityId: id,
      before: { status: before.status }, after: { status: order.status, cancelReason: order.cancelReason },
    });

    if (status === 'CONFIRMED' && before.status !== 'CONFIRMED') {
      notify({
        userId: order.userId,
        type: 'order-confirmed',
        title: 'Order confirmed',
        body: `Your order for ${order.totalAmount.toLocaleString()} MMK has been confirmed.`,
        actionUrl: `/patient/records`,
      });
    }

    return NextResponse.json({ order });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
