import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { notifyClinicOwner } from '@/lib/notify';

/* ── POST /api/medical-requests — a patient asking about treatment at a specific
 * international Hospital (Clinic.isInternational). Public, no login required — same
 * name+phone convention as doctor booking; identifies/creates the patient by phone. ── */
export async function POST(req: NextRequest) {
  try {
    const { hospitalClinicId, name, phone, email, specialty, reason } = await req.json();

    if (!hospitalClinicId || !name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: 'name, phone, hospitalClinicId are required.' }, { status: 400 });
    }

    const hospital = await db.clinic.findUnique({
      where: { id: hospitalClinicId },
      select: { id: true, isActive: true, isInternational: true, parentClinicId: true },
    });
    if (!hospital || !hospital.isActive || !hospital.isInternational) {
      return NextResponse.json({ error: 'This hospital is not accepting requests.' }, { status: 404 });
    }
    // A sub-clinic hospital's pipeline lives under its parent partner; a partner's own
    // clinic (when it is itself the Hospital) owns its pipeline directly.
    const ownerClinicId = hospital.parentClinicId ?? hospital.id;

    let user = await db.user.findUnique({ where: { phone: phone.trim() } });
    if (!user) {
      const hashedPassword = await bcrypt.hash(phone.trim(), 12);
      user = await db.user.create({
        data: { name: name.trim(), phone: phone.trim(), password: hashedPassword, role: 'PATIENT' },
      });
    }

    const request = await db.medicalRequest.create({
      data: {
        ownerClinicId,
        hospitalClinicId,
        patientUserId: user.id,
        patientName: name.trim(),
        patientPhone: phone.trim(),
        patientEmail: email?.trim() || null,
        specialty: specialty?.trim() || null,
        reason: reason?.trim() || null,
      },
    });

    await notifyClinicOwner(ownerClinicId, {
      type: 'new-medical-request',
      title: name.trim(),
      body: 'sent a new medical request.',
      actionUrl: `/partner/international-partner/requests/${request.id}`,
      actorName: name.trim(),
    });

    return NextResponse.json({ request }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
