import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

/* ── POST /api/auth/otp/verify — checks a code sent via /api/auth/otp/send ── */
export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json();
    if (!phone || !code) {
      return NextResponse.json({ error: 'ဖုန်းနံပါတ်နှင့် ကုဒ် ထည့်ပါ' }, { status: 400 });
    }

    const otp = await db.passwordResetOtp.findFirst({
      where: { phone, consumed: false, expiresAt: { gte: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      return NextResponse.json({ error: 'OTP ကုဒ် သက်တမ်းကုန်သွားပါပြီ။ ပြန်မေတ်ပါ။' }, { status: 400 });
    }

    const match = await bcrypt.compare(code, otp.codeHash);
    if (!match) {
      return NextResponse.json({ error: 'OTP ကုဒ် မှားနေသည်' }, { status: 400 });
    }

    await db.passwordResetOtp.update({ where: { id: otp.id }, data: { consumed: true } });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error. ထပ်မံ ကြိုးစားပါ။' }, { status: 500 });
  }
}
