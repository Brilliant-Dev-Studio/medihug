import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signDoctorToken } from '@/lib/jwt';
import { hasRole, verifyRolePassword } from '@/lib/roleAccess';

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
    if (!user || !(await hasRole(user, 'DOCTOR'))) {
      return NextResponse.json({ matched: false });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'ဤ account ကို ပိတ်ထားသည်။', code: 'ACCOUNT_DISABLED' }, { status: 403 });
    }

    // Each role has its own password. A phone that is also a patient may still be signing in
    // as that patient (patient sign-in doesn't check this password), so only a doctor-only
    // phone gets the wrong-password error.
    if (!(await verifyRolePassword(user, 'DOCTOR', password))) {
      if (await hasRole(user, 'PATIENT')) return NextResponse.json({ matched: false, code: 'DOCTOR_PASSWORD_MISMATCH_PATIENT' });
      return NextResponse.json({ error: 'Password မှားနေပါသည်။ ထပ်မံ ကြိုးစားပါ။', code: 'WRONG_PASSWORD' }, { status: 401 });
    }

    const doctor = await db.doctor.findUnique({ where: { userId: user.id }, select: { id: true } });
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor profile ရှာမတွေ့ပါ။' }, { status: 404 });
    }

    const token = await signDoctorToken({
      id: user.id, name: user.name, phone: user.phone, role: 'DOCTOR', doctorId: doctor.id,
    });

    const res = NextResponse.json({ matched: true, role: 'DOCTOR', name: user.name, phone: user.phone });
    res.cookies.set('doctor_token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path:     '/',
      maxAge:   60 * 60 * 24 * 60,
    });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error. ထပ်မံ ကြိုးစားပါ။' }, { status: 500 });
  }
}
