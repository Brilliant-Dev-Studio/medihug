import crypto from 'crypto';

/** Short, typeable-as-fallback verification code for a clinic referral QR. */
export function generateReferralCode(): string {
  return `MHR-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
}
