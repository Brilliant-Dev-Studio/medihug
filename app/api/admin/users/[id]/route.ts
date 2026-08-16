import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';

/* ── GET /api/admin/users/[id] ── */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'dashboard.view');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const user = await db.user.findUnique({
      where: { id, role: 'PATIENT' },
      select: {
        id: true, name: true, phone: true, gender: true, birthday: true,
        state: true, township: true, isActive: true, createdAt: true,
        appointments: {
          orderBy: { date: 'desc' },
          select: {
            id: true, date: true, time: true, reason: true, status: true,
            doctor: { select: { name: true } },
            clinic: { select: { name: true } },
          },
        },
      },
    });
    if (!user) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    return NextResponse.json({ user });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── DELETE /api/admin/users/[id] — hard delete patient account ── */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'dashboard.view');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const user = await db.user.findUnique({ where: { id, role: 'PATIENT' }, select: { id: true } });
    if (!user) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });

    await db.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
