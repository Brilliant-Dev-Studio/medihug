import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id }        = await params;
    const { name, nameEn, iconUrl, bgImageUrl } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    const category = await db.programCategory.update({
      where: { id },
      data:  { name: name.trim(), nameEn: nameEn?.trim() || null, iconUrl: iconUrl ?? null, bgImageUrl: bgImageUrl ?? null },
    });
    return NextResponse.json({ category });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.programCategory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
