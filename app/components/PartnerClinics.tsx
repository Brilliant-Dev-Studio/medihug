'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, BadgeCheck, Phone, ArrowRight, Star, MapPin } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

const PRIMARY = '#0d2b6e';

interface Clinic {
  id: string;
  name: string; nameEn: string | null;
  type: 'CLINIC' | 'PHARMACY' | 'HOSPITAL';
  address: string | null; addressEn: string | null;
  township: string | null;
  phone: string | null;
  openTime: string | null; closeTime: string | null;
  imageUrl: string | null;
  rating: number; reviewCount: number;
  tagsMm: string[]; tagsEn: string[];
}

const TYPE_LABEL: Record<Clinic['type'], { mm: string; en: string }> = {
  HOSPITAL: { mm: 'ဆေးရုံ', en: 'Hospital' },
  CLINIC: { mm: 'ဆေးခန်း', en: 'Clinic' },
  PHARMACY: { mm: 'ဆေးဆိုင်', en: 'Pharmacy' },
};

function SkeletonCard() {
  return (
    <div className="shrink-0 w-44 sm:w-72 rounded-2xl bg-white shadow-[0_2px_20px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="h-40 bg-gray-100 animate-pulse" />
      <div className="p-5 flex flex-col gap-2">
        <div className="h-4 bg-gray-100 rounded-lg animate-pulse w-3/4" />
        <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-1/2" />
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

  if (!loading && clinics.length === 0) return null;

  return (
    <section className="relative w-full py-10 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Cpath d='M14 7 L14 21 M7 14 L21 14' stroke='%230d2b6e' stroke-opacity='0.06' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />
      <div className="relative z-10 max-w-6xl mx-auto px-6 flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl sm:text-3xl font-bold text-gray-900">{tr.partnerTitle}</h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">{tr.partnerSubtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/patient/categories" className="text-xs font-semibold px-4 py-2 rounded-full border-2 transition-colors hidden sm:block" style={{ color: PRIMARY, borderColor: PRIMARY }}>
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

      {/* Card row — bleeds past the container's right edge */}
      <div
        ref={scrollRef}
        className="relative z-10 flex gap-5 overflow-x-auto pb-2 pl-6 sm:pl-8 pr-6"
        style={{ scrollbarWidth: 'none', paddingLeft: 'max(1.5rem, calc((100vw - 72rem) / 2 + 1.5rem))' }}
      >
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          clinics.map(c => {
            const name = mm ? c.name : (c.nameEn ?? c.name);
            const address = mm ? (c.address ?? c.addressEn) : (c.addressEn ?? c.address);
            const location = [address, c.township].filter(Boolean).join(', ');
            const hours = c.openTime && c.closeTime ? `${c.openTime} — ${c.closeTime}` : null;
            const tags = mm ? c.tagsMm : c.tagsEn;

            return (
              <div key={c.id} className="shrink-0 w-44 sm:w-72 rounded-2xl bg-white shadow-[0_2px_20px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">

                {/* Image */}
                <div className="relative w-full h-40 overflow-hidden bg-gray-50">
                  {c.imageUrl && <Image src={c.imageUrl} alt={name} fill className="object-cover" />}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <BadgeCheck className="w-3.5 h-3.5 text-white" />
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-white">{mm ? TYPE_LABEL[c.type].mm : TYPE_LABEL[c.type].en}</span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-3 sm:p-5 flex flex-col gap-2 sm:gap-3">
                  <div>
                    <h3 className="font-serif text-xl text-gray-900 leading-snug truncate">{name}</h3>
                    {location && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        <p className="text-xs text-gray-400 truncate">{location}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-semibold text-gray-700">{c.rating.toFixed(1)}</span>
                    {c.reviewCount > 0 && <span className="text-xs text-gray-400">({c.reviewCount})</span>}
                    {hours && (
                      <>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-400">{hours}</span>
                      </>
                    )}
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {tags.slice(0, 2).map(t => (
                        <span key={t} className="text-[10px] font-semibold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  )}

                  {c.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="text-xs text-gray-500">{c.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-1">
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
                      className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-full bg-gray-900 text-white text-xs font-bold uppercase tracking-wide hover:opacity-90 transition-opacity"
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
