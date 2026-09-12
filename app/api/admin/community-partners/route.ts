import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';

/* ── GET /api/admin/community-partners — SuperAdmin only ── */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req, 'dashboard.view');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const partners = await db.communityPartner.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json({ partners });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── POST /api/admin/community-partners — SuperAdmin only ── */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req, 'dashboard.view');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const {
      name, nameEn, descriptionMm, descriptionEn, contactPerson,
      phone, viber, location, address, addressEn, imageUrl, order, isActive,
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'name is required.' }, { status: 400 });
    }

    const partner = await db.communityPartner.create({
      data: {
        name,
        nameEn: nameEn || null,
        descriptionMm: descriptionMm || null,
        descriptionEn: descriptionEn || null,
        contactPerson: contactPerson || null,
        phone: phone || null,
        viber: viber || null,
        location: location || null,
        address: address || null,
        addressEn: addressEn || null,
        imageUrl: imageUrl || null,
        order: order ?? 0,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({ partner }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
