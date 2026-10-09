import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { hasRole, rolesOf, getRoleHash, setRolePassword } from '@/lib/roleAccess';

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

    const existing = await db.user.findUnique({ where: { phone }, select: { id: true, name: true, phone: true, role: true, password: true } });
    const hashedPassword = await bcrypt.hash(password, 12);

    if (existing) {
      if (await hasRole(existing, 'PATIENT')) {
        // Several guest flows (booking, favorites, orders, program enroll, support, medical
        // requests) silently create a PATIENT account by phone with password = bcrypt(phone)
        // so a guest's activity can be tracked. If that's still the untouched default password,
        // this is someone claiming that shell account for real — set their chosen password
        // instead of blocking them with a confusing "already exists".
        const patientHash = await getRoleHash(existing, 'PATIENT');
        const isUnclaimedGuestShell = patientHash !== null && await bcrypt.compare(existing.phone, patientHash);
        if (isUnclaimedGuestShell) {
          await setRolePassword(existing.id, 'PATIENT', password);
          await db.user.update({ where: { id: existing.id }, data: { name: username } });
          return NextResponse.json({ success: true, user: { name: username, phone: existing.phone } }, { status: 200 });
        }
        return NextResponse.json({ error: 'ဤဖုန်းနံပါတ်ဖြင့် အကောင့်ရှိပြီးသားဖြစ်သည်', code: 'PATIENT_EXISTS' }, { status: 409 });
      }
      // The phone already belongs to a doctor/partner: add a patient login with its own
      // password rather than rejecting it. Their other roles' passwords are untouched.
      await db.roleCredential.create({ data: { userId: existing.id, role: 'PATIENT', password: hashedPassword } });
      return NextResponse.json({
        success: true, roleAdded: true, existingRoles: await rolesOf(existing).then(r => r.filter(x => x !== 'PATIENT')),
        user: { name: existing.name, phone: existing.phone },
      }, { status: 201 });
    }
    const user = await db.user.create({
      data: { name: username, phone, password: hashedPassword, role: 'PATIENT' },
    });

    return NextResponse.json({ success: true, user: { name: user.name, phone: user.phone } }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error. ထပ်မံ ကြိုးစားပါ။' }, { status: 500 });
  }
}
