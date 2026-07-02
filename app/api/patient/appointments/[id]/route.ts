import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/patient/appointments/[id] ── */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const appointment = await db.appointment.findUnique({
      where: { id },
      include: {
        user:   { select: { name: true, phone: true } },
        doctor: { select: { name: true, nameEn: true, specialty: true, specialtyEn: true, imageUrl: true } },
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    }

    return NextResponse.json({ appointment });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
