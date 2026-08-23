import { NextRequest, NextResponse } from 'next/server';
import { verifyPartnerToken } from '@/lib/jwt';
import { db } from '@/lib/db';

async function requireClinicId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('partner_token')?.value;
  if (!token) return null;
  const payload = await verifyPartnerToken(token);
  return payload?.clinicId ?? null;
}

/* ── GET /api/partner/clinic — full profile for editing ── */
export async function GET(req: NextRequest) {
  const clinicId = await requireClinicId(req);
  if (!clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clinic = await db.clinic.findUnique({
    where: { id: clinicId },
    include: { gallery: { orderBy: { order: 'asc' } } },
  });
  if (!clinic) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ clinic });
}

/* ── PATCH /api/partner/clinic — self-service profile fields only
 * (verified / isActive / isPartner / ownerId stay admin-only) ── */
export async function PATCH(req: NextRequest) {
  const clinicId = await requireClinicId(req);
  if (!clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    name, nameEn, address, addressEn, state, township,
    phone, phone2, phone3, website, facebookUrl, tiktokUrl, mapUrl,
    imageUrl, coverUrl, openTime, closeTime, aboutMm, aboutEn, tagsMm, tagsEn,
  } = body;

  if (name !== undefined && !name.trim()) {
    return NextResponse.json({ error: 'name လိုအပ်သည်။' }, { status: 400 });
  }

  const clinic = await db.clinic.update({
    where: { id: clinicId },
    data: {
      ...(name        !== undefined && { name }),
      ...(nameEn      !== undefined && { nameEn }),
      ...(address     !== undefined && { address }),
      ...(addressEn   !== undefined && { addressEn }),
      ...(state       !== undefined && { state }),
      ...(township    !== undefined && { township }),
      ...(phone       !== undefined && { phone }),
      ...(phone2      !== undefined && { phone2 }),
      ...(phone3      !== undefined && { phone3 }),
      ...(website     !== undefined && { website }),
      ...(facebookUrl !== undefined && { facebookUrl }),
      ...(tiktokUrl   !== undefined && { tiktokUrl }),
      ...(mapUrl      !== undefined && { mapUrl }),
      ...(imageUrl    !== undefined && { imageUrl }),
      ...(coverUrl    !== undefined && { coverUrl }),
      ...(openTime    !== undefined && { openTime }),
      ...(closeTime   !== undefined && { closeTime }),
      ...(aboutMm     !== undefined && { aboutMm }),
      ...(aboutEn     !== undefined && { aboutEn }),
      ...(tagsMm      !== undefined && { tagsMm }),
      ...(tagsEn      !== undefined && { tagsEn }),
    },
  });
  return NextResponse.json({ clinic });
}
