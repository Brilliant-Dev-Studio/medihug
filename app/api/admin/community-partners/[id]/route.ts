import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';

/* ── GET /api/admin/community-partners/[id] — SuperAdmin only ── */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'dashboard.view');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const partner = await db.communityPartner.findUnique({ where: { id } });
    if (!partner) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ partner });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── PATCH /api/admin/community-partners/[id] — SuperAdmin only ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'dashboard.view');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const {
      name, nameEn, descriptionMm, descriptionEn, contactPerson,
      phone, viber, location, address, addressEn, imageUrl, order, isActive,
    } = body;

    const data: Record<string, unknown> = {};
    if (name          !== undefined) data.name          = name;
    if (nameEn        !== undefined) data.nameEn        = nameEn || null;
    if (descriptionMm !== undefined) data.descriptionMm = descriptionMm || null;
    if (descriptionEn !== undefined) data.descriptionEn = descriptionEn || null;
    if (contactPerson !== undefined) data.contactPerson = contactPerson || null;
    if (phone         !== undefined) data.phone         = phone || null;
    if (viber         !== undefined) data.viber         = viber || null;
    if (location      !== undefined) data.location      = location || null;
    if (address       !== undefined) data.address       = address || null;
    if (addressEn     !== undefined) data.addressEn     = addressEn || null;
    if (imageUrl      !== undefined) data.imageUrl      = imageUrl || null;
    if (order         !== undefined) data.order         = order;
    if (isActive      !== undefined) data.isActive      = isActive;

    const partner = await db.communityPartner.update({ where: { id }, data });
    return NextResponse.json({ partner });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── DELETE /api/admin/community-partners/[id] — SuperAdmin only ── */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'dashboard.view');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    await db.communityPartner.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
