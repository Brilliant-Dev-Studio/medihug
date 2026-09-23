import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { pointsErrorResponse, restorePointsEntry, updatePointsEntry, voidPointsEntry } from '@/lib/pointsAdmin';

/* ── PATCH /api/admin/points-ledger/[id] { points?, note? } edits an entry; { restore: true } undoes a delete ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'settings.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const actor = { id: admin.id, name: admin.name };
    if (body.restore === true) await restorePointsEntry(actor, id);
    else await updatePointsEntry(actor, id, { points: body.points, note: body.note });
    return NextResponse.json({ success: true });
  } catch (e) {
    return pointsErrorResponse(e);
  }
}

/* ── DELETE /api/admin/points-ledger/[id] { reason } — void: stops counting, stays on record ── */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'settings.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const { reason } = await req.json().catch(() => ({ reason: undefined }));
    await voidPointsEntry({ id: admin.id, name: admin.name }, id, reason);
    return NextResponse.json({ success: true });
  } catch (e) {
    return pointsErrorResponse(e);
  }
}
