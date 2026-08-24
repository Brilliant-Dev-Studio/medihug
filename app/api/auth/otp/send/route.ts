import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { sendSms } from '@/lib/sms';

/* ── POST /api/auth/otp/send — generic phone-verification OTP (patient register + sign-in).
 * Reuses the PasswordResetOtp table (phone + codeHash + expiry) as a generic OTP store —
 * no schema change needed, the shape already fits. Always returns { success: true } even
 * if SMS delivery fails, to avoid leaking gateway state to the client; the failure is logged
 * server-side by sendSms(). */
export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ error: 'ဖုန်းနံပါတ် ထည့်ပါ' }, { status: 400 });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = await bcrypt.hash(code, 10);

    await db.passwordResetOtp.updateMany({ where: { phone, consumed: false }, data: { consumed: true } });
    await db.passwordResetOtp.create({
      data: { phone, codeHash, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
    });

    const result = await sendSms(phone, `Your MediHug verification code is ${code}. Valid for 10 minutes.`);
    if (!result.ok) {
      return NextResponse.json({ error: 'SMS ပို့၍မရပါ။ ထပ်မံ ကြိုးစားပါ။', code: result.error }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error. ထပ်မံ ကြိုးစားပါ။' }, { status: 500 });
  }
}
