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
      select: { id: true, name: true, phone: true, gender: true, birthday: true, state: true, township: true, profileImage: true },
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
    const { phone, profileImage } = body;

    if (!phone) {
      return NextResponse.json({ error: 'phone is required.' }, { status: 400 });
    }

    const user = await db.user.update({
      where: { phone },
      data:  { profileImage: profileImage ?? null },
      select: { id: true, name: true, phone: true, profileImage: true },
    });

    return NextResponse.json({ user });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
