'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, BadgeCheck, Phone, ArrowRight, Star, MapPin, Building2 } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

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

function SkeletonCard() {
  return (
    <div className="shrink-0 w-48 sm:w-72 rounded-xl bg-white border border-gray-100 overflow-hidden">
      <div className="h-32 sm:h-40 bg-gray-100 animate-pulse" />
      <div className="p-3 sm:p-5 flex flex-col gap-2">
        <div className="h-4 bg-gray-100 rounded-lg animate-pulse w-3/4" />
        <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-1/2" />
        <div className="h-9 bg-gray-100 rounded-full animate-pulse w-full mt-2" />
      </div>
    </div>
  );
}

export default function PartnerClinics() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { lang, tr } = useLang();
  const mm = lang === 'mm';
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/clinics?limit=10')
      .then(r => r.json())
      .then(d => { setClinics(d.clinics ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  return (
    <section className="relative w-full py-10 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6 flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl sm:text-3xl font-bold text-gray-900">{tr.partnerTitle}</h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">{tr.partnerSubtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/patient/clinics" className="text-xs font-semibold px-4 py-2 rounded-full border-2 transition-colors hidden sm:block" style={{ color: PRIMARY, borderColor: PRIMARY }}>
            {tr.seeAll}
          </Link>
          <div className="flex gap-2">
            <button onClick={() => scroll('left')} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
            <button onClick={() => scroll('right')} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="relative z-10 flex gap-5 overflow-x-auto pb-2 max-w-6xl mx-auto px-6"
        style={{ scrollbarWidth: 'none' }}
      >
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : clinics.length === 0 ? (
          <div className="w-full flex flex-col items-center justify-center py-14 text-gray-300">
            <Image src="/9169253-removebg-preview.png" alt="No data" width={80} height={80} className="opacity-70 mb-2" />
            <p className="text-sm text-gray-400">{mm ? 'ဒေတာ မရှိသေးပါ' : 'No data yet'}</p>
          </div>
        ) : (
          clinics.map(c => {
            const name = mm ? c.name : (c.nameEn ?? c.name);
            const address = mm ? (c.address ?? c.addressEn) : (c.addressEn ?? c.address);
            const location = [address, c.township].filter(Boolean).join(', ');
            const hours = c.openTime && c.closeTime ? `${c.openTime} — ${c.closeTime}` : null;
            const tags = mm ? c.tagsMm : c.tagsEn;

            return (
              <div key={c.id} className="shrink-0 w-48 sm:w-72 rounded-xl bg-white border border-gray-100 overflow-hidden flex flex-col">

                {/* Image */}
                <div className="relative w-full h-32 sm:h-40 overflow-hidden" style={{ backgroundColor: `${PRIMARY}08` }}>
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

                {/* Body */}
                <div className="p-3 sm:p-5 flex flex-col gap-1.5 sm:gap-2.5 flex-1">
                  <div>
                    <h3 className="text-sm sm:text-lg font-bold text-gray-900 leading-snug line-clamp-2 min-h-[2.4em] sm:min-h-[2.6em]">{name}</h3>
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
                    {hours && (
                      <span className="text-[10px] text-gray-400 ml-1 truncate">{hours}</span>
                    )}
                  </div>

                  {tags.length > 0 && (
                    <div className="hidden sm:flex flex-wrap gap-1.5">
                      {tags.slice(0, 2).map(t => (
                        <span key={t} className="text-[10px] font-semibold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-auto pt-1.5 sm:pt-2">
                    {c.phone && (
                      <a
                        href={`tel:${c.phone}`}
                        className="w-8 h-8 sm:w-11 sm:h-11 shrink-0 rounded-full border border-gray-200 flex items-center justify-center transition-colors hover:bg-gray-50"
                      >
                        <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
                      </a>
                    )}
                    <Link
                      href={`/patient/clinics/${c.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-2.5 rounded-full text-white text-[11px] sm:text-xs font-bold hover:opacity-90 transition-opacity"
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
    </section>
  );
}
