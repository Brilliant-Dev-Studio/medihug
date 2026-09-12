import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAudit } from '@/lib/audit';
import { recordStockMovement } from '@/lib/stock';

/* ── POST /api/admin/purchases/[id]/receive { lines: [{ purchaseItemId, receiveQty }] } ──
 * The only place stock actually enters a store for this phase. Atomically: bumps each
 * PurchaseItem.receivedQty, writes a PURCHASE_RECEIVE StockMovement + increments
 * ProductStock/Product.stock via lib/stock.ts, then recomputes the Purchase's status. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const { lines } = await req.json();
    if (!Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json({ error: 'At least one line to receive is required.' }, { status: 400 });
    }

    const purchase = await db.$transaction(async tx => {
      const existing = await tx.purchase.findUnique({ where: { id }, include: { items: true } });
      if (!existing) throw new Error('NOT_FOUND');
      if (existing.status === 'CANCELLED') throw new Error('CANCELLED');
      if (existing.status === 'RECEIVED') throw new Error('ALREADY_RECEIVED');

      for (const line of lines as { purchaseItemId: string; receiveQty: number }[]) {
        const item = existing.items.find(i => i.id === line.purchaseItemId);
        if (!item) throw new Error('ITEM_NOT_FOUND');
        const receiveQty = Math.trunc(line.receiveQty);
        const remaining = item.orderedQty - item.receivedQty;
        if (!(receiveQty > 0) || receiveQty > remaining) throw new Error('INVALID_QTY');

        await recordStockMovement(tx, {
          productId: item.productId,
          storeId: existing.storeId,
          type: 'PURCHASE_RECEIVE',
          quantity: receiveQty,
          reference: existing.id,
          note: `Received against purchase`,
          createdById: admin.id,
          createdByName: admin.name,
        });
        await tx.purchaseItem.update({ where: { id: item.id }, data: { receivedQty: { increment: receiveQty } } });
      }

      const refreshedItems = await tx.purchaseItem.findMany({ where: { purchaseId: id } });
      const fullyReceived = refreshedItems.every(i => i.receivedQty >= i.orderedQty);
      const anyReceived = refreshedItems.some(i => i.receivedQty > 0);

      return tx.purchase.update({
        where: { id },
        data: {
          status: fullyReceived ? 'RECEIVED' : anyReceived ? 'PARTIAL' : existing.status,
          lastReceivedById: admin.id,
          lastReceivedByName: admin.name,
          lastReceivedAt: new Date(),
        },
        include: { items: true, supplier: { select: { name: true } }, store: { select: { name: true, code: true } } },
      });
    });

    logAudit({ admin, action: 'UPDATE', entityType: 'Purchase', entityId: id, after: purchase });
    return NextResponse.json({ purchase });
  } catch (e) {
    if (e instanceof Error && e.message === 'NOT_FOUND') return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (e instanceof Error && e.message === 'CANCELLED') return NextResponse.json({ error: 'This purchase was cancelled.' }, { status: 409 });
    if (e instanceof Error && e.message === 'ALREADY_RECEIVED') return NextResponse.json({ error: 'This purchase is already fully received.' }, { status: 409 });
    if (e instanceof Error && e.message === 'ITEM_NOT_FOUND') return NextResponse.json({ error: 'One or more line items do not belong to this purchase.' }, { status: 400 });
    if (e instanceof Error && e.message === 'INVALID_QTY') return NextResponse.json({ error: 'Receive quantity must be positive and not exceed the remaining ordered quantity.' }, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
