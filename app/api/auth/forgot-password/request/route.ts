import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

/* ── POST /api/auth/forgot-password/request ──
 * Generates a 6-digit OTP for a phone with a password-based account
 * (doctor/partner/admin — patients have no password to reset).
 * Always returns { success: true } even if the phone isn't found, to avoid
 * leaking which numbers have accounts.
 */
export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ error: 'ဖုန်းနံပါတ် ထည့်ပါ' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { phone }, select: { id: true, role: true, isActive: true } });

    if (user && user.role !== 'PATIENT' && user.isActive) {
      // No SMS gateway wired up yet — mock code, matches the existing /verify screen's default OTP.
      const code = '123456';
      const codeHash = await bcrypt.hash(code, 10);

      await db.passwordResetOtp.updateMany({ where: { phone, consumed: false }, data: { consumed: true } });
      await db.passwordResetOtp.create({
        data: { phone, codeHash, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error. ထပ်မံ ကြိုးစားပါ။' }, { status: 500 });
  }
}
