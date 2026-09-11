import { NextRequest, NextResponse } from 'next/server';
import { verifyPartnerToken } from '@/lib/jwt';
import { db } from '@/lib/db';

async function requireClinicId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('partner_token')?.value;
  if (!token) return null;
  const payload = await verifyPartnerToken(token);
  return payload?.clinicId ?? null;
}

/* ── GET /api/partner/sub-clinics — International Partners registered under this
 * partner's own account (no login of their own, managed via this session). ── */
export async function GET(req: NextRequest) {
  const clinicId = await requireClinicId(req);
  if (!clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const subClinics = await db.clinic.findMany({
    where: { parentClinicId: clinicId },
    include: { _count: { select: { doctors: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ subClinics });
}

/* ── POST /api/partner/sub-clinics — create a new International Partner "sub-clinic"
 * under the logged-in partner's own account. No separate login: same phone/password as
 * the main clinic keeps managing it (doctors, slots, country info) from this portal. ── */
export async function POST(req: NextRequest) {
  const clinicId = await requireClinicId(req);
  if (!clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const {
      name, nameEn, type, country, countryEn,
      address, addressEn, state, township,
      phone, phone2, phone3, website, facebookUrl, tiktokUrl, mapUrl,
      imageUrl, coverUrl, openTime, closeTime,
      aboutMm, aboutEn, tagsMm, tagsEn,
      branches, gallery,
    } = body;

    if (!name?.trim()) return NextResponse.json({ error: 'name လိုအပ်သည်။' }, { status: 400 });
    if (!country?.trim()) return NextResponse.json({ error: 'country လိုအပ်သည်။' }, { status: 400 });

    const subClinic = await db.clinic.create({
      data: {
        name,
        nameEn: nameEn || null,
        type: type || 'Clinic',
        country,
        countryEn: countryEn || null,
        address: address || null,
        addressEn: addressEn || null,
        state: state || null,
        township: township || null,
        phone: phone || null,
        phone2: phone2 || null,
        phone3: phone3 || null,
        website: website || null,
        facebookUrl: facebookUrl || null,
        tiktokUrl: tiktokUrl || null,
        mapUrl: mapUrl || null,
        imageUrl: imageUrl || null,
        coverUrl: coverUrl || null,
        openTime: openTime || null,
        closeTime: closeTime || null,
        aboutMm: aboutMm || null,
        aboutEn: aboutEn || null,
        tagsMm: tagsMm ?? [],
        tagsEn: tagsEn ?? [],
        isInternational: true,
        isPartner: true,
        isActive: true,
        parentClinicId: clinicId,
      },
    });

    if (Array.isArray(branches) && branches.length > 0) {
      await db.clinicBranch.createMany({
        data: branches.map((b: { title: string; titleEn?: string; address: string; addressEn?: string; mapUrl?: string }, i: number) => ({
          clinicId: subClinic.id,
          title: b.title,
          titleEn: b.titleEn || null,
          address: b.address,
          addressEn: b.addressEn || null,
          mapUrl: b.mapUrl || null,
          order: i,
        })),
      });
    }

    if (Array.isArray(gallery) && gallery.length > 0) {
      await db.clinicGallery.createMany({
        data: gallery.map((g: { imageUrl: string; captionMm?: string; captionEn?: string }, i: number) => ({
          clinicId: subClinic.id,
          imageUrl: g.imageUrl,
          captionMm: g.captionMm ?? '',
          captionEn: g.captionEn ?? '',
          order: i,
        })),
      });
    }

    return NextResponse.json({ subClinic }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
