'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import {
  ArrowLeft, Package, CreditCard, Upload, CheckCircle2, X,
  Loader2, ShoppingBag, PartyPopper, Sparkles, ArrowRight, Copy, Check,
} from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';
import { useCart } from '../../lib/useCart';
import { compressAndUpload } from '@/components/admin/uploadImage';
import { PAYMENT_METHOD_KEYS } from '@/lib/paymentMethods';
import { tryOpenDeeplink } from '@/lib/deeplink';
import { pushLog } from '@/lib/debugLog';

const PRIMARY   = 'var(--color-primary)';
const SECONDARY = 'var(--color-primary-dark)';

const PAYMENT_METHOD_IMG: Record<string, string> = {
  mmqr: '/MMQRLOGO.jpg', cb: '/payment/cbPay.jpg',
};
const PAYMENT_METHOD_SUBTITLE: Record<string, string> = {
  mmqr: 'Scan to pay', cb: 'Pay with PIN',
};
const PAYMENT_METHODS = PAYMENT_METHOD_KEYS.map(m => ({
  id: m.id, label: m.label, img: PAYMENT_METHOD_IMG[m.id], number: PAYMENT_METHOD_SUBTITLE[m.id],
}));

interface Product { id: string; name: string; nameEn: string | null; imageUrl: string | null; price: number; packSize: string | null; }

