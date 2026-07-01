import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get('search') ?? '';
    const page   = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') ?? '1'));
    const limit  = 15;
    const skip   = (page - 1) * limit;
    const where  = search
      ? { OR: [{ name: { contains: search, mode: 'insensitive' as const } }, { nameEn: { contains: search, mode: 'insensitive' as const } }] }
      : {};
    const [categories, total] = await Promise.all([
      db.productCategory.findMany({ where, orderBy: { name: 'asc' }, skip, take: limit }),
      db.productCategory.count({ where }),
    ]);
    return NextResponse.json({ categories, total, page, totalPages: Math.ceil(total / limit) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, nameEn } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    const existing = await db.productCategory.findUnique({ where: { name: name.trim() } });
    if (existing) return NextResponse.json({ error: 'Category already exists.' }, { status: 409 });
    const category = await db.productCategory.create({ data: { name: name.trim(), nameEn: nameEn?.trim() || null } });
    return NextResponse.json({ category }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
