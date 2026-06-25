'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Calendar, Clock, Video, X, ChevronRight,
  CheckCircle2, Star, RotateCcw, Ban, AlertCircle,
} from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';

const PRIMARY   = '#0d2b6e';
const SECONDARY = '#1a6bcc';
const ACCENT    = '#4facfe';

/* ─────────────────── types ─────────────────── */
type Status = 'pending_payment' | 'waiting_doctor' | 'confirmed' | 'ready';
type PastStatus = 'completed' | 'cancelled' | 'no_show';

type Appointment = {
  id: number;
  doctor: string;
  specialty_en: string;
  specialty_mm: string;
  avatar: string;
  time_en: string;
  time_mm: string;
  status: Status;
  fee: string;
};

type PastAppointment = {
  id: number;
  doctor: string;
  specialty_en: string;
  specialty_mm: string;
  avatar: string;
  date_en: string;
  date_mm: string;
  status: PastStatus;
  rating?: number;
  fee: string;
  note_en?: string;
  note_mm?: string;
};

/* ─────────────────── data ─────────────────── */
const UPCOMING: Appointment[] = [
  {
    id: 1,
    doctor: 'Dr. Khin Maung',
    specialty_en: 'Cardiologist',       specialty_mm: 'နှလုံးရောဂါ အထူးကု',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&crop=face',
    time_en: 'Tomorrow at 10:00 AM',    time_mm: 'မနက်ဖြန် နံနက် ၁၀:၀၀',
    status: 'pending_payment',
    fee: '15,000 Ks',
  },
  {
    id: 2,
    doctor: 'Dr. Aung Myo',
    specialty_en: 'Neurologist',        specialty_mm: 'အာရုံကြောရောဂါ အထူးကု',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=80&h=80&fit=crop&crop=face',
    time_en: 'June 28, 2026 at 01:00 PM', time_mm: 'ဇွန် ၂၈၊ ၂၀၂၆ နေ့လည် ၁:၀၀',
    status: 'waiting_doctor',
    fee: '20,000 Ks',
  },
  {
    id: 3,
    doctor: 'Dr. Thura Nyi',
    specialty_en: 'Senior Physiotherapist', specialty_mm: 'ရုပ်ပိုင်းဆိုင်ရာ ကုသရေး အထူးကု',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&crop=face',
    time_en: 'Next Monday at 02:00 PM', time_mm: 'နောက်တနင်္လာနေ့ နေ့လည် ၂:၀၀',
    status: 'confirmed',
    fee: '12,000 Ks',
  },
  {
    id: 4,
    doctor: 'Dr. Su Su Lwin',
    specialty_en: 'General Practitioner', specialty_mm: 'ယေဘုယျ ဆေးကုသ',
    avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=80&h=80&fit=crop&crop=face',
    time_en: 'Today at 03:30 PM',       time_mm: 'ယနေ့ ညနေ ၃:၃၀',
    status: 'ready',
    fee: '8,000 Ks',
  },
];

const PAST: PastAppointment[] = [
  {
    id: 101,
    doctor: 'Dr. Khin Maung',
    specialty_en: 'Cardiologist',       specialty_mm: 'နှလုံးရောဂါ အထူးကု',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&crop=face',
    date_en: 'Jun 10, 2026 • 10:00 AM', date_mm: 'ဇွန် ၁၀၊ ၂၀၂၆ • နံနက် ၁၀:၀၀',
    status: 'completed', rating: 5, fee: '15,000 Ks',
    note_en: 'ECG follow-up. Prescribed Amlodipine 5mg.',
    note_mm: 'ECG စစ်ဆေးမှု ဆက်လက်ကုသ။ Amlodipine 5mg ညွှန်ကြားသည်။',
  },
  {
    id: 102,
    doctor: 'Dr. Aung Myo',
    specialty_en: 'Neurologist',        specialty_mm: 'အာရုံကြောရောဂါ အထူးကု',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=80&h=80&fit=crop&crop=face',
    date_en: 'May 22, 2026 • 02:00 PM', date_mm: 'မေ ၂၂၊ ၂၀၂၆ • နေ့လည် ၂:၀၀',
    status: 'completed', rating: 4, fee: '20,000 Ks',
    note_en: 'Migraine assessment. CT scan recommended.',
    note_mm: 'ခေါင်းတဆတ်ဆတ်နာ စစ်ဆေးမှု။ CT scan ပြုလုပ်ရန် ညွှန်ကြားသည်။',
  },
  {
    id: 103,
    doctor: 'Dr. Thura Nyi',
    specialty_en: 'Senior Physiotherapist', specialty_mm: 'ရုပ်ပိုင်းဆိုင်ရာ ကုသရေး အထူးကု',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&crop=face',
    date_en: 'May 5, 2026 • 11:00 AM',  date_mm: 'မေ ၅၊ ၂၀၂၆ • နံနက် ၁၁:၀၀',
    status: 'cancelled', fee: '12,000 Ks',
  },
  {
    id: 104,
    doctor: 'Dr. Su Su Lwin',
    specialty_en: 'General Practitioner', specialty_mm: 'ယေဘုယျ ဆေးကုသ',
    avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=80&h=80&fit=crop&crop=face',
    date_en: 'Apr 18, 2026 • 09:30 AM', date_mm: 'ဧပြီ ၁၈၊ ၂၀၂၆ • နံနက် ၉:၃၀',
    status: 'no_show', fee: '8,000 Ks',
  },
];

