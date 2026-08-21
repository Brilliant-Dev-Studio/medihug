'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HeartPulse, ArrowRight, ChevronRight } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

const PRIMARY = 'var(--color-primary)';
const ACCENT  = 'var(--color-accent)';

interface Program {
  id: string; imageUrl: string; titleMm: string; titleEn: string | null;
  descMm: string | null; descEn: string | null; price: number;
}

function SkeletonCard() {
  return (
    <div className="shrink-0 w-52 lg:w-auto rounded-2xl overflow-hidden border border-gray-100 bg-white flex flex-col">
      <div className="h-32 bg-gray-200 animate-pulse" />
      <div className="px-3 py-3 flex flex-col gap-2">
        <div className="h-3 bg-gray-200 rounded animate-pulse w-4/5" />
        <div className="h-2 bg-gray-100 rounded animate-pulse w-3/5" />
      </div>
    </div>
  );
}

export default function HealthcareProgramsSlider() {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch('/api/healthcare-programs')
      .then(r => r.json())
      .then(d => { setPrograms((d.programs ?? []).filter((p: Program) => p.price > 0).slice(0, 8)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (!loading && programs.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <div>
          <h2 className="font-bold text-base lg:text-xl flex items-center gap-1.5" style={{ color: PRIMARY }}>
            <HeartPulse className="w-4 h-4 lg:w-5 lg:h-5" />
            {mm ? 'ကျန်းမာရေး အစီအစဉ်များ' : 'Healthcare Programs'}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5 lg:hidden">
            {mm ? 'ဝယ်ယူနိုင်သော အစီအစဉ်များ' : 'Programs you can enroll in'}
          </p>
        </div>
        <Link href="/patient/programs" className="text-xs font-semibold flex items-center gap-0.5 lg:text-sm" style={{ color: ACCENT }}>
          {mm ? 'အားလုံး' : 'See all'} <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Mobile */}
      <div className="lg:hidden flex flex-nowrap gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : programs.map(p => {
              const name = mm ? p.titleMm : (p.titleEn ?? p.titleMm);
              return (
                <Link key={p.id} href={`/patient/programs/${p.id}`}
                  className="shrink-0 w-52 rounded-2xl overflow-hidden border border-gray-100 bg-white flex flex-col active:scale-95 transition-all shadow-sm">
                  <div className="relative w-full h-32 overflow-hidden bg-gray-100">
                    <Image src={p.imageUrl} alt={name} fill className="object-cover" />
                  </div>
                  <div className="px-3 py-2.5 flex flex-col gap-1">
                    <p className="text-xs font-bold text-gray-800 leading-snug line-clamp-2">{name}</p>
                    <p className="text-xs font-bold" style={{ color: PRIMARY }}>{p.price.toLocaleString()} MMK</p>
                  </div>
                </Link>
              );
            })
        }
      </div>

      {/* Desktop */}
      <div className="hidden lg:grid grid-cols-3 gap-5">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          : programs.slice(0, 3).map(p => {
              const name = mm ? p.titleMm : (p.titleEn ?? p.titleMm);
              return (
                <Link key={p.id} href={`/patient/programs/${p.id}`}
                  className="group rounded-2xl overflow-hidden border border-gray-100 bg-white flex flex-col active:scale-[0.98] transition-all hover:shadow-lg">
                  <div className="relative w-full overflow-hidden bg-gray-100" style={{ height: 160 }}>
                    <Image src={p.imageUrl} alt={name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="px-4 py-3.5 flex flex-col gap-1.5">
                    <p className="text-sm font-bold text-gray-800 leading-snug line-clamp-2">{name}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-sm font-bold" style={{ color: PRIMARY }}>{p.price.toLocaleString()} MMK</span>
                      <span className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: ACCENT }}>
                        {mm ? 'ကြည့်ရှုမည်' : 'View'} <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })
        }
      </div>
    </div>
  );
}
