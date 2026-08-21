'use client';

import { useState, useRef, useEffect, use } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ChevronLeft, Upload, Image as ImageIcon, CheckCircle2, X, CreditCard,
  RotateCcw, Loader2, Stethoscope,
} from 'lucide-react';
import { useLang } from '../../../lib/LanguageContext';
import IntakeForm, { IntakeData } from '../../booking/IntakeForm';
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

interface Program {
  id: string; imageUrl: string; titleMm: string; titleEn: string | null;
  descMm: string | null; descEn: string | null; price: number;
  doctors: { id: string; name: string; nameEn: string | null; specialty: string; specialtyEn: string | null; imageUrl: string | null }[];
}

export default function ProgramPurchasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: programId } = use(params);
  const router = useRouter();
  const { lang } = useLang();
  const mm = lang === 'mm';

  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/healthcare-programs/${programId}`)
      .then(r => r.json())
      .then(d => setProgram(d.program ?? null))
      .finally(() => setLoading(false));
  }, [programId]);

  const [payMethod, setPayMethod] = useState('mmqr');
  const [receipt,   setReceipt]   = useState<{ file: File; url: string } | null>(null);
  const [dragOver,  setDragOver]  = useState(false);
  const [step, setStep] = useState<'form' | 'intake' | 'done'>('form');
  const [submitting, setSubmitting] = useState(false);
  const [submitErr,  setSubmitErr]  = useState<{ message: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [cbPhase, setCbPhase] = useState<'idle' | 'paying' | 'failed'>('idle');
  const [cbDeeplink, setCbDeeplink] = useState<string | null>(null);
  const [cbAppMissing, setCbAppMissing] = useState(false);
  const [cbProof, setCbProof] = useState<{ orderId: string; generateRefOrder: string } | null>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollAttempts = useRef(0);

  useEffect(() => () => { if (pollRef.current) clearTimeout(pollRef.current); }, []);

  function pollCbPayStatus(orderId: string, generateRefOrder: string) {
    pollAttempts.current += 1;
    if (pollAttempts.current > 60) {
      setCbPhase('failed');
      setSubmitErr({ message: mm ? 'ငွေချေမှု ကြာမြင့်နေပါသည်။ ထပ်စမ်းကြည့်ပါ' : 'Payment is taking too long. Please try again.' });
      return;
    }
    pollRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/payments/cbpay/pending?orderId=${encodeURIComponent(orderId)}&generateRefOrder=${encodeURIComponent(generateRefOrder)}`);
        const data = await res.json();
        pushLog('GET /api/payments/cbpay/pending (poll)', { attempt: pollAttempts.current, status: res.status, ok: res.ok, data });
        if (res.ok && data.transactionStatus === 'S') {
          setCbPhase('idle');
          setStep('intake');
          return;
        }
        if (res.ok && (data.transactionStatus === 'F' || data.transactionStatus === 'E')) {
          setCbPhase('failed');
          setSubmitErr({ message: mm ? 'CB Pay ငွေချေမှု မအောင်မြင်ပါ' : 'CB Pay payment was not successful.' });
          return;
        }
        pollCbPayStatus(orderId, generateRefOrder);
      } catch (err) {
        pushLog('GET /api/payments/cbpay/pending (poll) error', { message: err instanceof Error ? err.message : String(err) });
        pollCbPayStatus(orderId, generateRefOrder);
      }
    }, 3000);
  }

  function retryDeeplink() {
    if (!cbDeeplink) return;
    setCbAppMissing(false);
    tryOpenDeeplink(cbDeeplink, () => setCbAppMissing(true));
  }

  async function startCbPayment() {
    if (!program) return;
    setCbPhase('paying');
    setCbAppMissing(false);
    setSubmitErr(null);
    pollAttempts.current = 0;
    try {
      const res = await fetch('/api/payments/cbpay/pending', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: program.price, orderDetails: `Medihug program: ${program.titleMm}` }),
      });
      const data = await res.json();
      pushLog('POST /api/payments/cbpay/pending', { status: res.status, ok: res.ok, data });
      if (!res.ok) {
        setCbPhase('failed');
        setSubmitErr({ message: mm ? 'CB Pay ချိတ်ဆက်၍မရပါ။ ထပ်စမ်းကြည့်ပါ' : 'Could not start CB Pay. Please try again.' });
        return;
      }
      setCbProof({ orderId: data.orderId, generateRefOrder: data.generateRefOrder });
      setCbDeeplink(data.deeplink);
      pushLog('Opening CBPay deeplink', { deeplink: data.deeplink });
      tryOpenDeeplink(data.deeplink, () => { pushLog('CBPay app not detected', {}); setCbAppMissing(true); });
      pollCbPayStatus(data.orderId, data.generateRefOrder);
    } catch (err) {
      pushLog('startCbPayment error', { message: err instanceof Error ? err.message : String(err) });
      setCbPhase('failed');
      setSubmitErr({ message: mm ? 'ဆာဗာအမှား' : 'Server error' });
    }
  }

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    setReceipt({ file, url: URL.createObjectURL(file) });
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleSubmit() {
    if (payMethod === 'cb') { startCbPayment(); return; }
    if (!receipt) return;
    setStep('intake');
  }

  const [lastIntake, setLastIntake] = useState<IntakeData | null>(null);

  async function handleIntakeDone(intake: IntakeData) {
    const isCb = payMethod === 'cb';
    setLastIntake(intake);
    setSubmitting(true);
    setSubmitErr(null);
    try {
      const receiptUrl = isCb ? null : (receipt ? await compressAndUpload(receipt.file, () => {}, '/api/patient/upload') : null);
      const res = await fetch(`/api/patient/programs/${programId}/enroll`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: intake.name,
          phone: intake.phone,
          paymentMethod: payMethod,
          receiptUrl,
          intake,
          ...(isCb && cbProof ? { cbPayOrderId: cbProof.orderId, cbPayGenerateRefOrder: cbProof.generateRefOrder } : {}),
        }),
      });
      const data = await res.json();
      pushLog('POST /api/patient/programs/[id]/enroll', { status: res.status, ok: res.ok, data });
      if (!res.ok) {
        setSubmitErr({ message: data.error ?? (mm ? 'အမှားတစ်ခုဖြစ်ပွားသည်' : 'Something went wrong') });
        setSubmitting(false);
        return;
      }
      localStorage.setItem('medihug_patient', JSON.stringify({ name: intake.name, phone: intake.phone }));
      setSubmitting(false);
      setStep('done');
    } catch (err) {
      pushLog('handleIntakeDone error', { message: err instanceof Error ? err.message : String(err) });
      setSubmitErr({ message: err instanceof Error ? err.message : (mm ? 'ဆာဗာအမှား' : 'Server error') });
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="min-h-full flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin" style={{ color: PRIMARY }} /></div>;
  }
  if (!program) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center gap-3 py-24 text-center px-6">
        <p className="text-sm text-gray-500">{mm ? 'အစီအစဉ် ရှာမတွေ့ပါ' : 'Program not found'}</p>
        <button onClick={() => router.back()} className="text-sm font-semibold" style={{ color: PRIMARY }}>{mm ? 'နောက်သို့' : 'Go back'}</button>
      </div>
    );
  }

  const title = mm ? program.titleMm : (program.titleEn ?? program.titleMm);
  const desc  = mm ? program.descMm  : (program.descEn ?? program.descMm);

  /* ── Intake form screen ── */
  if (step === 'intake') {
    return (
      <div className="min-h-full bg-gray-50">
        <div className="max-w-2xl lg:max-w-5xl mx-auto px-4 lg:px-8 py-6">
          {submitErr && (
            <div className="mb-4 rounded-2xl border p-4 flex items-start gap-3" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: '#b91c1c' }}>{mm ? 'အမှားတစ်ခုဖြစ်ပွားသည်' : 'Something went wrong'}</p>
                <p className="text-xs mt-0.5" style={{ color: '#991b1b' }}>{submitErr.message}</p>
                <button
                  onClick={() => lastIntake && handleIntakeDone(lastIntake)}
                  disabled={!lastIntake}
                  className="mt-2.5 text-xs font-bold px-3.5 py-2 rounded-xl text-white flex items-center gap-1.5 disabled:opacity-50"
                  style={{ backgroundColor: '#dc2626' }}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {mm ? 'ထပ်ကြိုးစားရန်' : 'Try Again'}
                </button>
              </div>
            </div>
          )}
          <IntakeForm mm={mm} onDone={handleIntakeDone} />
          {submitting && (
            <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl px-6 py-4 text-sm font-semibold" style={{ color: PRIMARY }}>
                {mm ? 'တင်ပြနေသည်...' : 'Submitting...'}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── Success screen ── */
  if (step === 'done') {
    return (
      <div className="min-h-full bg-gray-50 flex flex-col items-center justify-center px-6 py-16 gap-6">
        <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2" style={{ color: PRIMARY }}>
            {mm ? 'တင်သွင်းပြီးပါပြီ' : 'Submitted!'}
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
            {mm
              ? 'သင့်ဆေးမှတ်တမ်းကို Super Admin မှ စစ်ဆေးနေပါသည်။ အတည်ပြုပြီးပါက အသိပေးပါမည်'
              : "Your medical record is under review by our team. You'll be notified once it's approved."}
          </p>
        </div>
        <button onClick={() => router.push('/patient/dashboard')} className="w-full max-w-sm py-4 rounded-2xl text-sm font-bold text-white"
          style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
          {mm ? 'ပင်မစာမျက်နှာသို့' : 'Back to Dashboard'}
        </button>
      </div>
    );
  }

  /* ── Purchase form ── */
  return (
    <div className="min-h-full bg-gray-50">
      <div
        className="-mt-18 pt-21 pb-6 px-4 w-full lg:mt-0 lg:pt-8 lg:px-8 lg:rounded-b-none"
        style={{ background: `linear-gradient(180deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
      >
        <div className="flex items-center gap-3 mb-1 max-w-2xl mx-auto">
          <button onClick={() => router.back()} className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">{mm ? 'အစီအစဉ် ဝယ်ယူရန်' : 'Enroll in Program'}</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 lg:px-8 py-5 pb-8 flex flex-col gap-4">
        {/* Program info */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="relative w-full h-40">
            <Image src={program.imageUrl} alt={title} fill className="object-cover" />
          </div>
          <div className="p-5 flex flex-col gap-3">
            <h2 className="text-lg font-bold" style={{ color: PRIMARY }}>{title}</h2>
            {desc && (
              <div className="prose prose-sm max-w-none text-gray-500 prose-headings:text-gray-700 prose-headings:font-bold">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{desc}</ReactMarkdown>
              </div>
            )}

            {program.doctors.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                  {mm ? 'ပါဝင်ဆောင်ရွက်မည့် ဆရာဝန်များ' : 'Doctors on this program'}
                </p>
                <div className="flex flex-col gap-2">
                  {program.doctors.map(d => (
                    <div key={d.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50">
                      <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-gray-100 bg-white flex items-center justify-center">
                        {d.imageUrl ? <Image src={d.imageUrl} alt={d.name} width={36} height={36} className="object-cover w-full h-full" /> : <Stethoscope className="w-4 h-4 text-gray-300" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-700 truncate">{mm ? d.name : (d.nameEn ?? d.name)}</p>
                        <p className="text-xs text-gray-400 truncate">{mm ? d.specialty : (d.specialtyEn ?? d.specialty)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between px-4 py-3 rounded-xl mt-1"
              style={{ background: `linear-gradient(135deg, ${PRIMARY}08 0%, ${SECONDARY}12 100%)`, border: `1px solid ${PRIMARY}15` }}>
              <span className="text-xs text-gray-500">{mm ? 'စျေးနှုန်း' : 'Price'}</span>
              <span className="text-xl font-bold" style={{ color: PRIMARY }}>{program.price.toLocaleString()} <span className="text-xs font-semibold text-gray-400">MMK</span></span>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" style={{ color: SECONDARY }} />
            <p className="text-sm font-bold" style={{ color: PRIMARY }}>{mm ? 'ငွေပေးချေမှု' : 'Payment'}</p>
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

          {(() => {
            const selected = PAYMENT_METHODS.find(p => p.id === payMethod)!;
            if (selected.id !== 'cb') {
              return (
                <div className="px-4 py-4 rounded-xl flex flex-col items-center gap-2" style={{ backgroundColor: '#f8faff', border: `1px dashed ${PRIMARY}40` }}>
                  <p className="text-xs font-bold" style={{ color: PRIMARY }}>MMQR</p>
                  <div className="w-40 h-40 rounded-xl overflow-hidden border border-gray-100 bg-white flex items-center justify-center">
                    <Image src="/payment/mmqr.jpg" alt="MMQR" width={160} height={160} className="object-contain w-full h-full" />
                  </div>
                  <p className="text-xs text-gray-500 text-center">{mm ? 'MMQR ကို စကင်ဖတ်ပြီး ငွေလွှဲပေးပါ' : 'Scan the MMQR to pay'}</p>
                </div>
              );
            }
            return (
              <div className="px-4 py-4 rounded-xl flex flex-col items-center gap-2 text-center" style={{ backgroundColor: '#f8faff', border: `1px dashed ${PRIMARY}40` }}>
                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-gray-100 bg-white flex items-center justify-center">
                  <Image src={selected.img} alt={selected.label} width={40} height={40} className="object-contain w-full h-full" />
                </div>
                <p className="text-xs font-bold" style={{ color: PRIMARY }}>{selected.label}</p>
                <p className="text-xs text-gray-500">
                  {mm ? 'ငွေချေမှု အောင်မြင်မှ ဆေးမှတ်တမ်း ဖြည့်ရပါမည်' : "You'll pay first, then fill in the medical form once payment succeeds."}
                </p>
              </div>
            );
          })()}

          {payMethod !== 'cb' && (
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

        {/* Submit */}
        {payMethod === 'cb' && cbPhase === 'paying' ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${PRIMARY}30`, borderTopColor: PRIMARY }} />
            <p className="text-xs font-semibold text-gray-500 text-center">
              {mm ? 'CBPay app တွင် PIN နှိပ်ပြီး ငွေချေရန် စောင့်နေပါသည်...' : 'Waiting for you to approve payment in the CBPay app...'}
            </p>
            {cbAppMissing && (
              <p className="text-xs text-red-500 font-semibold text-center">
                {mm ? 'ဤစက်ပေါ်တွင် CBPay app ကို ရှာမတွေ့ပါ' : 'CBPay app not found on this device.'}
              </p>
            )}
            {cbDeeplink && (
              <button type="button" onClick={retryDeeplink} className="text-xs font-bold underline" style={{ color: PRIMARY }}>
                {mm ? 'ထပ်ကြိုးစားရန်' : 'Try again'}
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {payMethod === 'cb' && cbPhase === 'failed' && (
              <p className="text-center text-xs text-red-500 font-semibold">{mm ? '⚠ ငွေချေမှု မအောင်မြင်ပါ။ ထပ်စမ်းကြည့်ပါ' : '⚠ Payment was not successful. Please try again.'}</p>
            )}
            {payMethod !== 'cb' && !receipt && (
              <p className="text-center text-xs text-amber-500 font-semibold">{mm ? '⚠ ငွေပေးချေပြေစာ တင်ရန် လိုအပ်သည်' : '⚠ Please upload payment receipt to continue'}</p>
            )}
            <button
              onClick={handleSubmit}
              disabled={payMethod === 'cb' ? false : !receipt}
              className="w-full py-4 rounded-2xl text-sm font-bold text-white transition-all"
              style={{
                background: (payMethod === 'cb' || receipt) ? `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` : '#d1d5db',
                cursor: (payMethod === 'cb' || receipt) ? 'pointer' : 'not-allowed',
              }}
            >
              {payMethod === 'cb' ? (mm ? 'CB Pay ဖြင့် ငွေချေမည်' : 'Pay with CB Pay') : (mm ? 'ဝယ်ယူရန်' : 'Enroll Now')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
