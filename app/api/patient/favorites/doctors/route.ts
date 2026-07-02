import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

/* ── GET /api/patient/favorites/doctors?phone=xxx&full=true ── */
export async function GET(req: NextRequest) {
  try {
    const phone = req.nextUrl.searchParams.get('phone') ?? '';
    const full  = req.nextUrl.searchParams.get('full') === 'true';
    if (!phone) return NextResponse.json({ error: 'phone is required.' }, { status: 400 });

    const user = await db.user.findUnique({ where: { phone } });
    if (!user) return NextResponse.json(full ? { doctors: [] } : { ids: [] });

    const favorites = await db.favoriteDoctor.findMany({
      where: { userId: user.id },
      include: { doctor: { include: { slots: true } } },
      orderBy: { createdAt: 'desc' },
    });

    if (full) return NextResponse.json({ doctors: favorites.map(f => f.doctor) });
    return NextResponse.json({ ids: favorites.map(f => f.doctorId) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── POST /api/patient/favorites/doctors ── */
export async function POST(req: NextRequest) {
  try {
    const { phone, name, doctorId } = await req.json();
    if (!phone || !name || !doctorId) {
      return NextResponse.json({ error: 'phone, name, doctorId are required.' }, { status: 400 });
    }

    let user = await db.user.findUnique({ where: { phone } });
    if (!user) {
      const hashedPassword = await bcrypt.hash(phone, 12);
      user = await db.user.create({ data: { name, phone, password: hashedPassword, role: 'PATIENT' } });
    }

    await db.favoriteDoctor.upsert({
      where: { userId_doctorId: { userId: user.id, doctorId } },
      create: { userId: user.id, doctorId },
      update: {},
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── DELETE /api/patient/favorites/doctors ── */
export async function DELETE(req: NextRequest) {
  try {
    const { phone, doctorId } = await req.json();
    if (!phone || !doctorId) {
      return NextResponse.json({ error: 'phone, doctorId are required.' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { phone } });
    if (!user) return NextResponse.json({ success: true });

    await db.favoriteDoctor.deleteMany({ where: { userId: user.id, doctorId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
