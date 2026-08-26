'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

const PRIMARY = '#0d2b6e';

interface PartnerType { id: string; name: string; nameEn: string | null; }

function SkeletonTile() {
  return <div className="rounded-md bg-gray-100 animate-pulse h-14 sm:h-11 w-full sm:w-32" />;
}

export default function PartnerCategories() {
  const { lang, tr } = useLang();
  const mm = lang === 'mm';
  const [types,   setTypes]   = useState<PartnerType[]>([]);
  const [loading, setLoading] = useState(true);
  const LIMIT = 10;

  useEffect(() => {
    fetch('/api/partner-types')
      .then(r => r.json())
      .then(d => { setTypes(d.partnerTypes ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (!loading && types.length === 0) return null;

  return (
    <section className="relative w-full py-8 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: PRIMARY }} />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {mm ? 'အမျိုးအစားအလိုက် ရှာဖွေပါ' : 'Browse by Category'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              {mm ? 'သင့်အနီးအနား မိတ်ဖက်များကို ရှာဖွေပါ' : 'Find the right partner for your needs'}
            </p>
          </div>
        </div>
        <Link href="/clinics" className="text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-md border-2 transition-colors hidden sm:block hover:bg-[#0d2b6e] hover:text-white" style={{ color: PRIMARY, borderColor: PRIMARY }}>
          {tr.seeAll}
        </Link>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col sm:flex-row sm:flex-wrap gap-2.5 sm:gap-3">
        {loading ? (
          Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className={i >= 3 ? 'hidden sm:block' : ''}><SkeletonTile /></div>
          ))
        ) : (
          types.slice(0, LIMIT).map((t, i) => {
            const label = mm ? t.name : (t.nameEn ?? t.name);
            return (
              <Link
                key={t.id}
                href={`/clinics?type=${encodeURIComponent(t.name)}`}
                className={`group w-full sm:w-auto flex items-center justify-center sm:justify-start text-base sm:text-sm font-bold text-gray-700 bg-white border-2 border-gray-100 rounded-md px-5 sm:px-5 py-3.5 sm:py-2.5 transition-all hover:border-[#0d2b6e] hover:shadow-md hover:-translate-y-0.5 ${i >= 3 ? 'hidden sm:flex' : ''}`}
                style={{ boxShadow: '0 1px 2px rgba(16,24,40,0.04)' }}
              >
                <span className="transition-colors group-hover:text-[#0d2b6e]">{label}</span>
              </Link>
            );
          })
        )}
        {!loading && types.length > LIMIT && (
          <Link
            href="/clinics"
            className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-1 text-base sm:text-sm font-bold rounded-md px-5 py-3.5 sm:py-2.5 transition-all hover:-translate-y-0.5"
            style={{ color: PRIMARY, backgroundColor: `${PRIMARY}12`, border: `2px solid ${PRIMARY}22` }}
          >
            {mm ? `နောက်ထပ် (${types.length - LIMIT})` : `More (${types.length - LIMIT})`}
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </section>
  );
}
