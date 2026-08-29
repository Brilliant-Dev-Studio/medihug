'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Copy, Check, Landmark, X } from 'lucide-react';

const PRIMARY = 'var(--color-primary)';

interface PaymentMethod {
  id: string; key: string; label: string;
  kind: 'WALLET' | 'BANK_TRANSFER';
  accountNumber: string | null; accountName: string | null;
}

/** Fetches the live, admin-managed payment method list and renders a dropdown + the
 * matching detail block below it (MMQR QR / CB Pay PIN-redirect prompt / bank account
 * card / generic "pay then upload receipt" note). Used identically across order checkout,
 * appointment booking, and program enrollment — the only pages with a payment step. */
export default function PaymentMethodPicker({
  mm, payMethod, setPayMethod, cbDeeplink, cbAppMissing, onRetryDeeplink,
}: {
  mm: boolean;
  payMethod: string;
  setPayMethod: (key: string) => void;
  cbDeeplink?: string | null;
  cbAppMissing?: boolean;
  onRetryDeeplink?: () => void;
}) {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [zoomQr, setZoomQr] = useState(false);

  useEffect(() => {
    fetch('/api/payment-methods').then(r => r.json()).then(d => {
      setMethods(d.methods ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const selected = methods.find(m => m.key === payMethod);

  const copyAccount = async (num: string) => {
    try {
      await navigator.clipboard.writeText(num);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
          {mm ? 'ငွေပေးချေနည်း ရွေးပါ' : 'Select payment method'}
        </p>
        <select
          required
          value={payMethod}
          onChange={e => setPayMethod(e.target.value)}
          disabled={loading || methods.length === 0}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-300 disabled:opacity-60"
        >
          {loading && <option value="">{mm ? 'တင်နေသည်...' : 'Loading...'}</option>}
          {!loading && methods.length === 0 && <option value="">{mm ? 'ငွေပေးချေနည်း မရှိသေးပါ' : 'No payment methods available'}</option>}
          {!loading && methods.length > 0 && (
            <option value="" disabled>{mm ? 'ငွေပေးချေနည်း ရွေးပါ...' : 'Select a payment method...'}</option>
          )}
          {methods.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
        </select>
      </div>

      {payMethod === 'mmqr' ? (
        <div className="px-4 py-4 rounded-xl flex flex-col items-center gap-2" style={{ backgroundColor: '#f8faff', border: `1px dashed ${PRIMARY}40` }}>
          <p className="text-xs font-bold" style={{ color: PRIMARY }}>MMQR</p>
          <button type="button" onClick={() => setZoomQr(true)}
            className="w-40 h-40 rounded-xl overflow-hidden border border-gray-100 bg-white flex items-center justify-center active:scale-95 transition-transform">
            <Image src="/payment/mmqr.jpg" alt="MMQR" width={160} height={160} className="object-contain w-full h-full" />
          </button>
          <p className="text-xs text-gray-500 text-center">
            {mm ? 'ပုံကို နှိပ်ပြီး ချဲ့ကြည့်နိုင်ပါသည် · MMQR ကို စကင်ဖတ်ပြီး ငွေလွှဲပေးပါ' : 'Tap image to zoom · Scan the MMQR to pay'}
          </p>
          {zoomQr && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6" onClick={() => setZoomQr(false)}>
              <button onClick={() => setZoomQr(false)} className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="bg-white rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/payment/mmqr.jpg" alt="MMQR" className="block w-auto h-auto max-w-[92vw] max-h-[88vh]" />
              </div>
            </div>
          )}
        </div>
      ) : payMethod === 'cb' ? (
        <div className="px-4 py-4 rounded-xl flex flex-col items-center gap-2 text-center" style={{ backgroundColor: '#f8faff', border: `1px dashed ${PRIMARY}40` }}>
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-gray-100 bg-white flex items-center justify-center">
            <Image src="/payment/cbPay.jpg" alt="CB Pay" width={40} height={40} className="object-contain w-full h-full" />
          </div>
          <p className="text-xs font-bold" style={{ color: PRIMARY }}>CB Pay</p>
          <p className="text-xs text-gray-500">
            {mm ? 'အော်ဒါတင်ပြီးရင် CBPay app ဖွင့်ပြီး PIN နှိပ်ပြီး ငွေချေရပါမည်' : "You'll be redirected to the CBPay app to approve payment with your PIN."}
          </p>
          {cbDeeplink && cbAppMissing && (
            <p className="text-[11px] text-red-500 mt-1 font-semibold">
              {mm ? 'ဤစက်ပေါ်တွင် CBPay app ကို ရှာမတွေ့ပါ။ Mobile ဖုန်းပေါ်တွင် CBPay app ထည့်သွင်းပြီး ပြန်စမ်းကြည့်ပါ' : "CBPay app not found on this device. Please install the CBPay app on your phone and try again."}
            </p>
          )}
          {cbDeeplink && onRetryDeeplink && (
            <button type="button" onClick={onRetryDeeplink} className="text-[11px] text-amber-600 underline font-semibold mt-1">
              {mm ? 'ထပ်ကြိုးစားရန်' : 'Try again'}
            </button>
          )}
        </div>
      ) : selected?.kind === 'BANK_TRANSFER' ? (
        <div className="px-4 py-4 rounded-xl flex flex-col items-center gap-3 text-center" style={{ backgroundColor: '#f8faff', border: `1px dashed ${PRIMARY}40` }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${PRIMARY}14` }}>
            <Landmark className="w-5 h-5" style={{ color: PRIMARY }} />
          </div>
          <p className="text-xs font-bold" style={{ color: PRIMARY }}>{selected.label}</p>
          <button type="button" onClick={() => selected.accountNumber && copyAccount(selected.accountNumber)}
            className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-white border border-gray-100">
            <div className="text-left min-w-0">
              <p className="text-sm font-bold text-gray-800 tracking-wide truncate">{selected.accountNumber}</p>
              <p className="text-[11px] text-gray-400 truncate">{selected.accountName}</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold shrink-0" style={{ color: PRIMARY }}>
              {copied
                ? <><Check className="w-3.5 h-3.5" /> {mm ? 'ကူးပြီး' : 'Copied'}</>
                : <><Copy className="w-3.5 h-3.5" /> {mm ? 'ကူးမည်' : 'Copy'}</>}
            </span>
          </button>
          <p className="text-xs text-gray-500">
            {mm ? 'အထက်ပါအကောင့်သို့ ငွေလွှဲပြီး ပြေစာတင်ပေးပါ' : 'Transfer to the account above, then upload your receipt'}
          </p>
        </div>
      ) : selected ? (
        <div className="px-4 py-4 rounded-xl flex flex-col items-center gap-2 text-center" style={{ backgroundColor: '#f8faff', border: `1px dashed ${PRIMARY}40` }}>
          <p className="text-xs font-bold" style={{ color: PRIMARY }}>{selected.label}</p>
          <p className="text-xs text-gray-500">
            {mm ? `${selected.label} ဖြင့် ငွေလွှဲပြီး ပြေစာတင်ပေးပါ` : `Pay via ${selected.label}, then upload your receipt`}
          </p>
        </div>
      ) : null}
    </div>
  );
}
