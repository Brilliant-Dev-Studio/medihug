import { NextRequest, NextResponse } from 'next/server';
import { verifyPartnerToken } from '@/lib/jwt';
import { db } from '@/lib/db';

async function requireClinicId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('partner_token')?.value;
  if (!token) return null;
  const payload = await verifyPartnerToken(token);
  return payload?.clinicId ?? null;
}

/* ── PATCH /api/partner/programs/[id] — edit own clinic's program (title/desc/price/image/active) ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const clinicId = await requireClinicId(req);
  if (!clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = await db.healthcareProgram.findUnique({ where: { id }, select: { clinicId: true } });
  if (!existing || existing.clinicId !== clinicId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { imageUrl, titleMm, titleEn, descMm, descEn, price, isActive } = await req.json();
  const program = await db.healthcareProgram.update({
    where: { id },
    data: {
      ...(imageUrl !== undefined && { imageUrl }),
      ...(titleMm  !== undefined && { titleMm }),
      ...(titleEn  !== undefined && { titleEn: titleEn || null }),
      ...(descMm   !== undefined && { descMm: descMm || null }),
      ...(descEn   !== undefined && { descEn: descEn || null }),
      ...(price    !== undefined && { price }),
      ...(isActive !== undefined && { isActive }),
    },
  });
  return NextResponse.json({ program });
}

/* ── DELETE /api/partner/programs/[id] — own clinic's program only ── */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const clinicId = await requireClinicId(req);
  if (!clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = await db.healthcareProgram.findUnique({ where: { id }, select: { clinicId: true } });
  if (!existing || existing.clinicId !== clinicId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await db.healthcareProgram.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
