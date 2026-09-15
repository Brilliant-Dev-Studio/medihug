/** The two permanent, platform-wide discount codes Super Admin can Activate/Deactivate,
 * set a Valid-until date for, and edit the discount percent of — distinct from
 * partner-issued vouchers created via the generic app/admin/vouchers form. These
 * defaults only seed the row on first creation (see the GET route's upsert); the
 * live discountValue lives in the DB from then on. Code stays fixed by design. */
export const SYSTEM_VOUCHERS = [
  {
    code: 'MEDIHUG10',
    mmLabel: 'ဆရာဝန်ချိန်းဆိုမှု လျှော့စျေး',
    enLabel: 'Doctor Appointment Discount',
    serviceType: 'CONSULTATION' as const,
    discountType: 'PERCENT' as const,
    discountValue: 10,
  },
  {
    code: 'MEDIHUG5',
    mmLabel: 'Program ဝယ်ယူမှု လျှော့စျေး',
    enLabel: 'Program Purchase Discount',
    serviceType: 'PROGRAM' as const,
    discountType: 'PERCENT' as const,
    discountValue: 5,
  },
] as const;

export const SYSTEM_VOUCHER_CODES = SYSTEM_VOUCHERS.map(v => v.code);
