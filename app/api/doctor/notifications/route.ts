import { NextRequest, NextResponse } from 'next/server';
import { verifyDoctorToken } from '@/lib/jwt';
import { db } from '@/lib/db';

async function requireDoctorUserId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('doctor_token')?.value;
  if (!token) return null;
  const payload = await verifyDoctorToken(token);
  return payload?.id ?? null;
}

/* ── GET /api/doctor/notifications — recent feed for the logged-in doctor ── */
export async function GET(req: NextRequest) {
  const userId = await requireDoctorUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const notifications = await db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  const unreadCount = await db.notification.count({ where: { userId, read: false } });

  return NextResponse.json({ notifications, unreadCount });
}

/* ── PATCH /api/doctor/notifications — mark all read ── */
export async function PATCH(req: NextRequest) {
  const userId = await requireDoctorUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await db.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
  return NextResponse.json({ success: true });
}
