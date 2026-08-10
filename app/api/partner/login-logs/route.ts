import { NextRequest, NextResponse } from 'next/server';
import { verifyPartnerToken } from '@/lib/jwt';
import { db } from '@/lib/db';

/* ── GET /api/partner/login-logs — most recent logins to this clinic's shared account ── */
export async function GET(req: NextRequest) {
  const token = req.cookies.get('partner_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyPartnerToken(token);
  if (!payload?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const logs = await db.clinicLoginLog.findMany({
    where: { clinicId: payload.clinicId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return NextResponse.json({ logs });
}
