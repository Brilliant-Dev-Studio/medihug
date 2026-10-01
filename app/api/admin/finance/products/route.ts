import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { resolveWindow, type FinanceRange } from '@/lib/financeReport';

/* ── GET /api/admin/finance/products?range=&from=&to= — per-product rollup: purchase cost,
 * selling price, units sold, stock on hand, COGS, gross profit, margin. Cost basis is a
 * weighted average over every Purchase ever received for that product (not range-filtered —
 * cost predates the reporting window, same as any inventory system); revenue/qty/COGS are
 * range-filtered to COMPLETED orders. Stock shown is the patient-facing balance (Product.stock,
 * or the sum of its sizes' stock for a sized product) — the same number checkout actually
 * checks, not the separate multi-store POS ProductStock ledger (see Stock Ledger for that). ── */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = req.nextUrl;
    const range = (['daily', 'weekly', 'monthly', 'yearly', 'custom'].includes(searchParams.get('range') || '')
      ? searchParams.get('range')
      : 'monthly') as FinanceRange;
    const { since, until } = resolveWindow(range, searchParams.get('from'), searchParams.get('to'));
    const search = searchParams.get('search') ?? '';

    const [products, purchaseItemCosts, orders] = await Promise.all([
      db.product.findMany({
        where: search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { nameEn: { contains: search, mode: 'insensitive' } }] } : {},
        select: { id: true, name: true, nameEn: true, imageUrl: true, price: true, stock: true, isActive: true, sizes: { select: { stock: true } } },
        orderBy: { name: 'asc' },
      }),
      db.purchaseItem.groupBy({ by: ['productId'], _sum: { lineTotal: true, receivedQty: true } }),
      db.order.findMany({
        where: { status: 'COMPLETED', createdAt: { gte: since, lte: until } },
        select: { items: { select: { productId: true, price: true, quantity: true } } },
      }),
    ]);

    const avgCostByProduct = new Map<string, number>();
    for (const p of purchaseItemCosts) {
      const qty = p._sum.receivedQty ?? 0;
      if (qty > 0) avgCostByProduct.set(p.productId, (p._sum.lineTotal ?? 0) / qty);
    }

    const soldByProduct = new Map<string, { qty: number; revenue: number }>();
    for (const o of orders) {
      for (const i of o.items) {
        const existing = soldByProduct.get(i.productId) ?? { qty: 0, revenue: 0 };
        existing.qty += i.quantity;
        existing.revenue += i.price * i.quantity;
        soldByProduct.set(i.productId, existing);
      }
    }

    const rows = products.map(p => {
      const sold = soldByProduct.get(p.id) ?? { qty: 0, revenue: 0 };
      const avgCost = avgCostByProduct.get(p.id) ?? 0;
      const cogs = Math.round(avgCost * sold.qty);
      const grossProfit = sold.revenue - cogs;
      const stockBalance = p.sizes.length > 0 ? p.sizes.reduce((s, sz) => s + sz.stock, 0) : p.stock;
      return {
        id: p.id, name: p.name, nameEn: p.nameEn, imageUrl: p.imageUrl, isActive: p.isActive,
        hasSizes: p.sizes.length > 0,
        purchasePrice: Math.round(avgCost), sellingPrice: p.price,
        qtySold: sold.qty, stockBalance,
        revenue: sold.revenue, cogs, grossProfit,
        margin: sold.revenue > 0 ? Math.round((grossProfit / sold.revenue) * 1000) / 10 : 0,
      };
    }).sort((a, b) => b.revenue - a.revenue);

    return NextResponse.json({ range, since, until, products: rows });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
