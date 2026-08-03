import { NextRequest, NextResponse } from 'next/server';
import { verifyPartnerToken } from '@/lib/jwt';
import { db } from '@/lib/db';

/* ── GET /api/partner/appointments?page=&pageSize= — read-only, own clinic only ── */
export async function GET(req: NextRequest) {
  const token = req.cookies.get('partner_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyPartnerToken(token);
  if (!payload?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const page     = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') ?? '20')));

  const where = { clinicId: payload.clinicId };
  const [appointments, total] = await Promise.all([
    db.appointment.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user:   { select: { name: true, phone: true } },
        doctor: { select: { name: true, nameEn: true, specialty: true, specialtyEn: true, imageUrl: true } },
      },
    }),
    db.appointment.count({ where }),
  ]);

  return NextResponse.json({ appointments, total, page, pageSize });
}
