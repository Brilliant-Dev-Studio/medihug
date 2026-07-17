'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Calendar, Clock, Video, X, ChevronRight,
  CheckCircle2, Star, RotateCcw, Ban, FileText, CalendarX2,
} from 'lucide-react';
import Link from 'next/link';
import { useLang } from '../../lib/LanguageContext';

const PRIMARY   = 'var(--color-primary)';
const SECONDARY = 'var(--color-primary-dark)';

/* ─────────────────── types ─────────────────── */
type Status = 'pending_payment' | 'confirmed' | 'ready';
type PastStatus = 'completed' | 'cancelled';

type Appointment = {
  id: string;
  doctor: string;
  specialty_en: string;
  specialty_mm: string;
  avatar: string | null;
  time_en: string;
  time_mm: string;
  status: Status;
  fee: string;
};

type PastAppointment = {
  id: string;
  doctor: string;
  specialty_en: string;
  specialty_mm: string;
  avatar: string | null;
  date_en: string;
  date_mm: string;
  status: PastStatus;
  rating?: number;
  fee: string;
  note_en?: string;
  note_mm?: string;
};

/* ─────────────────── raw API shape ─────────────────── */
interface RawAppointment {
  id: string;
  date: string;
  time: string | null;
  reason: string | null;
  note: string | null;
  fee: number | null;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  doctorApproved: boolean;
  doctor: { name: string; nameEn: string | null; specialty: string; specialtyEn: string | null; imageUrl: string | null };
}

function fmtFee(fee: number | null): string {
  return fee ? `${fee.toLocaleString()} Ks` : '—';
}

function fmtDateTime(dateIso: string, time: string | null): string {
  const d = new Date(dateIso);
  const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return time ? `${dateStr} • ${time}` : dateStr;
}

/* ─────────────────── raw → view model ─────────────────── */
function splitAppointments(raw: RawAppointment[]): { upcoming: Appointment[]; past: PastAppointment[] } {
  const upcoming: Appointment[] = [];
  const past: PastAppointment[] = [];

  for (const a of raw) {
    const dt = fmtDateTime(a.date, a.time);
    const doctorName = a.doctor.nameEn ?? a.doctor.name;
    const specEn = a.doctor.specialtyEn ?? a.doctor.specialty;

    if (a.status === 'COMPLETED' || a.status === 'CANCELLED') {
      past.push({
        id: a.id,
        doctor: doctorName,
        specialty_en: specEn, specialty_mm: a.doctor.specialty,
        avatar: a.doctor.imageUrl,
        date_en: dt, date_mm: dt,
        status: a.status === 'COMPLETED' ? 'completed' : 'cancelled',
        fee: fmtFee(a.fee),
        note_en: a.note ?? a.reason ?? undefined,
        note_mm: a.note ?? a.reason ?? undefined,
      });
    } else {
      upcoming.push({
        id: a.id,
        doctor: doctorName,
        specialty_en: specEn, specialty_mm: a.doctor.specialty,
        avatar: a.doctor.imageUrl,
        time_en: dt, time_mm: dt,
        status: a.status === 'PENDING' ? 'pending_payment' : (a.doctorApproved ? 'ready' : 'confirmed'),
        fee: fmtFee(a.fee),
      });
    }
  }

  return { upcoming, past };
}

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
  confirmed: {
    badgeEn: 'Confirmed',          badgeMm: 'အတည်ပြုပြီး',
    pillBg: '#10b981', pillText: '#fff',
    alertEn: 'Appointment confirmed. The doctor will initiate the video call — please be ready at your scheduled time.',
    alertMm: 'ချိန်းဆိုမှု အတည်ပြုပြီး။ ဆရာဝန်မှ Video call ခေါ်ဆိုမည်ဖြစ်သောကြောင့် ချိန်းဆိုချိန်တွင် အဆင်သင့်နေပေးပါ။',
  },
  ready: {
    badgeEn: 'Ready to Join',      badgeMm: 'ဝင်ရောက်ရန် အသင့်ဖြစ်သည်',
    pillBg: PRIMARY, pillText: '#fff',
    alertEn: 'Your doctor is online and will call you now. Please accept the incoming video call.',
    alertMm: 'ဆရာဝန် online ဝင်ရောက်နေပြီ။ ယခု video call ခေါ်ဆိုမည် — incoming call ကို လက်ခံပေးပါ။',
  },
};

