import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { isAdminRole } from '@/lib/permissions';

/* ── PATCH /api/admin/admins/[id] { isActive?, role? } ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requester = await requireAdmin(req, 'admins.manage');
  if (!requester) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const { isActive, role } = await req.json();

    if (role !== undefined && !isAdminRole(role)) {
      return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
    }

    const target = await db.user.findUnique({ where: { id } });
    if (!target || !isAdminRole(target.role)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const admin = await db.user.update({
      where: { id },
      data:  { ...(isActive !== undefined && { isActive }), ...(role !== undefined && { role }) },
      select: { id: true, name: true, phone: true, role: true, isActive: true, createdAt: true },
    });
    return NextResponse.json({ admin });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── DELETE /api/admin/admins/[id] ── */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requester = await requireAdmin(req, 'admins.manage');
  if (!requester) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;

    if (requester.id === id) {
      return NextResponse.json({ error: 'မိမိကိုယ်ကို ဖျက်၍မရပါ။' }, { status: 400 });
    }

    const target = await db.user.findUnique({ where: { id } });
    if (!target || !isAdminRole(target.role)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await db.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
