'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

const PRIMARY = '#0d2b6e';

interface PartnerType { id: string; name: string; nameEn: string | null; }

function SkeletonTile() {
  return <div className="rounded-xl bg-gray-100 animate-pulse h-13 sm:h-9 w-full sm:w-24" />;
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
    <section className="relative w-full py-6 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6 flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
            {mm ? 'အမျိုးအစားအလိုက် ရှာဖွေပါ' : 'Browse by Category'}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {mm ? 'သင့်အနီးအနား မိတ်ဖက်များကို ရှာဖွေပါ' : 'Find the right partner for your needs'}
          </p>
        </div>
        <Link href="/clinics" className="text-xs font-semibold px-4 py-2 rounded-full border-2 transition-colors hidden sm:block" style={{ color: PRIMARY, borderColor: PRIMARY }}>
          {tr.seeAll}
        </Link>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col sm:flex-row sm:flex-wrap gap-2">
        {loading ? (
          Array.from({ length: 10 }).map((_, i) => <SkeletonTile key={i} />)
        ) : (
          types.slice(0, LIMIT).map(t => {
            const label = mm ? t.name : (t.nameEn ?? t.name);
            return (
              <Link
                key={t.id}
                href={`/clinics?type=${encodeURIComponent(t.name)}`}
                className="w-full sm:w-auto text-base sm:text-sm font-bold sm:font-semibold text-gray-800 sm:text-gray-700 bg-white border border-gray-200 rounded-xl px-4 sm:px-3.5 py-3.5 sm:py-2 transition-colors hover:text-teal-600 hover:border-teal-300"
              >
                {label}
              </Link>
            );
          })
        )}
        {!loading && types.length > LIMIT && (
          <Link
            href="/clinics"
            className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-1 text-sm sm:text-sm font-bold sm:font-semibold rounded-xl px-4 sm:px-3.5 py-3.5 sm:py-2 transition-colors"
            style={{ color: PRIMARY, backgroundColor: `${PRIMARY}0d` }}
          >
            {mm ? `နောက်ထပ် (${types.length - LIMIT})` : `More (${types.length - LIMIT})`}
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </section>
  );
}
