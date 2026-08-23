import { NextRequest, NextResponse } from 'next/server';
import { verifyPartnerToken } from '@/lib/jwt';
import { db } from '@/lib/db';

async function requireClinicId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('partner_token')?.value;
  if (!token) return null;
  const payload = await verifyPartnerToken(token);
  return payload?.clinicId ?? null;
}

/* ── POST /api/partner/gallery — add a photo to the clinic's own gallery ── */
export async function POST(req: NextRequest) {
  const clinicId = await requireClinicId(req);
  if (!clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { imageUrl, captionMm, captionEn } = await req.json();
    if (!imageUrl) return NextResponse.json({ error: 'imageUrl လိုအပ်သည်။' }, { status: 400 });

    const maxOrder = await db.clinicGallery.aggregate({ where: { clinicId }, _max: { order: true } });
    const photo = await db.clinicGallery.create({
      data: {
        clinicId, imageUrl,
        captionMm: captionMm || null,
        captionEn: captionEn || null,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });
    return NextResponse.json({ photo }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
