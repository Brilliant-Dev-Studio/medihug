import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { notify } from '@/lib/notify';
import { checkCbPayStatus } from '@/lib/cbpay';

/* ── POST /api/patient/programs/[id]/enroll ──
 * Patient purchases a Program: pays first (CB Pay verified server-side here, like bookings;
 * MMQR verified manually by admin via receiptUrl), then fills the medical intake form. Creates
 * a PENDING_REVIEW ProgramEnrollment — doctors are only notified once Super Admin approves it.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: programId } = await params;
    const body = await req.json();
    const {
      name, phone, paymentMethod, receiptUrl, intake,
      cbPayOrderId, cbPayGenerateRefOrder,
    } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'name, phone are required.' }, { status: 400 });
    }

    const program = await db.healthcareProgram.findUnique({ where: { id: programId, isActive: true } });
    if (!program) return NextResponse.json({ error: 'Program not found.' }, { status: 404 });

    let cbPayVerified: { transactionId?: string; totalAmount?: number } | null = null;
    if (paymentMethod === 'cb') {
      if (!cbPayOrderId || !cbPayGenerateRefOrder) {
        return NextResponse.json({ error: 'CB Pay payment has not been completed.', code: 'CBPAY_NOT_CONFIRMED' }, { status: 402 });
      }
      const check = await checkCbPayStatus({ orderId: cbPayOrderId, generateRefOrder: cbPayGenerateRefOrder });
      if ('error' in check || check.transactionStatus !== 'S') {
        return NextResponse.json({ error: 'CB Pay payment could not be confirmed.', code: 'CBPAY_NOT_CONFIRMED' }, { status: 402 });
      }
      cbPayVerified = { transactionId: check.transactionId, totalAmount: check.totalAmount };
    }

    const enrollment = await db.$transaction(async tx => {
      let user = await tx.user.findUnique({ where: { phone } });
      if (!user) {
        const hashedPassword = await bcrypt.hash(phone, 12);
        user = await tx.user.create({ data: { name, phone, password: hashedPassword, role: 'PATIENT' } });
      }

      return tx.programEnrollment.create({
        data: {
          programId,
          userId: user.id,
          paymentMethod: paymentMethod ?? null,
          receiptUrl: receiptUrl ?? null,
          amount: program.price,
          intake: intake ?? undefined,
          ...(cbPayVerified ? {
            cbPayStatus: 'SUCCESS' as const,
            cbPayRefOrder: cbPayGenerateRefOrder,
            cbPayTransactionId: cbPayVerified.transactionId ?? null,
            cbPayAmountConfirmed: cbPayVerified.totalAmount != null ? Math.round(cbPayVerified.totalAmount) : null,
            cbPayPaidAt: new Date(),
          } : {}),
        },
        include: { user: true },
      });
    });

    const admins = await db.user.findMany({
      where: { role: 'SUPER_ADMIN', isActive: true },
      select: { id: true },
    });
    for (const admin of admins) {
      notify({
        userId: admin.id,
        type: 'new-program-enrollment',
        title: enrollment.user.name,
        body: `enrolled in "${program.titleMm}" and needs medical record review.`,
        actionUrl: `/admin/program-enrollments/${enrollment.id}`,
        actorName: enrollment.user.name,
        actorAvatar: enrollment.user.profileImage,
      });
    }

    if (program.clinicId) {
      const clinic = await db.clinic.findUnique({ where: { id: program.clinicId }, select: { ownerId: true } });
      if (clinic?.ownerId) {
        notify({
          userId: clinic.ownerId,
          type: 'new-program-enrollment',
          title: enrollment.user.name,
          body: `enrolled in "${program.titleMm}" — pending Super Admin review.`,
          actionUrl: `/partner/programs`,
          actorName: enrollment.user.name,
          actorAvatar: enrollment.user.profileImage,
        });
      }
    }

    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
