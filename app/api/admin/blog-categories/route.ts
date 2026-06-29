import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const categories = await db.blogCategory.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, nameEn } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: 'Name is required.' }, { status: 400 });

    const existing = await db.blogCategory.findUnique({ where: { name: name.trim() } });
    if (existing) return NextResponse.json({ error: 'ဤ Category ရှိနှင့်ပြီးသားဖြစ်သည်။' }, { status: 409 });

    const category = await db.blogCategory.create({
      data: { name: name.trim(), nameEn: nameEn?.trim() || null },
    });
    return NextResponse.json({ category }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
