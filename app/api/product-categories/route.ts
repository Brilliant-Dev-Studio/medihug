import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/product-categories ── */
export async function GET() {
  try {
    const categories = await db.productCategory.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json({ categories });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
