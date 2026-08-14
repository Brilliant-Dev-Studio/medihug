import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAudit } from '@/lib/audit';

/* ── DELETE /api/admin/finance/expenses/[id] ── */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const before = await db.expense.findUnique({ where: { id } });
  await db.expense.delete({ where: { id } });
  logAudit({ admin, action: 'DELETE', entityType: 'Expense', entityId: id, before });
  return NextResponse.json({ ok: true });
}
