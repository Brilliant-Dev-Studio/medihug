'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Heart, Search, SlidersHorizontal, Clock, Star,
  BriefcaseMedical, Stethoscope, Banknote, Check,
  RotateCcw, ListFilter, ChevronDown,
} from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';
import { useFavorites } from '../../lib/useFavorites';
import IdentifyModal from '../../components/IdentifyModal';

const PRIMARY   = 'var(--color-primary)';
const SECONDARY = 'var(--color-primary-dark)';
const AVATAR_COLORS = ['#2ab5ad','#8b5cf6','#f59e0b','#3b82f6','#10b981','#ef4444','#0d2b6e','#ec4899','#14b8a6'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

interface Slot { dayOfWeek: number; startTime: string; endTime: string; }
interface Doctor {
  id: string; name: string; nameEn: string | null;
  specialty: string; bio: string | null;
  experience: number; rating: number; reviewCount: number;
  price: number; imageUrl: string | null;
  isAvailable: boolean; slots: Slot[];
}

type ExpRange = 'all' | '0-10' | '11-20' | '21+';

/* ─── Skeleton shimmer ─── */
function Sh({ w, h, r = 'rounded-lg' }: { w: string; h: string; r?: string }) {
  return <div className={`${w} ${h} ${r} bg-gray-200 animate-pulse`} />;
}

function SkeletonCardMobile() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="p-4">
        <div className="flex gap-3">
          <Sh w="w-20" h="h-20" r="rounded-xl" />
          <div className="flex-1 flex flex-col gap-2 pt-1">
            <Sh w="w-3/4" h="h-4" />
            <Sh w="w-1/2" h="h-3" />
            <Sh w="w-2/5" h="h-3" />
            <Sh w="w-1/3" h="h-4" />
          </div>
        </div>
      </div>
      <div className="border-t border-gray-100 px-4 py-2.5 flex justify-between">
        <Sh w="w-16" h="h-3" />
        <Sh w="w-20" h="h-3" />
      </div>
      <div className="px-4 pb-4 flex gap-2">
        <Sh w="flex-1" h="h-10" r="rounded-full" />
        <Sh w="flex-1" h="h-10" r="rounded-full" />
      </div>
    </div>
  );
}

function SkeletonCardDesktop() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
      <Sh w="w-full" h="h-[200px]" r="rounded-none" />
      <div className="p-4 flex flex-col gap-2.5 flex-1">
        <Sh w="w-4/5" h="h-4" />
        <Sh w="w-1/2" h="h-3" />
        <Sh w="w-2/3" h="h-3" />
        <Sh w="w-1/3" h="h-3" />
        <div className="mt-auto pt-3 border-t border-gray-50 flex flex-col gap-3">
          <Sh w="w-1/2" h="h-5" />
          <div className="flex gap-2">
            <Sh w="flex-1" h="h-9" r="rounded-full" />
            <Sh w="flex-1" h="h-9" r="rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function nextSlotLabel(slots: Slot[]): string {
  if (!slots.length) return '—';
  const today = new Date().getDay();
  const sorted = [...slots].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  const upcoming = sorted.find(s => s.dayOfWeek >= today) ?? sorted[0];
  return `${DAYS[upcoming.dayOfWeek]} ${upcoming.startTime}`;
}

