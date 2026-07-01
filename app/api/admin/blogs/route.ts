import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = base || 'blog';
  let n = 0;
  for (;;) {
    const candidate = n === 0 ? slug : `${slug}-${n}`;
    const existing  = await db.blog.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    n++;
  }
}

/* ── GET /api/admin/blogs ── */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const search      = searchParams.get('search')      ?? '';
    const category    = searchParams.get('category')    ?? '';
    const isPublished = searchParams.get('isPublished') ?? '';
    const page        = Math.max(1, parseInt(searchParams.get('page')     ?? '1'));
    const pageSize    = Math.max(1, parseInt(searchParams.get('pageSize') ?? '12'));

    const where: Record<string, unknown> = {};
    if (search) where.OR = [
      { title:   { contains: search, mode: 'insensitive' } },
      { titleEn: { contains: search, mode: 'insensitive' } },
    ];
    if (category)       where.category    = { contains: category, mode: 'insensitive' };
    if (isPublished !== '') where.isPublished = isPublished === 'true';

    const [blogs, total] = await Promise.all([
      db.blog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true, title: true, titleEn: true, slug: true,
          excerpt: true, imageUrl: true, category: true,
          isPublished: true, publishedAt: true, createdAt: true,
        },
      }),
      db.blog.count({ where }),
    ]);

    return NextResponse.json({ blogs, total, page, pageSize });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── POST /api/admin/blogs ── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, titleEn, content, excerpt, imageUrl, category, isPublished } = body;

    if (!title?.trim())   return NextResponse.json({ error: 'Title is required.'   }, { status: 400 });
    if (!content?.trim()) return NextResponse.json({ error: 'Content is required.' }, { status: 400 });

    const slug = await uniqueSlug(toSlug(title));
    const publish = isPublished === true;

    const blog = await db.blog.create({
      data: {
        title:       title.trim(),
        titleEn:     titleEn?.trim()  || null,
        slug,
        content:     content.trim(),
        excerpt:     excerpt?.trim()  || null,
        imageUrl:    imageUrl?.trim() || null,
        category:    category?.trim() || null,
        isPublished: publish,
        publishedAt: publish ? new Date() : null,
      },
    });

    return NextResponse.json({ blog }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
