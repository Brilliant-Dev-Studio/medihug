'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Search, SlidersHorizontal, Clock, Star, BriefcaseMedical, Stethoscope, Banknote, Check, RotateCcw, ListFilter } from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';

type Doctor = {
  id: number;
  name_mm: string;
  name_en: string;
  spec_mm: string;
  spec_en: string;
  exp: number;
  price: number;
  waitMin: number;
  nextSlot_mm: string;
  nextSlot_en: string;
  img: string;
  online: boolean;
  rating: number;
  myDoctor?: boolean;
};

const ALL_DOCTORS: Doctor[] = [
  {
    id: 1,
    name_mm: 'ပါမောက္ခသိန်းအောင်',
    name_en: 'Prof. Dr. Thein Aung',
    spec_mm: 'ကလေးကျန်းမာရေးအထူးကု',
    spec_en: 'Pediatric Specialist',
    exp: 43, price: 22000, waitMin: 15, rating: 4.9,
    nextSlot_mm: 'မနက်ဖြန် မနက် 9:00',
    nextSlot_en: 'Tomorrow 9:00 AM',
    img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
    online: true, myDoctor: true,
  },
  {
    id: 2,
    name_mm: 'ဒေါ်ကျော်ကျော်သိန်း',
    name_en: 'Dr. Kyaw Kyaw Thein',
    spec_mm: 'နှလုံးအထူးကု',
    spec_en: 'Cardiologist',
    exp: 28, price: 15000, waitMin: 10, rating: 4.8,
    nextSlot_mm: 'ယနေ့ မွန်းလွဲ 2:00',
    nextSlot_en: 'Today 2:00 PM',
    img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
    online: true,
  },
  {
    id: 3,
    name_mm: 'ဒေါ်သန်းသန်းမြင့်',
    name_en: 'Dr. Than Than Myint',
    spec_mm: 'ကလေးအထူးကု',
    spec_en: 'Pediatrician',
    exp: 18, price: 10000, waitMin: 30, rating: 4.7,
    nextSlot_mm: 'မနက်ဖြန် မနက် 10:30',
    nextSlot_en: 'Tomorrow 10:30 AM',
    img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face',
    online: false, myDoctor: true,
  },
  {
    id: 4,
    name_mm: 'ဦးမောင်မောင်ဝင်း',
    name_en: 'Dr. Maung Maung Win',
    spec_mm: 'အရေပြားအထူးကု',
    spec_en: 'Dermatologist',
    exp: 12, price: 12000, waitMin: 20, rating: 4.6,
    nextSlot_mm: 'ယနေ့ ညနေ 4:00',
    nextSlot_en: 'Today 4:00 PM',
    img: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
    online: true,
  },
  {
    id: 5,
    name_mm: 'ဒေါ်နွဲ့နွဲ့မြင့်',
    name_en: 'Dr. Nwe Nwe Myint',
    spec_mm: 'မျက်စိအထူးကု',
    spec_en: 'Ophthalmologist',
    exp: 22, price: 18000, waitMin: 45, rating: 4.9,
    nextSlot_mm: 'မနက်ဖြန် မနက် 8:00',
    nextSlot_en: 'Tomorrow 8:00 AM',
    img: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face',
    online: false,
  },
];

const PRIMARY   = '#0d2b6e';
const SECONDARY = '#1a6bcc';
const ACCENT    = '#4facfe';

