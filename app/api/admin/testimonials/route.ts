import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';

/* ── GET /api/admin/testimonials — SuperAdmin only ── */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req, 'settings.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const testimonials = await db.testimonial.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json({ testimonials });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── POST /api/admin/testimonials — SuperAdmin only ── */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req, 'settings.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { name, roleMm, roleEn, reviewMm, reviewEn, rating, imageUrl, order, isActive } = body;

    if (!name || !roleMm || !reviewMm) {
      return NextResponse.json({ error: 'name, roleMm, reviewMm are required.' }, { status: 400 });
    }

    const testimonial = await db.testimonial.create({
      data: {
        name, roleMm,
        roleEn: roleEn || null,
        reviewMm,
        reviewEn: reviewEn || null,
        rating: rating ?? 5,
        imageUrl: imageUrl || null,
        order: order ?? 0,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({ testimonial }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
