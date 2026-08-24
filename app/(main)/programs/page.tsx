'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, HeartPulse } from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';

const PRIMARY = '#0d2b6e';

interface Category { id: string; name: string; nameEn: string | null; }
interface Program {
  id: string; imageUrl: string; titleMm: string; titleEn: string | null;
  descMm: string | null; descEn: string | null; ctaLink: string | null; price: number;
  category: Category | null;
}

function SkeletonCard() {
  return (
    <div className="rounded-xl bg-white border border-gray-100 overflow-hidden">
      <div className="h-40 bg-gray-100 animate-pulse" />
      <div className="p-5 flex flex-col gap-2">
        <div className="h-4 bg-gray-100 rounded-lg animate-pulse w-3/4" />
        <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-full" />
      </div>
    </div>
  );
}

function ProgramsListPageInner() {
  const { lang, tr } = useLang();
  const mm = lang === 'mm';
  const searchParams = useSearchParams();
  const [programs, setPrograms]   = useState<Program[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCat, setFilterCat] = useState(() => searchParams.get('category') ?? 'all');
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/healthcare-programs').then(r => r.json()),
      fetch('/api/program-categories').then(r => r.json()),
    ]).then(([pd, cd]) => {
      setPrograms(pd.programs ?? []);
      setCategories(cd.categories ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredPrograms = filterCat === 'all' ? programs : programs.filter(p => p.category?.id === filterCat);

  return (
    <main className="min-h-screen bg-white">
      <div className="w-full pt-20 pb-14" style={{ backgroundColor: PRIMARY }}>
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-white/50 text-xs uppercase tracking-widest mb-3">{mm ? 'MediHug' : 'MediHug'}</p>
          <h1 className="text-3xl sm:text-5xl font-bold text-white">{tr.healthcareProgramsTitle}</h1>
          <p className="text-white/70 text-sm sm:text-base mt-3 max-w-xl leading-relaxed">{tr.healthcareProgramsSubtitle}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 sm:py-14">
        {!loading && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button onClick={() => setFilterCat('all')}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors"
              style={filterCat === 'all' ? { backgroundColor: PRIMARY, color: '#fff', borderColor: PRIMARY } : { color: '#6b7280', borderColor: '#e5e7eb' }}>
              {mm ? 'အားလုံး' : 'All'}
            </button>
            {categories.map(c => (
              <button key={c.id} onClick={() => setFilterCat(c.id)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors"
                style={filterCat === c.id ? { backgroundColor: PRIMARY, color: '#fff', borderColor: PRIMARY } : { color: '#6b7280', borderColor: '#e5e7eb' }}>
                {mm ? c.name : (c.nameEn ?? c.name)}
              </button>
            ))}
          </div>
        )}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-300 gap-2">
            <HeartPulse className="w-10 h-10" />
            <p className="text-sm text-gray-400">{mm ? 'အစီအစဉ် မရှိသေးပါ' : 'No programs yet'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPrograms.map(p => {
              const name = mm ? p.titleMm : (p.titleEn ?? p.titleMm);
              const rawDesc = mm ? (p.descMm ?? p.descEn) : (p.descEn ?? p.descMm);
              const desc = rawDesc?.replace(/[#*_`>~-]/g, '').replace(/\[(.*?)\]\(.*?\)/g, '$1').trim();
              const href = p.ctaLink || `/programs/${p.id}`;

              return (
                <Link key={p.id} href={href} className="group rounded-xl bg-white border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                  <div className="relative w-full h-40 overflow-hidden bg-gray-50">
                    <Image src={p.imageUrl} alt={name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                    {p.price > 0 && (
                      <span className="absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full text-white" style={{ backgroundColor: PRIMARY }}>
                        {p.price.toLocaleString()} MMK
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex flex-col gap-2 flex-1">
                    <h3 className="text-lg font-bold text-gray-900 leading-snug">{name}</h3>
                    {desc && <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">{desc}</p>}
                    <span className="flex items-center gap-1 text-sm font-semibold mt-auto pt-2" style={{ color: PRIMARY }}>
                      {mm ? 'ပိုမိုသိရှိရန်' : 'Learn More'}
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default function ProgramsListPage() {
  return (
    <Suspense fallback={null}>
      <ProgramsListPageInner />
    </Suspense>
  );
}
