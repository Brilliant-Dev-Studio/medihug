import { db } from '@/lib/db';
import { resolveCommission, classifyOwnership, type RevenueOwnership } from '@/lib/commission';

/** Referral commission Medihug pays a partner clinic for referring a patient into a
 * Medihug-owned consultation. Only ever applied to MEDIHUG-owned revenue — never to
 * partner-owned or shared/pass-through revenue (the core rule this ledger encodes). */
const CONSULTATION_REFERRAL_FEE_PERCENT = 5;

interface RecordRevenueLedgerInput {
  sourceType: 'CONSULTATION' | 'PROGRAM' | 'PRODUCT';
  sourceId: string;
  patientPaid: number;
  /** Owning/shared clinic. Pass null for platform-only (pure Medihug) revenue. */
  clinicId: string | null;
  /** Referring clinic — only meaningful for CONSULTATION today. */
  referralClinicId?: string | null;
  /** Pre-resolved Medihug share % (0-100). If omitted and clinicId is set, resolved via
   * CommissionRule (serviceType + clinicId). Callers that already know the split (e.g.
   * program ownership, blended product carts) should pass this directly. */
  medihugSharePercent?: number;
  paymentMethod?: string | null;
}

/** Records (or re-records, idempotently) one Revenue Ledger row for a completed
 * transaction: Patient Paid → Revenue Ownership → Medihug Share → Partner Referral Fee →
 * Net Medihug Revenue. Called at each source's "realized revenue" completion point
 * (Order/Appointment → COMPLETED, ProgramEnrollment → APPROVED). Never throws — a ledger
 * failure must not block the underlying status update that triggered it. */
export async function recordRevenueLedger(input: RecordRevenueLedgerInput): Promise<void> {
  try {
    let medihugSharePercent: number;
    if (input.medihugSharePercent !== undefined) {
      medihugSharePercent = input.medihugSharePercent;
    } else if (!input.clinicId) {
      medihugSharePercent = 100;
    } else {
      const { percent } = await resolveCommission({
        serviceType: input.sourceType, clinicId: input.clinicId, paymentMethod: input.paymentMethod ?? null,
      });
      medihugSharePercent = percent;
    }

    const ownershipType: RevenueOwnership = classifyOwnership(input.clinicId, medihugSharePercent);
    const medihugShareAmount = Math.round(input.patientPaid * medihugSharePercent / 100);

    // Core rule: referral fee is only ever computed against Medihug-attributable revenue.
    let partnerReferralFeePercent = 0;
    let partnerReferralFeeAmount = 0;
    if (ownershipType === 'MEDIHUG' && input.referralClinicId) {
      partnerReferralFeePercent = CONSULTATION_REFERRAL_FEE_PERCENT;
      partnerReferralFeeAmount = Math.round(medihugShareAmount * partnerReferralFeePercent / 100);
    }

    const netMedihugRevenue = medihugShareAmount - partnerReferralFeeAmount;

    const data = {
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      patientPaid: input.patientPaid,
      ownershipType,
      clinicId: input.clinicId,
      medihugSharePercent,
      medihugShareAmount,
      referralClinicId: input.referralClinicId ?? null,
      partnerReferralFeePercent,
      partnerReferralFeeAmount,
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
