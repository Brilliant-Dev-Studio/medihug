import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

/* ── POST /api/auth/register — creates a patient account. Called only after
 * /api/auth/otp/verify has confirmed the phone via SMS. ── */
export async function POST(req: NextRequest) {
  try {
    const { username, phone, password } = await req.json();
    if (!username || !phone || !password) {
      return NextResponse.json({ error: 'အချက်အလက် မပြည့်စုံပါ' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'စကားဝှက် အနည်းဆုံး ၆ လုံး ဖြစ်ရမည်' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { phone } });
    if (existing) {
      return NextResponse.json({ error: 'ဤဖုန်းနံပါတ်ဖြင့် အကောင့်ရှိပြီးသားဖြစ်သည်' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await db.user.create({
      data: { name: username, phone, password: hashedPassword, role: 'PATIENT' },
    });

    return NextResponse.json({ success: true, user: { name: user.name, phone: user.phone } }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error. ထပ်မံ ကြိုးစားပါ။' }, { status: 500 });
  }
}
