import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAudit } from '@/lib/audit';

/* ── GET /api/admin/purchases/[id] ── */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const purchase = await db.purchase.findUnique({
      where: { id },
      include: {
        supplier: true,
        store: { select: { id: true, name: true, code: true } },
        items: { include: { product: { select: { id: true, name: true, nameEn: true, imageUrl: true } } } },
      },
    });
    if (!purchase) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ purchase });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── PATCH /api/admin/purchases/[id] — only while ORDERED and nothing received yet, or to
 * CANCEL a purchase at any point before it's fully RECEIVED. ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await db.purchase.findUnique({ where: { id }, include: { items: true } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Cancelling is allowed any time before the purchase is fully received.
    if (body.status === 'CANCELLED') {
      if (existing.status === 'RECEIVED') {
        return NextResponse.json({ error: 'A fully received purchase cannot be cancelled.' }, { status: 409 });
      }
      const purchase = await db.purchase.update({ where: { id }, data: { status: 'CANCELLED' } });
      logAudit({ admin, action: 'UPDATE', entityType: 'Purchase', entityId: id, before: existing, after: purchase });
      return NextResponse.json({ purchase });
    }

    const hasReceiving = existing.items.some(i => i.receivedQty > 0);
    if (existing.status !== 'ORDERED' || hasReceiving) {
      return NextResponse.json({ error: 'This purchase has already started receiving and can only be cancelled, not edited.' }, { status: 409 });
    }

    const { supplierId, storeId, expectedDate, note } = body;
    const discountAmount = body.discountAmount != null ? Number(body.discountAmount) : existing.discountAmount;
    const taxAmount      = body.taxAmount      != null ? Number(body.taxAmount)      : existing.taxAmount;
    const shippingCost   = body.shippingCost   != null ? Number(body.shippingCost)   : existing.shippingCost;
    const items: { productId: string; orderedQty: number; unitCost: number }[] | undefined = Array.isArray(body.items) ? body.items : undefined;

    const purchase = await db.$transaction(async tx => {
      if (items) {
        if (items.length === 0 || items.some(i => !i.productId || !(i.orderedQty > 0) || i.unitCost < 0)) {
          throw new Error('INVALID_ITEMS');
        }
        await tx.purchaseItem.deleteMany({ where: { purchaseId: id } });
        await tx.purchaseItem.createMany({
          data: items.map(i => ({
            purchaseId: id,
            productId: i.productId,
            orderedQty: Math.trunc(i.orderedQty),
            unitCost: Math.trunc(i.unitCost),
            lineTotal: Math.trunc(i.orderedQty) * Math.trunc(i.unitCost),
          })),
        });
      }
      const subtotal = items
        ? items.reduce((s, i) => s + Math.trunc(i.orderedQty) * Math.trunc(i.unitCost), 0)
        : existing.subtotal;

      return tx.purchase.update({
        where: { id },
        data: {
          ...(supplierId && { supplierId }),
          ...(storeId && { storeId }),
          ...(expectedDate !== undefined && { expectedDate: expectedDate ? new Date(expectedDate) : null }),
          ...(note !== undefined && { note: note || null }),
          discountAmount,
          taxAmount,
          shippingCost,
          subtotal,
          totalAmount: subtotal - discountAmount + taxAmount + shippingCost,
        },
        include: { items: true },
      });
    });

    logAudit({ admin, action: 'UPDATE', entityType: 'Purchase', entityId: id, before: existing, after: purchase });
    return NextResponse.json({ purchase });
  } catch (e) {
    if (e instanceof Error && e.message === 'INVALID_ITEMS') {
      return NextResponse.json({ error: 'At least one valid product line is required.' }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── DELETE /api/admin/purchases/[id] — only allowed pre-receiving; once receiving has
 * started, use PATCH { status: 'CANCELLED' } instead, since StockMovement rows reference
 * this purchase's id and must stay resolvable. ── */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'pos.delete');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const existing = await db.purchase.findUnique({ where: { id }, include: { items: true } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const hasReceiving = existing.items.some(i => i.receivedQty > 0);
    if (existing.status !== 'ORDERED' || hasReceiving) {
      return NextResponse.json({ error: 'This purchase has receiving history and cannot be deleted — cancel it instead.' }, { status: 409 });
    }

    await db.purchase.delete({ where: { id } });
    logAudit({ admin, action: 'DELETE', entityType: 'Purchase', entityId: id, before: existing });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
