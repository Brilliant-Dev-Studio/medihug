import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/product-categories ── */
export async function GET() {
  try {
    const categories = await db.productCategory.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { doctors: true, programs: true } } },
    });
    const withCounts = categories.map(({ _count, ...c }) => ({ ...c, doctorCount: _count.doctors, programCount: _count.programs }));
    return NextResponse.json({ categories: withCounts });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
