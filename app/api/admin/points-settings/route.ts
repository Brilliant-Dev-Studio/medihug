import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAudit } from '@/lib/audit';
import { getPointsSettings } from '@/lib/pointsLedger';

/* ── GET /api/admin/points-settings — SuperAdmin only ── */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req, 'settings.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const settings = await getPointsSettings();
    return NextResponse.json({ settings });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── PATCH /api/admin/points-settings — SuperAdmin only ── */
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req, 'settings.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { kyatPerPointEarn, kyatPerPointRedeem, isActive } = await req.json();
    if (kyatPerPointEarn !== undefined && (typeof kyatPerPointEarn !== 'number' || kyatPerPointEarn <= 0)) {
      return NextResponse.json({ error: 'kyatPerPointEarn must be a positive number.' }, { status: 400 });
    }
    if (kyatPerPointRedeem !== undefined && (typeof kyatPerPointRedeem !== 'number' || kyatPerPointRedeem <= 0)) {
      return NextResponse.json({ error: 'kyatPerPointRedeem must be a positive number.' }, { status: 400 });
    }

    const before = await getPointsSettings();
    const settings = await db.pointsSettings.upsert({
      where: { id: 'singleton' },
      update: {
        ...(kyatPerPointEarn   !== undefined && { kyatPerPointEarn }),
        ...(kyatPerPointRedeem !== undefined && { kyatPerPointRedeem }),
        ...(isActive           !== undefined && { isActive }),
      },
      create: {
        id: 'singleton',
        kyatPerPointEarn: kyatPerPointEarn ?? 1000,
        kyatPerPointRedeem: kyatPerPointRedeem ?? 1000,
        isActive: isActive ?? true,
      },
    });
    logAudit({ admin, action: 'UPDATE', entityType: 'PointsSettings', entityId: 'singleton', before, after: settings });
    return NextResponse.json({ settings });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
