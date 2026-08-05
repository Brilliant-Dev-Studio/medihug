import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/healthcare-programs ── */
export async function GET() {
  try {
    const programs = await db.healthcareProgram.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json({ programs });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
