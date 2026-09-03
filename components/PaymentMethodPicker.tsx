'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Copy, Check, X, Wallet, ChevronDown } from 'lucide-react';

const PRIMARY = 'var(--color-primary)';

interface PaymentMethod {
  id: string; key: string; label: string;
  kind: 'WALLET' | 'BANK_TRANSFER';
  accountNumber: string | null; accountName: string | null;
}

/** Static logo lookup — the picker itself has no admin-uploaded-logo field, so known keys
 * get their real brand mark and anything unrecognized (a newly added method) falls back to
 * a generic wallet icon rather than breaking. */
const LOGOS: Record<string, string> = {
  kpay: '/payment/Kpay.jpg',
  wavepay: '/payment/waveMoney.png',
  aya: '/payment/ayaPay.png',
  cb: '/payment/cbPay.jpg',
  mmqr: '/payment/mmqr.jpg',
  ayabank: '/payment/aya_bank.png',
  cbbank: '/payment/cb_bank.jpg',
  uabbank: '/payment/uab_bank.jpg',
};

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
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [zoomQr, setZoomQr] = useState(false);
  const [mmqrOpen, setMmqrOpen] = useState(true);

  useEffect(() => {
    fetch('/api/payment-methods').then(r => r.json()).then(d => {
      setMethods(d.methods ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // MMQR is one QR that any wallet app can scan — it isn't its own gateway, so a purchase
  // paid "via MMQR" carries no commission-trackable identity on its own. Whichever app the
  // patient actually used underneath is what CommissionRule/PaymentMethodConfig key off, so
  // picking MMQR requires a second, required pick of the real app — that sub-pick becomes
  // the committed paymentMethod value, never the literal string 'mmqr'.
  const TOP_RAIL_KEYS = ['mmqr', 'cb'];
  const COMING_SOON_KEYS = ['cb'];

  // Sub-list is every active wallet the admin has configured — the same set Commission Rules
  // offers — minus 'mmqr' itself, which can't answer its own question. CB Pay stays in here
  // even though its own top-level rail is "coming soon", since an MMQR scan can already settle
  // through CB Pay today; only CB's dedicated app-initiated flow is what's paused.
  const wallets    = methods.filter(m => m.kind === 'WALLET' && TOP_RAIL_KEYS.includes(m.key));
  const subMethods = methods.filter(m => m.kind === 'WALLET' && m.key !== 'mmqr');
  const banks      = methods.filter(m => m.kind === 'BANK_TRANSFER');
  const mmqrSelected = subMethods.some(s => s.key === payMethod);

  const copyAccount = async (key: string, num: string) => {
    try {
      await navigator.clipboard.writeText(num);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch {}
  };

  const Logo = ({ m, size = 44 }: { m: PaymentMethod; size?: number }) => (
    <div className="rounded-lg overflow-hidden shrink-0 border border-gray-100 bg-white flex items-center justify-center" style={{ width: size, height: size }}>
      {LOGOS[m.key]
        ? <Image src={LOGOS[m.key]} alt={m.label} width={size} height={size} className="object-cover w-full h-full" />
        : <Wallet className="w-4.5 h-4.5 text-gray-300" />}
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {loading ? (
        <div className="flex flex-col gap-3">
          <div className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
          <div className="h-32 rounded-2xl bg-gray-100 animate-pulse" />
        </div>
      ) : methods.length === 0 ? (
        <p className="text-xs text-gray-400">{mm ? 'ငွေပေးချေနည်း မရှိသေးပါ' : 'No payment methods available'}</p>
      ) : (
        <>
          {wallets.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-gray-400">{mm ? 'မိုဘိုင်းပေမှ ငွေပေးချေရန်' : 'Pay with mobile wallet'}</p>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {wallets.map((m, i) => {
                  const comingSoon = COMING_SOON_KEYS.includes(m.key);
                  const isMmqr = m.key === 'mmqr';
                  const active = isMmqr ? (mmqrOpen || mmqrSelected) : payMethod === m.key;
                  return (
                    <div key={m.key} className={i > 0 ? 'border-t border-gray-50' : ''}>
                      <button
                        type="button"
                        disabled={comingSoon}
                        onClick={() => isMmqr ? setMmqrOpen(o => !o) : setPayMethod(active ? '' : m.key)}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-left disabled:cursor-not-allowed"
                        style={{ backgroundColor: active ? `${PRIMARY}0a` : 'transparent', opacity: comingSoon ? 0.55 : 1 }}
                      >
                        <Logo m={m} />
                        <span className="flex-1 text-sm font-bold text-gray-800">{m.label}</span>
                        {comingSoon ? (
                          <span className="text-[10px] font-bold px-2 py-1 rounded-full shrink-0 bg-gray-100 text-gray-400">
                            {mm ? 'မကြာမီ' : 'Coming soon'}
                          </span>
                        ) : (
                          <ChevronDown className="w-4.5 h-4.5 shrink-0 transition-transform" style={{ color: active ? PRIMARY : '#9ca3af', transform: active ? 'rotate(180deg)' : 'none' }} />
                        )}
                      </button>

                      {active && isMmqr && (
                        <div className="px-4 pb-4 flex flex-col items-center gap-3">
                          <button type="button" onClick={() => setZoomQr(true)}
                            className="w-40 h-40 rounded-xl overflow-hidden border border-gray-100 bg-white flex items-center justify-center active:scale-95 transition-transform">
                            <Image src="/payment/mmqr.jpg" alt="MMQR" width={160} height={160} className="object-contain w-full h-full" />
                          </button>
                          <p className="text-xs text-gray-500 text-center">
                            {mm ? 'ပုံကို နှိပ်ပြီး ချဲ့ကြည့်နိုင်ပါသည် · MMQR ကို စကင်ဖတ်ပြီး ငွေလွှဲပေးပါ' : 'Tap image to zoom · Scan the MMQR to pay'}
                          </p>
                        </div>
                      )}

                      {/* Unreachable while 'cb' stays in COMING_SOON_KEYS (button above is disabled) —
                          kept ready so removing the flag re-enables CB Pay with no further work. */}
                      {active && m.key === 'cb' && (
                        <div className="px-4 pb-4 flex flex-col items-center gap-2 text-center">
                          <p className="text-xs text-gray-500">
                            {mm ? 'အော်ဒါတင်ပြီးရင် CBPay app ဖွင့်ပြီး PIN နှိပ်ပြီး ငွေချေရပါမည်' : "You'll be redirected to the CBPay app to approve payment with your PIN."}
                          </p>
                          {cbDeeplink && cbAppMissing && (
                            <p className="text-[11px] text-red-500 font-semibold">
                              {mm ? 'ဤစက်ပေါ်တွင် CBPay app ကို ရှာမတွေ့ပါ။ Mobile ဖုန်းပေါ်တွင် CBPay app ထည့်သွင်းပြီး ပြန်စမ်းကြည့်ပါ' : "CBPay app not found on this device. Please install the CBPay app on your phone and try again."}
                            </p>
                          )}
                          {cbDeeplink && onRetryDeeplink && (
                            <button type="button" onClick={onRetryDeeplink} className="text-[11px] text-amber-600 underline font-semibold">
                              {mm ? 'ထပ်ကြိုးစားရန်' : 'Try again'}
                            </button>
                          )}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

              {(mmqrOpen || mmqrSelected) && subMethods.length > 0 && (
                <div className="rounded-2xl border-2 p-4 flex flex-col gap-2.5" style={{ borderColor: PRIMARY, backgroundColor: `${PRIMARY}08` }}>
                  <p className="text-base font-bold" style={{ color: PRIMARY }}>
                    {mm ? 'ဘယ် App နဲ့ ငွေလွှဲခဲ့ပါသလဲ *' : 'Which app did you pay with? *'}
                  </p>
                  <select
                    required
                    value={mmqrSelected ? payMethod : ''}
                    onChange={e => setPayMethod(e.target.value)}
                    className="w-full bg-white border-2 rounded-xl px-4 py-3.5 text-base font-semibold text-gray-800 outline-none"
                    style={{ borderColor: `${PRIMARY}40` }}
                  >
                    <option value="" disabled>{mm ? 'ရွေးပါ...' : 'Select...'}</option>
                    {subMethods.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
              )}

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
          )}

          {banks.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-gray-400">{mm ? 'ဘဏ်မှတဆင့် ငွေလွှဲရန်' : 'Bank transfer'}</p>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {banks.map((m, i) => {
                  const active = payMethod === m.key;
                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setPayMethod(active ? '' : m.key)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left ${i > 0 ? 'border-t border-gray-50' : ''}`}
                      style={{ backgroundColor: active ? `${PRIMARY}0a` : 'transparent' }}
                    >
                      <Logo m={m} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 tracking-wide truncate">{m.accountNumber}</p>
                        <p className="text-xs text-gray-400 truncate">{m.accountName}</p>
                      </div>
                      <span
                        role="button"
                        onClick={e => { e.stopPropagation(); if (m.accountNumber) copyAccount(m.key, m.accountNumber); }}
                        className="flex items-center gap-1 text-xs font-bold shrink-0"
                        style={{ color: PRIMARY }}
                      >
                        {copiedKey === m.key
                          ? <><Check className="w-3.5 h-3.5" /> {mm ? 'ကူးပြီး' : 'Copied'}</>
                          : <><Copy className="w-3.5 h-3.5" /> {mm ? 'ကူးမည်' : 'Copy'}</>}
                      </span>
                    </button>
                  );
                })}
              </div>
              {payMethod && banks.some(b => b.key === payMethod) && (
                <p className="text-xs text-gray-400 px-1">
                  {mm ? 'အထက်ပါအကောင့်သို့ ငွေလွှဲပြီး ပြေစာတင်ပေးပါ' : 'Transfer to the account above, then upload your receipt'}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
