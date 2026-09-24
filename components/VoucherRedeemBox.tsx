'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Ticket, Check, X, Loader2, ScanLine, QrCode } from 'lucide-react';

const Scanner = dynamic(() => import('@yudiel/react-qr-scanner').then(m => m.Scanner), { ssr: false });

const PRIMARY = 'var(--color-primary)';

const REASON_LABEL: Record<string, { mm: string; en: string }> = {
  NOT_FOUND:            { mm: 'ဤ code ကို ရှာမတွေ့ပါ', en: 'Voucher code not found' },
  INACTIVE:             { mm: 'ဤ voucher ကို ရပ်ဆိုင်းထားပါသည်', en: 'This voucher is no longer active' },
  EXPIRED:              { mm: 'ဤ voucher သက်တမ်းကုန်သွားပါပြီ', en: 'This voucher has expired' },
  MAX_USES_REACHED:     { mm: 'ဤ voucher အသုံးပြုခွင့် ကုန်သွားပါပြီ', en: 'This voucher has reached its usage limit' },
  SCOPE_MISMATCH:       { mm: 'ဤဝယ်ယူမှုအတွက် ဤ voucher သုံး၍မရပါ', en: 'This voucher cannot be used for this purchase' },
  MIN_PURCHASE_NOT_MET: { mm: 'ဝယ်ယူမှုပမာဏ လုံလောက်မှုမရှိပါ', en: 'Purchase amount is too low for this voucher' },
};

const PARTNER_REASON_LABEL: Record<string, { mm: string; en: string }> = {
  NOT_FOUND:      { mm: 'ဤ Partner referral code ကို ရှာမတွေ့ပါ', en: 'Partner referral code not found' },
  INACTIVE:       { mm: 'ဤ Partner referral code ကို လက်ရှိ အသုံးမပြုနိုင်ပါ', en: 'This partner referral code is not active right now' },
  SCOPE_MISMATCH: { mm: 'Partner referral code ကို ဆရာဝန်ချိန်းဆိုမှုအတွက်သာ သုံးနိုင်ပါသည်', en: 'Partner referral codes only apply to doctor bookings' },
};

/** Coupon-code input for checkout — the counterpart to PointsRedeemBox for a discount
 * mechanism that isn't tied to a patient balance. Validates against
 * /api/patient/vouchers/validate (read-only preview); the server always re-validates and
 * re-clamps at actual submission time regardless of what's shown here. */
export default function VoucherRedeemBox({
  mm, variant = 'voucher', sourceType, doctorId, programId, productIds, purchaseAmount, onChange, initialApplied,
}: {
  mm: boolean;
  /** 'partner' takes only a partner's "MHQ-" referral code (typed or camera-scanned);
   * 'voucher' takes ordinary voucher codes and points people to the Partner Code tab otherwise. */
  variant?: 'voucher' | 'partner';
  sourceType: 'CONSULTATION' | 'PROGRAM' | 'PRODUCT';
  doctorId?: string;
  programId?: string;
  productIds?: string[];
  purchaseAmount: number;
  onChange: (state: { voucherCode: string | null; discountAmount: number; partnerName?: string }) => void;
  /** A code already applied earlier (the box remounts when the patient steps back a page). */
  initialApplied?: { code: string; discountAmount: number; partnerName?: string } | null;
}) {
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [applied, setApplied] = useState<{ code: string; discountAmount: number; partnerName?: string } | null>(initialApplied ?? null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);

  const apply = async (override?: string) => {
    const trimmed = (override ?? code).trim();
    if (!trimmed) return;
    const isPartnerCode = trimmed.toUpperCase().startsWith('MHQ-');
    if (variant === 'partner' && !isPartnerCode) {
      setError(mm ? 'Partner referral code မဟုတ်ပါ (MHQ-… ဖြင့်စပါမည်)' : 'Not a partner referral code (starts with MHQ-)');
      return;
    }
    if (variant === 'voucher' && isPartnerCode) {
      setError(mm ? 'Partner referral code ကို "Partner Code" tab တွင် ထည့်ပါ' : 'Enter partner referral codes in the Partner Code tab');
      return;
    }
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
        const labels = variant === 'partner' ? { ...REASON_LABEL, ...PARTNER_REASON_LABEL } : REASON_LABEL;
        setError((labels[data.reason] ?? { mm: 'Code မှား/မရပါ', en: 'Invalid code' })[mm ? 'mm' : 'en']);
        return;
      }
      setApplied({ code: trimmed.toUpperCase(), discountAmount: data.discountAmount, partnerName: data.partnerName });
      onChange({ voucherCode: trimmed.toUpperCase(), discountAmount: data.discountAmount, partnerName: data.partnerName });
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
          <p className="text-xs font-bold text-green-700">
            {applied.code}{applied.partnerName ? ` · ${applied.partnerName}` : ''}
          </p>
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
          {variant === 'partner' ? <QrCode className="w-4 h-4 text-gray-400 shrink-0" /> : <Ticket className="w-4 h-4 text-gray-400 shrink-0" />}
          <input
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); apply(); } }}
            placeholder={variant === 'partner'
              ? (mm ? 'Partner referral code ထည့်ပါ (MHQ-…)' : 'Enter partner referral code (MHQ-…)')
              : (mm ? 'Voucher code ရှိလား?' : 'Have a voucher code?')}
            className="flex-1 min-w-0 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400 uppercase"
          />
          {variant === 'partner' && (
            <button type="button" onClick={() => setScanning(true)} title={mm ? 'Partner QR စကင်န်ဖတ်မည်' : 'Scan partner QR'}
              className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100">
              <ScanLine className="w-4 h-4" />
            </button>
          )}
        </div>
        <button type="button" onClick={() => apply()} disabled={checking || !code.trim()}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-50"
          style={{ backgroundColor: PRIMARY }}>
          {checking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          {mm ? 'သုံးမည်' : 'Apply'}
        </button>
      </div>
      {error && <p className="text-[11px] text-red-500 font-semibold px-1">{error}</p>}

      {scanning && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4" onClick={() => setScanning(false)}>
          <div className="bg-white rounded-2xl p-4 w-full max-w-sm flex flex-col gap-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-gray-800">{mm ? 'Partner QR စကင်န်ဖတ်ပါ' : 'Scan partner QR'}</p>
              <button type="button" onClick={() => setScanning(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-black aspect-square">
              <Scanner
                onScan={codes => {
                  const raw = codes[0]?.rawValue;
                  if (!raw) return;
                  setScanning(false);
                  setCode(raw.toUpperCase());
                  apply(raw);
                }}
                formats={['qr_code']}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
