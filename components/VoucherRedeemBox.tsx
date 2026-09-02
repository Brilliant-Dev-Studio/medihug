'use client';

import { useState } from 'react';
import { Ticket, Check, X, Loader2 } from 'lucide-react';

const PRIMARY = 'var(--color-primary)';

const REASON_LABEL: Record<string, { mm: string; en: string }> = {
  NOT_FOUND:            { mm: 'ဤ code ကို ရှာမတွေ့ပါ', en: 'Voucher code not found' },
  INACTIVE:             { mm: 'ဤ voucher ကို ရပ်ဆိုင်းထားပါသည်', en: 'This voucher is no longer active' },
  EXPIRED:              { mm: 'ဤ voucher သက်တမ်းကုန်သွားပါပြီ', en: 'This voucher has expired' },
  MAX_USES_REACHED:     { mm: 'ဤ voucher အသုံးပြုခွင့် ကုန်သွားပါပြီ', en: 'This voucher has reached its usage limit' },
  SCOPE_MISMATCH:       { mm: 'ဤဝယ်ယူမှုအတွက် ဤ voucher သုံး၍မရပါ', en: 'This voucher cannot be used for this purchase' },
  MIN_PURCHASE_NOT_MET: { mm: 'ဝယ်ယူမှုပမာဏ လုံလောက်မှုမရှိပါ', en: 'Purchase amount is too low for this voucher' },
};

/** Coupon-code input for checkout — the counterpart to PointsRedeemBox for a discount
 * mechanism that isn't tied to a patient balance. Validates against
 * /api/patient/vouchers/validate (read-only preview); the server always re-validates and
 * re-clamps at actual submission time regardless of what's shown here. */
export default function VoucherRedeemBox({
  mm, sourceType, doctorId, programId, productIds, purchaseAmount, onChange,
}: {
  mm: boolean;
  sourceType: 'CONSULTATION' | 'PROGRAM' | 'PRODUCT';
  doctorId?: string;
  programId?: string;
  productIds?: string[];
  purchaseAmount: number;
  onChange: (state: { voucherCode: string | null; discountAmount: number }) => void;
}) {
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [applied, setApplied] = useState<{ code: string; discountAmount: number } | null>(null);
  const [error, setError] = useState('');

  const apply = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setChecking(true);
    setError('');
    try {
      const params = new URLSearchParams({ code: trimmed, sourceType, purchaseAmount: String(purchaseAmount) });
      if (doctorId) params.set('doctorId', doctorId);
      if (programId) params.set('programId', programId);
      if (productIds && productIds.length > 0) params.set('productIds', productIds.join(','));
      const res = await fetch(`/api/patient/vouchers/validate?${params}`);
      const data = await res.json();
      if (!data.ok) {
        setError((REASON_LABEL[data.reason] ?? { mm: 'Voucher code မှား/မရပါ', en: 'Invalid voucher code' })[mm ? 'mm' : 'en']);
        return;
      }
      setApplied({ code: trimmed.toUpperCase(), discountAmount: data.discountAmount });
      onChange({ voucherCode: trimmed.toUpperCase(), discountAmount: data.discountAmount });
    } catch {
      setError(mm ? 'စစ်ဆေး၍မရပါ၊ ပြန်စမ်းကြည့်ပါ' : 'Could not check this code — try again');
    } finally {
      setChecking(false);
    }
  };

  const remove = () => {
    setApplied(null);
    setCode('');
    setError('');
    onChange({ voucherCode: null, discountAmount: 0 });
  };

  if (applied) {
    return (
      <div className="px-4 py-3.5 rounded-xl flex items-center gap-3" style={{ backgroundColor: '#f0fdf4', border: '1px dashed #4ade80' }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#dcfce7' }}>
          <Ticket className="w-4.5 h-4.5" style={{ color: '#16a34a' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-green-700">{applied.code}</p>
          <p className="text-[11px] text-green-600 mt-0.5">
            {mm ? `${applied.discountAmount.toLocaleString()} Ks လျှော့ပေးပါသည်` : `${applied.discountAmount.toLocaleString()} Ks off applied`}
          </p>
        </div>
        <button type="button" onClick={remove} className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-green-500 hover:bg-green-100">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50">
          <Ticket className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); apply(); } }}
            placeholder={mm ? 'Voucher code ရှိလား?' : 'Have a voucher code?'}
            className="flex-1 min-w-0 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400 uppercase"
          />
        </div>
        <button type="button" onClick={apply} disabled={checking || !code.trim()}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-50"
          style={{ backgroundColor: PRIMARY }}>
          {checking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          {mm ? 'သုံးမည်' : 'Apply'}
        </button>
      </div>
      {error && <p className="text-[11px] text-red-500 font-semibold px-1">{error}</p>}
    </div>
  );
}
