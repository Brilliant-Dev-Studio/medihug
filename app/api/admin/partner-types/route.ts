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
      const partnerTypes = await db.partnerType.findMany({ where, orderBy: { name: 'asc' } });
      return NextResponse.json({ partnerTypes });
    }
    const page  = Math.max(1, parseInt(pageParam));
    const limit = 15;
    const skip  = (page - 1) * limit;
    const [partnerTypes, total] = await Promise.all([
      db.partnerType.findMany({ where, orderBy: { name: 'asc' }, skip, take: limit }),
      db.partnerType.count({ where }),
    ]);
    return NextResponse.json({ partnerTypes, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, nameEn } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: 'Name is required.' }, { status: 400 });

    const existing = await db.partnerType.findUnique({ where: { name: name.trim() } });
    if (existing) return NextResponse.json({ error: 'ဤ Partner Type ရှိနှင့်ပြီးသားဖြစ်သည်။' }, { status: 409 });

    const partnerType = await db.partnerType.create({
      data: { name: name.trim(), nameEn: nameEn?.trim() || null },
    });
    return NextResponse.json({ partnerType }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