/* ─── Mobile card (horizontal) ─── */
function DoctorCardMobile({ doc, mm, favorited, onToggleFav }: {
  doc: Doctor; mm: boolean; favorited: boolean; onToggleFav: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="p-4">
        <div className="flex gap-3">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-100">
              <Image src={doc.img} alt={doc.name_en} width={80} height={80} className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="font-bold text-base leading-tight" style={{ color: PRIMARY }}>
                {mm ? doc.name_mm : doc.name_en}
              </p>
              <button onClick={onToggleFav} className="shrink-0 mt-0.5 transition-transform active:scale-90">
                <Heart className="w-5 h-5" style={{ color: favorited ? '#ef4444' : '#d1d5db', fill: favorited ? '#ef4444' : 'transparent' }} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{mm ? doc.spec_mm : doc.spec_en}</p>
            <p className="text-sm text-gray-500 mt-0.5">
              {mm ? `အတွေ့အကြုံ (${doc.exp}) နှစ်` : `${doc.exp} yrs exp`}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-sm font-bold" style={{ color: PRIMARY }}>{doc.price.toLocaleString()} MMK</span>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-sm text-gray-500">{mm ? `${doc.waitMin} မိနစ်` : `${doc.waitMin} min`}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-100 px-4 py-2.5 flex items-center justify-between">
        <p className="text-xs text-gray-400">{mm ? 'အစောဆုံးပြန်နိုင်သည်' : 'Earliest available'}</p>
        <p className="text-xs font-semibold" style={{ color: PRIMARY }}>{mm ? doc.nextSlot_mm : doc.nextSlot_en}</p>
      </div>
      <div className="px-4 pb-4 flex gap-2">
        <Link href={`/patient/doctors/${doc.id}`} className="flex-1 text-center text-sm font-semibold py-2.5 rounded-full border transition-all active:scale-95" style={{ borderColor: PRIMARY, color: PRIMARY }}>
          {mm ? 'ကိုယ်ရေးအကျဉ်း' : 'View Profile'}
        </Link>
        <Link href="/patient/appointments" className="flex-1 text-center text-sm font-bold py-2.5 rounded-full text-white transition-all active:scale-95" style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
          {mm ? 'ချိန်းဆိုမည်' : 'Book Now'}
        </Link>
      </div>
    </div>
  );
}

