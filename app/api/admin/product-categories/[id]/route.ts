import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id }        = await params;
    const { name, nameEn, descriptionMm, descriptionEn, iconUrl, bgImageUrl, doctorIds, programIds, order } = await req.json();
    if (name !== undefined && !name.trim()) {
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    }

    const category = await db.$transaction(async tx => {
      const data: Record<string, unknown> = {};
      if (name          !== undefined) data.name          = name.trim();
      if (nameEn        !== undefined) data.nameEn         = nameEn?.trim() || null;
      if (descriptionMm !== undefined) data.descriptionMm  = descriptionMm?.trim() || null;
      if (descriptionEn !== undefined) data.descriptionEn  = descriptionEn?.trim() || null;
      if (iconUrl       !== undefined) data.iconUrl        = iconUrl ?? null;
      if (bgImageUrl    !== undefined) data.bgImageUrl     = bgImageUrl ?? null;
      if (order         !== undefined) data.order          = order;

      const updated = await tx.productCategory.update({ where: { id }, data });
      if (Array.isArray(doctorIds)) {
        await tx.doctorCategory.deleteMany({ where: { categoryId: id } });
        if (doctorIds.length > 0) {
          await tx.doctorCategory.createMany({ data: doctorIds.map((doctorId: string) => ({ categoryId: id, doctorId })) });
        }
      }
      if (Array.isArray(programIds)) {
        await tx.categoryProgram.deleteMany({ where: { categoryId: id } });
        if (programIds.length > 0) {
          await tx.categoryProgram.createMany({ data: programIds.map((programId: string) => ({ categoryId: id, programId })) });
        }
      }
      return updated;
    });

    return NextResponse.json({ category });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'pos.delete');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    await db.productCategory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
