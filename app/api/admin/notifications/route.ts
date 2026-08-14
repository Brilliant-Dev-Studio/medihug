import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';

/* ── GET /api/admin/notifications — recent feed for the logged-in admin ── */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const notifications = await db.notification.findMany({
    where: { userId: admin.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  const unreadCount = await db.notification.count({ where: { userId: admin.id, read: false } });

  return NextResponse.json({ notifications, unreadCount });
}

/* ── PATCH /api/admin/notifications — mark all read ── */
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await db.notification.updateMany({ where: { userId: admin.id, read: false }, data: { read: true } });
  return NextResponse.json({ success: true });
}