/* ─── Desktop card (vertical) ─── */
function DoctorCardDesktop({ doc, mm, favorited, onToggleFav }: {
  doc: Doctor; mm: boolean; favorited: boolean; onToggleFav: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col transition-shadow">
      {/* Photo */}
      <div className="relative w-full overflow-hidden bg-gray-100" style={{ height: 200 }}>
        <Image src={doc.img} alt={doc.name_en} fill className="object-cover" />
        {/* Fav button */}
        <button
          onClick={onToggleFav}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center transition-transform active:scale-90"
        >
          <Heart className="w-4 h-4" style={{ color: favorited ? '#ef4444' : '#9ca3af', fill: favorited ? '#ef4444' : 'transparent' }} />
        </button>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <p className="font-bold text-base leading-tight" style={{ color: PRIMARY }}>
            {mm ? doc.name_mm : doc.name_en}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">{mm ? doc.spec_mm : doc.spec_en}</p>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>{mm ? `အတွေ့အကြုံ ${doc.exp} နှစ်` : `${doc.exp} yrs exp`}</span>
          <span className="text-gray-200">|</span>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-gray-600">{doc.rating}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{mm ? `${doc.waitMin} မိနစ်အတွင်း` : `Available in ${doc.waitMin} min`}</span>
        </div>

        <div className="mt-auto pt-2 border-t border-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] text-gray-400">{mm ? 'တိုင်ပင်ဆွေးနွေးခ' : 'Consultation fee'}</p>
              <p className="text-base font-bold" style={{ color: PRIMARY }}>{doc.price.toLocaleString()} MMK</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400">{mm ? 'အစောဆုံး' : 'Next slot'}</p>
              <p className="text-xs font-semibold" style={{ color: ACCENT }}>{mm ? doc.nextSlot_mm : doc.nextSlot_en}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/patient/doctors/${doc.id}`}
              className="flex-1 text-center text-sm font-semibold py-2.5 rounded-full border transition-all hover:bg-gray-50"
              style={{ borderColor: PRIMARY, color: PRIMARY }}
            >
              {mm ? 'ကိုယ်ရေးအကျဉ်း' : 'Profile'}
            </Link>
            <Link
              href="/patient/appointments"
              className="flex-1 text-center text-sm font-bold py-2.5 rounded-full text-white transition-all hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}
            >
              {mm ? 'ချိန်းဆို' : 'Book'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

type Tab = 'all' | 'my';
type ExpRange   = 'all' | '0-10' | '11-20' | '21+';

const ALL_SPECS = [...new Set(ALL_DOCTORS.map(d => d.spec_en))];

const EXP_COUNTS: Record<ExpRange, number> = {
  all:     ALL_DOCTORS.length,
  '0-10':  ALL_DOCTORS.filter(d => d.exp <= 10).length,
  '11-20': ALL_DOCTORS.filter(d => d.exp >= 11 && d.exp <= 20).length,
  '21+':   ALL_DOCTORS.filter(d => d.exp >= 21).length,
};
const SPEC_COUNTS: Record<string, number> = {
  all: ALL_DOCTORS.length,
  ...Object.fromEntries(ALL_SPECS.map(s => [s, ALL_DOCTORS.filter(d => d.spec_en === s).length])),
};

function RadioRow({ active, label, count, onClick }: { active: boolean; label: string; count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all"
      style={{ backgroundColor: active ? `${PRIMARY}08` : 'transparent' }}
    >
      <span
        className="shrink-0 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all"
        style={{ borderColor: active ? PRIMARY : '#d1d5db', backgroundColor: active ? PRIMARY : 'transparent' }}
      >
        {active && <Check className="w-2 h-2 text-white" strokeWidth={3} />}
      </span>
      <span className="flex-1 text-xs text-left transition-colors" style={{ color: active ? PRIMARY : '#374151', fontWeight: active ? 600 : 400 }}>
        {label}
      </span>
      <span
        className="text-[10px] px-1.5 py-0.5 rounded transition-all min-w-4.5 text-center"
        style={{ backgroundColor: active ? `${PRIMARY}18` : '#f3f4f6', color: active ? PRIMARY : '#9ca3af', fontWeight: active ? 600 : 400 }}
      >
        {count}
      </span>
    </button>
  );
}

export default function DoctorsPage() {
  const { lang } = useLang();
  const mm = lang === 'mm';

  const [tab, setTab]           = useState<Tab>('all');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [search, setSearch]     = useState('');
  const [filterExp, setFilterExp]       = useState<ExpRange>('all');
  const [filterSpec, setFilterSpec]     = useState<string>('all');
  const [priceMin, setPriceMin]         = useState(0);
  const [priceMax, setPriceMax]         = useState(50000);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const toggleFav = (id: number) =>
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const hasFilter = filterExp !== 'all' || filterSpec !== 'all' || priceMin > 0 || priceMax < 50000;

  const resetFilters = () => {
    setFilterExp('all');
    setFilterSpec('all');
    setPriceMin(0);
    setPriceMax(50000);
  };

  const filtered = ALL_DOCTORS
    .filter(d => tab === 'my' ? d.myDoctor : true)
    .filter(d => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return d.name_mm.includes(search) || d.name_en.toLowerCase().includes(q) ||
             d.spec_mm.includes(search) || d.spec_en.toLowerCase().includes(q);
    })
    .filter(d => {
      if (filterExp === '0-10')  return d.exp <= 10;
      if (filterExp === '11-20') return d.exp >= 11 && d.exp <= 20;
      if (filterExp === '21+')   return d.exp >= 21;
      return true;
    })
    .filter(d => filterSpec === 'all' ? true : d.spec_en === filterSpec)
    .filter(d => d.price >= priceMin && d.price <= priceMax);

  const tabs: { key: Tab; mm: string; en: string }[] = [
    { key: 'all', mm: 'အားလုံး',    en: 'All Doctors' },
    { key: 'my',  mm: 'မိမိဆရာဝန်', en: 'My Doctors' },
  ];

  /* ── active filter count ── */
  const activeCount = (filterExp !== 'all' ? 1 : 0) + (filterSpec !== 'all' ? 1 : 0) + (priceMin > 0 || priceMax < 50000 ? 1 : 0);

  /* ── desktop hero content ── */
  const heroContent = (
    <>
      <h1 className="text-2xl font-bold text-white mb-4">
        {mm ? 'ဆရာဝန်များ' : 'Our Doctors'}
      </h1>
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1 flex items-center gap-2 rounded-2xl px-4 py-3" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
          <Search className="w-4 h-4 shrink-0 text-white/60" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={mm ? 'ဆရာဝန် ရှာဖွေပါ...' : 'Search by name or specialty...'}
            className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-white/50 text-white"
          />
        </div>
      </div>
    </>
  );

  /* ── shared tabs row ── */
  const tabsRow = (
    <div className="pt-4 pb-3 lg:pt-5 lg:pb-4 flex items-center justify-between gap-4 px-4 lg:px-6">
      <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 border border-gray-100">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ backgroundColor: tab === t.key ? PRIMARY : 'transparent', color: tab === t.key ? '#fff' : '#9ca3af' }}
          >
            {mm ? t.mm : t.en}
          </button>
        ))}
      </div>
      <p className="text-sm text-gray-400 shrink-0">
        {mm ? `${filtered.length} ဦး` : `${filtered.length} found`}
      </p>
    </div>
  );

  /* ── filter panel inner ── */
  const filterPanel = (
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
              {activeCount > 0
                ? (mm ? `${activeCount} ခု ရွေးချယ်ထား` : `${activeCount} active`)
                : (mm ? 'စစ်ထုတ်မှု မရှိသေး' : 'No filters')}
            </p>
          </div>
        </div>
        {hasFilter && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all hover:bg-red-50"
            style={{ color: '#ef4444' }}
          >
            <RotateCcw className="w-3 h-3" />
            {mm ? 'ရှင်းမည်' : 'Reset'}
          </button>
        )}
      </div>

      {/* Experience */}
      <div className="px-3 py-3 border-b border-gray-100">
        <div className="flex items-center gap-1.5 mb-1.5">
          <BriefcaseMedical className="w-3 h-3 text-gray-400" />
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {mm ? 'အတွေ့အကြုံ' : 'Experience'}
          </p>
        </div>
        <div className="flex flex-col">
          {([
            { value: 'all',   labelMm: 'အားလုံး',       labelEn: 'All levels' },
            { value: '0-10',  labelMm: '၁–၁၀ နှစ်',     labelEn: '1–10 years' },
            { value: '11-20', labelMm: '၁၁–၂၀ နှစ်',    labelEn: '11–20 years' },
            { value: '21+',   labelMm: '၂၁ နှစ်အထက်',   labelEn: '21+ years' },
          ] as { value: ExpRange; labelMm: string; labelEn: string }[]).map(o => (
            <RadioRow
              key={o.value}
              active={filterExp === o.value}
              label={mm ? o.labelMm : o.labelEn}
              count={EXP_COUNTS[o.value]}
              onClick={() => setFilterExp(o.value)}
            />
          ))}
        </div>
      </div>

      {/* Specialty */}
      <div className="px-3 py-3 border-b border-gray-100">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Stethoscope className="w-3 h-3 text-gray-400" />
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {mm ? 'အထူးကု' : 'Specialty'}
          </p>
        </div>
        <div className="flex flex-col">
          {(['all', ...ALL_SPECS] as string[]).map(spec => {
            const specDoc = ALL_DOCTORS.find(d => d.spec_en === spec);
            const label = spec === 'all'
              ? (mm ? 'အားလုံး' : 'All specialties')
              : (mm && specDoc ? specDoc.spec_mm : spec);
            return (
              <RadioRow
                key={spec}
                active={filterSpec === spec}
                label={label}
                count={SPEC_COUNTS[spec] ?? 0}
                onClick={() => setFilterSpec(spec)}
              />
            );
          })}
        </div>
      </div>

      {/* Price range slider */}
      <div className="px-3 pt-2.5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Banknote className="w-3 h-3 text-gray-400" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {mm ? 'တိုင်ပင်ဆွေးနွေးခ' : 'Fee'}
            </p>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${PRIMARY}10`, color: PRIMARY }}>
            {priceMin > 0 || priceMax < 50000
              ? `${(priceMin/1000).toFixed(0)}K – ${(priceMax/1000).toFixed(0)}K`
              : (mm ? 'အားလုံး' : 'Any')}
          </span>
        </div>

        {/* Dual range track */}
        <div className="relative py-2.5 px-1">
          <div className="h-1 bg-gray-200 rounded-full relative">
            <div
              className="absolute h-full rounded-full"
              style={{
                left:  `${(priceMin / 50000) * 100}%`,
                right: `${100 - (priceMax / 50000) * 100}%`,
                backgroundColor: PRIMARY,
              }}
            />
          </div>
          <input
            type="range" min={0} max={50000} step={1000} value={priceMin}
            onChange={e => { const v = Number(e.target.value); if (v < priceMax - 2000) setPriceMin(v); }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            style={{ zIndex: priceMin > 44000 ? 5 : 3 }}
          />
          <input
            type="range" min={0} max={50000} step={1000} value={priceMax}
            onChange={e => { const v = Number(e.target.value); if (v > priceMin + 2000) setPriceMax(v); }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            style={{ zIndex: 4 }}
          />
          <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow pointer-events-none"
            style={{ left: `calc(${(priceMin / 50000) * 100}% - 6px)`, backgroundColor: PRIMARY }} />
          <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow pointer-events-none"
            style={{ left: `calc(${(priceMax / 50000) * 100}% - 6px)`, backgroundColor: PRIMARY }} />
        </div>

        <div className="flex justify-between px-1">
          <span className="text-[10px] text-gray-400">0</span>
          <span className="text-[10px] text-gray-400">50,000 Ks</span>
        </div>
      </div>

      {/* Footer: result count */}
      <div className="px-3 pb-3">
        <div
          className="w-full py-2.5 rounded-xl text-xs font-bold text-white text-center"
          style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}
        >
          {mm ? `ဆရာဝန် ${filtered.length} ဦး တွေ့ရှိသည်` : `${filtered.length} doctor${filtered.length !== 1 ? 's' : ''} found`}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-full bg-gray-50 lg:bg-gray-100">

      {/* ══ DESKTOP: dashboard-style h-screen two-column ══ */}
      <div className="hidden lg:flex gap-5 h-screen overflow-hidden px-6 py-6 max-w-7xl mx-auto">

        {/* Left: scrollable card */}
        <div className="flex-1 overflow-y-auto rounded-2xl bg-gray-50 flex flex-col">

          {/* Hero */}
          <div
            className="px-8 pt-8 pb-6 rounded-t-2xl shrink-0"
            style={{ background: `linear-gradient(180deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}
          >
            {heroContent}
          </div>

          {/* Tabs */}
          {tabsRow}

          {/* Cards */}
          <div className="flex-1 px-6 pb-8">
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Search className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-400">{mm ? 'ဆရာဝန် မတွေ့ပါ' : 'No doctors found'}</p>
                <p className="text-xs text-gray-300 mt-1">{mm ? 'Filter ပြောင်းကြည့်ပါ' : 'Try adjusting filters'}</p>
              </div>
            )}
            {filtered.length > 0 && (
              <div className="grid grid-cols-3 gap-5">
                {filtered.map(doc => (
                  <DoctorCardDesktop key={doc.id} doc={doc} mm={mm}
                    favorited={favorites.has(doc.id)} onToggleFav={() => toggleFav(doc.id)} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: filter panel */}
        <div className="shrink-0 w-64 bg-gray-100">
          <div className="sticky top-0 flex flex-col gap-4 max-h-screen overflow-y-auto pb-4">
            {filterPanel}
          </div>
        </div>
      </div>

      {/* ══ MOBILE: Filter bottom sheet ══ */}
      {showMobileFilter && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowMobileFilter(false)}
          />
          {/* Slide-in panel from right */}
          <div className="relative bg-white w-72 h-full flex flex-col shadow-2xl">
            {/* Panel header */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${PRIMARY}10` }}>
                  <ListFilter className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
                </div>
                <p className="text-sm font-bold" style={{ color: PRIMARY }}>{mm ? 'စစ်ထုတ်မှု' : 'Filter'}</p>
                {activeCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: PRIMARY }}>
                    {activeCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {hasFilter && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg hover:bg-red-50"
                    style={{ color: '#ef4444' }}
                  >
                    <RotateCcw className="w-3 h-3" />
                    {mm ? 'ရှင်းမည်' : 'Reset'}
                  </button>
                )}
                <button
                  onClick={() => setShowMobileFilter(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <span className="text-gray-400 text-sm leading-none">✕</span>
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1">
              {/* Experience */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-1.5 mb-2">
                  <BriefcaseMedical className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    {mm ? 'အတွေ့အကြုံ' : 'Experience'}
                  </p>
                </div>
                <div className="flex flex-col">
                  {([
                    { value: 'all',   labelMm: 'အားလုံး',       labelEn: 'All levels' },
                    { value: '0-10',  labelMm: '၁–၁၀ နှစ်',     labelEn: '1–10 years' },
                    { value: '11-20', labelMm: '၁၁–၂၀ နှစ်',    labelEn: '11–20 years' },
                    { value: '21+',   labelMm: '၂၁ နှစ်အထက်',   labelEn: '21+ years' },
                  ] as { value: ExpRange; labelMm: string; labelEn: string }[]).map(o => (
                    <RadioRow
                      key={o.value}
                      active={filterExp === o.value}
                      label={mm ? o.labelMm : o.labelEn}
                      count={EXP_COUNTS[o.value]}
                      onClick={() => setFilterExp(o.value)}
                    />
                  ))}
                </div>
              </div>

              {/* Specialty */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-1.5 mb-2">
                  <Stethoscope className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    {mm ? 'အထူးကု' : 'Specialty'}
                  </p>
                </div>
                <div className="flex flex-col">
                  {(['all', ...ALL_SPECS] as string[]).map(spec => {
                    const specDoc = ALL_DOCTORS.find(d => d.spec_en === spec);
                    const label = spec === 'all'
                      ? (mm ? 'အားလုံး' : 'All specialties')
                      : (mm && specDoc ? specDoc.spec_mm : spec);
                    return (
                      <RadioRow
                        key={spec}
                        active={filterSpec === spec}
                        label={label}
                        count={SPEC_COUNTS[spec] ?? 0}
                        onClick={() => setFilterSpec(spec)}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Price */}
              <div className="px-4 pt-3 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Banknote className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                      {mm ? 'တိုင်ပင်ဆွေးနွေးခ' : 'Consultation Fee'}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${PRIMARY}10`, color: PRIMARY }}>
                    {priceMin > 0 || priceMax < 50000
                      ? `${(priceMin/1000).toFixed(0)}K – ${(priceMax/1000).toFixed(0)}K`
                      : (mm ? 'အားလုံး' : 'Any')}
                  </span>
                </div>
                <div className="relative py-3 px-1">
                  <div className="h-1 bg-gray-200 rounded-full relative">
                    <div className="absolute h-full rounded-full" style={{ left: `${(priceMin/50000)*100}%`, right: `${100-(priceMax/50000)*100}%`, backgroundColor: PRIMARY }} />
                  </div>
                  <input type="range" min={0} max={50000} step={1000} value={priceMin}
                    onChange={e => { const v = Number(e.target.value); if (v < priceMax - 2000) setPriceMin(v); }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    style={{ zIndex: priceMin > 44000 ? 5 : 3 }} />
                  <input type="range" min={0} max={50000} step={1000} value={priceMax}
                    onChange={e => { const v = Number(e.target.value); if (v > priceMin + 2000) setPriceMax(v); }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    style={{ zIndex: 4 }} />
                  <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow pointer-events-none"
                    style={{ left: `calc(${(priceMin/50000)*100}% - 8px)`, backgroundColor: PRIMARY }} />
                  <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow pointer-events-none"
                    style={{ left: `calc(${(priceMax/50000)*100}% - 8px)`, backgroundColor: PRIMARY }} />
                </div>
                <div className="flex justify-between px-1">
                  <span className="text-[10px] text-gray-400">0</span>
                  <span className="text-[10px] text-gray-400">50,000 Ks</span>
                </div>
              </div>
            </div>

            {/* Apply button */}
            <div className="px-4 py-4 border-t border-gray-100 shrink-0">
              <button
                onClick={() => setShowMobileFilter(false)}
                className="w-full py-3.5 rounded-2xl text-sm font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}
              >
                {mm ? `ဆရာဝန် ${filtered.length} ဦး ကြည့်မည်` : `View ${filtered.length} doctor${filtered.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MOBILE: full-page scroll ══ */}
      <div className="lg:hidden">
        {/* Hero */}
        <div
          className="-mt-18 pt-21 pb-5 px-4 w-full"
          style={{
            background: `linear-gradient(180deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
          }}
        >
          <h1 className="text-xl font-bold text-white mb-3">
            {mm ? 'ဆရာဝန်များ' : 'Our Doctors'}
          </h1>
          <div className="flex items-center gap-2 w-full">
            <div className="flex-1 flex items-center gap-2 rounded-xl px-4 py-3" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <Search className="w-4 h-4 shrink-0 text-white/60" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={mm ? 'ဆရာဝန် ရှာဖွေပါ...' : 'Search by name or specialty...'}
                className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-white/50 text-white"
              />
            </div>
            <button
              onClick={() => setShowMobileFilter(true)}
              className="relative w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <SlidersHorizontal className="w-4 h-4 text-white/70" />
              {activeCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: '#ef4444' }}>
                  {activeCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        {tabsRow}

        {/* Cards */}
        <div className="px-4 pb-24">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Search className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-400">{mm ? 'ဆရာဝန် မတွေ့ပါ' : 'No doctors found'}</p>
              <p className="text-xs text-gray-300 mt-1">{mm ? 'Filter ပြောင်းကြည့်ပါ' : 'Try adjusting filters'}</p>
            </div>
          )}
          {filtered.length > 0 && (
            <div className="flex flex-col gap-3">
              {filtered.map(doc => (
                <DoctorCardMobile key={doc.id} doc={doc} mm={mm}
                  favorited={favorites.has(doc.id)} onToggleFav={() => toggleFav(doc.id)} />
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
