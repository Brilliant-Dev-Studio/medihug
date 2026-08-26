import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id }        = await params;
    const { name, nameEn, iconUrl, bgImageUrl, doctorIds } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: 'Name is required.' }, { status: 400 });

    const category = await db.$transaction(async tx => {
      const updated = await tx.productCategory.update({
        where: { id },
        data:  { name: name.trim(), nameEn: nameEn?.trim() || null, iconUrl: iconUrl ?? null, bgImageUrl: bgImageUrl ?? null },
      });
      if (Array.isArray(doctorIds)) {
        await tx.doctorCategory.deleteMany({ where: { categoryId: id } });
        if (doctorIds.length > 0) {
          await tx.doctorCategory.createMany({ data: doctorIds.map((doctorId: string) => ({ categoryId: id, doctorId })) });
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
