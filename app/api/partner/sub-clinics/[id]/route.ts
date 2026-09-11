import { NextRequest, NextResponse } from 'next/server';
import { verifyPartnerToken } from '@/lib/jwt';
import { db } from '@/lib/db';

async function requireClinicId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('partner_token')?.value;
  if (!token) return null;
  const payload = await verifyPartnerToken(token);
  return payload?.clinicId ?? null;
}

/** A partner may only ever touch a sub-clinic that actually belongs to them. */
async function requireOwnedSubClinic(clinicId: string, subClinicId: string) {
  const sub = await db.clinic.findUnique({ where: { id: subClinicId }, select: { id: true, parentClinicId: true } });
  return sub && sub.parentClinicId === clinicId ? sub : null;
}

/* ── GET /api/partner/sub-clinics/[id] — full record for editing ── */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const clinicId = await requireClinicId(req);
  if (!clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!(await requireOwnedSubClinic(clinicId, id))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const subClinic = await db.clinic.findUnique({
    where: { id },
    include: { branches: { orderBy: { order: 'asc' } }, gallery: { orderBy: { order: 'asc' } } },
  });
  return NextResponse.json({ subClinic });
}

/* ── PATCH /api/partner/sub-clinics/[id] — same field set as create, minus login/ownership
 * fields (a sub-clinic never gets its own login) ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const clinicId = await requireClinicId(req);
  if (!clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!(await requireOwnedSubClinic(clinicId, id))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await req.json();
  const {
    name, nameEn, type, country, countryEn,
    address, addressEn, state, township,
    phone, phone2, phone3, website, facebookUrl, tiktokUrl, mapUrl,
    imageUrl, coverUrl, openTime, closeTime,
    aboutMm, aboutEn, tagsMm, tagsEn,
    branches, gallery,
  } = body;

  if (name !== undefined && !name.trim()) {
    return NextResponse.json({ error: 'name လိုအပ်သည်။' }, { status: 400 });
  }

  await db.clinic.update({
    where: { id },
    data: {
      ...(name        !== undefined && { name }),
      ...(nameEn      !== undefined && { nameEn }),
      ...(type        !== undefined && { type }),
      ...(country     !== undefined && { country }),
      ...(countryEn   !== undefined && { countryEn }),
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

  if (branches !== undefined) {
    await db.clinicBranch.deleteMany({ where: { clinicId: id } });
    if (branches.length > 0) {
      await db.clinicBranch.createMany({
        data: branches.map((b: { title: string; titleEn?: string; address: string; addressEn?: string; mapUrl?: string }, i: number) => ({
          clinicId: id,
          title: b.title,
          titleEn: b.titleEn || null,
          address: b.address,
          addressEn: b.addressEn || null,
          mapUrl: b.mapUrl || null,
          order: i,
        })),
      });
    }
  }

  if (gallery !== undefined) {
    await db.clinicGallery.deleteMany({ where: { clinicId: id } });
    if (gallery.length > 0) {
      await db.clinicGallery.createMany({
        data: gallery.map((g: { imageUrl: string; captionMm?: string; captionEn?: string }, i: number) => ({
          clinicId: id,
          imageUrl: g.imageUrl,
          captionMm: g.captionMm ?? '',
          captionEn: g.captionEn ?? '',
          order: i,
        })),
      });
    }
  }

  const subClinic = await db.clinic.findUnique({
    where: { id },
    include: { branches: { orderBy: { order: 'asc' } }, gallery: { orderBy: { order: 'asc' } } },
  });
  return NextResponse.json({ subClinic });
}

/* ── DELETE /api/partner/sub-clinics/[id] ── */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const clinicId = await requireClinicId(req);
  if (!clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!(await requireOwnedSubClinic(clinicId, id))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await db.clinic.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
