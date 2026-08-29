import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/healthcare-programs?categoryId= — categoryId filters by the landing-page
 * Product/Service category a program is linked to (CategoryProgram), separate from the
 * program's own ProgramCategory grouping. ── */
export async function GET(req: NextRequest) {
  try {
    const categoryId = req.nextUrl.searchParams.get('categoryId') ?? '';
    const where: Record<string, unknown> = { isActive: true };
    if (categoryId) where.categoryLinks = { some: { categoryId } };

    const programs = await db.healthcareProgram.findMany({
      where,
      include: { category: { select: { id: true, name: true, nameEn: true } } },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json({ programs });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