function avatarInitial(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

/* ─── Search box with dropdown autosuggest ─── */
function DoctorSearchBox({ doctors, value, onChange, mm, placeholder, pillClassName }: {
  doctors: Doctor[]; value: string; onChange: (v: string) => void; mm: boolean;
  placeholder: string; pillClassName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const q = value.trim().toLowerCase();
  const suggestions = q.length === 0 ? [] : doctors.filter(d =>
    d.name.toLowerCase().includes(q) ||
    (d.nameEn ?? '').toLowerCase().includes(q) ||
    d.specialty.toLowerCase().includes(q)
  ).slice(0, 6);

  return (
    <div ref={boxRef} className="relative flex-1 min-w-0">
      <div className={pillClassName}>
        <Search className="w-4 h-4 shrink-0 text-white/60" />
        <input
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true); setHi(0); }}
          onFocus={() => { if (value.trim()) setOpen(true); }}
          onKeyDown={e => {
            if (!open || suggestions.length === 0) return;
            if (e.key === 'ArrowDown') { e.preventDefault(); setHi(h => Math.min(h + 1, suggestions.length - 1)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setHi(h => Math.max(h - 1, 0)); }
            else if (e.key === 'Enter' && suggestions[hi]) { e.preventDefault(); setOpen(false); router.push(`/patient/doctors/${suggestions[hi].id}`); }
            else if (e.key === 'Escape') { setOpen(false); }
          }}
          placeholder={placeholder}
          className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-white/50 text-white" />
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden py-1.5">
          {suggestions.map((d, i) => {
            const name = mm ? d.name : (d.nameEn ?? d.name);
            return (
              <Link key={d.id} href={`/patient/doctors/${d.id}`}
                onClick={() => setOpen(false)}
                onMouseEnter={() => setHi(i)}
                className="flex items-center gap-3 px-3.5 py-2.5 transition-colors"
                style={{ backgroundColor: i === hi ? '#f3f4f6' : 'transparent' }}
              >
                <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                  {d.imageUrl
                    ? <img src={d.imageUrl} alt={name} className="w-full h-full object-cover" />
                    : <span className="text-xs font-bold" style={{ color: PRIMARY }}>{avatarInitial(d.name)}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
                  <p className="text-xs text-gray-400 truncate">{d.specialty}</p>
                </div>
                <span className="text-xs font-bold shrink-0" style={{ color: PRIMARY }}>{d.price.toLocaleString()} MMK</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Radio row ─── */
function RadioRow({ active, label, count, onClick }: { active: boolean; label: string; count: number; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all"
      style={{ backgroundColor: active ? `${PRIMARY}08` : 'transparent' }}>
      <span className="shrink-0 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all"
        style={{ borderColor: active ? PRIMARY : '#d1d5db', backgroundColor: active ? PRIMARY : 'transparent' }}>
        {active && <Check className="w-2 h-2 text-white" strokeWidth={3} />}
      </span>
      <span className="flex-1 text-xs text-left transition-colors"
        style={{ color: active ? PRIMARY : '#374151', fontWeight: active ? 600 : 400 }}>
        {label}
      </span>
      <span className="text-[10px] px-1.5 py-0.5 rounded min-w-4.5 text-center transition-all"
        style={{ backgroundColor: active ? `${PRIMARY}18` : '#f3f4f6', color: active ? PRIMARY : '#9ca3af', fontWeight: active ? 600 : 400 }}>
        {count}
      </span>
    </button>
  );
}

/* ─── Mobile card ─── */
function DoctorCardMobile({ doc, idx, mm, favorited, onToggleFav }: {
  doc: Doctor; idx: number; mm: boolean; favorited: boolean; onToggleFav: () => void;
}) {
  const name = mm ? doc.name : (doc.nameEn ?? doc.name);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="p-4">
        <div className="flex gap-3">
          <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-100 shrink-0 flex items-center justify-center"
            style={{ backgroundColor: `${AVATAR_COLORS[idx % AVATAR_COLORS.length]}18` }}>
            {doc.imageUrl
              ? <img src={doc.imageUrl} alt={name} className="w-full h-full object-cover" />
              : <span className="text-2xl font-bold" style={{ color: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}>{avatarInitial(doc.name)}</span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="font-bold text-base leading-tight" style={{ color: PRIMARY }}>{name}</p>
              <button onClick={onToggleFav} className="shrink-0 mt-0.5 transition-transform active:scale-90">
                <Heart className="w-5 h-5" style={{ color: favorited ? '#ef4444' : '#d1d5db', fill: favorited ? '#ef4444' : 'transparent' }} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{doc.specialty}</p>
            <p className="text-sm text-gray-500">{mm ? `အတွေ့အကြုံ (${doc.experience}) နှစ်` : `${doc.experience} yrs exp`}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-sm font-bold" style={{ color: PRIMARY }}>{doc.price.toLocaleString()} MMK</span>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-sm text-gray-500">{doc.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-100 px-4 py-2.5 flex items-center justify-between">
        <p className="text-xs text-gray-400">{mm ? 'နောက်ထပ် slot' : 'Next slot'}</p>
        <p className="text-xs font-semibold" style={{ color: PRIMARY }}>{nextSlotLabel(doc.slots)}</p>
      </div>
      <div className="px-4 pb-4 flex gap-2">
        <Link href={`/patient/doctors/${doc.id}`}
          className="flex-1 text-center text-sm font-semibold py-2.5 rounded-full border transition-all active:scale-95"
          style={{ borderColor: PRIMARY, color: PRIMARY }}>
          {mm ? 'ကိုယ်ရေးအကျဉ်း' : 'View Profile'}
        </Link>
        <Link href={`/patient/doctors/${doc.id}?tab=schedule`}
          className="flex-1 text-center text-sm font-bold py-2.5 rounded-full text-white transition-all active:scale-95"
          style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
          {mm ? 'ချိန်းဆိုမည်' : 'Book Now'}
        </Link>
      </div>
    </div>
  );
}

/* ─── Desktop card ─── */
function DoctorCardDesktop({ doc, idx, mm, favorited, onToggleFav }: {
  doc: Doctor; idx: number; mm: boolean; favorited: boolean; onToggleFav: () => void;
}) {
  const name = mm ? doc.name : (doc.nameEn ?? doc.name);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
      <div className="relative w-full flex items-center justify-center bg-gray-50" style={{ height: 200 }}>
        {doc.imageUrl
          ? <img src={doc.imageUrl} alt={name} className="w-full h-full object-cover object-top" />
          : <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white"
              style={{ backgroundColor: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}>
              {avatarInitial(doc.name)}
            </div>
        }
        <button onClick={onToggleFav}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center transition-transform active:scale-90">
          <Heart className="w-4 h-4" style={{ color: favorited ? '#ef4444' : '#9ca3af', fill: favorited ? '#ef4444' : 'transparent' }} />
        </button>
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <p className="font-bold text-base leading-tight" style={{ color: PRIMARY }}>{name}</p>
          <p className="text-sm text-gray-500 mt-0.5">{doc.specialty}</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>{mm ? `အတွေ့အကြုံ ${doc.experience} နှစ်` : `${doc.experience} yrs exp`}</span>
          <span className="text-gray-200">|</span>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-gray-600">{doc.rating.toFixed(1)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{mm ? 'နောက်ထပ်' : 'Next'}: {nextSlotLabel(doc.slots)}</span>
        </div>
        <div className="mt-auto pt-2 border-t border-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] text-gray-400">{mm ? 'တိုင်ပင်ဆွေးနွေးခ' : 'Consultation fee'}</p>
              <p className="text-base font-bold" style={{ color: PRIMARY }}>{doc.price.toLocaleString()} MMK</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/patient/doctors/${doc.id}`}
              className="flex-1 text-center text-sm font-semibold py-2.5 rounded-full border transition-all hover:bg-gray-50"
              style={{ borderColor: PRIMARY, color: PRIMARY }}>
              {mm ? 'ကိုယ်ရေးအကျဉ်း' : 'Profile'}
            </Link>
            <Link href={`/patient/doctors/${doc.id}?tab=schedule`}
              className="flex-1 text-center text-sm font-bold py-2.5 rounded-full text-white transition-all hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
              {mm ? 'ချိန်းဆို' : 'Book'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main content ─── */
function DoctorsContent({ initialSpec }: { initialSpec: string }) {
  const { lang } = useLang();
  const mm = lang === 'mm';

  const [allDoctors,  setAllDoctors]  = useState<Doctor[]>([]);
  const [loading,     setLoading]     = useState(true);
  const { favorites, toggle: toggleFav, needsIdentity, closeIdentity, submitIdentity } = useFavorites('doctor');
  const [search,      setSearch]      = useState('');
  const [filterExp,   setFilterExp]   = useState<ExpRange>('all');
  const [filterSpec,  setFilterSpec]  = useState<string>(initialSpec);
  const [priceMin,    setPriceMin]    = useState(0);
  const [priceMax,    setPriceMax]    = useState(50000);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [openExp,  setOpenExp]  = useState(true);
  const [openSpec, setOpenSpec] = useState(true);
  const [openFee,  setOpenFee]  = useState(true);

  useEffect(() => {
    fetch('/api/doctors?limit=100')
      .then(r => r.json())
      .then(d => { setAllDoctors(d.doctors ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  /* ── derived filter counts ── */
  const allSpecs = [...new Set(allDoctors.map(d => d.specialty))].sort();

  const expCount = (r: ExpRange) => {
    if (r === 'all')  return allDoctors.length;
    if (r === '0-10') return allDoctors.filter(d => d.experience <= 10).length;
    if (r === '11-20') return allDoctors.filter(d => d.experience >= 11 && d.experience <= 20).length;
    return allDoctors.filter(d => d.experience >= 21).length;
  };

  const specCount = (s: string) =>
    s === 'all' ? allDoctors.length : allDoctors.filter(d => d.specialty === s).length;

  /* ── filtered list ── */
  const filtered = allDoctors
    .filter(d => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return d.name.toLowerCase().includes(q) ||
             (d.nameEn ?? '').toLowerCase().includes(q) ||
             d.specialty.toLowerCase().includes(q);
    })
    .filter(d => {
      if (filterExp === '0-10')  return d.experience <= 10;
      if (filterExp === '11-20') return d.experience >= 11 && d.experience <= 20;
      if (filterExp === '21+')   return d.experience >= 21;
      return true;
    })
    .filter(d => filterSpec === 'all' ? true : d.specialty === filterSpec)
    .filter(d => d.price >= priceMin && d.price <= priceMax);

  const hasFilter  = filterExp !== 'all' || filterSpec !== 'all' || priceMin > 0 || priceMax < 50000;
  const activeCount = (filterExp !== 'all' ? 1 : 0) + (filterSpec !== 'all' ? 1 : 0) + (priceMin > 0 || priceMax < 50000 ? 1 : 0);

  const resetFilters = () => { setFilterExp('all'); setFilterSpec('all'); setPriceMin(0); setPriceMax(50000); };

  /* ── shared filter panel inner ── */
  const filterInner = (mobile = false) => (
    <>
      {/* Experience */}
      <div className={`border-b border-gray-100`}>
        <button
          onClick={() => setOpenExp(p => !p)}
          className={`w-full flex items-center justify-between gap-1.5 px-${mobile?4:3} py-3`}>
          <div className="flex items-center gap-1.5">
            <BriefcaseMedical className="w-3 h-3 text-gray-400" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{mm ? 'အတွေ့အကြုံ' : 'Experience'}</p>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${openExp ? 'rotate-180' : ''}`} />
        </button>
        {openExp && (
          <div className={`px-${mobile?4:3} pb-3`}>
            {([
              { value: 'all',   labelMm: 'အားလုံး',     labelEn: 'All levels' },
              { value: '0-10',  labelMm: '၁–၁၀ နှစ်',   labelEn: '1–10 years' },
              { value: '11-20', labelMm: '၁၁–၂၀ နှစ်',  labelEn: '11–20 years' },
              { value: '21+',   labelMm: '၂၁ နှစ်အထက်', labelEn: '21+ years' },
            ] as { value: ExpRange; labelMm: string; labelEn: string }[]).map(o => (
              <RadioRow key={o.value} active={filterExp === o.value}
                label={mm ? o.labelMm : o.labelEn} count={expCount(o.value)}
                onClick={() => setFilterExp(o.value)} />
            ))}
          </div>
        )}
      </div>

      {/* Specialty */}
      <div className={`border-b border-gray-100`}>
        <button
          onClick={() => setOpenSpec(p => !p)}
          className={`w-full flex items-center justify-between gap-1.5 px-${mobile?4:3} py-3`}>
          <div className="flex items-center gap-1.5">
            <Stethoscope className="w-3 h-3 text-gray-400" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{mm ? 'အထူးကု' : 'Specialty'}</p>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${openSpec ? 'rotate-180' : ''}`} />
        </button>
        {openSpec && (
          <div className={`px-${mobile?4:3} pb-3`}>
            {(['all', ...allSpecs]).map(spec => (
              <RadioRow key={spec} active={filterSpec === spec}
                label={spec === 'all' ? (mm ? 'အားလုံး' : 'All specialties') : spec}
                count={specCount(spec)}
                onClick={() => setFilterSpec(spec)} />
            ))}
          </div>
        )}
      </div>

      {/* Price */}
      <div>
        <button
          onClick={() => setOpenFee(p => !p)}
          className={`w-full flex items-center justify-between gap-1.5 px-${mobile?4:3} py-3`}>
          <div className="flex items-center gap-1.5">
            <Banknote className="w-3 h-3 text-gray-400" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{mm ? 'တိုင်ပင်ဆွေးနွေးခ' : 'Fee'}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${PRIMARY}10`, color: PRIMARY }}>
              {priceMin > 0 || priceMax < 50000 ? `${(priceMin/1000).toFixed(0)}K–${(priceMax/1000).toFixed(0)}K` : (mm ? 'အားလုံး' : 'Any')}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${openFee ? 'rotate-180' : ''}`} />
          </div>
        </button>
        {openFee && (
          <div className={`px-${mobile?4:3} pt-0 pb-3`}>
            <div className="relative py-2.5 px-1">
              <div className="h-1 bg-gray-200 rounded-full relative">
                <div className="absolute h-full rounded-full"
                  style={{ left: `${(priceMin/50000)*100}%`, right: `${100-(priceMax/50000)*100}%`, backgroundColor: PRIMARY }} />
              </div>
              <input type="range" min={0} max={50000} step={1000} value={priceMin}
                onChange={e => { const v = Number(e.target.value); if (v < priceMax - 2000) setPriceMin(v); }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                style={{ zIndex: priceMin > 44000 ? 5 : 3 }} />
              <input type="range" min={0} max={50000} step={1000} value={priceMax}
                onChange={e => { const v = Number(e.target.value); if (v > priceMin + 2000) setPriceMax(v); }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" style={{ zIndex: 4 }} />
              <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow pointer-events-none"
                style={{ left: `calc(${(priceMin/50000)*100}% - 6px)`, backgroundColor: PRIMARY }} />
              <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow pointer-events-none"
                style={{ left: `calc(${(priceMax/50000)*100}% - 6px)`, backgroundColor: PRIMARY }} />
            </div>
            <div className="flex justify-between px-1">
              <span className="text-[10px] text-gray-400">0</span>
              <span className="text-[10px] text-gray-400">50,000 Ks</span>
            </div>
          </div>
        )}
      </div>
    </>
  );

  /* ── empty state (no results, not loading) ── */
  const emptyState = (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <Search className="w-7 h-7 text-gray-300" />
      </div>
      <p className="text-sm font-semibold text-gray-400">{mm ? 'ဆရာဝန် မတွေ့ပါ' : 'No doctors found'}</p>
      <p className="text-xs text-gray-300 mt-1">{mm ? 'Filter ပြောင်းကြည့်ပါ' : 'Try adjusting filters'}</p>
    </div>
  );

  return (
    <div className="min-h-full bg-gray-50 lg:bg-gray-100">

      {/* ══ DESKTOP ══ */}
      <div className="hidden lg:flex gap-5 h-screen overflow-hidden px-6 py-6">

        {/* Left scrollable */}
        <div className="flex-1 overflow-y-auto rounded-2xl bg-gray-50 flex flex-col">
          {/* Hero */}
          <div className="px-8 pt-8 pb-6 rounded-t-2xl shrink-0"
            style={{ background: `linear-gradient(180deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
            <h1 className="text-2xl font-bold text-white mb-4">{mm ? 'ဆရာဝန်များ' : 'Our Doctors'}</h1>
            <DoctorSearchBox doctors={allDoctors} value={search} onChange={setSearch} mm={mm}
              placeholder={mm ? 'ဆရာဝန် ရှာဖွေပါ...' : 'Search by name or specialty...'}
              pillClassName="flex items-center gap-2 rounded-2xl px-4 py-3 w-full bg-white/15"
            />
          </div>

          {/* Count row */}
          <div className="px-6 py-3 flex items-center justify-between border-b border-gray-100 shrink-0">
            <p className="text-sm text-gray-400">
              {loading ? '...' : (mm ? `ဆရာဝန် ${filtered.length} ဦး` : `${filtered.length} doctors found`)}
            </p>
          </div>

          {/* Cards */}
          <div className="flex-1 px-6 py-5 pb-8">
            {loading ? (
              <div className="grid grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCardDesktop key={i} />)}
              </div>
            ) : filtered.length === 0 ? emptyState : (
              <div className="grid grid-cols-3 gap-5">
                {filtered.map((doc, i) => (
                  <DoctorCardDesktop key={doc.id} doc={doc} idx={i} mm={mm}
                    favorited={favorites.has(doc.id)} onToggleFav={() => toggleFav(doc.id)} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right filter */}
        <div className="shrink-0 w-80">
          <div className="sticky top-0 max-h-screen overflow-y-auto pb-4">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${PRIMARY}10` }}>
                    <ListFilter className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: PRIMARY }}>{mm ? 'စစ်ထုတ်မှု' : 'Filter'}</p>
                    <p className="text-[10px] text-gray-400 leading-none mt-0.5">
                      {activeCount > 0 ? (mm ? `${activeCount} ခု ရွေးထား` : `${activeCount} active`) : (mm ? 'မရှိသေး' : 'None')}
                    </p>
                  </div>
                </div>
                {hasFilter && (
                  <button onClick={resetFilters}
                    className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg hover:bg-red-50"
                    style={{ color: '#ef4444' }}>
                    <RotateCcw className="w-3 h-3" /> {mm ? 'ရှင်းမည်' : 'Reset'}
                  </button>
                )}
              </div>
              {filterInner(false)}
              {/* Result badge */}
              <div className="px-3 pb-3">
                <div className="w-full py-2.5 rounded-xl text-xs font-bold text-white text-center"
                  style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
                  {mm ? `ဆရာဝန် ${filtered.length} ဦး တွေ့ရှိသည်` : `${filtered.length} doctor${filtered.length !== 1 ? 's' : ''} found`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ MOBILE filter sheet ══ */}
      {showMobileFilter && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileFilter(false)} />
          <div className="relative bg-white w-72 h-full flex flex-col shadow-2xl">
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${PRIMARY}10` }}>
                  <ListFilter className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
                </div>
                <p className="text-sm font-bold" style={{ color: PRIMARY }}>{mm ? 'စစ်ထုတ်မှု' : 'Filter'}</p>
                {activeCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: PRIMARY }}>{activeCount}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {hasFilter && (
                  <button onClick={resetFilters} className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg hover:bg-red-50" style={{ color: '#ef4444' }}>
                    <RotateCcw className="w-3 h-3" /> {mm ? 'ရှင်းမည်' : 'Reset'}
                  </button>
                )}
                <button onClick={() => setShowMobileFilter(false)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">✕</span>
                </button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1">{filterInner(true)}</div>
            <div className="px-4 py-4 border-t border-gray-100 shrink-0">
              <button onClick={() => setShowMobileFilter(false)}
                className="w-full py-3.5 rounded-2xl text-sm font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
                {mm ? `ဆရာဝန် ${filtered.length} ဦး ကြည့်မည်` : `View ${filtered.length} doctor${filtered.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MOBILE scroll ══ */}
      <div className="lg:hidden">
        <div className="-mt-18 pt-21 pb-5 px-4 w-full"
          style={{ background: `linear-gradient(180deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
          <h1 className="text-xl font-bold text-white mb-3">{mm ? 'ဆရာဝန်များ' : 'Our Doctors'}</h1>
          <div className="flex items-center gap-2">
            <DoctorSearchBox doctors={allDoctors} value={search} onChange={setSearch} mm={mm}
              placeholder={mm ? 'ဆရာဝန် ရှာဖွေပါ...' : 'Search...'}
              pillClassName="flex items-center gap-2 rounded-xl px-4 py-3 bg-white/15"
            />
            <button onClick={() => setShowMobileFilter(true)}
              className="relative w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <SlidersHorizontal className="w-4 h-4 text-white/70" />
              {activeCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: '#ef4444' }}>
                  {activeCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            {loading ? '...' : (mm ? `${filtered.length} ဦး` : `${filtered.length} found`)}
          </p>
        </div>

        <div className="px-4 pb-24">
          {loading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCardMobile key={i} />)}
            </div>
          ) : filtered.length === 0 ? emptyState : (
            <div className="flex flex-col gap-3">
              {filtered.map((doc, i) => (
                <DoctorCardMobile key={doc.id} doc={doc} idx={i} mm={mm}
                  favorited={favorites.has(doc.id)} onToggleFav={() => toggleFav(doc.id)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {needsIdentity && <IdentifyModal mm={mm} onClose={closeIdentity} onSubmit={submitIdentity} />}
    </div>
  );
}

function DoctorsPageWrapper() {
  const searchParams = useSearchParams();
  const spec = searchParams.get('spec') ?? 'all';
  return <DoctorsContent initialSpec={spec} />;
}

export default function DoctorsPage() {
  return (
    <Suspense fallback={null}>
      <DoctorsPageWrapper />
    </Suspense>
  );
}
