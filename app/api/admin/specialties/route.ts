import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const specialties = await db.specialty.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json({ specialties });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, nameEn } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: 'Name is required.' }, { status: 400 });

    const existing = await db.specialty.findUnique({ where: { name: name.trim() } });
    if (existing) return NextResponse.json({ error: 'ဤ Specialty ရှိနှင့်ပြီးသားဖြစ်သည်။' }, { status: 409 });

    const specialty = await db.specialty.create({
      data: { name: name.trim(), nameEn: nameEn?.trim() || null },
    });
    return NextResponse.json({ specialty }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
