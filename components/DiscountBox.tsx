'use client';

import { useEffect, useState } from 'react';
import { Coins, Ticket } from 'lucide-react';
import PointsRedeemBox from './PointsRedeemBox';
import VoucherRedeemBox from './VoucherRedeemBox';

const PRIMARY = 'var(--color-primary)';

/** Mutually-exclusive Points-vs-Voucher discount picker for checkout — a purchase can use
 * one or the other, never both (server enforces this regardless; this is just the UI
 * reflecting it). Skips the tab chooser entirely when the patient has no points, since
 * PointsRedeemBox itself would render nothing anyway. */
export default function DiscountBox({
  mm, phone, purchaseAmount, sourceType, doctorId, programId, productIds, onChange,
}: {
  mm: boolean;
  phone: string;
  purchaseAmount: number;
  sourceType: 'CONSULTATION' | 'PROGRAM' | 'PRODUCT';
  doctorId?: string;
  programId?: string;
  productIds?: string[];
  onChange: (state: { pointsToRedeem: number; voucherCode: string | null; discountAmount: number }) => void;
}) {
  const [pointsBalance, setPointsBalance] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState<'points' | 'voucher' | null>(null);

  useEffect(() => {
    if (!phone) { setLoaded(true); return; }
    fetch(`/api/patient/points?phone=${encodeURIComponent(phone)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setPointsBalance(d?.balance ?? 0))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [phone]);

  const switchMode = (next: 'points' | 'voucher') => {
    setMode(next);
    onChange({ pointsToRedeem: 0, voucherCode: null, discountAmount: 0 });
  };

  if (!loaded) return null;

  if (pointsBalance <= 0) {
    return (
      <VoucherRedeemBox mm={mm} sourceType={sourceType} doctorId={doctorId} programId={programId} productIds={productIds}
        purchaseAmount={purchaseAmount}
        onChange={state => onChange({ pointsToRedeem: 0, voucherCode: state.voucherCode, discountAmount: state.discountAmount })} />
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex gap-2">
        <button type="button" onClick={() => switchMode('points')}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all"
          style={{ borderColor: mode === 'points' ? PRIMARY : '#e5e7eb', backgroundColor: mode === 'points' ? `${PRIMARY}0d` : '#fff', color: mode === 'points' ? PRIMARY : '#6b7280' }}>
          <Coins className="w-3.5 h-3.5" /> {mm ? 'Points သုံးမည်' : 'Use Points'}
        </button>
        <button type="button" onClick={() => switchMode('voucher')}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all"
          style={{ borderColor: mode === 'voucher' ? PRIMARY : '#e5e7eb', backgroundColor: mode === 'voucher' ? `${PRIMARY}0d` : '#fff', color: mode === 'voucher' ? PRIMARY : '#6b7280' }}>
          <Ticket className="w-3.5 h-3.5" /> {mm ? 'Voucher သုံးမည်' : 'Use Voucher'}
        </button>
      </div>

      {mode === 'points' && (
        <PointsRedeemBox mm={mm} phone={phone} purchaseAmount={purchaseAmount}
          onChange={state => onChange({ pointsToRedeem: state.pointsToRedeem, voucherCode: null, discountAmount: state.discountAmount })} />
      )}
      {mode === 'voucher' && (
        <VoucherRedeemBox mm={mm} sourceType={sourceType} doctorId={doctorId} programId={programId} productIds={productIds}
          purchaseAmount={purchaseAmount}
          onChange={state => onChange({ pointsToRedeem: 0, voucherCode: state.voucherCode, discountAmount: state.discountAmount })} />
      )}
    </div>
  );
}
