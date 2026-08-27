'use client';

import { Landmark } from 'lucide-react';

const PRIMARY = 'var(--color-primary)';

/** Generic bank icon badge for the "Bank Transfer" tile in the payment-method selector,
 * standing in for a real logo image (which mmqr/cb use via next/image). */
export default function PaymentMethodTileIcon() {
  return (
    <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}>
      <Landmark className="w-4 h-4" style={{ color: PRIMARY }} />
    </div>
  );
}
