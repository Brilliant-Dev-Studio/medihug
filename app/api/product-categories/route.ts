import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/product-categories ── */
export async function GET() {
  try {
    const categories = await db.productCategory.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { doctors: true } } },
    });
    const withDoctorCount = categories.map(({ _count, ...c }) => ({ ...c, doctorCount: _count.doctors }));
    return NextResponse.json({ categories: withDoctorCount });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
