import { NextRequest, NextResponse } from 'next/server';
import { getPlatformSettings } from '@/lib/commission';
import { db } from '@/lib/db';

/* ── GET /api/admin/settings ── */
export async function GET() {
  try {
    const settings = await getPlatformSettings();
    return NextResponse.json({ settings });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── PATCH /api/admin/settings ── */
export async function PATCH(req: NextRequest) {
  try {
    const { defaultCommissionPercent } = await req.json();
    if (typeof defaultCommissionPercent !== 'number' || defaultCommissionPercent < 0 || defaultCommissionPercent > 100) {
      return NextResponse.json({ error: 'defaultCommissionPercent must be a number between 0 and 100.' }, { status: 400 });
    }
    const settings = await db.platformSettings.upsert({
      where: { id: 'singleton' },
      update: { defaultCommissionPercent },
      create: { id: 'singleton', defaultCommissionPercent },
    });
    return NextResponse.json({ settings });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
