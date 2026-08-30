'use client';

import { useEffect, useState } from 'react';
import { Coins, Check } from 'lucide-react';

const PRIMARY = 'var(--color-primary)';

/** Fetches the patient's live points balance and lets them toggle "use all available points"
 * as a discount on the current purchase. Renders nothing if the patient has no points (or no
 * known phone yet) — no dead UI on a first purchase. The parent gets the computed
 * {pointsToRedeem, discountAmount} via onChange to display a live total and send with the
 * purchase — the server always re-validates and re-clamps regardless of what's shown here. */
export default function PointsRedeemBox({
  mm, phone, purchaseAmount, onChange,
}: {
  mm: boolean;
  phone: string;
  purchaseAmount: number;
  onChange: (state: { pointsToRedeem: number; discountAmount: number }) => void;
}) {
  const [balance, setBalance] = useState(0);
  const [kyatPerPointRedeem, setKyatPerPointRedeem] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [useAll, setUseAll] = useState(false);

  useEffect(() => {
    if (!phone) { setLoaded(true); return; }
    fetch(`/api/patient/points?phone=${encodeURIComponent(phone)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        setBalance(d?.balance ?? 0);
        setKyatPerPointRedeem(d?.kyatPerPointRedeem ?? 0);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [phone]);

  useEffect(() => {
    if (!useAll || balance <= 0 || kyatPerPointRedeem <= 0) { onChange({ pointsToRedeem: 0, discountAmount: 0 }); return; }
    const maxPointsForPurchase = Math.floor(purchaseAmount / kyatPerPointRedeem);
    const pointsToRedeem = Math.min(balance, maxPointsForPurchase);
    onChange({ pointsToRedeem, discountAmount: pointsToRedeem * kyatPerPointRedeem });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useAll, balance, kyatPerPointRedeem, purchaseAmount]);

  if (!loaded || balance <= 0) return null;

  const maxPointsForPurchase = Math.floor(purchaseAmount / (kyatPerPointRedeem || 1));
  const pointsApplied = useAll ? Math.min(balance, maxPointsForPurchase) : 0;
  const discountApplied = pointsApplied * kyatPerPointRedeem;

  return (
    <div className="px-4 py-3.5 rounded-xl flex items-center gap-3" style={{ backgroundColor: '#fffbeb', border: '1px dashed #fbbf24' }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#fef3c7' }}>
        <Coins className="w-4.5 h-4.5" style={{ color: '#d97706' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-amber-700">
          {mm ? `${balance.toLocaleString()} Points ရှိပါသည်` : `You have ${balance.toLocaleString()} points`}
        </p>
        <p className="text-[11px] text-amber-600 mt-0.5">
          {useAll && pointsApplied > 0
            ? (mm ? `${pointsApplied.toLocaleString()} Point သုံး၍ ${discountApplied.toLocaleString()} Ks လျှော့ရမည်` : `Using ${pointsApplied.toLocaleString()} points — ${discountApplied.toLocaleString()} Ks off`)
            : (mm ? `≈ ${(balance * kyatPerPointRedeem).toLocaleString()} Ks တန်ဖိုးရှိသည်` : `≈ ${(balance * kyatPerPointRedeem).toLocaleString()} Ks value`)}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setUseAll(v => !v)}
        className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors"
        style={{ backgroundColor: useAll ? PRIMARY : '#fff', color: useAll ? '#fff' : '#d97706', border: useAll ? 'none' : '1px solid #fbbf24' }}
      >
        {useAll && <Check className="w-3.5 h-3.5" />}
        {mm ? 'Points သုံးမည်' : 'Use points'}
      </button>
    </div>
  );
}
