import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { signAdminToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();

    if (!phone || !password) {
      return NextResponse.json({ error: 'Phone and password are required.' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { phone } });

    if (!user) {
      return NextResponse.json({ error: 'ဤဖုန်းနံပါတ်သည် မှတ်ပုံတင်မထားပါ။' }, { status: 401 });
    }

    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Super Admin အခွင့်အရေး မရှိပါ။' }, { status: 403 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'ဤ account ကို ပိတ်ထားသည်။' }, { status: 403 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Password မှားနေပါသည်။ ထပ်မံ ကြိုးစားပါ။' }, { status: 401 });
    }

    const token = await signAdminToken({
      id:    user.id,
      name:  user.name,
      phone: user.phone,
      role:  user.role,
    });

    const res = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role },
    });

    res.cookies.set('admin_token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path:     '/',
      maxAge:   60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch {
    return NextResponse.json({ error: 'Server error. ထပ်မံ ကြိုးစားပါ။' }, { status: 500 });
  }
}
