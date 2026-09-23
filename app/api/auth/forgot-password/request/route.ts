import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { sendSms } from '@/lib/sms';
import { resolveResetRole } from '@/lib/roleAccess';
import { isAdminRole } from '@/lib/permissions';

/* ── POST /api/auth/forgot-password/request ──
 * Generates a 6-digit OTP for a phone with a password-based account
 * (doctor/partner/admin — patients have no password to reset). `role` says which of the
 * phone's role passwords is being reset, since each role has its own.
 * Always returns { success: true } even if the phone isn't found, to avoid
 * leaking which numbers have accounts.
 */
export async function POST(req: NextRequest) {
  try {
    const { phone, role } = await req.json();
    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ error: 'ဖုန်းနံပါတ် ထည့်ပါ' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { phone }, select: { id: true, role: true, password: true, isActive: true } });
    const targetRole = user ? await resolveResetRole(user, typeof role === 'string' ? role : undefined, isAdminRole) : null;

    if (user && targetRole && user.isActive) {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const codeHash = await bcrypt.hash(code, 10);

      await db.passwordResetOtp.updateMany({ where: { phone, consumed: false }, data: { consumed: true } });
      await db.passwordResetOtp.create({
        data: { phone, codeHash, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
      });

      await sendSms(phone, `Your MediHug verification code is ${code}. Valid for 10 minutes.`);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error. ထပ်မံ ကြိုးစားပါ။' }, { status: 500 });
  }
}
