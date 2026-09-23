import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { grantRole, RoleAlreadyGrantedError, setRolePassword } from '@/lib/roleAccess';

/* ── POST /api/admin/clinics/[id]/account — create or update the partner login for a clinic ── */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'partners.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const { phone, password, isActive } = await req.json();

    const clinic = await db.clinic.findUnique({ where: { id }, select: { id: true, name: true, ownerId: true } });
    if (!clinic) return NextResponse.json({ error: 'Partner not found' }, { status: 404 });

    if (!phone?.trim()) return NextResponse.json({ error: 'Login phone is required.' }, { status: 400 });

    if (clinic.ownerId) {
      // Existing account — update phone / optionally reset password / toggle active.
      const phoneTaken = await db.user.findFirst({ where: { phone, id: { not: clinic.ownerId } }, select: { id: true } });
      if (phoneTaken) return NextResponse.json({ error: 'ဤဖုန်းနံပါတ်သည် အခြားအကောင့်တွင် အသုံးပြုနေပြီးဖြစ်သည်။' }, { status: 409 });

      const data: Record<string, unknown> = { phone };
      if (typeof isActive === 'boolean') data.isActive = isActive;
      if (password?.trim() && password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
      }

      const user = await db.user.update({ where: { id: clinic.ownerId }, data, select: { id: true, phone: true, isActive: true } });
      // Resets only the Partner password — the same phone's other roles keep theirs.
      if (password?.trim()) await setRolePassword(clinic.ownerId, 'PARTNER', password);
      return NextResponse.json({ owner: user, created: false });
    }

    // No account yet — create one.
    if (!password?.trim() || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }
    // A phone that already belongs to someone (patient, doctor...) gets a separate Partner
    // password instead of being rejected.
    let accountReused = false;
    const { user } = await db.$transaction(async (tx) => {
      const granted = await grantRole(tx, { name: clinic.name, phone, role: 'PARTNER', password });
      accountReused = !granted.created;
      await tx.clinic.update({ where: { id }, data: { ownerId: granted.id } });
      const user = await tx.user.findUniqueOrThrow({ where: { id: granted.id }, select: { id: true, phone: true, isActive: true } });
      return { user };
    });

    return NextResponse.json({ owner: user, created: true, accountReused }, { status: 201 });
  } catch (e) {
    if (e instanceof RoleAlreadyGrantedError) {
      return NextResponse.json({ error: 'ဤဖုန်းနံပါတ်ဖြင့် Partner account ရှိပြီးသား ဖြစ်သည်။' }, { status: 409 });
    }
    console.error('POST /api/admin/clinics/[id]/account', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
