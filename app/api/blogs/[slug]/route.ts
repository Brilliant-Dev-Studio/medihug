import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/blogs/[slug] ── */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const blog = await db.blog.findFirst({ where: { slug, isPublished: true } });
    if (!blog) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ blog });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
