'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HeartPulse, ArrowRight } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

const PRIMARY = '#0d2b6e';
const LIMIT = 10;

interface Program {
  id: string;
  imageUrl: string;
  titleMm: string; titleEn: string | null;
  descMm: string | null; descEn: string | null;
  ctaLink: string | null;
  price: number;
}

function SkeletonCard() {
  return (
    <div className="rounded-xl bg-white border border-gray-100 overflow-hidden">
      <div className="h-32 sm:h-40 bg-gray-100 animate-pulse" />
      <div className="p-3 sm:p-5 flex flex-col gap-2">
        <div className="h-4 bg-gray-100 rounded-lg animate-pulse w-3/4" />
        <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-full" />
      </div>
    </div>
  );
}

export default function HealthcarePrograms() {
  const { lang, tr } = useLang();
  const mm = lang === 'mm';
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch('/api/healthcare-programs')
      .then(r => r.json())
      .then(d => { setPrograms(d.programs ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (!loading && programs.length === 0) return null;

  return (
    <section className="relative w-full py-10 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6 mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: PRIMARY }} />
            <h2 className="text-xl sm:text-3xl font-bold text-gray-900">{tr.healthcareProgramsTitle}</h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">{tr.healthcareProgramsSubtitle}</p>
        </div>
        {!loading && programs.length > 0 && (
          <Link href="/programs" className="text-xs font-semibold px-4 py-2 rounded-full border-2 transition-colors hidden sm:block" style={{ color: PRIMARY, borderColor: PRIMARY }}>
            {tr.seeAll}
          </Link>
        )}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          programs.slice(0, LIMIT).map(p => {
            const name = mm ? p.titleMm : (p.titleEn ?? p.titleMm);
            const rawDesc = mm ? (p.descMm ?? p.descEn) : (p.descEn ?? p.descMm);
            // Teaser card shows plain text — strip markdown syntax rather than showing raw ** / # / - characters.
            const desc = rawDesc?.replace(/[#*_`>~-]/g, '').replace(/\[(.*?)\]\(.*?\)/g, '$1').trim();

            const href = p.ctaLink || `/programs/${p.id}`;

            const inner = (
              <>
                <div className="relative w-full h-32 sm:h-40 overflow-hidden bg-gray-50">
                  {p.imageUrl && (
                    <Image src={p.imageUrl} alt={name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                  )}
                  {p.price > 0 && (
                    <span className="absolute top-2 right-2 text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full text-white" style={{ backgroundColor: PRIMARY }}>
                      {p.price.toLocaleString()} MMK
                    </span>
                  )}
                </div>
                <div className="p-3 sm:p-5 flex flex-col gap-1.5 sm:gap-2 flex-1">
                  <h3 className="text-sm sm:text-lg font-bold text-gray-900 leading-snug">{name}</h3>
                  {desc && <p className="text-xs sm:text-sm text-gray-400 leading-relaxed line-clamp-2">{desc}</p>}
                  {href && (
                    <span className="flex items-center gap-1 text-xs sm:text-sm font-semibold mt-auto pt-1.5 sm:pt-2" style={{ color: PRIMARY }}>
                      {mm ? 'ပိုမိုသိရှိရန်' : 'Learn More'}
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  )}
                </div>
              </>
            );

            const cardClass = 'group rounded-xl bg-white border border-gray-100 overflow-hidden flex flex-col';

            return href ? (
              <Link key={p.id} href={href} className={cardClass}>{inner}</Link>
            ) : (
              <div key={p.id} className={cardClass}>{inner}</div>
            );
          })
        )}
      </div>

      {!loading && programs.length > 0 && (
        <div className="relative z-10 max-w-6xl mx-auto px-6 mt-6 flex justify-center sm:hidden">
          <Link href="/programs" className="text-xs font-semibold px-5 py-2.5 rounded-full border-2" style={{ color: PRIMARY, borderColor: PRIMARY }}>
            {tr.seeAll}
          </Link>
        </div>
      )}
    </section>
  );
}
