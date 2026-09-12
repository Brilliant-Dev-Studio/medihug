import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAudit } from '@/lib/audit';

/* ── GET /api/admin/suppliers?search=&isActive=&page=&pageSize= ── */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = req.nextUrl;
    const search   = searchParams.get('search')   ?? '';
    const isActive = searchParams.get('isActive') ?? '';
    const page     = parseInt(searchParams.get('page')     ?? '1');
    const pageSize = parseInt(searchParams.get('pageSize') ?? '20');

    const where: Record<string, unknown> = {};
    if (search) where.OR = [
      { name:          { contains: search, mode: 'insensitive' } },
      { contactPerson: { contains: search, mode: 'insensitive' } },
      { phone:         { contains: search, mode: 'insensitive' } },
    ];
    if (isActive !== '') where.isActive = isActive === 'true';

    const [suppliers, total] = await Promise.all([
      db.supplier.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.supplier.count({ where }),
    ]);

    return NextResponse.json({ suppliers, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── POST /api/admin/suppliers ── */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, contactPerson, phone, email, address, taxId, note } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: 'Supplier name is required.' }, { status: 400 });

    const supplier = await db.supplier.create({
      data: {
        name: name.trim(),
        contactPerson: contactPerson || null,
        phone: phone || null,
        email: email || null,
        address: address || null,
        taxId: taxId || null,
        note: note || null,
      },
    });
    logAudit({ admin, action: 'CREATE', entityType: 'Supplier', entityId: supplier.id, after: supplier });
    return NextResponse.json({ supplier }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
