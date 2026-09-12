import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';

/* ── GET /api/admin/stock-movements?productId=&storeId=&type=&from=&to=&page=&pageSize= ──
 * Read-only ledger view. Powers both the global Stock Ledger page and the
 * ?productId= pre-filtered link from a product's detail page. ── */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = req.nextUrl;
    const productId = searchParams.get('productId') ?? '';
    const storeId   = searchParams.get('storeId')   ?? '';
    const type      = searchParams.get('type')      ?? '';
    const from      = searchParams.get('from');
    const to        = searchParams.get('to');
    const page      = parseInt(searchParams.get('page')     ?? '1');
    const pageSize  = parseInt(searchParams.get('pageSize') ?? '30');

    const where: Record<string, unknown> = {};
    if (productId) where.productId = productId;
    if (storeId)   where.storeId = storeId;
    if (type)      where.type = type;
    if (from || to) where.createdAt = {
      ...(from && { gte: new Date(from) }),
      ...(to && { lte: new Date(to) }),
    };

    const [movements, total] = await Promise.all([
      db.stockMovement.findMany({
        where,
        include: { product: { select: { id: true, name: true, nameEn: true, imageUrl: true } }, store: { select: { id: true, name: true, code: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.stockMovement.count({ where }),
    ]);

    return NextResponse.json({ movements, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
