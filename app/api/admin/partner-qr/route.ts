import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAudit } from '@/lib/audit';
import { getPlatformSettings } from '@/lib/commission';
import type { Prisma } from '@/app/generated/prisma/client';

const PAGE_SIZE = 20;

/* ── GET /api/admin/partner-qr — discount % setting + the paginated usage log
 * (which patient used which partner's QR, when, on which doctor). ── */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req, 'partners.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const sp = req.nextUrl.searchParams;
    const page = Math.max(1, Number(sp.get('page') ?? '1') || 1);
    const clinicId = sp.get('clinicId');
    const q = sp.get('q')?.trim();
    const from = sp.get('from');
    const to = sp.get('to');

    const where: Prisma.PartnerQrRedemptionWhereInput = {};
    if (clinicId) where.clinicId = clinicId;
    if (q) {
      where.OR = [
        { user: { name: { contains: q, mode: 'insensitive' } } },
        { user: { phone: { contains: q } } },
        { code: { contains: q, mode: 'insensitive' } },
        { doctor: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }
    if (from || to) {
      where.createdAt = {
        ...(from ? { gte: new Date(`${from}T00:00:00`) } : {}),
        ...(to ? { lte: new Date(`${to}T23:59:59.999`) } : {}),
      };
    }

    const [settings, total, sum, redemptions, clinics] = await Promise.all([
      getPlatformSettings(),
      db.partnerQrRedemption.count({ where }),
      db.partnerQrRedemption.aggregate({ where, _sum: { discountAmount: true } }),
      db.partnerQrRedemption.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          clinic:      { select: { id: true, name: true, nameEn: true } },
          user:        { select: { id: true, name: true, phone: true } },
          doctor:      { select: { id: true, name: true } },
          appointment: { select: { id: true, date: true, time: true, fee: true, status: true } },
        },
      }),
      db.clinic.findMany({
        where: { referralQrCode: { not: null } },
        select: { id: true, name: true, nameEn: true, referralQrCode: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    return NextResponse.json({
      percent: settings.partnerQrDiscountPercent,
      total,
      totalDiscount: sum._sum.discountAmount ?? 0,
      pageSize: PAGE_SIZE,
      redemptions,
      clinics,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── PATCH /api/admin/partner-qr — set the doctor-booking discount % (0 disables it) ── */
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req, 'partners.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { percent } = await req.json();
    if (!Number.isInteger(percent) || percent < 0 || percent > 100) {
      return NextResponse.json({ error: 'percent must be a whole number between 0 and 100.' }, { status: 400 });
    }
    const before = await getPlatformSettings();
    const settings = await db.platformSettings.update({
      where: { id: 'singleton' },
      data: { partnerQrDiscountPercent: percent },
    });
    logAudit({
      admin: { id: admin.id, name: admin.name },
      action: 'UPDATE',
      entityType: 'PartnerQrDiscount',
      entityId: 'singleton',
      before: { percent: before.partnerQrDiscountPercent },
      after: { percent: settings.partnerQrDiscountPercent },
    });
    return NextResponse.json({ percent: settings.partnerQrDiscountPercent });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
