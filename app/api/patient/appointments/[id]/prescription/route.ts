import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/patient/appointments/[id]/prescription — only once the doctor has sent it ── */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const prescription = await db.prescription.findUnique({
      where: { appointmentId: id, status: 'SENT' },
      include: { medicines: { orderBy: { order: 'asc' } } },
    });

    return NextResponse.json({ prescription });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
