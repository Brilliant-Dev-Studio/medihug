import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/healthcare-programs/[id] — public program detail + assigned doctors ── */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const program = await db.healthcareProgram.findUnique({
      where: { id, isActive: true },
      include: {
        doctors: {
          select: { doctor: { select: { id: true, name: true, nameEn: true, specialty: true, specialtyEn: true, imageUrl: true } } },
        },
      },
    });
    if (!program) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ program: { ...program, doctors: program.doctors.map(d => d.doctor) } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
