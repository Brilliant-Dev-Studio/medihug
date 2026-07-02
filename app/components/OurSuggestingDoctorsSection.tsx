'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, Star, Clock, Award, Globe2 } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

const PRIMARY   = 'var(--color-primary)';
const SECONDARY = 'var(--color-primary-dark)';
const ACCENT    = 'var(--color-accent)';

const AVATAR_COLORS = ['#2ab5ad', '#8b5cf6', '#f59e0b', '#3b82f6', '#10b981', '#ef4444'];

interface DoctorItem {
  id: string; name: string; nameEn: string | null;
  specialty: string; rating: number; reviewCount: number; price: number;
  imageUrl: string | null; experience: number; isAvailable: boolean;
  languages: string[];
}

function SkeletonCard() {
  return (
    <div className="shrink-0 w-36 lg:w-72 bg-white rounded-xl lg:rounded-3xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="w-full h-28 lg:h-56 bg-gray-100" />
      <div className="p-2 lg:p-5 flex flex-col gap-1.5 lg:gap-3">
        <div className="h-3 lg:h-5 w-20 lg:w-36 bg-gray-100 rounded" />
        <div className="h-2.5 lg:h-3.5 w-16 lg:w-28 bg-gray-100 rounded" />
        <div className="h-7 lg:h-10 w-full bg-gray-100 rounded-lg lg:rounded-xl mt-1" />
      </div>
    </div>
  );
}

function DoctorCard({ d, i, mm }: { d: DoctorItem; i: number; mm: boolean }) {
  const displayName = mm ? d.name : (d.nameEn ?? d.name);
  return (
    <div className="shrink-0 w-36 lg:w-72 bg-white rounded-xl lg:rounded-3xl border border-gray-100 overflow-hidden flex flex-col transition-shadow lg:hover:shadow-lg">
      <div className="relative w-full h-28 lg:h-56 flex items-center justify-center"
        style={{ backgroundColor: `${AVATAR_COLORS[i % AVATAR_COLORS.length]}18` }}>
        {d.imageUrl ? (
          <img src={d.imageUrl} alt={displayName} className="w-full h-full object-cover object-top" />
        ) : (
          <div className="w-12 h-12 lg:w-24 lg:h-24 rounded-full flex items-center justify-center text-lg lg:text-4xl font-bold text-white"
            style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
            {d.name.charAt(0)}
          </div>
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 45%)' }} />

        <span className="absolute top-1.5 left-1.5 lg:top-3.5 lg:left-3.5 flex items-center gap-0.5 lg:gap-1.5 text-[8px] lg:text-xs font-bold px-1.5 lg:px-2.5 py-0.5 lg:py-1.5 rounded-full text-white shadow-sm" style={{ backgroundColor: '#f59e0b' }}>
          <Star className="w-2 h-2 lg:w-3.5 lg:h-3.5 fill-white" />
          <span className="hidden lg:inline">{mm ? 'အကြံပြု' : 'Suggested'}</span>
        </span>

        <span className={`hidden lg:flex absolute top-3.5 right-3.5 items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-full backdrop-blur-sm ${d.isAvailable ? 'bg-emerald-500/90 text-white' : 'bg-black/40 text-white/80'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${d.isAvailable ? 'bg-white' : 'bg-gray-300'}`} />
          {d.isAvailable ? (mm ? 'အသင့်' : 'Available') : (mm ? 'မအားပါ' : 'Busy')}
        </span>

        <div className="absolute bottom-0 left-0 right-0 px-2 lg:px-5 pb-1.5 lg:pb-4">
          <p className="text-[11px] lg:text-lg font-bold text-white leading-snug line-clamp-1">{displayName}</p>
          <p className="hidden lg:block text-sm text-white/80 leading-tight line-clamp-1">{d.specialty}</p>
        </div>
      </div>

      <div className="p-2 lg:p-5 flex flex-col gap-1.5 lg:gap-3 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5 lg:gap-1">
            <Star className="w-3 h-3 lg:w-4 lg:h-4 fill-amber-400 text-amber-400" />
            <span className="text-[10px] lg:text-sm font-bold text-gray-700">{d.rating.toFixed(1)}</span>
            <span className="hidden lg:inline text-xs text-gray-400">({d.reviewCount})</span>
          </div>
          <div className="hidden lg:flex items-center gap-1 text-gray-400">
            <Award className="w-4 h-4" />
            <span className="text-xs font-semibold">{d.experience} {mm ? 'နှစ်' : 'yrs'}</span>
          </div>
        </div>

        {d.languages.length > 0 && (
          <div className="hidden lg:flex items-center gap-1.5 text-gray-400">
            <Globe2 className="w-4 h-4 shrink-0" />
            <span className="text-xs truncate">{d.languages.join(', ')}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-gray-50">
          <div>
            <p className="hidden lg:block text-xs text-gray-400 leading-none mb-1">{mm ? 'ကုန်ကျစရိတ်' : 'Fee'}</p>
            <p className="text-[11px] lg:text-lg font-bold" style={{ color: PRIMARY }}>
              {d.price.toLocaleString()} <span className="text-[9px] lg:text-xs font-semibold text-gray-400">{mm ? 'ကျပ်' : 'MMK'}</span>
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            {mm ? '၁၅ မိနစ်' : '15 min'}
          </div>
        </div>

        <Link
          href={`/patient/doctors/${d.id}`}
          className="mt-0.5 lg:mt-2 w-full py-1.5 lg:py-3 rounded-lg lg:rounded-xl text-[10px] lg:text-sm font-bold text-white text-center"
          style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}
        >
          {mm ? 'ချိန်းဆိုရန်' : 'Book Now'}
        </Link>
      </div>
    </div>
  );
}

export default function OurSuggestingDoctorsSection() {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/doctors?suggested=true&limit=10')
      .then(r => r.json())
      .then(d => { setDoctors(d.doctors ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (!loading && doctors.length === 0) return null;

  const scroll = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 620, behavior: 'smooth' });
  };

  return (
    <div className="min-w-0 w-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-base lg:text-xl" style={{ color: PRIMARY }}>
          {mm ? 'အကြံပြုထားသော ဆရာဝန်များ' : 'Our Suggesting Doctors'}
        </h2>
        <div className="flex items-center gap-2">
          <Link href="/patient/doctors" className="text-xs lg:text-sm font-semibold flex items-center gap-0.5" style={{ color: ACCENT }}>
            {mm ? 'အားလုံး' : 'See all'} <ChevronRight className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
          </Link>
          <div className="hidden lg:flex items-center gap-1.5 ml-1">
            <button onClick={() => scroll(-1)} aria-label="prev"
              className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => scroll(1)} aria-label="next"
              className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="min-w-0 w-full flex gap-2.5 lg:gap-4 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : doctors.map((d, i) => <DoctorCard key={d.id} d={d} i={i} mm={mm} />)
        }
      </div>
    </div>
  );
}
