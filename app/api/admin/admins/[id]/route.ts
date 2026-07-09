import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/jwt';
import { db } from '@/lib/db';

/* ── PATCH /api/admin/admins/[id] — toggle active ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { isActive } = await req.json();

    const target = await db.user.findUnique({ where: { id } });
    if (!target || target.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const admin = await db.user.update({
      where: { id },
      data:  { isActive },
      select: { id: true, name: true, phone: true, isActive: true, createdAt: true },
    });
    return NextResponse.json({ admin });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── DELETE /api/admin/admins/[id] ── */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const token   = req.cookies.get('admin_token')?.value;
    const payload = token ? await verifyAdminToken(token) : null;
    if (payload?.id === id) {
      return NextResponse.json({ error: 'မိမိကိုယ်ကို ဖျက်၍မရပါ။' }, { status: 400 });
    }

    const target = await db.user.findUnique({ where: { id } });
    if (!target || target.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await db.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
