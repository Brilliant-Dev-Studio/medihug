import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAudit } from '@/lib/audit';

/* ── GET /api/admin/purchases?supplierId=&storeId=&status=&from=&to=&page=&pageSize= ── */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = req.nextUrl;
    const supplierId = searchParams.get('supplierId') ?? '';
    const storeId    = searchParams.get('storeId')    ?? '';
    const status     = searchParams.get('status')     ?? '';
    const from       = searchParams.get('from');
    const to         = searchParams.get('to');
    const page       = parseInt(searchParams.get('page')     ?? '1');
    const pageSize   = parseInt(searchParams.get('pageSize') ?? '20');

    const where: Record<string, unknown> = {};
    if (supplierId) where.supplierId = supplierId;
    if (storeId)    where.storeId = storeId;
    if (status)     where.status = status;
    if (from || to) where.purchaseDate = {
      ...(from && { gte: new Date(from) }),
      ...(to && { lte: new Date(to) }),
    };

    const [purchases, total] = await Promise.all([
      db.purchase.findMany({
        where,
        include: { supplier: { select: { name: true } }, store: { select: { name: true, code: true } }, items: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.purchase.count({ where }),
    ]);

    return NextResponse.json({ purchases, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── POST /api/admin/purchases { supplierId, storeId, expectedDate?, discountAmount?,
 * taxAmount?, shippingCost?, note?, items: [{ productId, orderedQty, unitCost }] } ──
 * Totals are always computed server-side from the submitted line items — never trusted
 * from the client. */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { supplierId, storeId, expectedDate, note } = body;
    const discountAmount = Number(body.discountAmount) || 0;
    const taxAmount      = Number(body.taxAmount) || 0;
    const shippingCost   = Number(body.shippingCost) || 0;
    const items: { productId: string; orderedQty: number; unitCost: number }[] = Array.isArray(body.items) ? body.items : [];

    if (!supplierId || !storeId) {
      return NextResponse.json({ error: 'Supplier and store are required.' }, { status: 400 });
    }
    if (items.length === 0 || items.some(i => !i.productId || !(i.orderedQty > 0) || i.unitCost < 0)) {
      return NextResponse.json({ error: 'At least one valid product line is required.' }, { status: 400 });
    }

    const lineItems = items.map(i => ({
      productId: i.productId,
      orderedQty: Math.trunc(i.orderedQty),
      unitCost: Math.trunc(i.unitCost),
      lineTotal: Math.trunc(i.orderedQty) * Math.trunc(i.unitCost),
    }));
    const subtotal = lineItems.reduce((s, i) => s + i.lineTotal, 0);
    const totalAmount = subtotal - discountAmount + taxAmount + shippingCost;

    const purchase = await db.purchase.create({
      data: {
        supplierId,
        storeId,
        expectedDate: expectedDate ? new Date(expectedDate) : null,
        subtotal,
        discountAmount,
        taxAmount,
        shippingCost,
        totalAmount,
        note: note || null,
        createdById: admin.id,
        createdByName: admin.name,
        items: { create: lineItems },
      },
      include: { supplier: { select: { name: true } }, store: { select: { name: true, code: true } }, items: true },
    });
    logAudit({ admin, action: 'CREATE', entityType: 'Purchase', entityId: purchase.id, after: purchase });
    return NextResponse.json({ purchase }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
