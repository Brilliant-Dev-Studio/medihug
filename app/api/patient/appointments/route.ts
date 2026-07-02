import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/patient/appointments?phone=xxx ── */
export async function GET(req: NextRequest) {
  try {
    const phone = req.nextUrl.searchParams.get('phone') ?? '';
    if (!phone) {
      return NextResponse.json({ error: 'phone is required.' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { phone } });
    if (!user) {
      return NextResponse.json({ appointments: [] });
    }

    const appointments = await db.appointment.findMany({
      where: { userId: user.id },
      include: {
        doctor: { select: { name: true, nameEn: true, specialty: true, specialtyEn: true, imageUrl: true } },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ appointments });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
