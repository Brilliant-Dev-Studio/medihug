'use client';

import { useEffect, useState } from 'react';
import { Coins, Ticket, QrCode } from 'lucide-react';
import PointsRedeemBox from './PointsRedeemBox';
import VoucherRedeemBox from './VoucherRedeemBox';

const PRIMARY = 'var(--color-primary)';

/** Mutually-exclusive Points / Voucher / Partner-code discount picker for checkout — a
 * purchase can use one of them, never several (server enforces this regardless; this is just
 * the UI reflecting it). Points appears only when the patient has a balance, Partner Code only
 * for doctor bookings; the tab chooser is skipped when just Voucher is left. */
export default function DiscountBox({
  mm, phone, purchaseAmount, sourceType, doctorId, programId, productIds, onChange, initial,
}: {
  mm: boolean;
  phone: string;
  purchaseAmount: number;
  sourceType: 'CONSULTATION' | 'PROGRAM' | 'PRODUCT';
  doctorId?: string;
  programId?: string;
  productIds?: string[];
  onChange: (state: { pointsToRedeem: number; voucherCode: string | null; discountAmount: number; partnerName?: string }) => void;
  /** The discount already applied (the box remounts when the patient steps back a page). */
  initial?: { pointsToRedeem: number; voucherCode: string | null; discountAmount: number; partnerName?: string };
}) {
  const [pointsBalance, setPointsBalance] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState<'points' | 'voucher' | 'partner'>(
    initial && initial.pointsToRedeem > 0 ? 'points'
    : initial?.voucherCode?.toUpperCase().startsWith('MHQ-') ? 'partner'
    : 'voucher',
  );
  const restoredVoucher = initial?.voucherCode && initial.discountAmount > 0
    ? { code: initial.voucherCode, discountAmount: initial.discountAmount, partnerName: initial.partnerName }
    : null;

  useEffect(() => {
    if (!phone) { setLoaded(true); return; }
    fetch(`/api/patient/points?phone=${encodeURIComponent(phone)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setPointsBalance(d?.balance ?? 0))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [phone]);

  const switchMode = (next: 'points' | 'voucher' | 'partner') => {
    setMode(next);
    onChange({ pointsToRedeem: 0, voucherCode: null, discountAmount: 0 });
  };

  if (!loaded) return null;

  const modes = [
    ...(pointsBalance > 0 ? ['points' as const] : []),
    'voucher' as const,
    ...(sourceType === 'CONSULTATION' ? ['partner' as const] : []),
  ];

  if (modes.length === 1) {
    return (
      <VoucherRedeemBox mm={mm} sourceType={sourceType} doctorId={doctorId} programId={programId} productIds={productIds}
        purchaseAmount={purchaseAmount}
        initialApplied={mode === 'voucher' ? restoredVoucher : null}
        onChange={state => onChange({ pointsToRedeem: 0, voucherCode: state.voucherCode, discountAmount: state.discountAmount, partnerName: state.partnerName })} />
    );
  }

  const TAB_META = {
    points:  { Icon: Coins,  mm: 'Points သုံးမည်',      en: 'Use Points' },
    voucher: { Icon: Ticket, mm: 'Voucher သုံးမည်',     en: 'Use Voucher' },
    partner: { Icon: QrCode, mm: 'Partner Code ထည့်မည်', en: 'Partner Code' },
  } as const;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex gap-2">
        {modes.map(m => {
          const { Icon, ...label } = TAB_META[m];
          return (
            <button key={m} type="button" onClick={() => switchMode(m)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-bold border-2 transition-all"
              style={{ borderColor: mode === m ? PRIMARY : '#e5e7eb', backgroundColor: mode === m ? `${PRIMARY}0d` : '#fff', color: mode === m ? PRIMARY : '#6b7280' }}>
              <Icon className="w-4.5 h-4.5 shrink-0" /> {mm ? label.mm : label.en}
            </button>
          );
        })}
      </div>

      {mode === 'points' && (
        <PointsRedeemBox mm={mm} phone={phone} purchaseAmount={purchaseAmount} initialUseAll={!!initial && initial.pointsToRedeem > 0}
          onChange={state => onChange({ pointsToRedeem: state.pointsToRedeem, voucherCode: null, discountAmount: state.discountAmount })} />
      )}
      {(mode === 'voucher' || mode === 'partner') && (
        <VoucherRedeemBox key={mode} mm={mm} variant={mode} sourceType={sourceType} doctorId={doctorId} programId={programId} productIds={productIds}
          purchaseAmount={purchaseAmount}
          initialApplied={restoredVoucher && (restoredVoucher.code.toUpperCase().startsWith('MHQ-') ? mode === 'partner' : mode === 'voucher') ? restoredVoucher : null}
          onChange={state => onChange({ pointsToRedeem: 0, voucherCode: state.voucherCode, discountAmount: state.discountAmount, partnerName: state.partnerName })} />
      )}
    </div>
  );
}
