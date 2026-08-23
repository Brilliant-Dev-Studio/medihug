import { NextRequest, NextResponse } from 'next/server';
import { verifyPartnerToken } from '@/lib/jwt';
import { db } from '@/lib/db';

async function requireClinicId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('partner_token')?.value;
  if (!token) return null;
  const payload = await verifyPartnerToken(token);
  return payload?.clinicId ?? null;
}

/* ── PATCH /api/partner/gallery/[id] — edit caption or reorder, own clinic's photo only ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const clinicId = await requireClinicId(req);
  if (!clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = await db.clinicGallery.findUnique({ where: { id }, select: { clinicId: true } });
  if (!existing || existing.clinicId !== clinicId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { imageUrl, captionMm, captionEn, order } = await req.json();
  const photo = await db.clinicGallery.update({
    where: { id },
    data: {
      ...(imageUrl   !== undefined && { imageUrl }),
      ...(captionMm  !== undefined && { captionMm: captionMm || null }),
      ...(captionEn  !== undefined && { captionEn: captionEn || null }),
      ...(order      !== undefined && { order }),
    },
  });
  return NextResponse.json({ photo });
}

/* ── DELETE /api/partner/gallery/[id] — own clinic's photo only ── */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const clinicId = await requireClinicId(req);
  if (!clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = await db.clinicGallery.findUnique({ where: { id }, select: { clinicId: true } });
  if (!existing || existing.clinicId !== clinicId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await db.clinicGallery.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
