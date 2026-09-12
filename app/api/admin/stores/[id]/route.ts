import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAudit } from '@/lib/audit';

/* ── GET /api/admin/stores/[id] ── */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const store = await db.store.findUnique({ where: { id } });
    if (!store) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ store });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── PATCH /api/admin/stores/[id] ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const { id: _id, createdAt, updatedAt, code, ...data } = await req.json();
    void _id; void createdAt; void updatedAt;

    const before = await db.store.findUnique({ where: { id } });
    const store = await db.store.update({
      where: { id },
      data: { ...data, ...(code ? { code: String(code).trim().toUpperCase() } : {}) },
    });
    logAudit({ admin, action: 'UPDATE', entityType: 'Store', entityId: id, before, after: store });
    return NextResponse.json({ store });
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
      return NextResponse.json({ error: 'A store with this code already exists.' }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── DELETE /api/admin/stores/[id] ── */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'pos.delete');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const before = await db.store.findUnique({ where: { id } });
    if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (before.isDefault) return NextResponse.json({ error: 'The default store cannot be deleted.' }, { status: 400 });

    await db.store.delete({ where: { id } });
    logAudit({ admin, action: 'DELETE', entityType: 'Store', entityId: id, before });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && e.code === 'P2003') {
      return NextResponse.json({ error: 'This store has stock/purchase history and cannot be deleted.' }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
