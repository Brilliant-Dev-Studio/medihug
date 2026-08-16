/** Canonical payment-method ids — the single source of truth shared by the patient booking
 * form, the admin Payment Methods config, and Commission Rules. Keeping one list here means
 * a rule's `paymentMethod` value always matches what a patient actually selects at booking. */
export const PAYMENT_METHOD_KEYS = [
  { id: 'kpay',    label: 'KPay' },
  { id: 'wavepay', label: 'Wave Pay' },
  { id: 'aya',     label: 'AYA Pay' },
  { id: 'cb',      label: 'CB Pay' },
] as const;
