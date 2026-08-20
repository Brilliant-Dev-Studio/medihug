'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Star, Building2, ArrowRight, ArrowLeft, ChevronRight, MapPin, BadgeCheck } from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';

const PRIMARY = '#0d2b6e';

interface PartnerType { id: string; name: string; nameEn: string | null; }

interface Clinic {
  id: string; name: string; nameEn: string | null;
  type: string;
  address: string | null; addressEn: string | null;
  township: string | null;
  imageUrl: string | null;
  rating: number; reviewCount: number;
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
      <div className="max-w-6xl mx-auto px-6 py-10 sm:py-14">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{mm ? 'မိတ်ဖက်များ' : 'Our Partners'}</h1>
        <p className="text-sm text-gray-500 mt-1.5">{mm ? 'အမျိုးအစားအလိုက် ရွေးချယ်ပြီး မိတ်ဖက်များကို ကြည့်ရှုပါ' : 'Pick a category to see the partners under it'}</p>

        <div className="relative mt-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={mm ? 'အမျိုးအစား ရှာဖွေရန်...' : 'Search categories...'}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[#0d2b6e] transition-colors"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-6">
            {Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
            <Building2 className="w-10 h-10 text-gray-200" />
            <p className="text-sm">{mm ? 'အမျိုးအစား မတွေ့ပါ' : 'No categories found'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-6">
            {filtered.map(t => {
              const label = mm ? t.name : (t.nameEn ?? t.name);
              return (
                <button
                  key={t.id}
                  onClick={() => onPick(t.name)}
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

/* ── Step 2: partners under the chosen category ── */
function ClinicsByType({ type, highlight, onBack }: { type: string; highlight: string; onBack: () => void }) {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const [clinics, setClinics] = useState<Clinic[]>([]);
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
      <div className="max-w-6xl mx-auto px-6 py-10 sm:py-14">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> {mm ? 'အမျိုးအစားများ' : 'All Categories'}
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{type}</h1>
        <p className="text-sm text-gray-500 mt-1.5">
          {loading ? (mm ? 'ရှာနေသည်...' : 'Loading...') : `${clinics.length} ${mm ? 'မိတ်ဖက်' : clinics.length === 1 ? 'partner' : 'partners'}`}
        </p>

        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : clinics.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
              <Building2 className="w-10 h-10 text-gray-200" />
              <p className="text-sm">{mm ? 'မိတ်ဖက် မတွေ့ပါ' : 'No partners found'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {clinics.map(c => {
                const name = mm ? c.name : (c.nameEn ?? c.name);
                const address = mm ? (c.address ?? c.addressEn) : (c.addressEn ?? c.address);
                const location = [address, c.township].filter(Boolean).join(', ');
                const isHighlighted = c.id === highlight;
                return (
                  <Link key={c.id} href={`/patient/clinics/${c.id}`}
                    ref={isHighlighted ? highlightRef : undefined}
                    className={`rounded-2xl border bg-white overflow-hidden flex flex-col hover:shadow-md transition-shadow ${
                      isHighlighted ? 'border-2 ring-4' : 'border-gray-100'
                    }`}
                    style={isHighlighted ? { borderColor: PRIMARY, ['--tw-ring-color' as string]: `${PRIMARY}33` } : undefined}>
                    <div className="relative w-full h-48" style={{ backgroundColor: `${PRIMARY}08` }}>
                      {c.imageUrl ? (
                        <Image src={c.imageUrl} alt={name} fill className="object-contain p-6" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="w-10 h-10" style={{ color: `${PRIMARY}40` }} />
                        </div>
                      )}
                      <span className="absolute top-3 left-3 flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: PRIMARY }}>
                        <BadgeCheck className="w-3.5 h-3.5" /> {c.type}
                      </span>
                    </div>
                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <h3 className="text-sm font-bold text-gray-800 leading-snug line-clamp-2">{name}</h3>
                      {location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <p className="text-xs text-gray-400 truncate">{location}</p>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-bold text-gray-700">{c.rating.toFixed(1)}</span>
                          {c.reviewCount > 0 && <span className="text-xs text-gray-400">({c.reviewCount})</span>}
                        </div>
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

function ClinicsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') ?? '';
  const highlight = searchParams.get('highlight') ?? '';

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
