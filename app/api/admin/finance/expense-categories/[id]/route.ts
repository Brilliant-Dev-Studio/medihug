import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';

/* ── PATCH /api/admin/finance/expense-categories/[id] { isCapital } — reclassify a category
 * between Operating Expense and Investment/CAPEX. ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    const { isCapital } = await req.json();
    if (typeof isCapital !== 'boolean') return NextResponse.json({ error: 'isCapital must be a boolean.' }, { status: 400 });
    const category = await db.expenseCategory.update({ where: { id }, data: { isCapital } });
    return NextResponse.json({ category });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── DELETE /api/admin/finance/expense-categories/[id] ── */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'pos.delete');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    await db.expenseCategory.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Category has expenses recorded against it and cannot be deleted.' }, { status: 409 });
  }
}
