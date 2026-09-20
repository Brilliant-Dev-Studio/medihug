import { NextRequest, NextResponse } from 'next/server';
import { verifyPartnerToken } from '@/lib/jwt';
import { db } from '@/lib/db';
import type { Prisma } from '@/app/generated/prisma/client';

const PAGE_SIZE = 15;

/** 09265577723 -> 0926•••7723 — a partner sees who booked through their QR, not a full contact. */
function maskPhone(phone: string): string {
  if (phone.length <= 7) return phone;
  return `${phone.slice(0, 4)}•••${phone.slice(-4)}`;
}

/* ── GET /api/partner/referral-qr/usage — bookings that used THIS clinic's referral QR,
 * newest first, with totals for the current date filter. ── */
export async function GET(req: NextRequest) {
  const token = req.cookies.get('partner_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyPartnerToken(token);
  if (!payload?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const sp = req.nextUrl.searchParams;
    const page = Math.max(1, Number(sp.get('page') ?? '1') || 1);
    const from = sp.get('from');
    const to = sp.get('to');

    const where: Prisma.PartnerQrRedemptionWhereInput = { clinicId: payload.clinicId };
    if (from || to) {
      where.createdAt = {
        ...(from ? { gte: new Date(`${from}T00:00:00`) } : {}),
        ...(to ? { lte: new Date(`${to}T23:59:59.999`) } : {}),
      };
    }

    const [total, sum, rows] = await Promise.all([
      db.partnerQrRedemption.count({ where }),
      db.partnerQrRedemption.aggregate({ where, _sum: { discountAmount: true } }),
      db.partnerQrRedemption.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          user:        { select: { name: true, phone: true } },
          doctor:      { select: { name: true, nameEn: true } },
          appointment: { select: { date: true, time: true, status: true, fee: true } },
        },
      }),
    ]);

    return NextResponse.json({
      total,
      totalDiscount: sum._sum.discountAmount ?? 0,
      pageSize: PAGE_SIZE,
      usage: rows.map(r => ({
        id: r.id,
        createdAt: r.createdAt,
        percent: r.percent,
        discountAmount: r.discountAmount,
        patient: { name: r.user.name, phone: maskPhone(r.user.phone) },
        doctor: { name: r.doctor.name, nameEn: r.doctor.nameEn },
        appointment: r.appointment,
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
