/** Medi Record — derives a partner-facing step timeline from fields that already exist on
 * Appointment/Order (no schema change). Only createdAt, cbPayPaidAt, and cancelledAt are
 * trustworthy timestamps today — there's no dedicated "doctor approved at"/"completed at"
 * column, and updatedAt can't stand in for one (unrelated writes, e.g. chat unread flips,
 * bump it too — see app/api/doctor/appointments/[id]/messages/route.ts). So steps without a
 * real timestamp field report `at: null` rather than a fabricated time. */

export type StepState = 'done' | 'cancelled' | 'upcoming';

export interface Step {
  key: string;
  labelMm: string;
  labelEn: string;
  state: StepState;
  at: string | null;
}

interface PaymentTrackedRecord {
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  cbPayStatus: 'NONE' | 'INITIATED' | 'SUCCESS' | 'FAILED';
  cbPayPaidAt: Date | string | null;
  createdAt: Date | string;
  cancelledAt: Date | string | null;
}

function iso(d: Date | string | null): string | null {
  if (!d) return null;
  return typeof d === 'string' ? d : d.toISOString();
}

/** Shared "Placed → Payment Confirmed → …" prefix for both Appointment and Order:
 * cb-paid records get a real cbPayPaidAt timestamp; other payment methods (manual receipt)
 * only ever reach a boolean "left PENDING" signal, no timestamp. */
function paymentConfirmedStep(r: PaymentTrackedRecord): Step {
  const isCb = r.cbPayStatus !== 'NONE';
  const done = isCb ? r.cbPayStatus === 'SUCCESS' : r.status !== 'PENDING';
  return {
    key: 'paymentConfirmed',
    labelMm: 'ငွေပေးချေမှု အတည်ပြုပြီး',
    labelEn: 'Payment confirmed',
    state: done ? 'done' : 'upcoming',
    at: done && isCb ? iso(r.cbPayPaidAt) : null,
  };
}

function cancelledStep(cancelledAt: Date | string | null): Step {
  return { key: 'cancelled', labelMm: 'ပယ်ဖျက်လိုက်သည်', labelEn: 'Cancelled', state: 'cancelled', at: iso(cancelledAt) };
}

export interface AppointmentStepInput extends PaymentTrackedRecord {
  doctorApproved: boolean;
}

export function deriveAppointmentSteps(a: AppointmentStepInput): Step[] {
  const booked: Step = { key: 'booked', labelMm: 'ဘွတ်ကင်လုပ်ပြီး', labelEn: 'Booked', state: 'done', at: iso(a.createdAt) };
  const payment = paymentConfirmedStep(a);
  const doctorConfirmed: Step = {
    key: 'doctorConfirmed', labelMm: 'ဆရာဝန် အတည်ပြုပြီး', labelEn: 'Doctor confirmed',
    state: a.doctorApproved ? 'done' : 'upcoming', at: null,
  };
  const completed: Step = {
    key: 'completed', labelMm: 'ဆေးဝါးအကြံပေးမှု ပြီးဆုံး', labelEn: 'Consultation completed',
    state: a.status === 'COMPLETED' ? 'done' : 'upcoming', at: null,
  };

  if (a.status === 'CANCELLED') return [booked, payment, cancelledStep(a.cancelledAt)];
  return [booked, payment, doctorConfirmed, completed];
}

export function deriveOrderSteps(o: PaymentTrackedRecord): Step[] {
  const placed: Step = { key: 'placed', labelMm: 'အော်ဒါ တင်ပြီး', labelEn: 'Order placed', state: 'done', at: iso(o.createdAt) };
  const payment = paymentConfirmedStep(o);
  const completed: Step = {
    key: 'completed', labelMm: 'ပြီးဆုံး', labelEn: 'Completed',
    state: o.status === 'COMPLETED' ? 'done' : 'upcoming', at: null,
  };

  if (o.status === 'CANCELLED') return [placed, payment, cancelledStep(o.cancelledAt)];
  return [placed, payment, completed];
}
