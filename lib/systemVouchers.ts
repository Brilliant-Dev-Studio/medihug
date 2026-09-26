/** The permanent, platform-wide discount codes (online doctor appointments only) Super Admin can Activate/Deactivate,
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
    code: 'MEDIHUGDISUSER',
    mmLabel: 'ဆရာဝန်ချိန်းဆိုမှု (User) လျှော့စျေး',
    enLabel: 'Doctor Appointment User Discount',
    serviceType: 'CONSULTATION' as const,
    discountType: 'PERCENT' as const,
    discountValue: 5,
  },
] as const;

/** MEDIHUG5 used to be the program-purchase coupon. Coupons now only apply to doctor appointments,
 * so it is no longer offered — its row is left untouched in the database (nothing is deleted) and
 * kept out of the generic voucher list so it doesn't show up as a stray "custom" voucher. */
export const RETIRED_SYSTEM_VOUCHER_CODES = ['MEDIHUG5'];

export const SYSTEM_VOUCHER_CODES = [...SYSTEM_VOUCHERS.map(v => v.code), ...RETIRED_SYSTEM_VOUCHER_CODES];
