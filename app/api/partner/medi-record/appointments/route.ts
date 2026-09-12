import { NextRequest, NextResponse } from 'next/server';
import { verifyPartnerToken } from '@/lib/jwt';
import { db } from '@/lib/db';
import { deriveAppointmentSteps } from '@/lib/mediRecordSteps';

/* ── GET /api/partner/medi-record/appointments — own clinic's appointments, each with a
 * derived step timeline. Same scoping as /api/partner/appointments, plus an optional
 * doctorId filter for the doctor-grouped Medi Record view. ── */
export async function GET(req: NextRequest) {
  const token = req.cookies.get('partner_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyPartnerToken(token);
  if (!payload?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const doctorId = searchParams.get('doctorId') ?? '';
  const search   = searchParams.get('search') ?? '';
  const page     = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') ?? '20')));

  const where: Record<string, unknown> = { clinicId: payload.clinicId };
  if (doctorId) where.doctorId = doctorId;
  if (search) {
    where.OR = [
      { user: { name:  { contains: search, mode: 'insensitive' } } },
      { user: { phone: { contains: search } } },
    ];
  }

  const [appointments, total] = await Promise.all([
    db.appointment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user:   { select: { name: true, phone: true } },
        doctor: { select: { id: true, name: true, nameEn: true, specialty: true, specialtyEn: true, imageUrl: true } },
      },
    }),
    db.appointment.count({ where }),
  ]);

  return NextResponse.json({
    appointments: appointments.map(a => ({ ...a, steps: deriveAppointmentSteps(a) })),
    total, page, pageSize,
  });
}