/* ─────────────────── status config ─────────────────── */
const STATUS_CONFIG: Record<Status, {
  badgeEn: string; badgeMm: string; pillBg: string; pillText: string;
  alertEn: string; alertMm: string;
}> = {
  pending_payment: {
    badgeEn: 'Pending Payment',    badgeMm: 'ငွေပေးချေမှု စောင့်ဆိုင်းနေသည်',
    pillBg: '#f59e0b', pillText: '#fff',
    alertEn: 'Super Admin is actively verifying your 10% mobile wallet deposit slip.',
    alertMm: 'Admin မှ သင်၏ ငွေပေးချေမှု ၁၀% ဖုန်းဘဏ် ငွေသွင်းဂါမြောက်ကို စစ်ဆေးနေသည်။',
  },
  waiting_doctor: {
    badgeEn: 'Waiting for Doctor', badgeMm: 'ဆရာဝန် လက်ခံမှု စောင့်ဆိုင်းနေသည်',
    pillBg: '#3b82f6', pillText: '#fff',
    alertEn: 'Payment verified by Admin. Waiting for the doctor to accept this schedule slot.',
    alertMm: 'Admin မှ ငွေပေးချေမှု အတည်ပြုပြီး။ ဆရာဝန် ချိန်းဆိုချိန် လက်ခံမှုကို စောင့်ဆိုင်းနေသည်။',
  },
  confirmed: {
    badgeEn: 'Confirmed',          badgeMm: 'အတည်ပြုပြီး',
    pillBg: '#10b981', pillText: '#fff',
    alertEn: 'Appointment locked in. Video room opens 15 min before the session.',
    alertMm: 'ချိန်းဆိုမှု အတည်ပြုပြီး။ ဗီဒီယိုခန်းကို session မစမီ မိနစ် ၁၅ ခန့်တွင် ဖွင့်ပေးမည်။',
  },
  ready: {
    badgeEn: 'Ready to Join',      badgeMm: 'ဝင်ရောက်ရန် အသင့်ဖြစ်သည်',
    pillBg: PRIMARY, pillText: '#fff',
    alertEn: 'Your doctor is online. The live session is open — join immediately.',
    alertMm: 'ဆရာဝန် online ဝင်ရောက်နေပြီ။ Live session ဖွင့်ထားသည် — ချက်ချင်းဝင်ပါ။',
  },
};

const PAST_CONFIG: Record<PastStatus, { en: string; mm: string; pillBg: string; pillText: string; icon: React.ElementType }> = {
  completed: { en: 'Completed', mm: 'ပြီးဆုံးသည်',   pillBg: '#10b981', pillText: '#fff', icon: CheckCircle2 },
  cancelled:  { en: 'Cancelled', mm: 'ပယ်ဖျက်သည်',   pillBg: '#9ca3af', pillText: '#fff', icon: Ban          },
  no_show:    { en: 'No Show',   mm: 'မပေါ်လာခဲ့ပါ', pillBg: '#ef4444', pillText: '#fff', icon: AlertCircle  },
};

/* ─────────────────── sub-components ─────────────────── */

