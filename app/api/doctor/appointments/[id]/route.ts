import { NextRequest, NextResponse } from 'next/server';
import { verifyDoctorToken } from '@/lib/jwt';
import { db } from '@/lib/db';
import { generateReferralCode } from '@/lib/referral';
import { notify } from '@/lib/notify';
import { recordRevenueLedger } from '@/lib/revenueLedger';
import { awardPoints } from '@/lib/pointsLedger';

async function requireDoctorId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('doctor_token')?.value;
  if (!token) return null;
  const payload = await verifyDoctorToken(token);
  return payload?.doctorId ?? null;
}

/* ── GET /api/doctor/appointments/[id] — own appointments only ── */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const doctorId = await requireDoctorId(req);
  if (!doctorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const appointment = await db.appointment.findUnique({
    where: { id },
    include: {
      user:   { select: { name: true, phone: true, profileImage: true } },
      doctor: { select: { name: true, nameEn: true, specialty: true, specialtyEn: true, imageUrl: true } },
      referredDoctor: { select: { id: true, name: true, nameEn: true, specialty: true, specialtyEn: true, imageUrl: true } },
      referredClinic: { select: { id: true, name: true, nameEn: true, type: true, imageUrl: true } },
      clinicReferral: { select: { code: true, verifiedAt: true } },
    },
  });
  // Doctors only ever see appointments the admin has already approved.
  if (!appointment || appointment.doctorId !== doctorId || !['CONFIRMED', 'COMPLETED'].includes(appointment.status)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ appointment });
}

