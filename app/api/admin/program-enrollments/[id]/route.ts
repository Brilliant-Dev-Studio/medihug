import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notify } from '@/lib/notify';
import { recordRevenueLedger } from '@/lib/revenueLedger';

const INCLUDE = {
  user: { select: { id: true, name: true, phone: true, profileImage: true } },
  program: {
    select: {
      id: true, titleMm: true, titleEn: true, imageUrl: true, price: true, clinicId: true,
      doctors: { select: { doctor: { select: { id: true, userId: true, name: true, nameEn: true, specialty: true, imageUrl: true } } } },
    },
  },
};

/* ── GET /api/admin/program-enrollments/[id] ── */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const enrollment = await db.programEnrollment.findUnique({ where: { id }, include: INCLUDE });
    if (!enrollment) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ enrollment });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── PATCH /api/admin/program-enrollments/[id] — approve or reject the medical record.
 * Approving fans out a notification to every doctor attached to the program. ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status, reviewNote } = await req.json();
    if (status !== 'APPROVED' && status !== 'REJECTED') {
      return NextResponse.json({ error: 'status must be APPROVED or REJECTED.' }, { status: 400 });
    }

    const before = await db.programEnrollment.findUnique({ where: { id }, select: { status: true } });
    if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const enrollment = await db.programEnrollment.update({
      where: { id },
      data: { status, reviewNote: reviewNote ?? null, reviewedAt: new Date() },
      include: INCLUDE,
    });

    if (status === 'APPROVED' && before.status !== 'APPROVED') {
      // Platform program → fully Medihug's. Partner program with Medihug doctors attached →
      // shared/co-run (matches the POS ownership breakdown's existing 50/50 convention).
      // Partner program with no Medihug doctors → the partner's own, Medihug takes nothing.
      const clinicId = enrollment.program.clinicId;
      const medihugSharePercent = !clinicId ? 100 : enrollment.program.doctors.length > 0 ? 50 : 0;
      recordRevenueLedger({
        sourceType: 'PROGRAM', sourceId: id, patientPaid: enrollment.amount,
        clinicId, medihugSharePercent,
      });

      for (const { doctor } of enrollment.program.doctors) {
        if (!doctor.userId) continue;
        notify({
          userId: doctor.userId,
          type: 'program-enrollment-approved-doctor',
          title: enrollment.user.name,
          body: `has an approved medical record for "${enrollment.program.titleMm}" — ready for your review.`,
          actionUrl: `/doctor/programs/${enrollment.id}`,
          actorName: enrollment.user.name,
          actorAvatar: enrollment.user.profileImage,
        });
      }
      notify({
        userId: enrollment.userId,
        type: 'program-enrollment-approved',
        title: enrollment.program.titleMm,
        body: 'Your medical record has been approved. Your program doctors have been notified.',
        actionUrl: `/patient/programs/${enrollment.programId}`,
      });
    } else if (status === 'REJECTED' && before.status !== 'REJECTED') {
      notify({
        userId: enrollment.userId,
        type: 'program-enrollment-rejected',
        title: enrollment.program.titleMm,
        body: reviewNote || 'Your medical record needs corrections. Please review and resubmit.',
        actionUrl: `/patient/programs/${enrollment.programId}`,
      });
    }

    return NextResponse.json({ enrollment });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
