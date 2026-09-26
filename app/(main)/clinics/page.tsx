'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Search, Building2, ArrowLeft, ChevronRight } from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';
import { PartnerCard, PartnerCardSkeleton, type PartnerClinic } from '@/components/CategoryPartners';

const PRIMARY = '#0d2b6e';
const ACCENT = '#2ab5ad';
const CATEGORY_COLORS = [ACCENT, '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9', '#ec4899', '#10b981', '#f97316'];

interface PartnerType { id: string; name: string; nameEn: string | null; }

function PageHero({ eyebrow, title, subtitle, idSuffix }: { eyebrow: string; title: string; subtitle: string; idSuffix: string }) {
  return (
    <>
      {/* Desktop hero — light brand-tinted band with a dot pattern and a faint icon watermark */}
      <div className="hidden lg:block relative overflow-hidden border-b border-gray-100" style={{ background: `linear-gradient(135deg, ${PRIMARY}06 0%, ${PRIMARY}0f 100%)` }}>
        <svg className="absolute inset-0 w-full h-full opacity-[0.07]" aria-hidden="true">
          <defs>
            <pattern id={`hero-dots-${idSuffix}`} width="26" height="26" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="2" fill={PRIMARY} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#hero-dots-${idSuffix})`} />
        </svg>
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full opacity-[0.08] pointer-events-none" style={{ background: PRIMARY }} />
        <div className="absolute right-32 -bottom-16 w-48 h-48 rounded-full opacity-10 pointer-events-none" style={{ background: ACCENT }} />
        <Image
          src="/medihug-icon.png" alt="" width={340} height={340} aria-hidden
          className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-[0.07] pointer-events-none select-none object-contain"
        />
        <div className="max-w-6xl mx-auto px-8 pt-14 pb-10 relative">
          <div className="flex items-center gap-2">
            <Image src="/medihug-icon.png" alt="" width={20} height={20} aria-hidden className="object-contain" />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: PRIMARY }}>{eyebrow}</p>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mt-2">{title}</h1>
          <p className="text-sm text-gray-500 mt-2 max-w-lg">{subtitle}</p>
          <div className="h-1 w-14 rounded-full mt-4" style={{ background: `linear-gradient(90deg, ${PRIMARY} 0%, ${ACCENT} 100%)` }} />
        </div>
      </div>

      {/* Mobile/tablet hero — dark, colorful banner */}
      <div className="lg:hidden relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #163a8a 100%)` }}>
        <svg className="absolute inset-0 w-full h-full opacity-[0.08]" aria-hidden="true">
          <defs>
            <pattern id={`hero-dots-mobile-${idSuffix}`} width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.6" fill="#fff" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#hero-dots-mobile-${idSuffix})`} />
        </svg>
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-10 pointer-events-none" style={{ background: ACCENT }} />
        <div className="absolute -right-6 bottom-0 w-28 h-28 rounded-full opacity-10 pointer-events-none translate-y-1/2" style={{ background: '#4facfe' }} />
        <Image
          src="/medihug-icon.png" alt="" width={150} height={150} aria-hidden
          className="absolute -right-2 -bottom-4 opacity-[0.12] pointer-events-none select-none object-contain"
        />
        <div className="relative px-6 pt-8 pb-8">
          <div className="flex items-center gap-2 mb-2">
            <Image src="/medihug-icon.png" alt="" width={16} height={16} aria-hidden className="object-contain" />
            <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest">{eyebrow}</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{title}</h1>
          <p className="text-white/70 text-sm mt-1.5 max-w-xs">{subtitle}</p>
          <div className="h-1 w-12 rounded-full mt-4" style={{ background: `linear-gradient(90deg, ${ACCENT} 0%, #fff 100%)`, opacity: 0.9 }} />
        </div>
      </div>
    </>
  );
}

