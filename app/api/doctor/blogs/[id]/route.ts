import { NextRequest, NextResponse } from 'next/server';
import { verifyDoctorToken } from '@/lib/jwt';
import { db } from '@/lib/db';

async function requireDoctorId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('doctor_token')?.value;
  if (!token) return null;
  const payload = await verifyDoctorToken(token);
  return payload?.doctorId ?? null;
}

/* ── GET /api/doctor/blogs/[id] — own blog only ── */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const doctorId = await requireDoctorId(req);
  if (!doctorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const blog = await db.blog.findUnique({ where: { id } });
  if (!blog || blog.authorDoctorId !== doctorId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ blog });
}

/* ── PATCH /api/doctor/blogs/[id] — own blog only ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const doctorId = await requireDoctorId(req);
  if (!doctorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = await db.blog.findUnique({ where: { id }, select: { authorDoctorId: true, isPublished: true } });
  if (!existing || existing.authorDoctorId !== doctorId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { title, titleEn, content, excerpt, imageUrl, category, isPublished } = body;
    if (title !== undefined   && !title?.trim())   return NextResponse.json({ error: 'Title is required.'   }, { status: 400 });
    if (content !== undefined && !content?.trim()) return NextResponse.json({ error: 'Content is required.' }, { status: 400 });

    const data: Record<string, unknown> = {};
    if (title       !== undefined) data.title       = title.trim();
    if (titleEn      !== undefined) data.titleEn      = titleEn?.trim() || null;
    if (content      !== undefined) data.content      = content.trim();
    if (excerpt      !== undefined) data.excerpt      = excerpt?.trim() || null;
    if (imageUrl     !== undefined) data.imageUrl     = imageUrl?.trim() || null;
    if (category     !== undefined) data.category     = category?.trim() || null;
    if (isPublished   !== undefined) {
      data.isPublished = isPublished;
      if (isPublished === true && !existing.isPublished) data.publishedAt = new Date();
      if (isPublished === false) data.publishedAt = null;
    }

    const blog = await db.blog.update({ where: { id }, data });
    return NextResponse.json({ blog });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── DELETE /api/doctor/blogs/[id] — own blog only ── */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const doctorId = await requireDoctorId(req);
  if (!doctorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = await db.blog.findUnique({ where: { id }, select: { authorDoctorId: true } });
  if (!existing || existing.authorDoctorId !== doctorId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await db.blog.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