/* ── PATCH /api/doctor/appointments/[id] — status and/or doctorApproved, own appointments only ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const doctorId = await requireDoctorId(req);
  if (!doctorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { status, doctorApproved, callRinging, callDeclined, doctorNote, referredDoctorId, referredClinicId, notifyNote } = await req.json();

  const existing = await db.appointment.findUnique({
    where: { id },
    select: { doctorId: true, status: true, userId: true, referredDoctorId: true, referredClinicId: true, fee: true, paymentMethod: true, doctorPayoutAmount: true, doctor: { select: { name: true, nameEn: true, imageUrl: true } } },
  });
  if (!existing || existing.doctorId !== doctorId || !['CONFIRMED', 'COMPLETED'].includes(existing.status)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const data: {
    status?: 'CONFIRMED' | 'COMPLETED'; doctorApproved?: boolean; callRinging?: boolean; callDeclined?: boolean;
    doctorNote?: string | null; referredDoctorId?: string | null; referredClinicId?: string | null;
  } = {};

  if (status !== undefined) {
    // Doctors can only mark an admin-approved appointment as completed (or back to confirmed) —
    // approving/cancelling stays an admin-only action.
    if (!['CONFIRMED', 'COMPLETED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    data.status = status;
  }
  if (doctorApproved !== undefined) {
    if (typeof doctorApproved !== 'boolean') {
      return NextResponse.json({ error: 'Invalid doctorApproved' }, { status: 400 });
    }
    data.doctorApproved = doctorApproved;
  }
  if (callRinging !== undefined) {
    if (typeof callRinging !== 'boolean') {
      return NextResponse.json({ error: 'Invalid callRinging' }, { status: 400 });
    }
    data.callRinging = callRinging;
  }
  if (callDeclined !== undefined) {
    if (callDeclined !== false) {
      return NextResponse.json({ error: 'Invalid callDeclined' }, { status: 400 });
    }
    data.callDeclined = false;
  }
  if (doctorNote !== undefined) {
    if (doctorNote !== null && typeof doctorNote !== 'string') {
      return NextResponse.json({ error: 'Invalid doctorNote' }, { status: 400 });
    }
    data.doctorNote = doctorNote;
  }
  let referredDoctorName: string | null = null;
  let referredClinicName: string | null = null;
  if (referredDoctorId !== undefined) {
    if (referredDoctorId !== null) {
      if (referredDoctorId === doctorId) {
        return NextResponse.json({ error: 'Cannot refer to yourself' }, { status: 400 });
      }
      const target = await db.doctor.findUnique({ where: { id: referredDoctorId }, select: { id: true, name: true, nameEn: true } });
      if (!target) return NextResponse.json({ error: 'Referred doctor not found' }, { status: 400 });
      referredDoctorName = target.nameEn ?? target.name;
    }
    data.referredDoctorId = referredDoctorId;
  }
  if (referredClinicId !== undefined) {
    if (referredClinicId !== null) {
      const target = await db.clinic.findUnique({ where: { id: referredClinicId }, select: { id: true, name: true, nameEn: true } });
      if (!target) return NextResponse.json({ error: 'Referred clinic not found' }, { status: 400 });
      referredClinicName = target.nameEn ?? target.name;
    }
    data.referredClinicId = referredClinicId;
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const appointment = await db.appointment.update({ where: { id }, data });

  if (data.status === 'COMPLETED' && existing.status !== 'COMPLETED' && existing.fee != null) {
    recordRevenueLedger({
      sourceType: 'CONSULTATION', sourceId: id, patientPaid: existing.fee,
      clinicId: null, referralClinicId: appointment.referredClinicId, paymentMethod: existing.paymentMethod,
      providerShareAmount: existing.doctorPayoutAmount ?? 0,
    });
    awardPoints({ userId: existing.userId, sourceType: 'CONSULTATION', sourceId: id, netAmountKs: existing.fee });
  }

  // Keep the referral QR/verification code in sync with the referred clinic — a new/changed
  // clinic gets a fresh code (invalidating any previously issued QR), an unchanged clinic
  // keeps its existing code and verification status, and clearing the referral removes it.
  let referralCode: string | null = null;
  if (referredClinicId !== undefined) {
    if (referredClinicId === null) {
      await db.clinicReferral.deleteMany({ where: { appointmentId: id } });
    } else {
      const existingReferral = await db.clinicReferral.findUnique({ where: { appointmentId: id } });
      if (!existingReferral) {
        const referral = await db.clinicReferral.create({
          data: { appointmentId: id, clinicId: referredClinicId, userId: existing.userId, doctorId, code: generateReferralCode() },
        });
        referralCode = referral.code;
      } else if (existingReferral.clinicId !== referredClinicId) {
        const referral = await db.clinicReferral.update({
          where: { appointmentId: id },
          data: { clinicId: referredClinicId, code: generateReferralCode(), verifiedAt: null, verifiedBy: null },
        });
        referralCode = referral.code;
      } else {
        referralCode = existingReferral.code;
      }
    }
  }

  // Notify the patient the moment a referral is newly set (or changed) — not on every note-only
  // save — so they don't have to stumble back into the appointment to discover it themselves.
  const newDoctorReferral = referredDoctorId !== undefined && referredDoctorId && referredDoctorId !== existing.referredDoctorId;
  const newClinicReferral = referredClinicId !== undefined && referredClinicId && referredClinicId !== existing.referredClinicId;
  if (newDoctorReferral || newClinicReferral) {
    const [patient, referringDoctor] = await Promise.all([
      db.user.findUnique({ where: { id: existing.userId }, select: { id: true, name: true } }),
      db.doctor.findUnique({ where: { id: doctorId }, select: { userId: true, name: true, nameEn: true, imageUrl: true } }),
    ]);
    if (patient) {
      const doctorDisplayName = referringDoctor ? (referringDoctor.nameEn ?? referringDoctor.name) : 'your doctor';
      const target = newClinicReferral ? referredClinicName : referredDoctorName;
      notify({
        userId: patient.id,
        type: 'appointment-referral',
        title: `Dr. ${doctorDisplayName}`,
        body: `referred you to ${target}.`,
        actionUrl: `/patient/appointments/${id}/form`,
        actorName: doctorDisplayName,
        actorAvatar: referringDoctor?.imageUrl,
      });
    }
  }

  // "Send & Share": doctor explicitly shared the clinical note (as opposed to a background
  // save) — reach both the patient and every admin, mirroring the prescription send flow.
  if (notifyNote === true && data.doctorNote) {
    const doctorDisplayName = existing.doctor.nameEn ?? existing.doctor.name;
    notify({
      userId: existing.userId,
      type: 'appointment-note-shared',
      title: `Dr. ${doctorDisplayName}`,
      body: 'shared a clinical note with you.',
      actionUrl: `/patient/appointments/${id}/form`,
      actorName: doctorDisplayName,
      actorAvatar: existing.doctor.imageUrl,
    });
    const admins = await db.user.findMany({
      where:  { role: 'SUPER_ADMIN', isActive: true },
      select: { id: true },
    });
    for (const admin of admins) {
      notify({
        userId: admin.id,
        type: 'appointment-note-shared',
        title: `Dr. ${doctorDisplayName}`,
        body: 'shared a clinical note.',
        actionUrl: `/admin/appointments/${id}`,
        actorName: doctorDisplayName,
        actorAvatar: existing.doctor.imageUrl,
      });
    }
  }

  return NextResponse.json({ appointment, referralCode });
}
