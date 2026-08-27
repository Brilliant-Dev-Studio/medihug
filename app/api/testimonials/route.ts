import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/testimonials — public, active-only, ordered ── */
export async function GET() {
  try {
    const testimonials = await db.testimonial.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json({ testimonials });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