/* ── Step 1: full-page category picker ── */
function PartnerTypePicker({ onPick }: { onPick: (name: string) => void }) {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const [types,   setTypes]   = useState<PartnerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  useEffect(() => {
    fetch('/api/partner-types')
      .then(r => r.json())
      .then(d => { setTypes(d.partnerTypes ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = types.filter(t => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return t.name.toLowerCase().includes(q) || (t.nameEn ?? '').toLowerCase().includes(q);
  });

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <PageHero
        idSuffix="clinics-picker"
        eyebrow="MediHug Partners"
        title={mm ? 'မိတ်ဖက်များ' : 'Our Partners'}
        subtitle={mm ? 'အမျိုးအစားအလိုက် ရွေးချယ်ပြီး မိတ်ဖက်များကို ကြည့်ရှုပါ' : 'Pick a category to see the partners under it'}
      />

      <div className="max-w-6xl mx-auto px-6 lg:px-8 pb-10 pt-6 lg:pt-8">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={mm ? 'အမျိုးအစား ရှာဖွေရန်...' : 'Search categories...'}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[#0d2b6e] transition-colors shadow-sm"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-6">
            {Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
            <Building2 className="w-10 h-10 text-gray-200" />
            <p className="text-sm">{mm ? 'အမျိုးအစား မတွေ့ပါ' : 'No categories found'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-6">
            {filtered.map((t, i) => {
              const label = mm ? t.name : (t.nameEn ?? t.name);
              const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
              return (
                <button
                  key={t.id}
                  onClick={() => onPick(t.name)}
                  className="group flex items-center gap-3 bg-white border rounded-xl px-4 py-4 text-left font-bold text-gray-800 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{ borderColor: `${color}30` }}
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span className="leading-snug flex-1 truncate">{label}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color }} />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Step 2: partners under the chosen category ── */
function ClinicsByType({ type, highlight, onBack }: { type: string; highlight: string; onBack: () => void }) {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const [clinics, setClinics] = useState<PartnerClinic[]>([]);
  const [loading, setLoading] = useState(true);
  const highlightRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/clinics?limit=60&type=${encodeURIComponent(type)}`)
      .then(r => r.json())
      .then(d => { setClinics(d.clinics ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [type]);

  useEffect(() => {
    if (!highlight || loading || !highlightRef.current) return;
    highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlight, loading]);

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <PageHero
        idSuffix="clinics-type"
        eyebrow="MediHug Partners"
        title={type}
        subtitle={loading ? (mm ? 'ရှာနေသည်...' : 'Loading...') : `${clinics.length} ${mm ? 'မိတ်ဖက်' : clinics.length === 1 ? 'partner' : 'partners'}`}
      />

      <div className="max-w-6xl mx-auto px-6 lg:px-8 pb-10 pt-6 lg:pt-8">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors mb-2">
          <ArrowLeft className="w-4 h-4" /> {mm ? 'အမျိုးအစားများ' : 'All Categories'}
        </button>

        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <PartnerCardSkeleton key={i} />)}
            </div>
          ) : clinics.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
              <Building2 className="w-10 h-10 text-gray-200" />
              <p className="text-sm">{mm ? 'မိတ်ဖက် မတွေ့ပါ' : 'No partners found'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {clinics.map(c => {
                const isHighlighted = c.id === highlight;
                return <PartnerCard key={c.id} clinic={c} highlighted={isHighlighted} linkRef={isHighlighted ? highlightRef : undefined} />;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Partners tagged onto a landing-page category (SuperAdmin → Product Categories) ── */
function ClinicsByCategory({ categoryId, onBack }: { categoryId: string; onBack: () => void }) {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const [clinics, setClinics] = useState<PartnerClinic[]>([]);
  const [title, setTitle] = useState('');
  // Loading is derived from which category the data belongs to, so switching category shows the
  // skeleton again without a synchronous setState in the effect.
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const loading = loadedFor !== categoryId;

  useEffect(() => {
    Promise.all([
      fetch(`/api/clinics?limit=60&categoryId=${encodeURIComponent(categoryId)}`).then(r => r.json()),
      fetch('/api/product-categories').then(r => r.json()).catch(() => ({})),
    ])
      .then(([d, c]) => {
        setClinics(d.clinics ?? []);
        const cat = (c.categories ?? []).find((x: { id: string }) => x.id === categoryId);
        setTitle(cat ? (mm ? cat.name : (cat.nameEn ?? cat.name)) : '');
        setLoadedFor(categoryId);
      })
      .catch(() => setLoadedFor(categoryId));
  }, [categoryId, mm]);

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <PageHero
        idSuffix="clinics-category"
        eyebrow="MediHug Partners"
        title={title || (mm ? 'မိတ်ဖက်များ' : 'Our Partners')}
        subtitle={loading ? (mm ? 'ရှာနေသည်...' : 'Loading...') : `${clinics.length} ${mm ? 'မိတ်ဖက်' : clinics.length === 1 ? 'partner' : 'partners'}`}
      />

      <div className="max-w-6xl mx-auto px-6 lg:px-8 pb-10 pt-6 lg:pt-8">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors mb-2">
          <ArrowLeft className="w-4 h-4" /> {mm ? 'အမျိုးအစားများ' : 'All Categories'}
        </button>

        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <PartnerCardSkeleton key={i} />)}
            </div>
          ) : clinics.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
              <Building2 className="w-10 h-10 text-gray-200" />
              <p className="text-sm">{mm ? 'မိတ်ဖက် မတွေ့ပါ' : 'No partners found'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {clinics.map(c => <PartnerCard key={c.id} clinic={c} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ClinicsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') ?? '';
  const highlight = searchParams.get('highlight') ?? '';
  const pcat = searchParams.get('pcat') ?? '';

  if (pcat) {
    return <ClinicsByCategory categoryId={pcat} onBack={() => router.push('/')} />;
  }

  if (type) {
    return (
      <ClinicsByType
        type={type}
        highlight={highlight}
        onBack={() => router.push('/clinics')}
      />
    );
  }

  return (
    <PartnerTypePicker onPick={name => router.push(`/clinics?type=${encodeURIComponent(name)}`)} />
  );
}

export default function ClinicsPage() {
  return (
    <Suspense fallback={null}>
      <ClinicsPageInner />
    </Suspense>
  );
}
