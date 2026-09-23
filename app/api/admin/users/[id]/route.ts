import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patientWhere } from '@/lib/roleAccess';
import { requireAdmin } from '@/lib/adminAuth';

/* ── GET /api/admin/users/[id] ── */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'dashboard.view');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const user = await db.user.findFirst({
      where: { AND: [{ id }, patientWhere] },
      select: {
        id: true, name: true, phone: true, gender: true, birthday: true,
        state: true, township: true, isActive: true, createdAt: true,
        appointments: {
          orderBy: { date: 'desc' },
          select: {
            id: true, date: true, time: true, reason: true, status: true,
            doctor: { select: { name: true } },
            clinic: { select: { name: true } },
          },
        },
      },
    });
    if (!user) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    return NextResponse.json({ user });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── DELETE /api/admin/users/[id] — hard delete patient account ── */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'dashboard.view');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const user = await db.user.findFirst({ where: { AND: [{ id }, patientWhere] }, select: { id: true, role: true } });
    if (!user) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });

    // The same phone may also be a doctor or partner. Deleting the shared user row would wipe
    // those accounts too, so never do that from the patient list.
    const [otherRoles, doctorProfiles, ownedClinics] = await Promise.all([
      db.roleCredential.count({ where: { userId: id, role: { not: 'PATIENT' } } }),
      db.doctor.count({ where: { userId: id } }),
      db.clinic.count({ where: { ownerId: id } }),
    ]);
    if (otherRoles + doctorProfiles + ownedClinics > 0 || user.role !== 'PATIENT') {
      // Only the patient role is removed; the doctor/partner account keeps working.
      if (user.role !== 'PATIENT') {
        await db.roleCredential.deleteMany({ where: { userId: id, role: 'PATIENT' } });
        return NextResponse.json({ success: true, removedRoleOnly: true });
      }
      return NextResponse.json(
        { error: 'This phone also has a Doctor/Partner account, so the patient account can\'t be deleted from here.' },
        { status: 409 },
      );
    }

    await db.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
