import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/patient/profile?phone=xxx ── */
export async function GET(req: NextRequest) {
  try {
    const phone = req.nextUrl.searchParams.get('phone') ?? '';
    if (!phone) {
      return NextResponse.json({ error: 'phone is required.' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where:  { phone },
      select: { id: true, name: true, phone: true, gender: true, birthday: true, state: true, township: true, profileImage: true, role: true },
    });
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ user });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── PATCH /api/patient/profile ── */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, profileImage, name, gender, birthday, state, township } = body;

    if (!phone) {
      return NextResponse.json({ error: 'phone is required.' }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (profileImage !== undefined) data.profileImage = profileImage || null;
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return NextResponse.json({ error: 'name cannot be empty.' }, { status: 400 });
      }
      data.name = name.trim();
    }
    if (gender !== undefined) data.gender = gender === 'MALE' || gender === 'FEMALE' ? gender : null;
    if (birthday !== undefined) data.birthday = birthday ? new Date(birthday) : null;
    if (state !== undefined) data.state = state || null;
    if (township !== undefined) data.township = township || null;

    const user = await db.user.update({
      where: { phone },
      data,
      select: { id: true, name: true, phone: true, gender: true, birthday: true, state: true, township: true, profileImage: true },
    });

    return NextResponse.json({ user });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