const PAST_CONFIG: Record<PastStatus, { en: string; mm: string; pillBg: string; pillText: string; icon: React.ElementType }> = {
  completed: { en: 'Completed', mm: 'ပြီးဆုံးသည်', pillBg: '#10b981', pillText: '#fff', icon: CheckCircle2 },
  cancelled: { en: 'Cancelled', mm: 'ပယ်ဖျက်သည်', pillBg: '#9ca3af', pillText: '#fff', icon: Ban          },
};

/* ─────────────────── sub-components ─────────────────── */

function Avatar({ src, name, size }: { src: string | null; name: string; size: number }) {
  if (src) {
    return <Image src={src} alt={name} width={size} height={size} className="object-cover w-full h-full" />;
  }
  return (
    <div className="w-full h-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: PRIMARY, fontSize: size * 0.35 }}>
      {name.split(' ').map(w => w[0]).join('').slice(0, 2)}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
      {/* Mobile */}
      <div className="lg:hidden px-4 py-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-3.5 w-32 bg-gray-100 rounded" />
            <div className="h-3 w-24 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-3 w-28 bg-gray-100 rounded" />
          <div className="h-3 w-16 bg-gray-100 rounded" />
        </div>
        <div className="h-6 w-28 bg-gray-100 rounded-full" />
      </div>
      {/* Desktop */}
      <div className="hidden lg:flex flex-1 px-6 py-5 items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-4 w-48 bg-gray-100 rounded" />
          <div className="h-3 w-64 bg-gray-100 rounded" />
        </div>
        <div className="w-24 h-7 bg-gray-100 rounded-full shrink-0" />
        <div className="w-24 h-9 bg-gray-100 rounded-lg shrink-0" />
      </div>
    </div>
  );
}

function EmptyList({ mm }: { mm: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <CalendarX2 className="w-8 h-8 text-gray-200" />
      <p className="text-sm text-gray-400">{mm ? 'ချိန်းဆိုမှု မရှိပါ' : 'No appointments here.'}</p>
    </div>
  );
}

