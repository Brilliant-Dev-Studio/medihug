import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/blogs ── */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const limit    = parseInt(searchParams.get('limit') ?? '10');
    const search   = searchParams.get('search')   ?? '';
    const category = searchParams.get('category') ?? '';

    const where: Record<string, unknown> = { isPublished: true };
    if (search) where.OR = [
      { title:   { contains: search, mode: 'insensitive' } },
      { titleEn: { contains: search, mode: 'insensitive' } },
    ];
    if (category) where.category = { contains: category, mode: 'insensitive' };

    const blogs = await db.blog.findMany({
      where,
      select: {
        id: true, title: true, titleEn: true, slug: true, excerpt: true,
        imageUrl: true, category: true, publishedAt: true, createdAt: true,
      },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });

    return NextResponse.json({ blogs });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