function getPatient(): { name: string; phone: string } | null {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem('medihug_patient') ?? 'null'); } catch { return null; }
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { lang } = useLang();
  const mm = lang === 'mm';
  const { lines, removeItem } = useCart();

  const ids = (params.get('ids') ?? '').split(',').filter(Boolean);
  const checkoutLines = lines.filter(l => ids.includes(l.productId));

  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading]   = useState(true);

  const patient = getPatient();
  const [name,  setName]  = useState(patient?.name  ?? '');
  const [phone, setPhone] = useState(patient?.phone ?? '');

  const [payMethod, setPayMethod] = useState('mmqr');
  const [receipt,   setReceipt]   = useState<{ file: File; url: string } | null>(null);
  const [dragOver,  setDragOver]  = useState(false);
  const [note,      setNote]      = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');
  const [done,       setDone]       = useState(false);
  const [placedOrder, setPlacedOrder] = useState<{ id: string; total: number } | null>(null);
  const [copied,     setCopied]     = useState(false);
  const [zoomQr,     setZoomQr]     = useState(false);
  const [cbDeeplink, setCbDeeplink] = useState<string | null>(null);
  const [cbAppMissing, setCbAppMissing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ids.length === 0) { setLoading(false); return; }
    Promise.all(ids.map(id => fetch(`/api/admin/products/${id}`).then(r => r.ok ? r.json() : null)))
      .then(results => {
        const map: Record<string, Product> = {};
        results.forEach(r => { if (r?.product) map[r.product.id] = r.product; });
        setProducts(map);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = checkoutLines.reduce((sum, l) => {
    const p = products[l.productId];
    return sum + (p ? p.price * l.quantity : 0);
  }, 0);

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    setReceipt({ file, url: URL.createObjectURL(file) });
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function handleSubmit() {
    const isCb = payMethod === 'cb';
    if (!name.trim() || !phone.trim() || (!isCb && !receipt)) return;
    setSubmitting(true); setError('');
    try {
      const receiptUrl = isCb ? null : await compressAndUpload(receipt!.file, () => {}, '/api/patient/upload');
      const res = await fetch('/api/patient/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(), phone: phone.trim(),
          items: checkoutLines.map(l => ({ productId: l.productId, quantity: l.quantity })),
          paymentMethod: payMethod, receiptUrl, note,
        }),
      });
      const data = await res.json();
      pushLog('POST /api/patient/orders', { status: res.status, ok: res.ok, data });
      if (!res.ok) { setError(data.error ?? (mm ? 'အမှားတစ်ခုဖြစ်ပွားသည်' : 'Something went wrong')); setSubmitting(false); return; }
      localStorage.setItem('medihug_patient', JSON.stringify({ name: name.trim(), phone: phone.trim() }));
      checkoutLines.forEach(l => removeItem(l.productId));

      if (isCb) {
        const initRes = await fetch('/api/payments/cbpay/initiate', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kind: 'order', id: data.order.id }),
        });
        const initData = await initRes.json();
        pushLog('POST /api/payments/cbpay/initiate', { status: initRes.status, ok: initRes.ok, initData });
        if (!initRes.ok) {
          setError(mm ? 'CB Pay ချိတ်ဆက်၍မရပါ။ ထပ်စမ်းကြည့်ပါ' : 'Could not start CB Pay. Please try again.');
          setSubmitting(false);
          return;
        }
        setCbDeeplink(initData.deeplink);
        setCbAppMissing(false);
        setSubmitting(false);
        pushLog('Opening CBPay deeplink', { deeplink: initData.deeplink });
        tryOpenDeeplink(initData.deeplink, () => { pushLog('CBPay app not detected', {}); setCbAppMissing(true); });
        return;
      }

      setPlacedOrder({ id: data.order.id, total: data.order.totalAmount });
      setSubmitting(false);
      setDone(true);
    } catch (err) {
      pushLog('handleSubmit error', { message: err instanceof Error ? err.message : String(err) });
      setError(err instanceof Error ? err.message : (mm ? 'ဆာဗာအမှား' : 'Server error'));
      setSubmitting(false);
    }
  }

  if (done) {
    const copyOrderId = () => {
      if (!placedOrder) return;
      navigator.clipboard.writeText(placedOrder.id).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      });
    };

    return (
      <div className="relative min-h-full overflow-hidden flex flex-col items-center justify-center px-6 py-20" style={{ backgroundColor: '#f8fafc' }}>
        {/* decorative background blobs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-24 -left-20 w-72 h-72 rounded-full blur-3xl" style={{ backgroundColor: `${PRIMARY}14` }} />
          <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: `${SECONDARY}12` }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-xl shadow-gray-200/70 border border-gray-100 px-7 py-9 flex flex-col items-center text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 16 }}
            className="relative w-20 h-20 rounded-full flex items-center justify-center mb-5"
            style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`, boxShadow: `0 10px 28px -8px ${PRIMARY}55` }}
          >
            <span className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: `${PRIMARY}30`, animationDuration: '2.2s' }} />
            <PartyPopper className="w-9 h-9 text-white relative" />
            <Sparkles className="w-4 h-4 text-white/90 absolute -top-1 -right-1" />
          </motion.div>

          <p className="text-xl font-extrabold text-gray-900">{mm ? 'အော်ဒါ တင်ပြီးပါပြီ!' : 'Order placed!'}</p>
          <p className="text-sm text-gray-400 mt-1.5 max-w-65 leading-relaxed">
            {mm ? 'ငွေပေးချေမှု စစ်ဆေးပြီးပါက အတည်ပြုပေးပါမည်' : "We'll confirm once your payment is verified."}
          </p>

          {placedOrder && (
            <div className="w-full mt-6 rounded-2xl overflow-hidden border border-gray-100">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{mm ? 'အော်ဒါ ID' : 'Order ID'}</span>
                <button onClick={copyOrderId} className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-800 transition-colors">
                  <span className="font-mono">{placedOrder.id.slice(0, 10)}…</span>
                  {copied ? <Check className="w-3.5 h-3.5" style={{ color: PRIMARY }} /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                </button>
              </div>
              <div className="flex items-center justify-between px-4 py-3" style={{ background: `linear-gradient(135deg, ${PRIMARY}08 0%, ${SECONDARY}10 100%)` }}>
                <span className="text-xs font-semibold text-gray-500">{mm ? 'ပေးချေပြီးငွေ' : 'Amount Paid'}</span>
                <span className="text-lg font-bold" style={{ color: PRIMARY }}>{placedOrder.total.toLocaleString()} <span className="text-xs font-semibold text-gray-400">MMK</span></span>
              </div>
            </div>
          )}

          <Link href="/patient/records"
            className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white transition-transform active:scale-[0.98]"
            style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`, boxShadow: `0 8px 20px -8px ${PRIMARY}70` }}>
            {mm ? 'ဆက်လက်ဝယ်ယူရန်' : 'Continue Shopping'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!loading && checkoutLines.length === 0) {
    return (
      <div className="min-h-full bg-gray-50 flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
        <ShoppingBag className="w-10 h-10 text-gray-300" />
        <p className="text-sm font-bold text-gray-600">{mm ? 'ဝယ်ယူရန် ပစ္စည်း မရှိပါ' : 'Nothing to check out'}</p>
        <Link href="/patient/cart" className="text-sm font-semibold" style={{ color: PRIMARY }}>
          {mm ? 'ဈေးခြင်းသို့ ပြန်သွားရန်' : 'Back to cart'}
        </Link>
      </div>
    );
  }

  const selected = PAYMENT_METHODS.find(p => p.id === payMethod)!;
  const isCb = payMethod === 'cb';
  const canSubmit = !!name.trim() && !!phone.trim() && !submitting && (isCb || !!receipt);

  return (
    <div className="min-h-full bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 lg:px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center shrink-0 transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>
        <h1 className="text-base font-bold text-gray-800">{mm ? 'ငွေချေရန်' : 'Checkout'}</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 lg:px-6 py-5 pb-8 flex flex-col gap-4">

        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin" style={{ color: PRIMARY }} /></div>
        ) : (
          <>
            {/* order items */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{mm ? 'ဝယ်ယူမည့်ပစ္စည်း' : 'Order Items'}</p>
              {checkoutLines.map(l => {
                const p = products[l.productId];
                if (!p) return null;
                const pname = mm ? p.name : (p.nameEn ?? p.name);
                return (
                  <div key={l.productId} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                      {p.imageUrl ? <Image src={p.imageUrl} alt={pname} fill sizes="48px" className="object-cover" /> : <div className="absolute inset-0 flex items-center justify-center"><Package className="w-5 h-5 text-gray-300" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{pname}</p>
                      <p className="text-xs text-gray-400">x{l.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-700 shrink-0">{(p.price * l.quantity).toLocaleString()} Ks</p>
                  </div>
                );
              })}
              <div className="h-px bg-gray-100" />
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-gray-700">{mm ? 'စုစုပေါင်း' : 'Total'}</p>
                <p className="text-lg font-bold" style={{ color: PRIMARY }}>{total.toLocaleString()} <span className="text-xs font-semibold text-gray-400">Ks</span></p>
              </div>
            </div>

            {/* your info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
              <p className="text-sm font-bold" style={{ color: PRIMARY }}>{mm ? 'သင့်အချက်အလက်' : 'Your Info'}</p>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder={mm ? 'အမည်' : 'Name'}
                className="w-full text-sm text-gray-700 rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-gray-300 transition-colors" />
              <input value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="09xxxxxxxxx"
                className="w-full text-sm text-gray-700 rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-gray-300 transition-colors" />
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                placeholder={mm ? 'မှတ်ချက် (ရွေးချယ်စရာ)' : 'Note (optional)'}
                className="w-full text-sm text-gray-700 rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-gray-300 transition-colors resize-none" />
            </div>

            {/* payment — mirrors app/patient/booking payment section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" style={{ color: SECONDARY }} />
                <p className="text-sm font-bold" style={{ color: PRIMARY }}>{mm ? 'ငွေပေးချေမှု' : 'Payment'}</p>
              </div>

              <div className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: `linear-gradient(135deg, ${PRIMARY}08 0%, ${SECONDARY}12 100%)`, border: `1px solid ${PRIMARY}15` }}>
                <span className="text-xs text-gray-500">{mm ? 'ပေးရမည့်ငွေ' : 'Amount to pay'}</span>
                <span className="text-xl font-bold" style={{ color: PRIMARY }}>{total.toLocaleString()} <span className="text-xs font-semibold text-gray-400">MMK</span></span>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">{mm ? 'ငွေပေးချေနည်း ရွေးပါ' : 'Select payment method'}</p>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map(pm => {
                    const active = payMethod === pm.id;
                    return (
                      <button key={pm.id} onClick={() => setPayMethod(pm.id)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all"
                        style={{ backgroundColor: active ? `${PRIMARY}10` : '#fafafa', borderColor: active ? PRIMARY : '#e5e7eb', boxShadow: active ? `0 0 0 1px ${PRIMARY}` : 'none' }}>
                        <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-gray-100 bg-white flex items-center justify-center">
                          <Image src={pm.img} alt={pm.label} width={36} height={36} className="object-contain w-full h-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold" style={{ color: active ? PRIMARY : '#374151' }}>{pm.label}</p>
                          <p className="text-[10px] text-gray-400 truncate">{pm.number}</p>
                        </div>
                        {active && (
                          <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: PRIMARY }}>
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selected.id !== 'cb' ? (
                <div className="px-4 py-4 rounded-xl flex flex-col items-center gap-2" style={{ backgroundColor: '#f8faff', border: `1px dashed ${PRIMARY}40` }}>
                  <p className="text-xs font-bold" style={{ color: PRIMARY }}>MMQR</p>
                  <button type="button" onClick={() => setZoomQr(true)}
                    className="w-40 h-40 rounded-xl overflow-hidden border border-gray-100 bg-white flex items-center justify-center active:scale-95 transition-transform">
                    <Image src="/payment/mmqr.jpg" alt="MMQR" width={160} height={160} className="object-contain w-full h-full" />
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    {mm ? 'ပုံကို နှိပ်ပြီး ချဲ့ကြည့်နိုင်ပါသည် · MMQR ကို စကင်ဖတ်ပြီး ငွေလွှဲပေးပါ' : 'Tap image to zoom · Scan the MMQR to pay'}
                  </p>
                </div>
              ) : (
                <div className="px-4 py-4 rounded-xl flex flex-col items-center gap-2 text-center" style={{ backgroundColor: '#f8faff', border: `1px dashed ${PRIMARY}40` }}>
                  <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-gray-100 bg-white flex items-center justify-center">
                    <Image src={selected.img} alt={selected.label} width={40} height={40} className="object-contain w-full h-full" />
                  </div>
                  <p className="text-xs font-bold" style={{ color: PRIMARY }}>{selected.label}</p>
                  <p className="text-xs text-gray-500">
                    {mm ? 'အော်ဒါတင်ပြီးရင် CBPay app ဖွင့်ပြီး PIN နှိပ်ပြီး ငွေချေရပါမည်' : "You'll be redirected to the CBPay app to approve payment with your PIN."}
                  </p>
                  {cbDeeplink && cbAppMissing && (
                    <p className="text-[11px] text-red-500 mt-1 font-semibold">
                      {mm ? 'ဤစက်ပေါ်တွင် CBPay app ကို ရှာမတွေ့ပါ။ Mobile ဖုန်းပေါ်တွင် CBPay app ထည့်သွင်းပြီး ပြန်စမ်းကြည့်ပါ' : "CBPay app not found on this device. Please install the CBPay app on your phone and try again."}
                    </p>
                  )}
                  {cbDeeplink && (
                    <button
                      type="button"
                      onClick={() => { setCbAppMissing(false); tryOpenDeeplink(cbDeeplink, () => setCbAppMissing(true)); }}
                      className="text-[11px] text-amber-600 underline font-semibold mt-1"
                    >
                      {mm ? 'ထပ်ကြိုးစားရန်' : 'Try again'}
                    </button>
                  )}
                </div>
              )}

              {!isCb && (
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">{mm ? 'ငွေလွှဲပြေစာ တင်ပါ' : 'Upload payment receipt'}</p>
                {receipt ? (
                  <div className="relative rounded-2xl overflow-hidden border border-gray-100" style={{ height: 180 }}>
                    <Image src={receipt.url} alt="receipt" fill className="object-contain bg-gray-50" />
                    <button onClick={() => setReceipt(null)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center">
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center gap-2" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)' }}>
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-white text-xs font-semibold truncate">{receipt.file.name}</span>
                    </div>
                  </div>
                ) : (
                  <div
                    onDrop={handleDrop}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onClick={() => fileRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2.5 py-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all"
                    style={{ borderColor: dragOver ? PRIMARY : '#d1d5db', backgroundColor: dragOver ? '#eff6ff' : '#fafafa' }}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#eff6ff' }}>
                      <Upload className="w-5 h-5" style={{ color: PRIMARY }} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold" style={{ color: PRIMARY }}>{mm ? 'ပုံ / PDF တင်ရန် နှိပ်ပါ' : 'Tap to upload image or PDF'}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{mm ? 'သို့မဟုတ် ဤနေရာသို့ ဆွဲချပါ' : 'or drag and drop here'}</p>
                    </div>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </div>
              )}
            </div>

            {error && <p className="text-center text-xs text-red-500 font-semibold">{error}</p>}

            <div className="flex flex-col gap-2">
              {!isCb && !receipt && (
                <p className="text-center text-xs text-amber-500 font-semibold">
                  {mm ? '⚠ ငွေပေးချေပြေစာ တင်ရန် လိုအပ်သည်' : '⚠ Please upload payment receipt to continue'}
                </p>
              )}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full py-4 rounded-2xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2"
                style={{ background: canSubmit ? `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` : '#d1d5db', cursor: canSubmit ? 'pointer' : 'not-allowed' }}>
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {mm ? 'အော်ဒါ တင်ပြီးမည်' : 'Place Order'}
              </button>
            </div>
          </>
        )}
      </div>

      {zoomQr && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6"
          onClick={() => setZoomQr(false)}
        >
          <button onClick={() => setZoomQr(false)}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="bg-white rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/payment/mmqr.jpg" alt="MMQR" className="block w-auto h-auto max-w-[92vw] max-h-[88vh]" />
          </div>
        </div>
      )}
    </div>
  );
}
