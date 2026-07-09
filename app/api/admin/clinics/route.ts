import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/admin/clinics ── */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const search   = searchParams.get('search')   ?? '';
    const type     = searchParams.get('type')     ?? '';
    const isActive = searchParams.get('isActive') ?? '';
    const page     = parseInt(searchParams.get('page')     ?? '1');
    const pageSize = parseInt(searchParams.get('pageSize') ?? '12');

    const where: Record<string, unknown> = {};
    if (search) where.OR = [
      { name:   { contains: search, mode: 'insensitive' } },
      { nameEn: { contains: search, mode: 'insensitive' } },
    ];
    const isPartner = searchParams.get('isPartner') ?? '';
    if (type)               where.type      = type;
    if (isActive  !== '')   where.isActive  = isActive  === 'true';
    if (isPartner !== '')   where.isPartner = isPartner === 'true';

    const [clinics, total] = await Promise.all([
      db.clinic.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: { select: { doctors: true } },
        },
      }),
      db.clinic.count({ where }),
    ]);

    return NextResponse.json({ clinics, total, page, pageSize });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── POST /api/admin/clinics ── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, nameEn, type, address, addressEn, state, township,
      phone, website, imageUrl, coverUrl, openTime, closeTime,
      aboutMm, aboutEn, tagsMm, tagsEn, verified, isPartner,
    } = body;

    if (!name) return NextResponse.json({ error: 'name လိုအပ်သည်။' }, { status: 400 });

    const { doctorIds } = body;

    const clinic = await db.clinic.create({
      data: {
        name,
        nameEn:    nameEn    || null,
        type:      type      || 'CLINIC',
        address:   address   || null,
        addressEn: addressEn || null,
        state:     state     || null,
        township:  township  || null,
        phone:     phone     || null,
        website:   website   || null,
        imageUrl:  imageUrl  || null,
        coverUrl:  coverUrl  || null,
        openTime:  openTime  || null,
        closeTime: closeTime || null,
        aboutMm:   aboutMm   || null,
        aboutEn:   aboutEn   || null,
        tagsMm:    tagsMm    ?? [],
        tagsEn:    tagsEn    ?? [],
        verified:  verified  ?? false,
        isPartner: isPartner ?? true,
        isActive:  true,
      },
    });

    if (Array.isArray(doctorIds) && doctorIds.length > 0) {
      await db.clinicDoctor.createMany({
        data: doctorIds.map((doctorId: string) => ({ clinicId: clinic.id, doctorId })),
        skipDuplicates: true,
      });
    }

    const { gallery } = body;
    if (Array.isArray(gallery) && gallery.length > 0) {
      await db.clinicGallery.createMany({
        data: gallery.map((g: { imageUrl: string; captionMm?: string; captionEn?: string }, i: number) => ({
          clinicId:  clinic.id,
          imageUrl:  g.imageUrl,
          captionMm: g.captionMm ?? '',
          captionEn: g.captionEn ?? '',
          order:     i,
        })),
      });
    }

    return NextResponse.json({ clinic }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
