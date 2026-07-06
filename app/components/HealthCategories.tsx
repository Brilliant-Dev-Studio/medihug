'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Thermometer, Salad, Stethoscope, Baby, Sun, Pill, type LucideIcon,
} from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

interface Category {
  id: string;
  name: string;
  nameEn: string | null;
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

function SkeletonTile() {
  return <div className="rounded-2xl bg-gray-100 animate-pulse h-20 sm:h-32" />;
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
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8">
          {tr.categoriesTitle}
        </h2>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 sm:gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonTile key={i} />)
          ) : (
            categories.map(cat => {
              const style = ICON_MAP[cat.nameEn ?? ''] ?? DEFAULT_STYLE;
              const Icon = style.icon;
              const label = mm ? cat.name : (cat.nameEn ?? cat.name);

              return (
                <Link
                  key={cat.id}
                  href={`/patient/records?category=${encodeURIComponent(cat.name)}`}
                  className="group relative flex flex-col items-center gap-1.5 sm:gap-3 overflow-hidden rounded-2xl sm:rounded-3xl px-2 py-3 sm:px-4 sm:py-6 text-center transition-all duration-300 hover:-translate-y-1 border border-white/50 backdrop-blur-xl"
                  style={{
                    background: `linear-gradient(150deg, ${style.color}26 0%, ${style.color}0a 100%)`,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)',
                  }}
                >
                  {/* Glass sheen */}
                  <div
                    className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
                    style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)' }}
                  />

                  <div
                    className="relative flex items-center justify-center rounded-full border border-white/60 backdrop-blur-md transition-transform duration-300 group-hover:scale-110 w-9 h-9 sm:w-14 sm:h-14"
                    style={{ backgroundColor: `${style.color}22` }}
                  >
                    <Icon style={{ color: style.color }} className="w-4 h-4 sm:w-6 sm:h-6" strokeWidth={2.2} />
                  </div>

                  <span className="relative text-[10px] sm:text-sm font-semibold text-gray-800 leading-snug">
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
