import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAudit } from '@/lib/audit';

/* ── GET /api/admin/stores?search=&isActive= ── */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = req.nextUrl;
    const search   = searchParams.get('search')   ?? '';
    const isActive = searchParams.get('isActive') ?? '';

    const where: Record<string, unknown> = {};
    if (search) where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
    ];
    if (isActive !== '') where.isActive = isActive === 'true';

    const stores = await db.store.findMany({ where, orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }] });
    return NextResponse.json({ stores });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── POST /api/admin/stores ── */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, nameEn, code, address, phone } = await req.json();
    if (!name?.trim() || !code?.trim()) {
      return NextResponse.json({ error: 'Store name and code are required.' }, { status: 400 });
    }

    const store = await db.store.create({
      data: {
        name: name.trim(),
        nameEn: nameEn || null,
        code: code.trim().toUpperCase(),
        address: address || null,
        phone: phone || null,
      },
    });
    logAudit({ admin, action: 'CREATE', entityType: 'Store', entityId: store.id, after: store });
    return NextResponse.json({ store }, { status: 201 });
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
      return NextResponse.json({ error: 'A store with this code already exists.' }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
