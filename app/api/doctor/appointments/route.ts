import { NextRequest, NextResponse } from 'next/server';
import { verifyDoctorToken } from '@/lib/jwt';
import { db } from '@/lib/db';

async function requireDoctorId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('doctor_token')?.value;
  if (!token) return null;
  const payload = await verifyDoctorToken(token);
  return payload?.doctorId ?? null;
}

/* ── GET /api/doctor/appointments ── */
export async function GET(req: NextRequest) {
  const doctorId = await requireDoctorId(req);
  if (!doctorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const status   = searchParams.get('status')   ?? '';
  const search   = searchParams.get('search')   ?? '';
  const page     = parseInt(searchParams.get('page')     ?? '1');
  const pageSize = parseInt(searchParams.get('pageSize') ?? '10');

  const where: Record<string, unknown> = { doctorId };
  if (status) where.status = status;
  if (search) {
    where.user = {
      OR: [
        { name:  { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ],
    };
  }

  const [appointments, total] = await Promise.all([
    db.appointment.findMany({
      where,
      include: { user: { select: { name: true, phone: true } } },
      orderBy: { date: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.appointment.count({ where }),
  ]);

  return NextResponse.json({ appointments, total, page, pageSize });
}
