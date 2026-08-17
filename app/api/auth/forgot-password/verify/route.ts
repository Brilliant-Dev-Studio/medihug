import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { signResetToken } from '@/lib/jwt';

/* ── POST /api/auth/forgot-password/verify ──
 * Checks the OTP against the most recent unconsumed code for that phone.
 * On success, marks it consumed and returns a short-lived reset token.
 */
export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json();
    if (!phone || !code) {
      return NextResponse.json({ error: 'OTP ကုဒ် ထည့်ပါ' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { phone }, select: { id: true, role: true } });
    if (!user || user.role === 'PATIENT') {
      return NextResponse.json({ error: 'OTP ကုဒ် မှားနေသည်' }, { status: 400 });
    }

    const otp = await db.passwordResetOtp.findFirst({
      where: { phone, consumed: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (!otp) {
      return NextResponse.json({ error: 'OTP ကုဒ် သက်တမ်းကုန်သွားပါပြီ။ ထပ်မံတောင်းပါ။' }, { status: 400 });
    }

    const match = await bcrypt.compare(code, otp.codeHash);
    if (!match) {
      return NextResponse.json({ error: 'OTP ကုဒ် မှားနေသည်' }, { status: 400 });
    }

    await db.passwordResetOtp.update({ where: { id: otp.id }, data: { consumed: true } });

    const resetToken = await signResetToken({ userId: user.id, phone, purpose: 'password_reset' });
    return NextResponse.json({ success: true, resetToken });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error. ထပ်မံ ကြိုးစားပါ။' }, { status: 500 });
  }
}
