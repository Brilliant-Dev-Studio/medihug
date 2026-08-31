'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search, Star, Stethoscope, ArrowRight, ArrowLeft, ChevronRight,
  SlidersHorizontal, BriefcaseMedical, Banknote, RotateCcw, ListFilter, ChevronDown, Check,
} from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';

const PRIMARY = '#0d2b6e';

interface Specialty { id: string; name: string; nameEn: string | null; }

interface Doctor {
  id: string; name: string; nameEn: string | null;
  specialty: string; imageUrl: string | null;
  experience: number; rating: number; reviewCount: number; price: number; patientPrice: number;
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
      <div className="h-48 bg-gray-100 animate-pulse" />
      <div className="p-4 flex flex-col gap-2">
        <div className="h-4 bg-gray-100 rounded-lg animate-pulse w-4/5" />
        <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-1/2" />
      </div>
    </div>
  );
}

/* ── Step 1: full-page specialty picker ── */
function SpecialtyPicker({ onPick }: { onPick: (name: string) => void }) {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');

  useEffect(() => {
    fetch('/api/admin/specialties')
      .then(r => r.json())
      .then(d => { setSpecialties(d.specialties ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = specialties.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || (s.nameEn ?? '').toLowerCase().includes(q);
  });

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10 sm:py-14">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{mm ? 'ဆရာဝန်များ' : 'Our Doctors'}</h1>
        <p className="text-sm text-gray-500 mt-1.5">{mm ? 'အထူးကုဌာနအလိုက် ရွေးချယ်ပြီး ဆရာဝန်များကို ကြည့်ရှုပါ' : 'Pick a specialty to see the doctors under it'}</p>

        <div className="relative mt-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={mm ? 'အထူးကုဌာန ရှာဖွေရန်...' : 'Search specialties...'}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[#0d2b6e] transition-colors"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-6">
            {Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
            <Stethoscope className="w-10 h-10 text-gray-200" />
            <p className="text-sm">{mm ? 'အထူးကုဌာန မတွေ့ပါ' : 'No specialties found'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-6">
            {filtered.map(s => {
              const label = mm ? s.name : (s.nameEn ?? s.name);
              return (
                <button
                  key={s.id}
                  onClick={() => onPick(s.name)}
                  className="flex items-center justify-between gap-2 bg-white border border-gray-200 rounded-xl px-4 py-4 text-left font-bold text-gray-800 transition-colors hover:border-teal-300 hover:text-teal-600"
                >
                  <span className="leading-snug">{label}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Step 2: doctors under the chosen specialty ── */
function DoctorsBySpecialty({ spec, highlight, onBack }: { spec: string; highlight: string; onBack: () => void }) {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const highlightRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/doctors?limit=60&specialty=${encodeURIComponent(spec)}`)
      .then(r => r.json())
      .then(d => { setDoctors(d.doctors ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [spec]);

  useEffect(() => {
    if (!highlight || loading || !highlightRef.current) return;
    highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlight, loading]);

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10 sm:py-14">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> {mm ? 'အထူးကုဌာနများ' : 'All Specialties'}
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{spec}</h1>
        <p className="text-sm text-gray-500 mt-1.5">
          {loading ? (mm ? 'ရှာနေသည်...' : 'Loading...') : `${doctors.length} ${mm ? 'ဆရာဝန်' : doctors.length === 1 ? 'doctor' : 'doctors'}`}
        </p>

        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : doctors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
              <Stethoscope className="w-10 h-10 text-gray-200" />
              <p className="text-sm">{mm ? 'ဆရာဝန် မတွေ့ပါ' : 'No doctors found'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {doctors.map(d => {
                const name = mm ? d.name : (d.nameEn ?? d.name);
                const isHighlighted = d.id === highlight;
                return (
                  <Link key={d.id} href={`/patient/doctors/${d.id}`}
                    ref={isHighlighted ? highlightRef : undefined}
                    className={`rounded-2xl border bg-white overflow-hidden flex flex-col hover:shadow-md transition-shadow ${
                      isHighlighted ? 'border-2 ring-4' : 'border-gray-100'
                    }`}
                    style={isHighlighted ? { borderColor: PRIMARY, ['--tw-ring-color' as string]: `${PRIMARY}33` } : undefined}>
                    <div className="relative w-full h-48 bg-gray-50">
                      {d.imageUrl ? (
                        <Image src={d.imageUrl} alt={name} fill className="object-cover object-top" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white"
                          style={{ background: `linear-gradient(160deg, ${PRIMARY} 0%, #1a3a8f 100%)` }}>
                          {d.name.charAt(0)}
                        </div>
                      )}
                      <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: PRIMARY }}>
                        {d.specialty}
                      </span>
                    </div>
                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <h3 className="text-sm font-bold text-gray-800 leading-snug line-clamp-2">{name}</h3>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-semibold text-gray-700">{d.rating.toFixed(1)}</span>
                          {d.reviewCount > 0 && <span>({d.reviewCount})</span>}
                        </div>
                        <span>{d.experience} {mm ? 'နှစ်' : 'yrs'}</span>
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                        <p className="text-sm font-bold" style={{ color: PRIMARY }}>{d.patientPrice.toLocaleString()} MMK</p>
                        <span className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: PRIMARY }}>
                          {mm ? 'ကြည့်ရန်' : 'View'} <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type CatExpRange = 'all' | '0-10' | '11-20' | '21+';
const CAT_PRICE_MAX = 50000;

/* ── Radio row (filter option) ── */
function CatRadioRow({ active, label, count, onClick }: { active: boolean; label: string; count: number; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all"
      style={{ backgroundColor: active ? `${PRIMARY}08` : 'transparent' }}>
      <span className="shrink-0 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all"
        style={{ borderColor: active ? PRIMARY : '#d1d5db', backgroundColor: active ? PRIMARY : 'transparent' }}>
        {active && <Check className="w-2 h-2 text-white" strokeWidth={3} />}
      </span>
      <span className="flex-1 text-xs text-left transition-colors truncate"
        style={{ color: active ? PRIMARY : '#374151', fontWeight: active ? 600 : 400 }}>
        {label}
      </span>
      <span className="text-[10px] px-1.5 py-0.5 rounded min-w-4.5 text-center transition-all shrink-0"
        style={{ backgroundColor: active ? `${PRIMARY}18` : '#f3f4f6', color: active ? PRIMARY : '#9ca3af', fontWeight: active ? 600 : 400 }}>
        {count}
      </span>
    </button>
  );
}

/* ── Search box with dropdown autosuggest, scoped to this category's own doctor list ── */
function CatSearchBox({ doctors, value, onChange, mm, placeholder, pillClassName }: {
  doctors: Doctor[]; value: string; onChange: (v: string) => void; mm: boolean;
  placeholder: string; pillClassName: string;
}) {
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
              <Link key={d.id} href={`/doctors/${d.id}`}
                onClick={() => setOpen(false)}
                onMouseEnter={() => setHi(i)}
                className="flex items-center gap-3 px-3.5 py-2.5 transition-colors"
                style={{ backgroundColor: i === hi ? '#f3f4f6' : 'transparent' }}
              >
                <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                  {d.imageUrl
                    ? <img src={d.imageUrl} alt={name} className="w-full h-full object-cover" />
                    : <span className="text-xs font-bold" style={{ color: PRIMARY }}>{d.name.charAt(0)}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
                  <p className="text-xs text-gray-400 truncate">{d.specialty}</p>
                </div>
                <span className="text-xs font-bold shrink-0" style={{ color: PRIMARY }}>{d.patientPrice.toLocaleString()} MMK</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Doctors linked to a landing-page category (e.g. "Consult a Doctor") — clicking a
 * card here opens the public doctor detail page, not the patient-portal one, so browsing
 * stays on the landing site until the patient chooses to book. ── */
function DoctorsByCategory({ categoryId, onBack }: { categoryId: string; onBack: () => void }) {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterExp, setFilterExp] = useState<CatExpRange>('all');
  const [filterSpec, setFilterSpec] = useState('all');
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(CAT_PRICE_MAX);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [openExp, setOpenExp] = useState(true);
  const [openSpec, setOpenSpec] = useState(true);
  const [openFee, setOpenFee] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/doctors?limit=60&categoryId=${encodeURIComponent(categoryId)}`)
      .then(r => r.json())
      .then(d => { setAllDoctors(d.doctors ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [categoryId]);

  const allSpecs = [...new Set(allDoctors.map(d => d.specialty))].sort();

  const expCount = (r: CatExpRange) => {
    if (r === 'all') return allDoctors.length;
    if (r === '0-10') return allDoctors.filter(d => d.experience <= 10).length;
    if (r === '11-20') return allDoctors.filter(d => d.experience >= 11 && d.experience <= 20).length;
    return allDoctors.filter(d => d.experience >= 21).length;
  };
  const specCount = (s: string) => s === 'all' ? allDoctors.length : allDoctors.filter(d => d.specialty === s).length;

  const doctors = allDoctors
    .filter(d => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return d.name.toLowerCase().includes(q) || (d.nameEn ?? '').toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q);
    })
    .filter(d => {
      if (filterExp === '0-10') return d.experience <= 10;
      if (filterExp === '11-20') return d.experience >= 11 && d.experience <= 20;
      if (filterExp === '21+') return d.experience >= 21;
      return true;
    })
    .filter(d => filterSpec === 'all' ? true : d.specialty === filterSpec)
    .filter(d => d.patientPrice >= priceMin && d.patientPrice <= priceMax);

  const hasFilter = filterExp !== 'all' || filterSpec !== 'all' || priceMin > 0 || priceMax < CAT_PRICE_MAX;
  const activeCount = (filterExp !== 'all' ? 1 : 0) + (filterSpec !== 'all' ? 1 : 0) + (priceMin > 0 || priceMax < CAT_PRICE_MAX ? 1 : 0);
  const resetFilters = () => { setFilterExp('all'); setFilterSpec('all'); setPriceMin(0); setPriceMax(CAT_PRICE_MAX); };

  const filterInner = (mobilePad = false) => (
    <>
      <div className="border-b border-gray-100">
        <button onClick={() => setOpenExp(p => !p)} className={`w-full flex items-center justify-between gap-1.5 ${mobilePad ? 'px-4' : 'px-3'} py-3`}>
          <div className="flex items-center gap-1.5">
            <BriefcaseMedical className="w-3 h-3 text-gray-400" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{mm ? 'အတွေ့အကြုံ' : 'Experience'}</p>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${openExp ? 'rotate-180' : ''}`} />
        </button>
        {openExp && (
          <div className={`${mobilePad ? 'px-4' : 'px-3'} pb-3`}>
            {([
              { value: 'all', labelMm: 'အားလုံး', labelEn: 'All levels' },
              { value: '0-10', labelMm: '၁–၁၀ နှစ်', labelEn: '1–10 years' },
              { value: '11-20', labelMm: '၁၁–၂၀ နှစ်', labelEn: '11–20 years' },
              { value: '21+', labelMm: '၂၁ နှစ်အထက်', labelEn: '21+ years' },
            ] as { value: CatExpRange; labelMm: string; labelEn: string }[]).map(o => (
              <CatRadioRow key={o.value} active={filterExp === o.value}
                label={mm ? o.labelMm : o.labelEn} count={expCount(o.value)}
                onClick={() => setFilterExp(o.value)} />
            ))}
          </div>
        )}
      </div>

      <div className="border-b border-gray-100">
        <button onClick={() => setOpenSpec(p => !p)} className={`w-full flex items-center justify-between gap-1.5 ${mobilePad ? 'px-4' : 'px-3'} py-3`}>
          <div className="flex items-center gap-1.5">
            <Stethoscope className="w-3 h-3 text-gray-400" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{mm ? 'အထူးကု' : 'Specialty'}</p>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${openSpec ? 'rotate-180' : ''}`} />
        </button>
        {openSpec && (
          <div className={`${mobilePad ? 'px-4' : 'px-3'} pb-3`}>
            {(['all', ...allSpecs]).map(spec => (
              <CatRadioRow key={spec} active={filterSpec === spec}
                label={spec === 'all' ? (mm ? 'အားလုံး' : 'All specialties') : spec}
                count={specCount(spec)}
                onClick={() => setFilterSpec(spec)} />
            ))}
          </div>
        )}
      </div>

      <div>
        <button onClick={() => setOpenFee(p => !p)} className={`w-full flex items-center justify-between gap-1.5 ${mobilePad ? 'px-4' : 'px-3'} py-3`}>
          <div className="flex items-center gap-1.5">
            <Banknote className="w-3 h-3 text-gray-400" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{mm ? 'တိုင်ပင်ဆွေးနွေးခ' : 'Fee'}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${PRIMARY}10`, color: PRIMARY }}>
              {priceMin > 0 || priceMax < CAT_PRICE_MAX ? `${(priceMin / 1000).toFixed(0)}K–${(priceMax / 1000).toFixed(0)}K` : (mm ? 'အားလုံး' : 'Any')}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${openFee ? 'rotate-180' : ''}`} />
          </div>
        </button>
        {openFee && (
          <div className={`${mobilePad ? 'px-4' : 'px-3'} pt-0 pb-3`}>
            <div className="relative py-2.5 px-1">
              <div className="h-1 bg-gray-200 rounded-full relative">
                <div className="absolute h-full rounded-full"
                  style={{ left: `${(priceMin / CAT_PRICE_MAX) * 100}%`, right: `${100 - (priceMax / CAT_PRICE_MAX) * 100}%`, backgroundColor: PRIMARY }} />
              </div>
              <input type="range" min={0} max={CAT_PRICE_MAX} step={1000} value={priceMin}
                onChange={e => { const v = Number(e.target.value); if (v < priceMax - 2000) setPriceMin(v); }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                style={{ zIndex: priceMin > CAT_PRICE_MAX - 6000 ? 5 : 3 }} />
              <input type="range" min={0} max={CAT_PRICE_MAX} step={1000} value={priceMax}
                onChange={e => { const v = Number(e.target.value); if (v > priceMin + 2000) setPriceMax(v); }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" style={{ zIndex: 4 }} />
              <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow pointer-events-none"
                style={{ left: `calc(${(priceMin / CAT_PRICE_MAX) * 100}% - 6px)`, backgroundColor: PRIMARY }} />
              <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow pointer-events-none"
                style={{ left: `calc(${(priceMax / CAT_PRICE_MAX) * 100}% - 6px)`, backgroundColor: PRIMARY }} />
            </div>
            <div className="flex justify-between px-1">
              <span className="text-[10px] text-gray-400">0</span>
              <span className="text-[10px] text-gray-400">{CAT_PRICE_MAX.toLocaleString()} Ks</span>
            </div>
          </div>
        )}
      </div>
    </>
  );

  const DoctorCard = ({ d }: { d: Doctor }) => {
    const name = mm ? d.name : (d.nameEn ?? d.name);
    return (
      <Link href={`/doctors/${d.id}`}
        className="rounded-2xl border border-gray-100 bg-white overflow-hidden flex flex-col hover:shadow-md transition-shadow">
        <div className="relative w-full h-48 bg-gray-50">
          {d.imageUrl ? (
            <Image src={d.imageUrl} alt={name} fill className="object-cover object-top" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white"
              style={{ background: `linear-gradient(160deg, ${PRIMARY} 0%, #1a3a8f 100%)` }}>
              {d.name.charAt(0)}
            </div>
          )}
          <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: PRIMARY }}>
            {d.specialty}
          </span>
        </div>
        <div className="p-4 flex flex-col gap-2 flex-1">
          <h3 className="text-sm font-bold text-gray-800 leading-snug line-clamp-2">{name}</h3>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-gray-700">{d.rating.toFixed(1)}</span>
              {d.reviewCount > 0 && <span>({d.reviewCount})</span>}
            </div>
            <span>{d.experience} {mm ? 'နှစ်' : 'yrs'}</span>
          </div>
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
            <p className="text-sm font-bold" style={{ color: PRIMARY }}>{d.patientPrice.toLocaleString()} MMK</p>
            <span className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: PRIMARY }}>
              {mm ? 'ကြည့်ရန်' : 'View'} <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </Link>
    );
  };

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
      <Stethoscope className="w-10 h-10 text-gray-200" />
      <p className="text-sm">{mm ? 'ဆရာဝန် မတွေ့ပါ' : 'No doctors found'}</p>
    </div>
  );

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10 sm:py-14">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> {mm ? 'အမျိုးအစားများ' : 'All Categories'}
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{mm ? 'ဆရာဝန်နှင့် တိုင်ပင်ပြသခြင်း' : 'Consult a Doctor'}</h1>

        <div className="flex items-center gap-2 mt-5">
          <CatSearchBox doctors={allDoctors} value={search} onChange={setSearch} mm={mm}
            placeholder={mm ? 'ဆရာဝန် ရှာဖွေပါ...' : 'Search by name or specialty...'}
            pillClassName="flex items-center gap-2 rounded-xl px-4 py-3 w-full bg-gray-900/90"
          />
          <button onClick={() => setShowMobileFilter(true)}
            className="lg:hidden relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gray-900/90">
            <SlidersHorizontal className="w-4 h-4 text-white/70" />
            {activeCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: '#ef4444' }}>
                {activeCount}
              </span>
            )}
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-3">
          {loading ? (mm ? 'ရှာနေသည်...' : 'Loading...') : `${doctors.length} ${mm ? 'ဆရာဝန်' : doctors.length === 1 ? 'doctor' : 'doctors'}`}
        </p>

        <div className="mt-6 flex gap-6">
          {/* Cards */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : doctors.length === 0 ? emptyState : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {doctors.map(d => <DoctorCard key={d.id} d={d} />)}
              </div>
            )}
          </div>

          {/* Desktop filter sidebar */}
          <div className="hidden lg:block shrink-0 w-72">
            <div className="sticky top-6">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
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
                    <button onClick={resetFilters} className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg hover:bg-red-50" style={{ color: '#ef4444' }}>
                      <RotateCcw className="w-3 h-3" /> {mm ? 'ရှင်းမည်' : 'Reset'}
                    </button>
                  )}
                </div>
                {filterInner(false)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile filter sheet */}
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
                className="w-full py-3.5 rounded-2xl text-sm font-bold text-white" style={{ backgroundColor: PRIMARY }}>
                {mm ? `ဆရာဝန် ${doctors.length} ဦး ကြည့်မည်` : `View ${doctors.length} doctor${doctors.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DoctorsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const spec = searchParams.get('spec') ?? '';
  const category = searchParams.get('category') ?? '';
  const highlight = searchParams.get('highlight') ?? '';

  if (category) {
    return <DoctorsByCategory categoryId={category} onBack={() => router.push('/')} />;
  }

  if (spec) {
    return (
      <DoctorsBySpecialty
        spec={spec}
        highlight={highlight}
        onBack={() => router.push('/doctors')}
      />
    );
  }

  return (
    <SpecialtyPicker onPick={name => router.push(`/doctors?spec=${encodeURIComponent(name)}`)} />
  );
}

export default function DoctorsPage() {
  return (
    <Suspense fallback={null}>
      <DoctorsPageInner />
    </Suspense>
  );
}
