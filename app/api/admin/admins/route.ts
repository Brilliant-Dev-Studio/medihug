import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

/* ── GET /api/admin/admins ── */
export async function GET() {
  try {
    const admins = await db.user.findMany({
      where:   { role: 'SUPER_ADMIN' },
      select:  { id: true, name: true, phone: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ admins });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── POST /api/admin/admins ── */
export async function POST(req: NextRequest) {
  try {
    const { name, phone, password } = await req.json();

    if (!name || !phone || !password) {
      return NextResponse.json({ error: 'Name, phone, password လိုအပ်သည်။' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password အနည်းဆုံး ၆ လုံး ဖြစ်ရမည်။' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { phone } });
    if (existing) {
      return NextResponse.json({ error: 'ဤဖုန်းနံပါတ်သည် မှတ်ပုံတင်ပြီးသား ဖြစ်သည်။' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const admin = await db.user.create({
      data: { name, phone, password: hashedPassword, role: 'SUPER_ADMIN', isActive: true },
      select: { id: true, name: true, phone: true, isActive: true, createdAt: true },
    });

    return NextResponse.json({ admin }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
