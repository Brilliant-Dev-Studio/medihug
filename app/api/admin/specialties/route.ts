import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const pageParam = req.nextUrl.searchParams.get('page');
    const search    = req.nextUrl.searchParams.get('search') ?? '';
    const where     = search
      ? { OR: [{ name: { contains: search, mode: 'insensitive' as const } }, { nameEn: { contains: search, mode: 'insensitive' as const } }] }
      : {};
    if (!pageParam) {
      const specialties = await db.specialty.findMany({ where, orderBy: { name: 'asc' } });
      return NextResponse.json({ specialties });
    }
    const page  = Math.max(1, parseInt(pageParam));
    const limit = 15;
    const skip  = (page - 1) * limit;
    const [specialties, total] = await Promise.all([
      db.specialty.findMany({ where, orderBy: { name: 'asc' }, skip, take: limit }),
      db.specialty.count({ where }),
    ]);
    return NextResponse.json({ specialties, total, page, totalPages: Math.ceil(total / limit) });
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
