import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { signDoctorToken } from '@/lib/jwt';

/* ── POST /api/auth/login ──
 * Used by the landing sign-in form. Only enforces real credential checks
 * for DOCTOR accounts (issues a doctor_token session). Any other phone
 * (unregistered, patient, admin) resolves as matched:false so the existing
 * mock OTP flow continues unaffected for non-doctor users.
 */
export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();
    if (!phone || !password) {
      return NextResponse.json({ error: 'Phone and password are required.' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { phone } });
    if (!user || user.role !== 'DOCTOR') {
      return NextResponse.json({ matched: false });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'ဤ account ကို ပိတ်ထားသည်။' }, { status: 403 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Password မှားနေပါသည်။ ထပ်မံ ကြိုးစားပါ။' }, { status: 401 });
    }

    const doctor = await db.doctor.findUnique({ where: { userId: user.id }, select: { id: true } });
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile ရှာမတွေ့ပါ။' }, { status: 404 });
    }

    const token = await signDoctorToken({
      id: user.id, name: user.name, phone: user.phone, role: user.role, doctorId: doctor.id,
    });

    const res = NextResponse.json({ matched: true, role: 'DOCTOR', name: user.name, phone: user.phone });
    res.cookies.set('doctor_token', token, {
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