function UpcomingCard({ appt, mm }: { appt: Appointment; mm: boolean }) {
  const cfg = STATUS_CONFIG[appt.status];

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">

      {/* ── Mobile layout ── */}
      <div className="lg:hidden px-4 py-4 flex flex-col gap-3">
        {/* Top row: avatar + name */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-gray-100">
            <Image src={appt.avatar} alt={appt.doctor} width={48} height={48} className="object-cover w-full h-full" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold text-gray-800 leading-tight">{appt.doctor}</p>
            <p className="text-xs text-gray-400 mt-0.5">{mm ? appt.specialty_mm : appt.specialty_en}</p>
          </div>
        </div>
        {/* Time + fee */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5 text-gray-300" />{mm ? appt.time_mm : appt.time_en}
          </span>
          <span className="text-xs font-bold" style={{ color: PRIMARY }}>{appt.fee}</span>
        </div>
        {/* Alert */}
        <p className="text-xs text-gray-400 leading-relaxed">{mm ? cfg.alertMm : cfg.alertEn}</p>
        {/* Status pill + action buttons */}
        <div className="flex items-center justify-between gap-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: cfg.pillBg, color: cfg.pillText }}>
            {mm ? cfg.badgeMm : cfg.badgeEn}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {appt.status === 'ready' && (
              <a href="#" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
                <Video className="w-3.5 h-3.5" />{mm ? 'ဝင်ရောက်မည်' : 'Join Now'}
              </a>
            )}
            {appt.status === 'confirmed' && (
              <button disabled className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 border border-gray-100 cursor-not-allowed">
                <Video className="w-3.5 h-3.5" />{mm ? 'မဖွင့်ရသေး' : 'Not Open'}
              </button>
            )}
            {appt.status === 'pending_payment' && (
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 border border-red-200 hover:bg-red-50 transition-colors">
                <X className="w-3.5 h-3.5" />{mm ? 'ပယ်ဖျက်မည်' : 'Cancel'}
              </button>
            )}
            <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Desktop layout ── */}
      <div className="hidden lg:flex flex-1 px-6 py-5 items-center gap-5 min-w-0">
        <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-gray-100">
          <Image src={appt.avatar} alt={appt.doctor} width={56} height={56} className="object-cover w-full h-full" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-lg font-bold text-gray-800">{appt.doctor}</p>
            <span className="text-sm text-gray-400 font-medium">{mm ? appt.specialty_mm : appt.specialty_en}</span>
          </div>
          <div className="flex items-center gap-4 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              <Clock className="w-4 h-4 text-gray-300" />{mm ? appt.time_mm : appt.time_en}
            </span>
            <span className="text-sm font-bold" style={{ color: PRIMARY }}>{appt.fee}</span>
          </div>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">{mm ? cfg.alertMm : cfg.alertEn}</p>
        </div>
        <div className="shrink-0 flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap"
            style={{ backgroundColor: cfg.pillBg, color: cfg.pillText }}>
            {mm ? cfg.badgeMm : cfg.badgeEn}
          </span>
          {appt.status === 'ready' && (
            <a href="#" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
              <Video className="w-4 h-4" />{mm ? 'ဝင်ရောက်မည်' : 'Join Now'}
            </a>
          )}
          {appt.status === 'confirmed' && (
            <button disabled className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-300 border border-gray-100 cursor-not-allowed">
              <Video className="w-4 h-4" />{mm ? 'မဖွင့်ရသေး' : 'Not Open Yet'}
            </button>
          )}
          {appt.status === 'pending_payment' && (
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-red-400 border border-red-200 hover:bg-red-50 transition-colors">
              <X className="w-4 h-4" />{mm ? 'ပယ်ဖျက်မည်' : 'Cancel'}
            </button>
          )}
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function PastCard({ appt, mm }: { appt: PastAppointment; mm: boolean }) {
  const cfg = PAST_CONFIG[appt.status];

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">

      {/* ── Mobile layout ── */}
      <div className="lg:hidden px-4 py-4 flex flex-col gap-3">
        {/* Top row: avatar + name */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-gray-100">
            <Image src={appt.avatar} alt={appt.doctor} width={48} height={48} className="object-cover w-full h-full" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold text-gray-800 leading-tight">{appt.doctor}</p>
            <p className="text-xs text-gray-400 mt-0.5">{mm ? appt.specialty_mm : appt.specialty_en}</p>
          </div>
        </div>
        {/* Date + fee */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5 text-gray-300" />{mm ? appt.date_mm : appt.date_en}
          </span>
          <span className="text-xs font-bold" style={{ color: PRIMARY }}>{appt.fee}</span>
        </div>
        {/* Note */}
        {(mm ? appt.note_mm : appt.note_en) && (
          <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{mm ? appt.note_mm : appt.note_en}</p>
        )}
        {/* Stars + status pill + action */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            {appt.rating !== undefined && (
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className="w-3 h-3" fill={s <= appt.rating! ? '#facc15' : 'none'} stroke="#facc15" />
                ))}
              </div>
            )}
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ backgroundColor: cfg.pillBg, color: cfg.pillText }}>
              {mm ? cfg.mm : cfg.en}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {appt.status === 'completed' && (
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                <RotateCcw className="w-3 h-3" />{mm ? 'ထပ်ချိန်းမည်' : 'Book Again'}
              </button>
            )}
            <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Desktop layout ── */}
      <div className="hidden lg:flex flex-1 px-6 py-5 items-center gap-5 min-w-0">
        <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-gray-100">
          <Image src={appt.avatar} alt={appt.doctor} width={56} height={56} className="object-cover w-full h-full" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-lg font-bold text-gray-800">{appt.doctor}</p>
            <span className="text-sm text-gray-400 font-medium">{mm ? appt.specialty_mm : appt.specialty_en}</span>
          </div>
          <div className="flex items-center gap-4 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              <Calendar className="w-4 h-4 text-gray-300" />{mm ? appt.date_mm : appt.date_en}
            </span>
            <span className="text-sm font-bold" style={{ color: PRIMARY }}>{appt.fee}</span>
          </div>
          {(mm ? appt.note_mm : appt.note_en) && (
            <p className="text-xs text-gray-400 mt-2 leading-relaxed line-clamp-1">{mm ? appt.note_mm : appt.note_en}</p>
          )}
        </div>
        <div className="shrink-0 flex items-center gap-3">
          {appt.rating !== undefined && (
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className="w-3.5 h-3.5" fill={s <= appt.rating! ? '#facc15' : 'none'} stroke="#facc15" />
              ))}
            </div>
          )}
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap"
            style={{ backgroundColor: cfg.pillBg, color: cfg.pillText }}>
            {mm ? cfg.mm : cfg.en}
          </span>
          {appt.status === 'completed' && (
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" />{mm ? 'ထပ်မံချိန်းဆိုမည်' : 'Book Again'}
            </button>
          )}
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── page ─────────────────── */
export default function AppointmentsPage() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const { lang } = useLang();
  const mm = lang === 'mm';

  return (
    <div className="min-h-full bg-slate-50 lg:bg-gray-100">

      {/* ══ DESKTOP ══ */}
      <div className="hidden lg:flex gap-5 h-screen overflow-hidden px-6 py-6 max-w-7xl mx-auto">

        {/* ── Left: main list ── */}
        <div className="flex-1 overflow-y-auto rounded-2xl bg-gray-50 flex flex-col min-w-0">

          {/* Compact gradient header */}
          <div className="px-6 pt-6 pb-5 rounded-t-2xl shrink-0"
            style={{ background: `linear-gradient(180deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">{mm ? 'ချိန်းဆိုမှုများ' : 'My Appointments'}</h1>
                <p className="text-white/55 text-xs mt-0.5">{mm ? 'ချိန်းဆိုမှုများကို စီမံခန့်ခွဲပါ' : 'Track and manage all your consultations'}</p>
              </div>
              <div className="flex gap-1 rounded-xl p-1" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
                {(['upcoming', 'past'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={tab === t
                      ? { backgroundColor: '#fff', color: PRIMARY }
                      : { color: 'rgba(255,255,255,0.65)' }
                    }
                  >
                    {t === 'upcoming'
                      ? `${mm ? 'လာမည့်' : 'Upcoming'} · ${UPCOMING.length}`
                      : `${mm ? 'မှတ်တမ်း' : 'Past History'} · ${PAST.length}`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 px-6 py-4 pb-8 flex flex-col gap-3">
            {tab === 'upcoming'
              ? UPCOMING.map(a => <UpcomingCard key={a.id} appt={a} mm={mm} />)
              : PAST.map(a => <PastCard key={a.id} appt={a} mm={mm} />)
            }
          </div>
        </div>

        {/* ── Right: stats sidebar ── */}
        <div className="shrink-0 w-64 flex flex-col gap-4">

          {/* Summary card */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{mm ? 'အကျဉ်းချုပ်' : 'Overview'}</p>
            </div>
            {[
              { en: 'Upcoming',  mm: 'လာမည့်',       value: UPCOMING.length,                               color: PRIMARY,   bg: `${PRIMARY}10` },
              { en: 'Completed', mm: 'ပြီးဆုံးသည်',  value: PAST.filter(p=>p.status==='completed').length, color: '#10b981', bg: '#d1fae5'       },
              { en: 'Cancelled', mm: 'ပယ်ဖျက်သည်',  value: PAST.filter(p=>p.status==='cancelled').length, color: '#6b7280', bg: '#f3f4f6'       },
              { en: 'No Show',   mm: 'မပေါ်လာခဲ့',   value: PAST.filter(p=>p.status==='no_show').length,   color: '#ef4444', bg: '#fee2e2'       },
            ].map(s => (
              <div key={s.en} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-xs text-gray-600">{mm ? s.mm : s.en}</span>
                </div>
                <span className="text-sm font-bold px-2.5 py-0.5 rounded-lg" style={{ backgroundColor: s.bg, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Next appointment card */}
          {UPCOMING[0] && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">{mm ? 'နောက်ထပ် ချိန်းဆိုမှု' : 'Next Appointment'}</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                  <Image src={UPCOMING[0].avatar} alt={UPCOMING[0].doctor} width={40} height={40} className="object-cover" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 leading-tight">{UPCOMING[0].doctor}</p>
                  <p className="text-[10px] text-slate-400">{mm ? UPCOMING[0].specialty_mm : UPCOMING[0].specialty_en}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
                <Clock className="w-3 h-3 text-slate-300" />{mm ? UPCOMING[0].time_mm : UPCOMING[0].time_en}
              </div>
              <div className="text-[11px] font-semibold mt-1" style={{ color: PRIMARY }}>{UPCOMING[0].fee}</div>
            </div>
          )}

          {/* Quick tip */}
          <div className="rounded-2xl p-4 border" style={{ backgroundColor: `${PRIMARY}08`, borderColor: `${PRIMARY}20` }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: PRIMARY }}>{mm ? 'သတိပေးချက်' : 'Reminder'}</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              {mm
                ? <>Video session မစမီ အနည်းဆုံး <span className="font-semibold text-slate-700">မိနစ် ၅</span> ကြိုတင် ဝင်ရောက်ပေးပါ။</>
                : <>Join your video session at least <span className="font-semibold text-slate-700">5 minutes early</span> to ensure a smooth consultation.</>
              }
            </p>
          </div>

        </div>
      </div>

      {/* ══ MOBILE ══ */}
      <div className="lg:hidden">
        <div className="-mt-18 pt-21 pb-5 px-4 w-full"
          style={{ background: `linear-gradient(180deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
          <h1 className="text-xl font-bold text-white mb-0.5">{mm ? 'ချိန်းဆိုမှုများ' : 'My Appointments'}</h1>
          <p className="text-white/60 text-xs mb-4">{mm ? 'ချိန်းဆိုမှုများကို စီမံခန့်ခွဲပါ' : 'Manage and track your consultations'}</p>

          <div className="grid grid-cols-3 gap-2">
            {[
              { en: 'Upcoming',  mm: 'လာမည့်',      value: UPCOMING.length },
              { en: 'Completed', mm: 'ပြီးဆုံး',    value: PAST.filter(p => p.status === 'completed').length },
              { en: 'Cancelled', mm: 'ပယ်ဖျက်',    value: PAST.filter(p => p.status !== 'completed').length },
            ].map(s => (
              <div key={s.en} className="rounded-xl px-3 py-2.5 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-[10px] text-white/60 mt-0.5">{mm ? s.mm : s.en}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 pt-4">
          <div className="flex gap-1 bg-white rounded-xl border border-slate-100 p-1 shadow-sm">
            {(['upcoming', 'past'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                style={tab === t ? { backgroundColor: PRIMARY, color: '#fff' } : { color: '#64748b' }}
              >
                {t === 'upcoming'
                  ? `${mm ? 'လာမည့်' : 'Upcoming'} (${UPCOMING.length})`
                  : `${mm ? 'မှတ်တမ်း' : 'Past History'} (${PAST.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="px-4 pt-4 pb-28 flex flex-col gap-3">
          {tab === 'upcoming'
            ? UPCOMING.map(a => <UpcomingCard key={a.id} appt={a} mm={mm} />)
            : PAST.map(a => <PastCard key={a.id} appt={a} mm={mm} />)
          }
        </div>
      </div>

    </div>
  );
}
