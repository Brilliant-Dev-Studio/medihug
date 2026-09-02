import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { parseSlotTimes, maxPerSlotFor, dayBounds } from '@/lib/timeSlots';
import { computePatientPrice, computePlatformCut, resolveCommission } from '@/lib/commission';
import { notify } from '@/lib/notify';
import { checkCbPayStatus } from '@/lib/cbpay';
import { redeemPoints } from '@/lib/pointsLedger';
import { redeemVoucher, VoucherRedemptionError } from '@/lib/voucherLedger';

/* ── POST /api/patient/bookings ── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, phone, doctorId, date, time, reason, note,
      paymentMethod, receiptUrl, intake,
      cbPayOrderId, cbPayGenerateRefOrder, pointsToRedeem, voucherCode,
    } = body;

    if (!name || !phone || !doctorId || !date) {
      return NextResponse.json({ error: 'name, phone, doctorId, date are required.' }, { status: 400 });
    }
    if (pointsToRedeem !== undefined && (!Number.isInteger(pointsToRedeem) || pointsToRedeem < 0)) {
      return NextResponse.json({ error: 'pointsToRedeem must be a non-negative integer.' }, { status: 400 });
    }

    // CB Pay bookings are only created once payment already succeeded (patient pays first,
    // fills the medical intake form after) — re-verify with CB Bank server-side rather than
    // trusting the client's claim; this is the real trust boundary, not the client payload.
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

    const doctor = await db.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found.' }, { status: 404 });
    }

    // Fee is always derived server-side from the live doctor price + commission rule — the client
    // never gets to dictate what gets charged. Session count is re-derived from the same slot
    // label already used for capacity validation below, not trusted from the request body.
    const sessionCount = time ? Math.max(1, parseSlotTimes(time).length) : 1;
    const { percent } = await resolveCommission({
      serviceType: 'CONSULTATION',
      doctorId: doctor.id,
      paymentMethod: paymentMethod ?? null,
    });
    const fee = computePatientPrice(doctor.price, percent) * sessionCount;
    const platformFeeAmount = computePlatformCut(doctor.price, percent) * sessionCount;
    const doctorPayoutAmount = doctor.price * sessionCount;

    const appointment = await db.$transaction(async (tx) => {
      if (time) {
        const requestedSlots = parseSlotTimes(time);
        const { start, end } = dayBounds(date);
        const dayOfWeek = start.getDay();

        const [firstH, firstM] = requestedSlots[0].split(':').map(Number);
        const target = new Date(start); target.setHours(firstH, firstM, 0, 0);
        // Grace period: the intake form can take several minutes to fill out between
        // picking a slot and final submit, so don't reject a slot that only just ticked past.
        const GRACE_MS = 5 * 60 * 1000;
        if (target.getTime() < Date.now() - GRACE_MS) throw new Error('PAST_SLOT');

        const [windows, existing] = await Promise.all([
          tx.doctorSlot.findMany({ where: { doctorId, dayOfWeek, isActive: true }, select: { startTime: true, endTime: true, maxPerSlot: true } }),
          tx.appointment.findMany({ where: { doctorId, date: { gte: start, lt: end }, status: { not: 'CANCELLED' } }, select: { time: true } }),
        ]);

        const counts: Record<string, number> = {};
        for (const a of existing) {
          if (!a.time) continue;
          for (const slot of parseSlotTimes(a.time)) counts[slot] = (counts[slot] ?? 0) + 1;
        }

        const isFull = requestedSlots.some(slot => (counts[slot] ?? 0) >= maxPerSlotFor(slot, windows));
        if (isFull) throw new Error('SLOT_TAKEN');
      }

      let user = await tx.user.findUnique({ where: { phone } });
      if (!user) {
        const hashedPassword = await bcrypt.hash(phone, 12);
        user = await tx.user.create({
          data: { name, phone, password: hashedPassword, role: 'PATIENT' },
        });
      }

      const created = await tx.appointment.create({
        data: {
          userId:        user.id,
          doctorId,
          date:          new Date(date),
          time:          time ?? null,
          reason:        reason ?? null,
          note:          note ?? null,
          paymentMethod: paymentMethod ?? null,
          fee,
          platformFeeAmount,
          doctorPayoutAmount,
          receiptUrl:    receiptUrl ?? null,
          intake:        intake ?? undefined,
          ...(cbPayVerified ? {
            cbPayStatus: 'SUCCESS' as const,
            cbPayRefOrder: cbPayGenerateRefOrder,
            cbPayTransactionId: cbPayVerified.transactionId ?? null,
            cbPayAmountConfirmed: cbPayVerified.totalAmount != null ? Math.round(cbPayVerified.totalAmount) : null,
            cbPayPaidAt: new Date(),
            status: 'CONFIRMED' as const,
          } : {}),
        },
      });

      // CB Pay pays *before* the appointment exists (verified above against what was
      // actually charged) — the fee here must stay exactly what was already paid, so points
      // can only discount the fee for the manual-receipt payment methods.
      if (cbPayVerified) return tx.appointment.findUniqueOrThrow({ where: { id: created.id }, include: { doctor: true, user: true } });

      let pointsRedeemed = 0;
      let voucherApplied: string | null = null;
      let discountAmount = 0;
      if (voucherCode) {
        const result = await redeemVoucher(tx, user.id, created.id, {
          code: voucherCode, sourceType: 'CONSULTATION', doctorId, purchaseAmount: fee,
        });
        voucherApplied = result.voucherCode;
        discountAmount = result.discountAmount;
      } else {
        const result = await redeemPoints(
          tx, { userId: user.id, sourceType: 'CONSULTATION', sourceId: created.id, pointsToRedeem: pointsToRedeem ?? 0 }, fee,
        );
        pointsRedeemed = result.pointsRedeemed;
        discountAmount = result.discountAmount;
      }

      return tx.appointment.update({
        where: { id: created.id },
        data: {
          fee: fee - discountAmount,
          pointsRedeemed, pointsDiscountAmount: voucherApplied ? 0 : discountAmount,
          voucherCode: voucherApplied, voucherDiscountAmount: voucherApplied ? discountAmount : 0,
        },
        include: { doctor: true, user: true },
      });
    });

    const admins = await db.user.findMany({
      where:  { role: 'SUPER_ADMIN', isActive: true },
      select: { id: true, name: true },
    });

    for (const admin of admins) {
      notify({
        userId: admin.id,
        type: 'new-appointment-booked',
        title: appointment.user.name,
        body: `booked an appointment with Dr. ${appointment.doctor.name}.`,
        actionUrl: `/admin/appointments/${appointment.id}`,
        actorName: appointment.user.name,
        actorAvatar: appointment.user.profileImage,
      });
    }

    // Appointment.clinicId is never actually populated anywhere in the app, so derive the
    // relevant clinic(s) via ClinicDoctor instead — the real source of truth for which
    // clinic(s) a doctor belongs to (a doctor can belong to more than one).
    const clinics = await db.clinic.findMany({
      where: { ownerId: { not: null }, doctors: { some: { doctorId } } },
      select: { ownerId: true },
    });
    const seenOwners = new Set<string>();
    for (const c of clinics) {
      if (!c.ownerId || seenOwners.has(c.ownerId)) continue;
      seenOwners.add(c.ownerId);
      notify({
        userId: c.ownerId,
        type: 'new-appointment-booked',
        title: appointment.user.name,
        body: `booked an appointment with Dr. ${appointment.doctor.name}.`,
        actionUrl: `/partner/appointments`,
        actorName: appointment.user.name,
        actorAvatar: appointment.user.profileImage,
      });
    }

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (e) {
    if (e instanceof VoucherRedemptionError) {
      return NextResponse.json({ error: 'This voucher cannot be used for this booking.', code: e.reason }, { status: 400 });
    }
    if (e instanceof Error && e.message === 'SLOT_TAKEN') {
      return NextResponse.json({ error: 'This time slot was just booked by someone else. Please choose another.', code: 'SLOT_TAKEN' }, { status: 409 });
    }
    if (e instanceof Error && e.message === 'PAST_SLOT') {
      return NextResponse.json({ error: 'This time slot has already passed. Please choose another.', code: 'PAST_SLOT' }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
