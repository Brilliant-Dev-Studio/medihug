import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { verifyResetToken } from '@/lib/jwt';

/* ── POST /api/auth/forgot-password/reset ──
 * Final step: exchanges the OTP-verified reset token for a real password change.
 */
export async function POST(req: NextRequest) {
  try {
    const { resetToken, newPassword } = await req.json();
    if (!resetToken || !newPassword) {
      return NextResponse.json({ error: 'အချက်အလက် မပြည့်စုံပါ' }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'စကားဝှက် အနည်းဆုံး ၆ လုံး ဖြစ်ရမည်' }, { status: 400 });
    }

    const payload = await verifyResetToken(resetToken);
    if (!payload) {
      return NextResponse.json({ error: 'Session သက်တမ်းကုန်သွားပါပြီ။ ပြန်စမ်းကြည့်ပါ။' }, { status: 401 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.user.update({ where: { id: payload.userId }, data: { password: passwordHash } });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error. ထပ်မံ ကြိုးစားပါ။' }, { status: 500 });
  }
}
