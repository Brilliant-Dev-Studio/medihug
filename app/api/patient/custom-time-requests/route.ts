import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { notify } from '@/lib/notify';

/* ── POST /api/patient/custom-time-requests ──
 * Patient asks for a time outside the doctor's fixed slots. Goes straight
 * to Super Admin for review — no doctor-side involvement.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, doctorId, requestedDate, requestedTime, note } = body;

    if (!name || !phone || !doctorId || !requestedDate || !requestedTime) {
      return NextResponse.json({ error: 'name, phone, doctorId, requestedDate, requestedTime are required.' }, { status: 400 });
    }

    const doctor = await db.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found.' }, { status: 404 });
    }
    if (!doctor.allowsCustomTimeRequests) {
      return NextResponse.json({ error: 'This doctor does not accept custom time requests.' }, { status: 403 });
    }

    let user = await db.user.findUnique({ where: { phone } });
    if (!user) {
      const hashedPassword = await bcrypt.hash(phone, 12);
      user = await db.user.create({
        data: { name, phone, password: hashedPassword, role: 'PATIENT' },
      });
    }

    const request = await db.customTimeRequest.create({
      data: {
        userId:        user.id,
        doctorId,
        requestedDate: new Date(requestedDate),
        requestedTime,
        note:          note ?? null,
      },
    });

    const admins = await db.user.findMany({
      where:  { role: 'SUPER_ADMIN', isActive: true },
      select: { id: true },
    });
    for (const admin of admins) {
      notify({
        userId: admin.id,
        type: 'new-custom-time-request',
        title: user.name,
        body: `requested a custom time with Dr. ${doctor.name}.`,
        actionUrl: '/admin/custom-time-requests',
        actorName: user.name,
        actorAvatar: user.profileImage,
      });
    }

    return NextResponse.json({ request }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
