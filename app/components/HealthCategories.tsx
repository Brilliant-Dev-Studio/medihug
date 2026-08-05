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
          ) : categories.length === 0 ? (
            <div className="col-span-3 md:col-span-6 flex flex-col items-center justify-center py-10 text-gray-300">
              <Image src="/9169253-removebg-preview.png" alt="No data" width={80} height={80} className="opacity-70 mb-2" />
              <p className="text-sm text-gray-400">{mm ? 'ဒေတာ မရှိသေးပါ' : 'No data yet'}</p>
            </div>
          ) : (
            categories.map(cat => {
              const style = ICON_MAP[cat.nameEn ?? ''] ?? DEFAULT_STYLE;
              const Icon = style.icon;
              const label = mm ? cat.name : (cat.nameEn ?? cat.name);

              return (
                <Link
                  key={cat.id}
                  href={`/patient/records?category=${encodeURIComponent(cat.name)}`}
                  className="group relative flex flex-col items-center gap-2 sm:gap-4 rounded-2xl sm:rounded-3xl p-3 sm:p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  style={{ backgroundColor: style.bg, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                >
                  <div
                    className="flex items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 w-16 h-16 sm:w-16 sm:h-16"
                    style={{ backgroundColor: `${style.color}1f` }}
                  >
                    <Icon style={{ color: style.color }} className="w-9 h-9 sm:w-9 sm:h-9" strokeWidth={2.2} />
                  </div>

                  <span className="text-xs sm:text-base font-bold text-gray-900 leading-tight">
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
