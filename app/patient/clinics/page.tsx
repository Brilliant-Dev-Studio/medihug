'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, Phone, ArrowRight, Star, MapPin, Search, Building2 } from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';

const PRIMARY = '#0d2b6e';

interface Clinic {
  id: string;
  name: string; nameEn: string | null;
  type: string;
  address: string | null; addressEn: string | null;
  township: string | null;
  phone: string | null;
  openTime: string | null; closeTime: string | null;
  imageUrl: string | null;
  rating: number; reviewCount: number;
  tagsMm: string[]; tagsEn: string[];
}
interface PartnerType { id: string; name: string; nameEn: string | null; }

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
      <div className="h-40 bg-gray-100 animate-pulse" />
      <div className="p-5 flex flex-col gap-2">
        <div className="h-4 bg-gray-100 rounded-lg animate-pulse w-3/4" />
        <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-1/2" />
      </div>
    </div>
  );
}

export default function ClinicsPage() {
  const { lang, tr } = useLang();
  const mm = lang === 'mm';

  const [clinics, setClinics]         = useState<Clinic[]>([]);
  const [types, setTypes]             = useState<PartnerType[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeType, setActiveType]   = useState('all');
  const [search, setSearch]           = useState('');

  useEffect(() => {
    fetch('/api/clinics?limit=200')
      .then(r => r.json())
      .then(d => { setClinics(d.clinics ?? []); setLoading(false); })
      .catch(() => setLoading(false));
    fetch('/api/partner-types')
      .then(r => r.json())
      .then(d => setTypes(d.partnerTypes ?? []))
      .catch(() => {});
  }, []);

  const typeCount = (t: string) =>
    t === 'all' ? clinics.length : clinics.filter(c => c.type.toLowerCase() === t.toLowerCase()).length;

  const filtered = clinics
    .filter(c => activeType === 'all' ? true : c.type.toLowerCase() === activeType.toLowerCase())
    .filter(c => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) ||
             (c.nameEn ?? '').toLowerCase().includes(q) ||
             c.type.toLowerCase().includes(q);
    });

  return (
    <div className="min-h-full bg-gray-50">
      {/* Hero */}
      <div className="px-6 pt-8 pb-10" style={{ background: `linear-gradient(180deg, ${PRIMARY} 0%, #16398f 100%)` }}>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">{tr.partnerTitle}</h1>
          <div className="flex items-center gap-2 rounded-2xl px-4 py-3 bg-white/15 max-w-xl">
            <Search className="w-4 h-4 text-white/70 shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={mm ? 'ဆေးရုံ/ဆေးခန်း ရှာဖွေပါ...' : 'Search clinics or hospitals...'}
              className="bg-transparent outline-none text-sm text-white placeholder:text-white/60 w-full"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Category chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setActiveType('all')}
            className="shrink-0 text-xs sm:text-sm font-semibold px-4 py-2 rounded-full border-2 transition-colors"
            style={activeType === 'all'
              ? { backgroundColor: PRIMARY, borderColor: PRIMARY, color: '#fff' }
              : { borderColor: '#e5e7eb', color: '#374151' }}
          >
            {mm ? 'အားလုံး' : 'All'} ({typeCount('all')})
          </button>
          {types.map(t => {
            const label = mm ? t.name : (t.nameEn ?? t.name);
            const active = activeType.toLowerCase() === t.name.toLowerCase();
            return (
              <button
                key={t.id}
                onClick={() => setActiveType(t.name)}
                className="shrink-0 text-xs sm:text-sm font-semibold px-4 py-2 rounded-full border-2 transition-colors"
                style={active
                  ? { backgroundColor: PRIMARY, borderColor: PRIMARY, color: '#fff' }
                  : { borderColor: '#e5e7eb', color: '#374151' }}
              >
                {label} ({typeCount(t.name)})
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filtered.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Search className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-400">{mm ? 'ဆေးရုံ/ဆေးခန်း မတွေ့ပါ' : 'No clinics found'}</p>
            </div>
          ) : (
            filtered.map(c => {
              const name = mm ? c.name : (c.nameEn ?? c.name);
              const address = mm ? (c.address ?? c.addressEn) : (c.addressEn ?? c.address);
              const location = [address, c.township].filter(Boolean).join(', ');
              const hours = c.openTime && c.closeTime ? `${c.openTime} — ${c.closeTime}` : null;
              const tags = mm ? c.tagsMm : c.tagsEn;

              return (
                <div key={c.id} className="rounded-xl bg-white border border-gray-100 overflow-hidden flex flex-col">
                  <div className="relative w-full h-40 overflow-hidden" style={{ backgroundColor: `${PRIMARY}08` }}>
                    {c.imageUrl ? (
                      <Image src={c.imageUrl} alt={name} fill className="object-contain p-4" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-9 h-9" style={{ color: `${PRIMARY}40` }} />
                      </div>
                    )}
                    <span className="absolute top-2 left-2 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm max-w-[calc(100%-1rem)]">
                      <BadgeCheck className="w-3 h-3 shrink-0" style={{ color: PRIMARY }} />
                      <span className="text-[9px] font-bold uppercase tracking-wide truncate" style={{ color: PRIMARY }}>{c.type}</span>
                    </span>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col gap-2 sm:gap-2.5 flex-1">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug line-clamp-2">{name}</h3>
                      {location && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                          <p className="text-xs text-gray-400 truncate">{location}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 flex-wrap">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className="w-3 h-3" fill={s < Math.round(c.rating) ? '#f59e0b' : 'none'} stroke={s < Math.round(c.rating) ? '#f59e0b' : '#d1d5db'} />
                      ))}
                      {c.reviewCount > 0 && <span className="text-[10px] text-gray-400 ml-0.5">({c.reviewCount})</span>}
                      {hours && <span className="text-[10px] text-gray-400 ml-1">{hours}</span>}
                    </div>

                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {tags.slice(0, 3).map(t => (
                          <span key={t} className="text-[10px] font-semibold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-auto pt-1">
                      {c.phone && (
                        <a
                          href={`tel:${c.phone}`}
                          className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 rounded-full border border-gray-200 flex items-center justify-center transition-colors hover:bg-gray-50"
                        >
                          <Phone className="w-4 h-4 text-gray-700" />
                        </a>
                      )}
                      <Link
                        href={`/patient/clinics/${c.id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-white text-xs font-bold hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: PRIMARY }}
                      >
                        {tr.viewDetails}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
