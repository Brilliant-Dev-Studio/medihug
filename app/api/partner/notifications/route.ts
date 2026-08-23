import { NextRequest, NextResponse } from 'next/server';
import { verifyPartnerToken } from '@/lib/jwt';
import { db } from '@/lib/db';

async function requirePartnerUserId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('partner_token')?.value;
  if (!token) return null;
  const payload = await verifyPartnerToken(token);
  return payload?.id ?? null;
}

/* ── GET /api/partner/notifications — recent feed for the logged-in partner ── */
export async function GET(req: NextRequest) {
  const userId = await requirePartnerUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const notifications = await db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  const unreadCount = await db.notification.count({ where: { userId, read: false } });

  return NextResponse.json({ notifications, unreadCount });
}

/* ── PATCH /api/partner/notifications — mark all read ── */
export async function PATCH(req: NextRequest) {
  const userId = await requirePartnerUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await db.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
  return NextResponse.json({ success: true });
}
