import { db } from '@/lib/db';
import { resolveCommission, classifyOwnership, getPaymentMethodFee, type RevenueOwnership } from '@/lib/commission';

/** Referral commission Medihug pays a partner clinic for referring a patient into a
 * transaction it doesn't itself own or co-run. Carved out of Medihug's own share only
 * (medihugShareAmount) — never touches the revenue owner's slice, so it applies the same
 * way whether the underlying revenue is pure Medihug or Shared with a different partner. */
const PARTNER_REFERRAL_FEE_PERCENT = 5;

interface RecordRevenueLedgerInput {
  sourceType: 'CONSULTATION' | 'PROGRAM' | 'PRODUCT';
  sourceId: string;
  patientPaid: number;
  /** Owning/shared clinic. Pass null for platform-only (pure Medihug) revenue. */
  clinicId: string | null;
  /** Referring clinic. Referral commission only applies when this differs from clinicId
   * (a genuine third-party referrer) — a partner referring its own co-run revenue earns
   * nothing extra for the referral. */
  referralClinicId?: string | null;
  /** Pre-resolved Medihug share % (0-100). If omitted and clinicId is set, resolved via
   * CommissionRule (serviceType + clinicId). Callers that already know the split (e.g.
   * program ownership, blended product carts) should pass this directly. */
  medihugSharePercent?: number;
  paymentMethod?: string | null;
  /** Doctor payout on this transaction (consultations only) — a real cost, deducted from
   * Net Medihug Revenue but never counted as Medihug's own share. */
  providerShareAmount?: number;
}

/** Records (or re-records, idempotently) one Revenue Ledger row for a completed
 * transaction: Patient Paid → Revenue Ownership → Medihug Share → Partner Referral Fee →
 * Net Medihug Revenue. Called at each source's "realized revenue" completion point
 * (Order/Appointment → COMPLETED, ProgramEnrollment → APPROVED). Never throws — a ledger
 * failure must not block the underlying status update that triggered it. */
export async function recordRevenueLedger(input: RecordRevenueLedgerInput): Promise<void> {
  try {
    let medihugSharePercent: number;
    let medihugFixedFee = 0;
    if (input.medihugSharePercent !== undefined) {
      medihugSharePercent = input.medihugSharePercent;
    } else if (!input.clinicId) {
      medihugSharePercent = 100;
    } else {
      const { percent, fixedFee } = await resolveCommission({
        serviceType: input.sourceType, clinicId: input.clinicId, paymentMethod: input.paymentMethod ?? null,
      });
      medihugSharePercent = percent;
      medihugFixedFee = fixedFee;
    }

    const ownershipType: RevenueOwnership = classifyOwnership(input.clinicId, medihugSharePercent);
    // Rule-based fixed fee (CommissionRule.fixedFee) stacks on top of the percent cut —
    // only ever resolved when the split itself came from a CommissionRule above.
    const medihugShareAmount = Math.round(input.patientPaid * medihugSharePercent / 100) + medihugFixedFee;
    const partnerShareAmount = input.clinicId ? input.patientPaid - medihugShareAmount : 0;

    // Core rule: referral fee is carved out of Medihug's own share, and only when a
    // genuinely distinct clinic referred the patient (not the revenue owner referring
    // itself). For PARTNER-owned revenue this is naturally 0 anyway, since
    // medihugShareAmount is 0 there — no separate ownership gate needed.
    let partnerReferralFeePercent = 0;
    let partnerReferralFeeAmount = 0;
    if (input.referralClinicId && input.referralClinicId !== input.clinicId) {
      partnerReferralFeePercent = PARTNER_REFERRAL_FEE_PERCENT;
      partnerReferralFeeAmount = Math.round(medihugShareAmount * partnerReferralFeePercent / 100);
    }

    const { feePercent: gatewayFeePercent, feeFixed: gatewayFeeFixed } = await getPaymentMethodFee(input.paymentMethod);
    const gatewayFeeAmount = Math.round(input.patientPaid * gatewayFeePercent / 100) + (input.patientPaid > 0 ? gatewayFeeFixed : 0);

    const providerShareAmount = input.providerShareAmount ?? 0;

    const netMedihugRevenue = medihugShareAmount - partnerReferralFeeAmount - providerShareAmount - gatewayFeeAmount;

    const data = {
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      patientPaid: input.patientPaid,
      ownershipType,
      clinicId: input.clinicId,
      medihugSharePercent,
      medihugShareAmount,
      partnerShareAmount,
      referralClinicId: input.referralClinicId ?? null,
      partnerReferralFeePercent,
      partnerReferralFeeAmount,
      gatewayFeePercent,
      gatewayFeeAmount,
      providerShareAmount,
      netMedihugRevenue,
    };

    await db.revenueLedger.upsert({
      where: { sourceType_sourceId: { sourceType: input.sourceType, sourceId: input.sourceId } },
      create: data,
      update: data,
    });
  } catch (err) {
    console.error(`recordRevenueLedger failed (sourceType=${input.sourceType}, sourceId=${input.sourceId}):`, err);
  }
}
