import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAudit } from '@/lib/audit';

const SERVICE_TYPES = ['CONSULTATION', 'PRODUCT', 'PROGRAM', 'ADS'];

/* ── GET /api/admin/finance/rules ── */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rules = await db.commissionRule.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      doctor: { select: { id: true, name: true } },
      clinic: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json({ rules });
}

/* ── POST /api/admin/finance/rules ── */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { serviceType, doctorId, clinicId, paymentMethod, percent, fixedFee, effectiveFrom, effectiveTo, note } = body;

    if (!SERVICE_TYPES.includes(serviceType)) {
      return NextResponse.json({ error: `serviceType must be one of ${SERVICE_TYPES.join(', ')}.` }, { status: 400 });
    }
    if (typeof percent !== 'number' || percent < 0 || percent > 100) {
      return NextResponse.json({ error: 'percent must be a number between 0 and 100.' }, { status: 400 });
    }
    if (doctorId && serviceType !== 'CONSULTATION') {
      return NextResponse.json({ error: 'doctorId only applies to CONSULTATION rules.' }, { status: 400 });
    }

    const rule = await db.commissionRule.create({
      data: {
        serviceType,
        doctorId: doctorId || null,
        clinicId: clinicId || null,
        paymentMethod: paymentMethod || null,
        percent,
        fixedFee: typeof fixedFee === 'number' ? fixedFee : 0,
        effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : new Date(),
        effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
        note: note || null,
      },
    });
    logAudit({ admin, action: 'CREATE', entityType: 'CommissionRule', entityId: rule.id, after: rule });
    return NextResponse.json({ rule }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
