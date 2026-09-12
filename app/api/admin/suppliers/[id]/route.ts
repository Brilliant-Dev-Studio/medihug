import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAudit } from '@/lib/audit';

/* ── GET /api/admin/suppliers/[id] ── */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const supplier = await db.supplier.findUnique({ where: { id } });
    if (!supplier) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ supplier });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── PATCH /api/admin/suppliers/[id] ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const { id: _id, createdAt, updatedAt, purchases, ...data } = await req.json();
    void _id; void createdAt; void updatedAt; void purchases;

    const before = await db.supplier.findUnique({ where: { id } });
    const supplier = await db.supplier.update({ where: { id }, data });
    logAudit({ admin, action: 'UPDATE', entityType: 'Supplier', entityId: id, before, after: supplier });
    return NextResponse.json({ supplier });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── DELETE /api/admin/suppliers/[id] ── */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'pos.delete');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const before = await db.supplier.findUnique({ where: { id } });
    await db.supplier.delete({ where: { id } });
    logAudit({ admin, action: 'DELETE', entityType: 'Supplier', entityId: id, before });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && e.code === 'P2003') {
      return NextResponse.json({ error: 'This supplier has purchase history and cannot be deleted.' }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
