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
    const { kyatPerPointEarn, kyatPerPointRedeem, isActive, expiryEnabled, expiryValue, expiryUnit } = await req.json();
    if (kyatPerPointEarn !== undefined && (typeof kyatPerPointEarn !== 'number' || kyatPerPointEarn <= 0)) {
      return NextResponse.json({ error: 'kyatPerPointEarn must be a positive number.' }, { status: 400 });
    }
    if (kyatPerPointRedeem !== undefined && (typeof kyatPerPointRedeem !== 'number' || kyatPerPointRedeem <= 0)) {
      return NextResponse.json({ error: 'kyatPerPointRedeem must be a positive number.' }, { status: 400 });
    }

    if (expiryEnabled !== undefined && typeof expiryEnabled !== 'boolean') {
      return NextResponse.json({ error: 'expiryEnabled must be true or false.' }, { status: 400 });
    }
    if (expiryUnit !== undefined && expiryUnit !== 'DAYS' && expiryUnit !== 'MONTHS') {
      return NextResponse.json({ error: 'expiryUnit must be DAYS or MONTHS.' }, { status: 400 });
    }
    if (expiryValue !== undefined) {
      const max = (expiryUnit ?? 'MONTHS') === 'DAYS' ? 3650 : 120;
      if (!Number.isInteger(expiryValue) || expiryValue < 1 || expiryValue > max) {
        return NextResponse.json({ error: `Expiry time must be a whole number between 1 and ${max} ${(expiryUnit ?? 'MONTHS').toLowerCase()}.` }, { status: 400 });
      }
    }

    const before = await getPointsSettings();
    const settings = await db.pointsSettings.upsert({
      where: { id: 'singleton' },
      update: {
        ...(kyatPerPointEarn   !== undefined && { kyatPerPointEarn }),
        ...(kyatPerPointRedeem !== undefined && { kyatPerPointRedeem }),
        ...(isActive           !== undefined && { isActive }),
        ...(expiryEnabled      !== undefined && { expiryEnabled }),
        ...(expiryValue        !== undefined && { expiryValue }),
        ...(expiryUnit         !== undefined && { expiryUnit }),
      },
      create: {
        id: 'singleton',
        kyatPerPointEarn: kyatPerPointEarn ?? 1000,
        kyatPerPointRedeem: kyatPerPointRedeem ?? 1000,
        isActive: isActive ?? true,
        expiryEnabled: expiryEnabled ?? false,
        expiryValue: expiryValue ?? 12,
        expiryUnit: expiryUnit ?? 'MONTHS',
      },
    });
    logAudit({ admin, action: 'UPDATE', entityType: 'PointsSettings', entityId: 'singleton', before, after: settings });
    return NextResponse.json({ settings });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
