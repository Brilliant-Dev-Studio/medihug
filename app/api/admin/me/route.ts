import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await verifyAdminToken(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json({ admin: payload });
}
