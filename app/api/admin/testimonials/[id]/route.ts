import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';

/* ── GET /api/admin/testimonials/[id] — SuperAdmin only ── */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'settings.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const testimonial = await db.testimonial.findUnique({ where: { id } });
    if (!testimonial) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ testimonial });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── PATCH /api/admin/testimonials/[id] — SuperAdmin only ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'settings.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, roleMm, roleEn, reviewMm, reviewEn, rating, imageUrl, order, isActive } = body;

    const data: Record<string, unknown> = {};
    if (name      !== undefined) data.name      = name;
    if (roleMm    !== undefined) data.roleMm    = roleMm;
    if (roleEn    !== undefined) data.roleEn    = roleEn || null;
    if (reviewMm  !== undefined) data.reviewMm  = reviewMm;
    if (reviewEn  !== undefined) data.reviewEn  = reviewEn || null;
    if (rating    !== undefined) data.rating    = rating;
    if (imageUrl  !== undefined) data.imageUrl  = imageUrl || null;
    if (order     !== undefined) data.order     = order;
    if (isActive  !== undefined) data.isActive  = isActive;

    const testimonial = await db.testimonial.update({ where: { id }, data });
    return NextResponse.json({ testimonial });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── DELETE /api/admin/testimonials/[id] — SuperAdmin only ── */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'settings.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    await db.testimonial.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
