import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { resolveCommission } from '@/lib/commission';
import { logAudit } from '@/lib/audit';

/* ── GET /api/admin/finance/revenue?serviceType=&from=&to= ── */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const serviceType = searchParams.get('serviceType');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const entries = await db.revenueEntry.findMany({
    where: {
      ...(serviceType && { serviceType: serviceType as 'PROGRAM' | 'ADS' }),
      ...((from || to) && {
        date: {
          ...(from && { gte: new Date(from) }),
          ...(to && { lte: new Date(to) }),
        },
      }),
    },
    include: { clinic: { select: { id: true, name: true } } },
    orderBy: { date: 'desc' },
  });
  return NextResponse.json({ entries });
}

/* ── POST /api/admin/finance/revenue ── */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { serviceType, amount, description, clinicId, date } = await req.json();
    if (serviceType !== 'PROGRAM' && serviceType !== 'ADS') {
      return NextResponse.json({ error: 'serviceType must be PROGRAM or ADS.' }, { status: 400 });
    }
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'amount must be a positive number.' }, { status: 400 });
    }

    let platformAmount: number | null = null;
    let partnerAmount: number | null = null;
    if (clinicId) {
      const clinic = await db.clinic.findUnique({ where: { id: clinicId }, select: { id: true } });
      if (!clinic) return NextResponse.json({ error: 'Clinic not found.' }, { status: 404 });
      // percent = platform's cut (same convention as Appointment's commission split).
      const { percent } = await resolveCommission({ serviceType, clinicId });
      platformAmount = Math.round(amount * percent / 100);
      partnerAmount = amount - platformAmount;
    }

    const entry = await db.revenueEntry.create({
      data: {
        serviceType,
        amount,
        description: description || null,
        clinicId: clinicId || null,
        platformAmount,
        partnerAmount,
        date: date ? new Date(date) : new Date(),
        createdBy: admin.name,
      },
      include: { clinic: { select: { id: true, name: true } } },
    });

    logAudit({ admin, action: 'CREATE', entityType: 'RevenueEntry', entityId: entry.id, after: entry });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
