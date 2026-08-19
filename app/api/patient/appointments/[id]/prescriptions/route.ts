import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/* ── GET /api/patient/appointments/[id]/prescriptions — every round the doctor has sent ── */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const prescriptions = await db.prescription.findMany({
      where: { appointmentId: id, status: 'SENT' },
      include: { medicines: { orderBy: { order: 'asc' } } },
      orderBy: { sentAt: 'desc' },
    });

    return NextResponse.json({ prescriptions }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
