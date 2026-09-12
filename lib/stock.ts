import type { Prisma, StockMovementType } from '@/app/generated/prisma/client';

type TxClient = Prisma.TransactionClient;

/** The only function allowed to write to ProductStock/StockMovement. Every stock writer
 * (Purchases today; Transfers/Damages/the checkout register later) must go through this so
 * the per-store balance, the ledger, and the Product.stock aggregate never drift apart.
 * Must be called inside the caller's db.$transaction. Throws 'INSUFFICIENT_STOCK' if a
 * negative `quantity` would take a store's balance below zero. */
export async function recordStockMovement(tx: TxClient, params: {
  productId: string;
  storeId: string;
  type: StockMovementType;
  quantity: number; // signed: positive = stock in, negative = stock out
  reference?: string;
  note?: string;
  createdById?: string;
  createdByName?: string;
}): Promise<{ balanceAfter: number }> {
  const { productId, storeId, type, quantity, reference, note, createdById, createdByName } = params;

  const stock = await tx.productStock.upsert({
    where: { productId_storeId: { productId, storeId } },
    create: { productId, storeId, quantity },
    update: { quantity: { increment: quantity } },
  });
  if (stock.quantity < 0) throw new Error('INSUFFICIENT_STOCK');

  await tx.stockMovement.create({
    data: {
      productId,
      storeId,
      type,
      quantity,
      balanceAfter: stock.quantity,
      reference: reference ?? null,
      note: note ?? null,
      createdById: createdById ?? null,
      createdByName: createdByName ?? null,
    },
  });

  await tx.product.update({ where: { id: productId }, data: { stock: { increment: quantity } } });

  return { balanceAfter: stock.quantity };
}