function UpcomingCard({ appt, mm }: { appt: Appointment; mm: boolean }) {
  const cfg = STATUS_CONFIG[appt.status];

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">

      {/* ── Mobile layout ── */}
      <div className="lg:hidden px-4 py-4 flex flex-col gap-3">
        {/* Top row: avatar + name */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-gray-100">
            <Avatar src={appt.avatar} name={appt.doctor} size={48} />
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
        {/* Status badge — own row */}
        <span className="self-start px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap"
          style={{ backgroundColor: cfg.pillBg, color: cfg.pillText }}>
          {mm ? cfg.badgeMm : cfg.badgeEn}
        </span>
        {/* Action buttons row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {appt.status === 'ready' && (
              <Link href={`/patient/appointments/${appt.id}/call`} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
                <Video className="w-3.5 h-3.5" />{mm ? 'ဝင်ရောက်မည်' : 'Join Now'}
              </Link>
            )}
            {appt.status === 'confirmed' && (
              <button disabled className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-300 border border-gray-100 cursor-not-allowed">
                <Video className="w-3.5 h-3.5" />{mm ? 'မဖွင့်ရသေး' : 'Not Open'}
              </button>
            )}
            {appt.status === 'pending_payment' && (
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 border border-red-200 active:bg-red-50">
                <X className="w-3.5 h-3.5" />{mm ? 'ပယ်ဖျက်မည်' : 'Cancel'}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/patient/appointments/${appt.id}/form`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border"
              style={{ color: PRIMARY, borderColor: `${PRIMARY}30`, backgroundColor: `${PRIMARY}08` }}
            >
              <FileText className="w-3.5 h-3.5" />{mm ? 'ဆေးမှတ်တမ်း' : 'View Form'}
            </Link>
            <button className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-300 active:bg-gray-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Desktop layout ── */}
      <div className="hidden lg:flex flex-1 px-6 py-5 items-center gap-5 min-w-0">
        <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-gray-100">
          <Avatar src={appt.avatar} name={appt.doctor} size={56} />
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
          <Link
            href={`/patient/appointments/${appt.id}/form`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors"
            style={{ color: PRIMARY, borderColor: `${PRIMARY}30`, backgroundColor: `${PRIMARY}08` }}
          >
            <FileText className="w-4 h-4" />{mm ? 'ဆေးမှတ်တမ်း' : 'View Form'}
          </Link>
          {appt.status === 'ready' && (
            <Link href={`/patient/appointments/${appt.id}/call`} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
              <Video className="w-4 h-4" />{mm ? 'ဝင်ရောက်မည်' : 'Join Now'}
            </Link>
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
            <Avatar src={appt.avatar} name={appt.doctor} size={48} />
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
          <Avatar src={appt.avatar} name={appt.doctor} size={56} />
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
  const [loading, setLoading] = useState(true);
  const [hasPhone, setHasPhone] = useState(true);
  const [UPCOMING, setUpcoming] = useState<Appointment[]>([]);
  const [PAST, setPast] = useState<PastAppointment[]>([]);
  const { lang } = useLang();
  const mm = lang === 'mm';

  useEffect(() => {
    const stored = localStorage.getItem('medihug_patient');
    if (!stored) { setHasPhone(false); setLoading(false); return; }
    const { phone } = JSON.parse(stored) as { phone: string };
    fetch(`/api/patient/appointments?phone=${encodeURIComponent(phone)}`)
      .then(r => r.json())
      .then(d => {
        const { upcoming, past } = splitAppointments(d.appointments ?? []);
        setUpcoming(upcoming);
        setPast(past);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 lg:bg-gray-100">
        {/* Desktop */}
        <div className="hidden lg:flex gap-5 h-screen overflow-hidden px-6 py-6">
          <div className="flex-1 overflow-y-auto rounded-2xl bg-gray-50 flex flex-col min-w-0">
            <div className="px-6 pt-6 pb-5 rounded-t-2xl shrink-0 animate-pulse"
              style={{ background: `linear-gradient(180deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
              <div className="h-5 w-40 bg-white/25 rounded mb-2" />
              <div className="h-3 w-56 bg-white/15 rounded" />
            </div>
            <div className="flex-1 px-6 py-4 pb-8 flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
          <div className="shrink-0 w-64 flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 h-40 animate-pulse" />
            <div className="bg-white rounded-2xl border border-gray-100 h-32 animate-pulse" />
          </div>
        </div>
        {/* Mobile */}
        <div className="lg:hidden">
          <div className="-mt-18 pt-21 pb-5 px-4 w-full animate-pulse"
            style={{ background: `linear-gradient(180deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
            <div className="h-5 w-40 bg-white/25 rounded mb-2" />
            <div className="h-3 w-52 bg-white/15 rounded mb-4" />
            <div className="h-16 bg-white/10 rounded-xl" />
          </div>
          <div className="px-4 pt-4 pb-28 flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (!hasPhone) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center gap-4 py-24 px-6 text-center">
        <CalendarX2 className="w-10 h-10 text-gray-300" />
        <div>
          <p className="text-sm font-bold text-gray-600">{mm ? 'ချိန်းဆိုမှု မရှိသေးပါ' : 'No appointments yet'}</p>
          <p className="text-xs text-gray-400 mt-1">{mm ? 'ဆရာဝန်နှင့် ပထမဆုံး ချိန်းဆိုမှု ပြုလုပ်ပါ' : 'Book your first consultation to see it here'}</p>
        </div>
        <Link href="/patient/doctors" className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: PRIMARY }}>
          {mm ? 'ဆရာဝန်များ ကြည့်ရန်' : 'Browse Doctors'}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 lg:bg-gray-100">

      {/* ══ DESKTOP ══ */}
      <div className="hidden lg:flex gap-5 h-screen overflow-hidden px-6 py-6">

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
              ? (UPCOMING.length ? UPCOMING.map(a => <UpcomingCard key={a.id} appt={a} mm={mm} />) : <EmptyList mm={mm} />)
              : (PAST.length ? PAST.map(a => <PastCard key={a.id} appt={a} mm={mm} />) : <EmptyList mm={mm} />)
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
                  <Avatar src={UPCOMING[0].avatar} name={UPCOMING[0].doctor} size={40} />
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
            ? (UPCOMING.length ? UPCOMING.map(a => <UpcomingCard key={a.id} appt={a} mm={mm} />) : <EmptyList mm={mm} />)
            : (PAST.length ? PAST.map(a => <PastCard key={a.id} appt={a} mm={mm} />) : <EmptyList mm={mm} />)
          }
        </div>
      </div>

    </div>
  );
}
