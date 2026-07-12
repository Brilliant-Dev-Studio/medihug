'use client';
import { theme } from '../../../lib/theme';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart, ChevronLeft, GraduationCap, Languages, MapPin, Stethoscope,
  BriefcaseMedical, CheckCircle2, Hospital, Images, X,
  Sunrise, Sun, Sunset, Calendar, Clock,
} from 'lucide-react';
import { useLang } from '../../../lib/LanguageContext';
import { useFavorites } from '../../../lib/useFavorites';
import IdentifyModal from '../../../components/IdentifyModal';

const PRIMARY   = 'var(--color-primary)';
const SECONDARY = 'var(--color-primary-dark)';
const ACCENT    = 'var(--color-accent)';

const AVATAR_COLORS = ['#0d2b6e','#f59e0b','#22c55e','#a855f7','#ef4444','#ec4899','#2ab5ad','#3b82f6','#10b981'];

interface DoctorSlot {
  id: string; dayOfWeek: number; startTime: string; endTime: string; duration: number; maxPerSlot: number;
}
interface DoctorGallery {
  id: string; imageUrl: string; captionMm: string | null; captionEn: string | null; order: number;
}
interface Doctor {
  id: string; name: string; nameEn: string | null;
  specialty: string; experience: number; price: number;
  imageUrl: string | null; isAvailable: boolean;
  rating: number; reviewCount: number;
  bio: string | null; phone: string | null;
  qualifications: string | null;
  careerMm: string | null; careerEn: string | null;
  clinicNote: string | null; clinicNoteEn: string | null;
  clinicTypesMm: string[]; clinicTypesEn: string[];
  languages: string[]; location: string | null;
  slots: DoctorSlot[];
  gallery: DoctorGallery[];
}

type Tab = 'profile' | 'schedule';

function gen15Min(startTime: string, endTime: string): string[] {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const endTotal = eh * 60 + em;
  const slots: string[] = [];
  let total = sh * 60 + sm;
  while (total < endTotal) {
    const h = Math.floor(total / 60);
    const m = total % 60;
    slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
    total += 15;
  }
  return slots;
}
function toMin(t: string) { const [h, m] = t.split(':').map(Number); return h * 60 + m; }
function fmtDuration(a: string, b: string) {
  const mins = Math.abs(toMin(b) - toMin(a)) + 15;
  const h = Math.floor(mins / 60), m = mins % 60;
  return h > 0 ? `${h} hr${m ? ` ${m} min` : ''}` : `${m} min`;
}

function InfoCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <h3 className="font-bold text-base" style={{ color: PRIMARY }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function DoctorDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useLang();
  const mm = lang === 'mm';

  const [doctor,        setDoctor]        = useState<Doctor | null>(null);
  const [loading,       setLoading]       = useState(true);
  const { favorites, toggle: toggleFav, needsIdentity, closeIdentity, submitIdentity } = useFavorites('doctor');
  const [tab,           setTab]           = useState<Tab>(searchParams.get('tab') === 'schedule' ? 'schedule' : 'profile');
  const [lightbox,      setLightbox]      = useState<number | null>(null);
  const [selectedDay,   setSelectedDay]   = useState(0);
  const [selectionMode, setSelectionMode] = useState<'single' | 'range'>('single');
  const [selectedSlot,  setSelectedSlot]  = useState<string | null>(null);
  const [rangeStart,    setRangeStart]    = useState<string | null>(null);
  const [rangeEnd,      setRangeEnd]      = useState<string | null>(null);
  const [hoveredSlot,   setHoveredSlot]   = useState<string | null>(null);
  const [fullSlots,     setFullSlots]     = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!id) return;
    fetch(`/api/doctors/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => { setDoctor(d.doctor); setLoading(false); })
      .catch(() => { setDoctor(null); setLoading(false); });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const d = new Date(); d.setDate(d.getDate() + selectedDay);
    fetch(`/api/doctors/${id}/booked-slots?date=${d.toISOString()}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => setFullSlots(new Set<string>(data.fullTimes ?? [])))
      .catch(() => setFullSlots(new Set()));
  }, [id, selectedDay]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-gray-200 animate-spin" style={{ borderTopColor: PRIMARY }} />
    </div>
  );

  if (!doctor) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
      <Stethoscope className="w-12 h-12 text-gray-200" />
      <p className="text-gray-400 text-sm">{mm ? 'ဆရာဝန် မတွေ့ပါ' : 'Doctor not found'}</p>
      <Link href="/patient/doctors" className="text-sm font-semibold" style={{ color: PRIMARY }}>
        {mm ? 'ပြန်သွားမည်' : 'Go back'}
      </Link>
    </div>
  );

  const displayName = mm ? doctor.name : (doctor.nameEn ?? doctor.name);
  const favorited = favorites.has(doctor.id);

  /* ── Schedule helpers ── */
  const today    = new Date();
  const DAY_MM   = ['တနင်္ဂနွေ','တနင်္လာ','အင်္ဂါ','ဗုဒ္ဓဟူး','ကြာသပတေး','သောကြာ','စနေ'];
  const DAY_EN   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const MONTH_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() + i); return d;
  });

  const selectedDate   = days[selectedDay];
  const dayOfWeek      = selectedDate.getDay();
  const doctorDaySlots = doctor.slots.filter(s => s.dayOfWeek === dayOfWeek);

  const morningSlots:   string[] = [];
  const afternoonSlots: string[] = [];
  const eveningSlots:   string[] = [];
  for (const s of doctorDaySlots) {
    for (const t of gen15Min(s.startTime, s.endTime)) {
      const h = parseInt(t.split(':')[0]);
      if      (h < 12)  morningSlots.push(t);
      else if (h < 17)  afternoonSlots.push(t);
      else              eveningSlots.push(t);
    }
  }
  const allSlots = [...morningSlots, ...afternoonSlots, ...eveningSlots];
  const nowMin = selectedDay === 0 ? today.getHours() * 60 + today.getMinutes() : -1;
  const isPastSlot = (slot: string) => selectedDay === 0 && toMin(slot) <= nowMin;

  const periods = [
    { label_mm: 'မနက်ပိုင်း',   label_en: 'Morning',   Icon: Sunrise, iconColor: '#f97316', slots: morningSlots },
    { label_mm: 'နေ့လည်ပိုင်း', label_en: 'Afternoon', Icon: Sun,     iconColor: '#eab308', slots: afternoonSlots },
    { label_mm: 'ညနေပိုင်း',    label_en: 'Evening',   Icon: Sunset,  iconColor: '#6366f1', slots: eveningSlots },
  ].filter(p => p.slots.length > 0);

  const _toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const sessionCount = selectionMode === 'range' && rangeStart && rangeEnd
    ? Math.round((Math.abs(_toMin(rangeEnd) - _toMin(rangeStart)) + 15) / 15) : 1;
  const totalFee = doctor.price * sessionCount;

  const startIdx = rangeStart  ? allSlots.indexOf(rangeStart)  : -1;
  const endIdx   = rangeEnd    ? allSlots.indexOf(rangeEnd)    : -1;
  const hoverIdx = hoveredSlot ? allSlots.indexOf(hoveredSlot) : -1;
  const loIdx    = rangeEnd ? Math.min(startIdx, endIdx) : startIdx;
  const hiIdx    = rangeEnd ? Math.max(startIdx, endIdx) : (hoveredSlot && hoverIdx > startIdx ? hoverIdx : startIdx);

  const resetAll = () => { setSelectedSlot(null); setRangeStart(null); setRangeEnd(null); setHoveredSlot(null); };
  const dayLabel = `${DAY_EN[days[selectedDay].getDay()]} ${days[selectedDay].getDate()} ${MONTH_EN[days[selectedDay].getMonth()]}`;
  const showConfirm = selectionMode === 'single' ? selectedSlot !== null : (rangeStart !== null && rangeEnd !== null);

  function goToBooking() {
    if (!doctor) return;
    const hasSlot = selectionMode === 'single' ? selectedSlot !== null : (rangeStart !== null && rangeEnd !== null);
    if (!hasSlot) { setTab('schedule'); return; }
    const d_s = new Date(today); d_s.setDate(today.getDate() + selectedDay);
    const dl  = `${DAY_EN[d_s.getDay()]} ${d_s.getDate()} ${MONTH_EN[d_s.getMonth()]}`;
    const sorted = selectionMode === 'range' && rangeStart && rangeEnd
      ? [rangeStart, rangeEnd].sort((a, b) => toMin(a) - toMin(b))
      : [selectedSlot ?? '', ''];
    const sc = selectionMode === 'range' && rangeStart && rangeEnd
      ? Math.round((Math.abs(toMin(rangeEnd) - toMin(rangeStart)) + 15) / 15) : 1;
    const tf = doctor.price * sc;
    const q = new URLSearchParams({
      doctorId: doctor.id,
      name:     doctor.nameEn ?? doctor.name,
      nameMm:   doctor.name,
      spec:     doctor.specialty,
      specMm:   doctor.specialty,
      img:      doctor.imageUrl ?? '',
      date:     dl, dateIso: d_s.toISOString(), start: sorted[0], end: sorted[1],
      duration: selectionMode === 'range' && rangeStart && rangeEnd ? fmtDuration(rangeStart, rangeEnd) : '',
      fee:      tf.toLocaleString(), sessions: String(sc), basePrice: String(doctor.price),
    });
    router.push(`/patient/booking?${q.toString()}`);
  }

  /* ── Gallery grid ── */
  const GALLERY_MAX = 8;
  const galleryItems = doctor.gallery ?? [];
  const galleryGrid = galleryItems.length > 0 ? (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Images className="w-4 h-4" style={{ color: SECONDARY }} />
          <h3 className="text-sm font-bold" style={{ color: PRIMARY }}>{mm ? 'ဓာတ်ပုံများ' : 'Gallery'}</h3>
        </div>
        <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{galleryItems.length} {mm ? 'ပုံ' : 'photos'}</span>
      </div>
      <div className="p-3 grid grid-cols-2 lg:grid-cols-4 gap-2">
        {galleryItems.slice(0, GALLERY_MAX).map((g, i) => {
          const isLast = i === GALLERY_MAX - 1 && galleryItems.length > GALLERY_MAX;
          return (
            <button key={i} onClick={() => setLightbox(i)} className="relative overflow-hidden rounded-lg group" style={{ paddingBottom: '75%' }}>
              <Image src={g.imageUrl} alt={g.captionEn ?? ''} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
              {isLast ? (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1">
                  <span className="text-white text-lg font-bold">+{galleryItems.length - GALLERY_MAX}</span>
                  <span className="text-white/70 text-[10px]">{mm ? 'ပိုမိုကြည့်ရန်' : 'more'}</span>
                </div>
              ) : (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  ) : null;

  /* ── Profile tab ── */
  const profileTab = (
    <>
      {/* Mobile */}
      <div className="lg:hidden px-4 pt-4 pb-4 flex flex-col gap-3">
        {(doctor.clinicTypesMm?.length > 0) && (
          <InfoCard icon={<BriefcaseMedical className="w-5 h-5" style={{ color: SECONDARY }} />} title={mm ? 'ဆွေးနွေးနိုင်သည့်အကြောင်းအရာ' : 'Consultation Topics'}>
            {(doctor.clinicTypesMm ?? []).map((type, i) => (
              <div key={i} className="flex items-start gap-2 mb-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: ACCENT }} />
                <p className="text-sm text-gray-600">{mm ? type : (doctor.clinicTypesEn?.[i] ?? type)}</p>
              </div>
            ))}
            {(doctor.clinicNote || doctor.clinicNoteEn) && (
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">[ {mm ? doctor.clinicNote : doctor.clinicNoteEn} ]</p>
            )}
          </InfoCard>
        )}
        {doctor.qualifications && (
          <InfoCard icon={<GraduationCap className="w-5 h-5" style={{ color: SECONDARY }} />} title={mm ? 'ဘွဲ့' : 'Qualifications'}>
            <p className="text-sm text-gray-600 leading-relaxed">{doctor.qualifications}</p>
          </InfoCard>
        )}
        <InfoCard icon={<Stethoscope className="w-5 h-5" style={{ color: SECONDARY }} />} title={mm ? 'ကိုယ်ရေးအကျဉ်း' : 'About'}>
          {(doctor.careerMm || doctor.careerEn) && (
            <p className="text-sm font-semibold text-gray-700 mb-1.5">{mm ? doctor.careerMm : (doctor.careerEn ?? doctor.careerMm)}</p>
          )}
          <p className="text-sm text-gray-500 leading-relaxed">{doctor.bio ?? (mm ? 'အချက်အလက် မရှိပါ' : 'No bio available')}</p>
        </InfoCard>
        {doctor.languages && doctor.languages.length > 0 && (
          <InfoCard icon={<Languages className="w-5 h-5" style={{ color: SECONDARY }} />} title={mm ? 'ဘာသာစကား' : 'Languages'}>
            <p className="text-sm text-gray-600">{doctor.languages.join(' | ')}</p>
          </InfoCard>
        )}
        {doctor.location && (
          <InfoCard icon={<MapPin className="w-5 h-5" style={{ color: SECONDARY }} />} title={mm ? 'လိပ်စာ' : 'Location'}>
            <div className="flex items-center gap-2">
              <Hospital className="w-4 h-4 shrink-0" style={{ color: ACCENT }} />
              <p className="text-sm text-gray-600">{doctor.location}</p>
            </div>
          </InfoCard>
        )}
        {galleryGrid}
      </div>

      {/* Desktop */}
      <div className="hidden lg:block px-6 pt-3 pb-6">
        <div className="grid grid-cols-2 gap-2">

          {(doctor.clinicTypesMm?.length > 0) && (
            <div className="col-span-2 bg-white border border-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: `${PRIMARY}0d` }}>
                  <BriefcaseMedical className="w-3 h-3" style={{ color: PRIMARY }} />
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{mm ? 'ဆွေးနွေးနိုင်သည့် အကြောင်းအရာ' : 'Consultation Topics'}</p>
                {(doctor.clinicNote || doctor.clinicNoteEn) && (
                  <p className="text-[10px] text-gray-400 ml-auto italic truncate max-w-xs hidden xl:block">
                    {mm ? doctor.clinicNote : doctor.clinicNoteEn}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                {(doctor.clinicTypesMm ?? []).map((type, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: ACCENT }} />
                    <p className="text-sm text-gray-700">{mm ? type : (doctor.clinicTypesEn?.[i] ?? type)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="col-span-2 bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: `${SECONDARY}0d` }}>
                <Stethoscope className="w-3 h-3" style={{ color: SECONDARY }} />
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider flex-1">{mm ? 'ကိုယ်ရေးအကျဉ်း' : 'About'}</p>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-gray-200 text-gray-500 shrink-0">
                {doctor.experience} {mm ? 'နှစ်' : 'yrs exp'}
              </span>
            </div>
            {(doctor.careerMm || doctor.careerEn) && (
              <p className="text-sm font-semibold text-gray-800 mb-1.5">{mm ? doctor.careerMm : (doctor.careerEn ?? doctor.careerMm)}</p>
            )}
            <p className="text-sm text-gray-500 leading-relaxed">{doctor.bio ?? (mm ? 'အချက်အလက် မရှိပါ' : 'No bio available')}</p>
          </div>

          {doctor.location && (
            <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-start gap-3">
              <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 bg-emerald-50">
                <MapPin className="w-3 h-3 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{mm ? 'နေရာ' : 'Location'}</p>
                <p className="text-sm font-semibold text-gray-800 leading-snug">{doctor.location}</p>
              </div>
              <Hospital className="w-3 h-3 text-gray-300 shrink-0 mt-0.5" />
            </div>
          )}

          {doctor.languages && doctor.languages.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-start gap-3">
              <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: '#f5f3ff' }}>
                <Languages className="w-3 h-3" style={{ color: '#7c3aed' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">{mm ? 'ဘာသာစကား' : 'Languages'}</p>
                <div className="flex flex-wrap gap-1">
                  {doctor.languages.map(l => (
                    <span key={l} className="text-xs font-medium px-2 py-0.5 rounded-full border border-gray-200 text-gray-600">{l}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {doctor.qualifications && (
            <div className="col-span-2 bg-white border border-gray-100 rounded-xl p-4 flex items-start gap-3">
              <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 bg-amber-50">
                <GraduationCap className="w-3 h-3 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{mm ? 'ဘွဲ့ / အရည်အချင်း' : 'Qualifications'}</p>
                <div className="flex flex-wrap gap-1">
                  {doctor.qualifications.split('|').filter(q => q.trim()).map((q, i) => (
                    <span key={i} className="text-xs font-medium px-2 py-0.5 rounded-full border border-gray-200 text-gray-600">{q.trim()}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {galleryItems.length > 0 && (
            <div className="col-span-2">{galleryGrid}</div>
          )}
        </div>
      </div>
    </>
  );

  /* ── Schedule tab ── */
  const scheduleTab = (
    <div className="px-4 lg:px-6 pt-4 pb-6 flex flex-col gap-4">
      {/* Mode toggle */}
      <div className="flex items-center gap-3">
        <div className="flex rounded-xl p-1 gap-1" style={{ backgroundColor: '#f3f4f6' }}>
          {(['single', 'range'] as const).map(mode => {
            const active = selectionMode === mode;
            return (
              <button key={mode} onClick={() => { setSelectionMode(mode); resetAll(); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all"
                style={{ backgroundColor: active ? PRIMARY : 'transparent', color: active ? '#fff' : '#6b7280', boxShadow: active ? `0 2px 8px ${PRIMARY}35` : 'none' }}>
                <span>{mode === 'single' ? '◆' : '↔'}</span>
                <span>{mode === 'single' ? (mm ? 'တစ်ကြိမ်' : 'Single') : (mm ? 'အပိုင်းအခြား' : 'Range')}</span>
              </button>
            );
          })}
        </div>
        {selectionMode === 'range' && (
          <p className="text-[11px] text-gray-400 leading-tight">
            {mm ? (rangeStart ? (rangeEnd ? '' : 'ကုန်ဆုံးချိန် ရွေးပါ') : 'စတင်ချိန် ရွေးပါ')
                : (rangeStart ? (rangeEnd ? '' : 'Pick end time') : 'Pick start time')}
          </p>
        )}
      </div>

      {/* Date selector */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {days.map((d, i) => {
          const active    = i === selectedDay;
          const isToday   = i === 0;
          const hasDrSlot = doctor.slots.some(s => s.dayOfWeek === d.getDay());
          return (
            <button key={i} onClick={() => { setSelectedDay(i); resetAll(); }}
              className="shrink-0 flex flex-col items-center px-3.5 py-2.5 rounded-2xl transition-all"
              style={{ minWidth: 60, backgroundColor: active ? PRIMARY : '#fff', border: `1.5px solid ${active ? PRIMARY : (hasDrSlot ? '#bbf7d0' : '#e5e7eb')}`, boxShadow: active ? `0 4px 14px ${PRIMARY}30` : 'none', opacity: hasDrSlot ? 1 : 0.5 }}>
              <span className="text-[10px] font-semibold" style={{ color: active ? 'rgba(255,255,255,0.7)' : '#9ca3af' }}>
                {mm ? DAY_MM[d.getDay()] : DAY_EN[d.getDay()]}
              </span>
              <span className="text-lg font-bold leading-tight mt-0.5" style={{ color: active ? '#fff' : '#111827' }}>{d.getDate()}</span>
              {isToday ? (
                <span className="text-[9px] font-bold mt-0.5 px-1.5 py-0.5 rounded-full" style={{ backgroundColor: active ? 'rgba(255,255,255,0.25)' : '#eff6ff', color: active ? '#fff' : PRIMARY }}>
                  {mm ? 'ယနေ့' : 'Today'}
                </span>
              ) : (
                <span className="text-[10px] mt-0.5" style={{ color: active ? 'rgba(255,255,255,0.6)' : '#d1d5db' }}>{MONTH_EN[d.getMonth()]}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      {allSlots.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {[
            { fill: '#fff',    border: '#e5e7eb', label_mm: 'ရနိုင်သည်',   label_en: 'Available' },
            { fill: PRIMARY,   border: PRIMARY,   label_mm: 'ရွေးချယ်',    label_en: 'Selected'  },
            { fill: '#f3f4f6', border: '#e5e7eb', label_mm: 'ပြည့်သည်',    label_en: 'Booked'    },
            ...(selectionMode === 'range' ? [{ fill: '#eff6ff', border: '#bfdbfe', label_mm: 'ရွေးချယ်ထားသော အပိုင်း', label_en: 'In range' }] : []),
          ].map(l => (
            <div key={l.label_en} className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-md border" style={{ backgroundColor: l.fill, borderColor: l.border }} />
              <span className="text-[11px] text-gray-500">{mm ? l.label_mm : l.label_en}</span>
            </div>
          ))}
        </div>
      )}

      {/* Time slots */}
      {allSlots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 bg-white rounded-2xl border border-gray-100">
          <Calendar className="w-10 h-10 text-gray-200" />
          <p className="text-sm text-gray-400">{mm ? 'ဤနေ့တွင် ချိန်းဆိုမှု မရှိပါ' : 'No slots available on this day'}</p>
          <p className="text-xs text-gray-300">{mm ? 'အခြားနေ့ရက် ရွေးချယ်ပါ' : 'Please select another date'}</p>
        </div>
      ) : (
        periods.map(period => (
          <div key={period.label_en} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
              <period.Icon className="w-4 h-4 shrink-0" style={{ color: period.iconColor }} />
              <p className="text-sm font-bold" style={{ color: PRIMARY }}>{mm ? period.label_mm : period.label_en}</p>
              <span className="ml-auto text-[11px] text-gray-400">{period.slots[0]} – {period.slots[period.slots.length - 1]}</span>
            </div>
            <div className="p-3 grid grid-cols-4 lg:grid-cols-6 gap-2">
              {period.slots.map(slot => {
                const idx           = allSlots.indexOf(slot);
                const isFull        = fullSlots.has(slot);
                const isPast        = isPastSlot(slot);
                const isBlocked     = isFull || isPast;
                const isSingleSel   = selectionMode === 'single' && selectedSlot === slot;
                const isEndpoint    = selectionMode === 'range' && (slot === rangeStart || slot === rangeEnd);
                const isInRange     = selectionMode === 'range' && rangeStart !== null && rangeEnd !== null && idx > loIdx && idx < hiIdx;
                const isHoverRange  = selectionMode === 'range' && rangeStart !== null && rangeEnd === null && hoverIdx > startIdx && idx > startIdx && idx <= hoverIdx;

                const bg = isBlocked ? '#f3f4f6' : isSingleSel || isEndpoint ? PRIMARY : isInRange ? '#eff6ff' : isHoverRange ? '#f0f9ff' : '#fff';
                const fg = isBlocked ? '#9ca3af' : isSingleSel || isEndpoint ? '#fff'   : isInRange ? PRIMARY   : '#374151';
                const bd = isBlocked ? '#e5e7eb' : isSingleSel || isEndpoint ? PRIMARY  : isInRange ? '#bfdbfe' : isHoverRange ? '#93c5fd' : '#e5e7eb';
                const shadow = (isSingleSel || isEndpoint) ? `0 3px 10px ${PRIMARY}35` : 'none';

                const handleClick = () => {
                  if (isBlocked) return;
                  if (selectionMode === 'single') { setSelectedSlot(slot === selectedSlot ? null : slot); return; }
                  if (!rangeStart) { setRangeStart(slot); }
                  else if (!rangeEnd) {
                    if (slot === rangeStart) { setRangeStart(null); return; }
                    const lo = Math.min(allSlots.indexOf(rangeStart), idx);
                    const hi = Math.max(allSlots.indexOf(rangeStart), idx);
                    const blocked = allSlots.slice(lo + 1, hi).some(s => fullSlots.has(s) || isPastSlot(s));
                    if (blocked) return;
                    setRangeEnd(slot); setHoveredSlot(null);
                  } else { setRangeStart(slot); setRangeEnd(null); setHoveredSlot(null); }
                };

                return (
                  <button key={slot} onClick={handleClick} disabled={isBlocked}
                    onMouseEnter={() => selectionMode === 'range' && !isBlocked && setHoveredSlot(slot)}
                    onMouseLeave={() => selectionMode === 'range' && setHoveredSlot(null)}
                    className="rounded-xl py-2.5 text-xs font-semibold transition-all text-center disabled:cursor-not-allowed"
                    style={{ backgroundColor: bg, color: fg, border: `1.5px solid ${bd}`, boxShadow: shadow, textDecoration: isBlocked ? 'line-through' : 'none' }}>
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Confirm bar */}
      {showConfirm && (
        <div className="sticky bottom-0 -mx-4 lg:-mx-6 px-4 lg:px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3"
          style={{ backgroundColor: '#fff', boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}>
          <div className="min-w-0">
            <p className="text-xs text-gray-400 mb-0.5">{mm ? 'ရွေးချယ်ထားသောအချိန်' : 'Selected time'}</p>
            {selectionMode === 'single' ? (
              <p className="text-base font-bold truncate" style={{ color: PRIMARY }}>{dayLabel} · {selectedSlot}</p>
            ) : (
              <div>
                <p className="text-base font-bold leading-tight" style={{ color: PRIMARY }}>
                  {dayLabel} · {[rangeStart, rangeEnd].sort((a, b) => toMin(a!) - toMin(b!)).join(' → ')}
                </p>
                <p className="text-xs font-semibold mt-0.5" style={{ color: ACCENT }}>{fmtDuration(rangeStart!, rangeEnd!)}</p>
              </div>
            )}
          </div>
          <button onClick={goToBooking}
            className="shrink-0 px-5 py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
            {mm ? 'ချိန်းဆိုမည်' : 'Confirm Booking'}
          </button>
        </div>
      )}
    </div>
  );

  const tabContent = tab === 'profile' ? profileTab : scheduleTab;

  /* ── Sidebar slot display ── */
  const SidebarSlotDisplay = () => {
    const d_s = new Date(today); d_s.setDate(today.getDate() + selectedDay);
    const dl  = `${DAY_EN[d_s.getDay()]} ${d_s.getDate()} ${MONTH_EN[d_s.getMonth()]}`;
    const hasSingle = selectionMode === 'single' && selectedSlot;
    const hasRange  = selectionMode === 'range' && rangeStart && rangeEnd;
    const sortedRange = hasRange ? [rangeStart!, rangeEnd!].sort((a, b) => toMin(a) - toMin(b)) : null;
    const durMins = sortedRange ? Math.abs(toMin(sortedRange[1]) - toMin(sortedRange[0])) + 15 : null;
    const dur = durMins ? (Math.floor(durMins / 60) > 0 ? `${Math.floor(durMins / 60)} hr${durMins % 60 ? ` ${durMins % 60} min` : ''}` : `${durMins} min`) : null;
    if (!hasSingle && !hasRange) return (
      <div className="flex items-center gap-2.5 px-3 py-3 rounded-xl" style={{ backgroundColor: '#f8faff', border: '1px dashed #bfdbfe' }}>
        <Clock className="w-4 h-4 shrink-0 text-gray-300" />
        <p className="text-xs text-gray-400">{mm ? 'အချိန်ဇယားမှ အချိန်ရွေးပါ' : 'Select a time from Schedule'}</p>
      </div>
    );
    return (
      <div className="px-3 py-3 rounded-xl flex flex-col gap-1" style={{ backgroundColor: '#eff6ff', border: `1px solid ${PRIMARY}20` }}>
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: SECONDARY }} />
          <p className="text-xs font-semibold" style={{ color: PRIMARY }}>{dl}</p>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: SECONDARY }} />
          <p className="text-sm font-bold" style={{ color: PRIMARY }}>
            {hasSingle ? selectedSlot : `${sortedRange![0]} → ${sortedRange![1]}`}
          </p>
          {dur && <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${PRIMARY}15`, color: PRIMARY }}>{dur}</span>}
        </div>
      </div>
    );
  };

  const doctorImg = doctor.imageUrl ? (
    <Image src={doctor.imageUrl} alt={displayName} fill className="object-cover" />
  ) : (
    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white" style={{ backgroundColor: AVATAR_COLORS[0] }}>
      {doctor.name.charAt(0)}
    </div>
  );

  return (
    <div className="min-h-full bg-gray-50 lg:bg-gray-100">

      {/* ══ DESKTOP ══ */}
      <div className="hidden lg:flex gap-5 h-screen overflow-hidden px-6 py-6">

        {/* Left: scrollable content */}
        <div className="flex-1 overflow-y-auto rounded-2xl bg-gray-50 flex flex-col">
          <div className="px-6 pt-8 pb-5 rounded-t-2xl shrink-0"
            style={{ background: `linear-gradient(180deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => router.back()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-opacity hover:opacity-80"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                <ChevronLeft className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">{mm ? 'နောက်သို့' : 'Back'}</span>
              </button>
              <h1 className="text-base font-bold text-white">{mm ? 'ဆရာဝန်အကြောင်း' : 'Doctor Info'}</h1>
              <button onClick={() => toggleFav(doctor.id)}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                <Heart className="w-5 h-5" style={{ color: favorited ? '#fca5a5' : 'rgba(255,255,255,0.8)', fill: favorited ? '#fca5a5' : 'transparent' }} />
              </button>
            </div>
            <div className="flex gap-2 rounded-2xl p-1" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              {(['profile', 'schedule'] as Tab[]).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ backgroundColor: tab === t ? '#fff' : 'transparent', color: tab === t ? PRIMARY : 'rgba(255,255,255,0.7)' }}>
                  {t === 'profile' ? (mm ? 'ကိုယ်ရေးအကျဉ်း' : 'Profile') : (mm ? 'အချိန်ဇယား' : 'Schedule')}
                </button>
              ))}
            </div>
          </div>
          {tabContent}
        </div>

        {/* Right sidebar */}
        <div className="shrink-0 w-72 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="relative w-full" style={{ height: 200 }}>
              {doctorImg}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,43,110,0.7) 0%, transparent 60%)' }} />
              <div className="absolute bottom-3 left-4 right-4">
                <p className="text-white font-bold text-base leading-tight">{displayName}</p>
                <p className="text-white/80 text-xs mt-0.5">{doctor.specialty}</p>
              </div>
              {doctor.isAvailable && (
                <span className="absolute top-3 right-3 text-[10px] font-bold text-white px-2 py-0.5 rounded-full" style={{ backgroundColor: '#22c55e' }}>
                  {mm ? 'အွန်လိုင်း' : 'Online'}
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
              {[
                { label: mm ? 'အတွေ့အကြုံ' : 'Experience', value: `${doctor.experience}${mm ? 'နှစ်' : 'yrs'}` },
                { label: mm ? 'နေရာ' : 'Location',         value: doctor.location ? doctor.location.replace('.','').substring(0,8) : '—' },
                { label: mm ? 'ဘာသာ' : 'Languages',        value: doctor.languages?.length ? String(doctor.languages.length) : '—' },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center py-3 px-2">
                  <p className="text-sm font-bold" style={{ color: PRIMARY }}>{s.value}</p>
                  <p className="text-[10px] text-gray-400 text-center leading-tight mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="p-4 flex flex-col gap-2.5">
              {doctor.qualifications && (
                <div className="flex items-start gap-2.5">
                  <GraduationCap className="w-4 h-4 shrink-0 mt-0.5" style={{ color: SECONDARY }} />
                  <p className="text-xs text-gray-500 leading-relaxed">{doctor.qualifications}</p>
                </div>
              )}
              {doctor.languages && doctor.languages.length > 0 && (
                <div className="flex items-center gap-2.5">
                  <Languages className="w-4 h-4 shrink-0" style={{ color: SECONDARY }} />
                  <p className="text-xs text-gray-500">{doctor.languages.join(' · ')}</p>
                </div>
              )}
              {doctor.location && (
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 shrink-0" style={{ color: SECONDARY }} />
                  <p className="text-xs text-gray-500">{doctor.location}</p>
                </div>
              )}
            </div>
          </div>

          {/* Booking card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4">
            <SidebarSlotDisplay />
            <div>
              <p className="text-xs text-gray-400 mb-1">{mm ? 'တိုင်ပင်ဆွေးနွေးခ' : 'Consultation Fee'}</p>
              {sessionCount > 1 && (
                <p className="text-[11px] text-gray-400 mb-0.5">{doctor.price.toLocaleString()} × {sessionCount} sessions</p>
              )}
              <p className="text-2xl font-bold" style={{ color: PRIMARY }}>
                {totalFee.toLocaleString()} <span className="text-sm font-semibold text-gray-400">MMK</span>
              </p>
            </div>
            <button onClick={goToBooking}
              className="block w-full text-center text-sm font-bold py-3.5 rounded-xl text-white transition-opacity hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
              {mm ? 'ချိန်းဆိုမည်' : 'Book Appointment'}
            </button>
            <button onClick={() => toggleFav(doctor.id)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all"
              style={{ borderColor: favorited ? '#fca5a5' : '#e5e7eb', color: favorited ? '#ef4444' : '#6b7280', backgroundColor: favorited ? '#fef2f2' : 'transparent' }}>
              <Heart className="w-4 h-4" style={{ fill: favorited ? '#ef4444' : 'transparent', color: favorited ? '#ef4444' : '#6b7280' }} />
              {favorited ? (mm ? 'သိမ်းဆည်းပြီး' : 'Saved') : (mm ? 'သိမ်းဆည်းမည်' : 'Save Doctor')}
            </button>
          </div>
        </div>
      </div>

      {/* ══ MOBILE ══ */}
      <div className="lg:hidden min-h-full pb-36">
        <div className="-mt-18 pt-21 px-4 pb-5"
          style={{ background: `linear-gradient(180deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => router.back()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl active:opacity-70" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <ChevronLeft className="w-4 h-4 text-white" />
              <span className="text-sm font-semibold text-white">{mm ? 'နောက်သို့' : 'Back'}</span>
            </button>
            <h1 className="text-base font-bold text-white">{mm ? 'ဆရာဝန်အကြောင်း' : 'Doctor Info'}</h1>
            <button onClick={() => toggleFav(doctor.id)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <Heart className="w-5 h-5" style={{ color: favorited ? '#fca5a5' : 'rgba(255,255,255,0.8)', fill: favorited ? '#fca5a5' : 'transparent' }} />
            </button>
          </div>
          <div className="flex gap-4 items-center mb-5">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/30 relative">
                {doctor.imageUrl
                  ? <Image src={doctor.imageUrl} alt={displayName} width={80} height={80} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: AVATAR_COLORS[0] }}>{doctor.name.charAt(0)}</div>
                }
              </div>
              {doctor.isAvailable && <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-white" style={{ backgroundColor: '#22c55e' }} />}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white leading-tight">{displayName}</h2>
              <p className="text-sm text-white/70 mt-0.5">{doctor.specialty}</p>
              <p className="text-sm text-white/70 mt-0.5">{mm ? `အတွေ့အကြုံ (${doctor.experience}) နှစ်` : `${doctor.experience} years experience`}</p>
            </div>
          </div>
          <div className="flex gap-2 rounded-2xl p-1" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            {(['profile', 'schedule'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ backgroundColor: tab === t ? '#fff' : 'transparent', color: tab === t ? PRIMARY : 'rgba(255,255,255,0.7)' }}>
                {t === 'profile' ? (mm ? 'ကိုယ်ရေးအကျဉ်း' : 'Profile') : (mm ? 'အချိန်ဇယား' : 'Schedule')}
              </button>
            ))}
          </div>
        </div>

        {tabContent}

        <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 px-4 pt-3 pb-4 z-30">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-sm text-gray-500">{mm ? 'တိုင်ပင်ဆွေးနွေးခ' : 'Consultation Fee'}</span>
            <span className="text-sm text-gray-400">-</span>
            <div className="flex flex-col items-end">
              {sessionCount > 1 && <span className="text-[10px] text-gray-400">{doctor.price.toLocaleString()} × {sessionCount}</span>}
              <span className="text-xl font-bold" style={{ color: PRIMARY }}>{totalFee.toLocaleString()} MMK</span>
            </div>
          </div>
          <button onClick={goToBooking}
            className="block w-full text-center text-base font-bold py-4 rounded-2xl text-white active:scale-95 transition-transform"
            style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
            {mm ? 'ချိန်းဆိုမည်' : 'Book Appointment'}
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && galleryItems.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
          {lightbox > 0 && (
            <button onClick={e => { e.stopPropagation(); setLightbox(lightbox - 1); }}
              className="absolute left-4 w-10 h-10 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors">
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          )}
          <div className="relative mx-16 rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}
            style={{ width: 'min(720px, 90vw)', height: 'min(480px, 60vh)' }}>
            <Image src={galleryItems[lightbox].imageUrl} alt={galleryItems[lightbox].captionEn ?? ''} fill className="object-cover" />
            {(galleryItems[lightbox].captionMm || galleryItems[lightbox].captionEn) && (
              <div className="absolute bottom-0 left-0 right-0 px-5 py-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)' }}>
                <p className="text-white text-sm font-semibold">
                  {mm ? galleryItems[lightbox].captionMm : galleryItems[lightbox].captionEn}
                </p>
                <p className="text-white/60 text-xs mt-0.5">{lightbox + 1} / {galleryItems.length}</p>
              </div>
            )}
          </div>
          {lightbox < galleryItems.length - 1 && (
            <button onClick={e => { e.stopPropagation(); setLightbox(lightbox + 1); }}
              className="absolute right-4 w-10 h-10 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors">
              <ChevronLeft className="w-5 h-5 text-white rotate-180" />
            </button>
          )}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
            {galleryItems.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setLightbox(i); }}
                className="rounded-full transition-all"
                style={{ width: i === lightbox ? 20 : 6, height: 6, backgroundColor: i === lightbox ? '#fff' : 'rgba(255,255,255,0.4)' }} />
            ))}
          </div>
        </div>
      )}

      {needsIdentity && <IdentifyModal mm={mm} onClose={closeIdentity} onSubmit={submitIdentity} />}
    </div>
  );
}
