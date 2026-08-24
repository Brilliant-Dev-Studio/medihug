'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Thermometer, Salad, Stethoscope, Baby, Sun, Pill, type LucideIcon,
} from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

interface Category {
  id: string;
  name: string;
  nameEn: string | null;
  iconUrl: string | null;
  bgImageUrl: string | null;
}

const ICON_MAP: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  'Medicine':               { icon: Pill,        color: '#ef4444', bg: '#fef2f2' },
  'Supplements & Vitamins':  { icon: Thermometer, color: '#22c55e', bg: '#f0fdf4' },
  'Health Food':             { icon: Salad,       color: '#f97316', bg: '#fff7ed' },
  'Medical Devices':         { icon: Stethoscope, color: '#0891b2', bg: '#ecfeff' },
  'Mother & Baby':           { icon: Baby,        color: '#a855f7', bg: '#faf5ff' },
  'Skincare':                { icon: Sun,         color: '#f59e0b', bg: '#fffbeb' },
};
const DEFAULT_STYLE = { icon: Pill, color: '#6b7280', bg: '#f9fafb' };
const LIMIT = 6;

function SkeletonTile() {
  return <div className="rounded-2xl sm:rounded-3xl bg-gray-100 animate-pulse h-28 sm:h-40" />;
}

export default function HealthCategories() {
  const { tr, lang } = useLang();
  const mm = lang === 'mm';
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    fetch('/api/product-categories')
      .then(r => r.json())
      .then(d => { setCategories(d.categories ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (!loading && categories.length === 0) return null;

  return (
    <section className="relative w-full px-6 py-12 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top left, rgba(13,43,110,0.06) 0%, transparent 55%), radial-gradient(ellipse at bottom right, rgba(245,158,11,0.08) 0%, transparent 55%)' }}
      />
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {tr.categoriesTitle}
          </h2>
          {!loading && categories.length > LIMIT && (
            <Link href="/categories" className="text-sm font-semibold shrink-0" style={{ color: '#0d2b6e' }}>
              {mm ? 'အားလုံးကြည့်ရန်' : 'See all'} →
            </Link>
          )}
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 auto-rows-fr gap-2 sm:gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonTile key={i} />)
          ) : (
            categories.slice(0, LIMIT).map(cat => {
              const style = ICON_MAP[cat.nameEn ?? ''] ?? DEFAULT_STYLE;
              const Icon = style.icon;
              const label = mm ? cat.name : (cat.nameEn ?? cat.name);

              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${encodeURIComponent(cat.name)}`}
                  className="group relative flex flex-col items-center justify-center gap-2 sm:gap-3 rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 py-4 sm:py-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-black/3"
                  style={{
                    ...(cat.bgImageUrl ? {} : { backgroundColor: style.bg }),
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                >
                  {cat.bgImageUrl && (
                    <div className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden pointer-events-none">
                      <div className="absolute inset-0" style={{ backgroundImage: `url(${cat.bgImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                      <div className="absolute inset-0 bg-white/55 group-hover:bg-white/45 transition-colors" />
                    </div>
                  )}
                  <div
                    className="relative shrink-0 flex items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 w-12 h-12 sm:w-16 sm:h-16 overflow-hidden"
                    style={cat.iconUrl ? undefined : { backgroundColor: `${style.color}1f` }}
                  >
                    {cat.iconUrl ? (
                      <Image src={cat.iconUrl} alt={label} width={64} height={64} className="w-full h-full object-cover" />
                    ) : (
                      <Icon style={{ color: style.color }} className="w-6 h-6 sm:w-9 sm:h-9" strokeWidth={2.2} />
                    )}
                  </div>

                  <span className="relative text-[11px] sm:text-base font-bold text-gray-900 leading-snug w-full wrap-break-word">
                    {label}
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
