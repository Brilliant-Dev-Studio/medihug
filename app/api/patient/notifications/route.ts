import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

async function resolveUserId(phone: string): Promise<string | null> {
  if (!phone) return null;
  const user = await db.user.findUnique({ where: { phone }, select: { id: true } });
  return user?.id ?? null;
}

/* ── GET /api/patient/notifications?phone= — recent feed for the logged-in patient ── */
export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get('phone') ?? '';
  const userId = await resolveUserId(phone);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const notifications = await db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  const unreadCount = await db.notification.count({ where: { userId, read: false } });

  return NextResponse.json({ notifications, unreadCount });
}

/* ── PATCH /api/patient/notifications { phone } — mark all read ── */
export async function PATCH(req: NextRequest) {
  const { phone } = await req.json();
  const userId = await resolveUserId(phone);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await db.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
  return NextResponse.json({ success: true });
}
