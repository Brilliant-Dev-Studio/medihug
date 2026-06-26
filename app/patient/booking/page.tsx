'use client';

import { useState, useRef, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronLeft, Calendar, Clock, User, Stethoscope,
  Upload, Image as ImageIcon, CheckCircle2, X, FileText,
  CreditCard, Smartphone, Building2,
} from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';

const PRIMARY   = '#0d2b6e';
const SECONDARY = '#1a6bcc';
const ACCENT    = '#4facfe';

const PAYMENT_METHODS = [
  { id: 'kpay',    icon: '🟣', label: 'KPay',          number: '09 xxx xxx xxx' },
  { id: 'wavepay', icon: '🔵', label: 'Wave Pay',       number: '09 xxx xxx xxx' },
  { id: 'aya',     icon: '🏦', label: 'AYA Pay',        number: '09 xxx xxx xxx' },
  { id: 'cb',      icon: '🏦', label: 'CB Pay',         number: '09 xxx xxx xxx' },
];

export default function BookingPage() {
  return (
    <Suspense>
      <BookingContent />
    </Suspense>
  );
}

function BookingContent() {
  const router       = useRouter();
  const params       = useSearchParams();
  const { lang }     = useLang();
  const mm           = lang === 'mm';

  /* ── URL params passed from doctor detail page ── */
  const doctorId     = params.get('doctorId')    ?? '1';
  const doctorName   = params.get('name')        ?? 'Prof. Dr. Thein Aung';
  const doctorNameMm = params.get('nameMm')      ?? 'ပါမောက္ခသိန်းအောင်';
  const spec         = params.get('spec')        ?? 'Pediatric Specialist';
  const specMm       = params.get('specMm')      ?? 'ကလေးကျန်းမာရေးအထူးကု';
  const img          = params.get('img')         ?? 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face';
  const date         = params.get('date')        ?? 'Fri 27 Jun';
  const slotStart    = params.get('start')       ?? '09:00';
  const slotEnd      = params.get('end')         ?? '';
  const duration     = params.get('duration')    ?? '';
  const fee          = params.get('fee')         ?? '22,000';

  /* ── local state ── */
  const [payMethod,  setPayMethod]  = useState<string>('kpay');
  const [receipt,    setReceipt]    = useState<{ file: File; url: string } | null>(null);
  const [dragOver,   setDragOver]   = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [note,       setNote]       = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const timeLabel = slotEnd
    ? `${slotStart} → ${slotEnd}${duration ? ` (${duration})` : ''}`
    : slotStart;

  function handleFile(file: File) {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') return;
    setReceipt({ file, url: URL.createObjectURL(file) });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleSubmit() {
    if (!receipt) return;
    setSubmitted(true);
  }

  /* ── Success screen ── */
  if (submitted) {
    return (
      <div className="min-h-full bg-gray-50 flex flex-col items-center justify-center px-6 py-16 gap-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}
        >
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2" style={{ color: PRIMARY }}>
            {mm ? 'ချိန်းဆိုမှု တင်ပြပြီး' : 'Booking Submitted!'}
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
            {mm
              ? 'ဆရာဝန် အတည်ပြုပြီးနောက် SMS / Notification ဖြင့် အသိပေးပါမည်'
              : 'You will be notified via SMS or notification once the doctor confirms.'}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 w-full max-w-sm flex flex-col gap-3">
          <Row icon={<User className="w-4 h-4" style={{ color: SECONDARY }} />}
            label={mm ? 'ဆရာဝန်' : 'Doctor'}
            value={mm ? doctorNameMm : doctorName} />
          <Row icon={<Calendar className="w-4 h-4" style={{ color: SECONDARY }} />}
            label={mm ? 'ရက်စွဲ' : 'Date'}
            value={date} />
          <Row icon={<Clock className="w-4 h-4" style={{ color: SECONDARY }} />}
            label={mm ? 'အချိန်' : 'Time'}
            value={timeLabel} />
        </div>
        <button
          onClick={() => router.push('/patient/appointments')}
          className="w-full max-w-sm py-4 rounded-2xl text-sm font-bold text-white"
          style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}
        >
          {mm ? 'ချိန်းဆိုမှုများ ကြည့်ရန်' : 'View My Appointments'}
        </button>
        <button onClick={() => router.push('/patient/dashboard')} className="text-sm text-gray-400">
          {mm ? 'ပင်မစာမျက်နှာသို့' : 'Back to Dashboard'}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 lg:bg-gray-100">

      {/* ══ DESKTOP ══ */}
      <div className="hidden lg:flex gap-5 h-screen overflow-hidden px-6 py-6 max-w-5xl mx-auto">
        <div className="flex-1 overflow-y-auto rounded-2xl bg-gray-50 flex flex-col">

          {/* Hero header */}
          <div
            className="px-8 pt-8 pb-6 rounded-t-2xl shrink-0"
            style={{ background: `linear-gradient(180deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}
          >
            <div className="flex items-center gap-3 mb-1">
              <button
                onClick={() => router.back()}
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <h1 className="text-2xl font-bold text-white">
                {mm ? 'ချိန်းဆိုမှု အတည်ပြုရန်' : 'Confirm Booking'}
              </h1>
            </div>
            <p className="text-white/60 text-sm ml-11">
              {mm ? 'အချက်အလက်စစ်ဆေးပြီး ငွေချေပါ' : 'Review details and complete payment'}
            </p>
          </div>

          <div className="p-6 flex flex-col gap-5">
            <BookingInfoCard mm={mm} doctorName={doctorName} doctorNameMm={doctorNameMm}
              spec={spec} specMm={specMm} img={img} date={date} timeLabel={timeLabel} fee={fee} />
            <NoteCard mm={mm} note={note} setNote={setNote} />
            <PaymentCard mm={mm} payMethod={payMethod} setPayMethod={setPayMethod}
              receipt={receipt} setReceipt={setReceipt} dragOver={dragOver}
              setDragOver={setDragOver} fileRef={fileRef} handleFile={handleFile}
              handleDrop={handleDrop} fee={fee} />
          </div>

          {/* Submit bar */}
          <div className="mt-auto px-6 pb-6">
            <SubmitBar mm={mm} receipt={receipt} fee={fee} onSubmit={handleSubmit} />
          </div>
        </div>
      </div>

      {/* ══ MOBILE ══ */}
      <div className="lg:hidden pb-40">
        {/* Hero */}
        <div
          className="-mt-18 pt-21 pb-6 px-4 w-full"
          style={{
            background: `linear-gradient(180deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
          }}
        >
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">
              {mm ? 'ချိန်းဆိုမှု အတည်ပြုရန်' : 'Confirm Booking'}
            </h1>
          </div>
          <p className="text-white/60 text-sm ml-11">
            {mm ? 'အချက်အလက်စစ်ဆေးပြီး ငွေချေပါ' : 'Review details and complete payment'}
          </p>
        </div>

        <div className="px-4 pt-5 flex flex-col gap-4">
          <BookingInfoCard mm={mm} doctorName={doctorName} doctorNameMm={doctorNameMm}
            spec={spec} specMm={specMm} img={img} date={date} timeLabel={timeLabel} fee={fee} />
          <NoteCard mm={mm} note={note} setNote={setNote} />
          <PaymentCard mm={mm} payMethod={payMethod} setPayMethod={setPayMethod}
            receipt={receipt} setReceipt={setReceipt} dragOver={dragOver}
            setDragOver={setDragOver} fileRef={fileRef} handleFile={handleFile}
            handleDrop={handleDrop} fee={fee} />
        </div>

        {/* Fixed bottom submit */}
        <div
          className="fixed bottom-16 left-0 right-0 px-4 pt-3 pb-4 border-t border-gray-100 z-30"
          style={{ backgroundColor: '#fff', boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}
        >
          <SubmitBar mm={mm} receipt={receipt} fee={fee} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}

/* ── shared sub-components ── */

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#eff6ff' }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
}

function BookingInfoCard({ mm, doctorName, doctorNameMm, spec, specMm, img, date, timeLabel, fee }: {
  mm: boolean; doctorName: string; doctorNameMm: string; spec: string; specMm: string;
  img: string; date: string; timeLabel: string; fee: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Doctor row */}
      <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-50">
        <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-gray-100">
          <Image src={img} alt={doctorName} width={56} height={56} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-base leading-tight truncate" style={{ color: PRIMARY }}>
            {mm ? doctorNameMm : doctorName}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">{mm ? specMm : spec}</p>
        </div>
      </div>
      {/* Details */}
      <div className="px-5 py-4 flex flex-col gap-3.5">
        <Row icon={<Calendar className="w-4 h-4" style={{ color: PRIMARY }} />}
          label={mm ? 'ရက်စွဲ' : 'Date'} value={date} />
        <Row icon={<Clock className="w-4 h-4" style={{ color: PRIMARY }} />}
          label={mm ? 'အချိန်' : 'Time'} value={timeLabel} />
        <Row icon={<Stethoscope className="w-4 h-4" style={{ color: PRIMARY }} />}
          label={mm ? 'ကုသမှုအမျိုးအစား' : 'Consultation'} value={mm ? 'ဆရာဝန်နှင့် တိုင်ပင်ခြင်း' : 'Doctor Consultation'} />
      </div>
      {/* Fee banner */}
      <div
        className="mx-4 mb-4 px-4 py-3 rounded-xl flex items-center justify-between"
        style={{ backgroundColor: '#eff6ff' }}
      >
        <span className="text-sm font-semibold" style={{ color: PRIMARY }}>
          {mm ? 'တိုင်ပင်ဆွေးနွေးခ' : 'Consultation Fee'}
        </span>
        <span className="text-lg font-bold" style={{ color: PRIMARY }}>
          {fee} <span className="text-xs font-semibold text-gray-400">MMK</span>
        </span>
      </div>
    </div>
  );
}

function NoteCard({ mm, note, setNote }: { mm: boolean; note: string; setNote: (v: string) => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-4 h-4" style={{ color: SECONDARY }} />
        <p className="text-sm font-bold" style={{ color: PRIMARY }}>
          {mm ? 'မှတ်ချက် (မဖြစ်မနေ မဟုတ်)' : 'Note (optional)'}
        </p>
      </div>
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        rows={3}
        placeholder={mm ? 'ဆရာဝန်ထံ ကြိုတင်ပြောလိုသည့် အကြောင်းအရာ...' : 'Anything the doctor should know in advance...'}
        className="w-full text-sm text-gray-700 placeholder-gray-300 resize-none outline-none rounded-xl border border-gray-100 px-3 py-2.5 focus:border-blue-200 transition-colors"
      />
    </div>
  );
}

function PaymentCard({ mm, payMethod, setPayMethod, receipt, setReceipt, dragOver, setDragOver,
  fileRef, handleFile, handleDrop, fee }: {
  mm: boolean; payMethod: string; setPayMethod: (v: string) => void;
  receipt: { file: File; url: string } | null; setReceipt: (v: null) => void;
  dragOver: boolean; setDragOver: (v: boolean) => void;
  fileRef: React.RefObject<HTMLInputElement | null>;
  handleFile: (f: File) => void; handleDrop: (e: React.DragEvent) => void;
  fee: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
      {/* Section title */}
      <div className="flex items-center gap-2">
        <CreditCard className="w-4 h-4" style={{ color: SECONDARY }} />
        <p className="text-sm font-bold" style={{ color: PRIMARY }}>
          {mm ? 'ငွေပေးချေမှု' : 'Payment'}
        </p>
      </div>

      {/* Amount reminder */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-xl"
        style={{ background: `linear-gradient(135deg, ${PRIMARY}08 0%, ${SECONDARY}12 100%)`, border: `1px solid ${PRIMARY}15` }}
      >
        <span className="text-xs text-gray-500">{mm ? 'ပေးရမည့်ငွေ' : 'Amount to pay'}</span>
        <span className="text-xl font-bold" style={{ color: PRIMARY }}>{fee} <span className="text-xs font-semibold text-gray-400">MMK</span></span>
      </div>

      {/* Payment method selector */}
      <div>
        <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
          {mm ? 'ငွေပေးချေနည်း ရွေးပါ' : 'Select payment method'}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {PAYMENT_METHODS.map(pm => {
            const active = payMethod === pm.id;
            return (
              <button
                key={pm.id}
                onClick={() => setPayMethod(pm.id)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all"
                style={{
                  backgroundColor: active ? '#eff6ff' : '#fafafa',
                  borderColor: active ? PRIMARY : '#e5e7eb',
                  boxShadow: active ? `0 0 0 1px ${PRIMARY}` : 'none',
                }}
              >
                <span className="text-xl leading-none">{pm.icon}</span>
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

      {/* QR / account info for selected method */}
      <div
        className="px-4 py-3 rounded-xl flex items-center gap-3"
        style={{ backgroundColor: '#f8faff', border: '1px dashed #bfdbfe' }}
      >
        <Smartphone className="w-5 h-5 shrink-0" style={{ color: SECONDARY }} />
        <div>
          <p className="text-xs font-bold" style={{ color: PRIMARY }}>
            {PAYMENT_METHODS.find(p => p.id === payMethod)?.label}
          </p>
          <p className="text-xs text-gray-500">
            {mm ? 'ဤနံပါတ်သို့ ငွေလွှဲပေးပါ → ' : 'Transfer to → '}
            <span className="font-bold text-gray-700">
              {PAYMENT_METHODS.find(p => p.id === payMethod)?.number}
            </span>
          </p>
        </div>
      </div>

      {/* Receipt upload */}
      <div>
        <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
          {mm ? 'ငွေလွှဲပြေစာ တင်ပါ' : 'Upload payment receipt'}
        </p>

        {receipt ? (
          <div className="relative rounded-2xl overflow-hidden border border-gray-100" style={{ height: 180 }}>
            <Image src={receipt.url} alt="receipt" fill className="object-contain bg-gray-50" />
            <button
              onClick={() => setReceipt(null)}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
            <div
              className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center gap-2"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)' }}
            >
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
            style={{
              borderColor: dragOver ? PRIMARY : '#d1d5db',
              backgroundColor: dragOver ? '#eff6ff' : '#fafafa',
            }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: '#eff6ff' }}
            >
              <Upload className="w-5 h-5" style={{ color: PRIMARY }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: PRIMARY }}>
                {mm ? 'ပုံ / PDF တင်ရန် နှိပ်ပါ' : 'Tap to upload image or PDF'}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {mm ? 'သို့မဟုတ် ဤနေရာသို့ ဆွဲချပါ' : 'or drag and drop here'}
              </p>
            </div>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>
    </div>
  );
}

function SubmitBar({ mm, receipt, fee, onSubmit }: {
  mm: boolean; receipt: { file: File; url: string } | null; fee: string; onSubmit: () => void;
}) {
  const canSubmit = receipt !== null;
  return (
    <div className="flex flex-col gap-2">
      {!receipt && (
        <p className="text-center text-xs text-amber-500 font-semibold">
          {mm ? '⚠ ငွေပေးချေပြေစာ တင်ရန် လိုအပ်သည်' : '⚠ Please upload payment receipt to continue'}
        </p>
      )}
      <button
        onClick={onSubmit}
        disabled={!canSubmit}
        className="w-full py-4 rounded-2xl text-sm font-bold text-white transition-all"
        style={{
          background: canSubmit
            ? `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`
            : '#d1d5db',
          cursor: canSubmit ? 'pointer' : 'not-allowed',
        }}
      >
        {mm ? 'ချိန်းဆိုမှု တင်ပြမည်' : 'Submit Booking'}
      </button>
    </div>
  );
}
