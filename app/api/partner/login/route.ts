import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { signPartnerToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();

    if (!phone || !password) {
      return NextResponse.json({ error: 'Phone and password are required.' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { phone } });
    if (!user || user.role !== 'PARTNER') {
      return NextResponse.json({ error: 'ဖုန်းနံပါတ် (သို့) စကားဝှက် မှားနေပါသည်။' }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'ဤ account ကို ပိတ်ထားသည်။' }, { status: 403 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'ဖုန်းနံပါတ် (သို့) စကားဝှက် မှားနေပါသည်။' }, { status: 401 });
    }

    const clinic = await db.clinic.findUnique({ where: { ownerId: user.id }, select: { id: true } });
    if (!clinic) {
      return NextResponse.json({ error: 'Partner clinic ရှာမတွေ့ပါ။' }, { status: 404 });
    }

    const token = await signPartnerToken({
      id: user.id, name: user.name, phone: user.phone, role: user.role, clinicId: clinic.id,
    });

    const res = NextResponse.json({ success: true, name: user.name, phone: user.phone });
    res.cookies.set('partner_token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path:     '/',
      maxAge:   60 * 60 * 24 * 7,
    });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error. ထပ်မံ ကြိုးစားပါ။' }, { status: 500 });
  }
}
