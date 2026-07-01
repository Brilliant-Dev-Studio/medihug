import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/admin/blogs/[id] ── */
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const blog = await db.blog.findUnique({ where: { id } });
    if (!blog) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ blog });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── PATCH /api/admin/blogs/[id] ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id }  = await params;
    const body    = await req.json();
    const { id: _id, createdAt, updatedAt, slug: _slug, ...rest } = body;
    void _id; void createdAt; void updatedAt; void _slug;

    // If toggling isPublished on → set publishedAt
    const data: Record<string, unknown> = { ...rest };
    if (rest.isPublished === true && !rest.publishedAt) {
      const existing = await db.blog.findUnique({ where: { id }, select: { isPublished: true, publishedAt: true } });
      if (!existing?.isPublished) data.publishedAt = new Date();
    }
    if (rest.isPublished === false) data.publishedAt = null;

    const blog = await db.blog.update({ where: { id }, data });
    return NextResponse.json({ blog });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── DELETE /api/admin/blogs/[id] ── */
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.blog.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
