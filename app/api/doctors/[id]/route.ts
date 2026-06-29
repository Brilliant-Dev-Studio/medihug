import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const doctor = await db.doctor.findUnique({
      where:   { id, isActive: true },
      include: {
        slots:   { orderBy: { dayOfWeek: 'asc' } },
        gallery: { orderBy: { order: 'asc' } },
      },
    });
    if (!doctor) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ doctor });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
