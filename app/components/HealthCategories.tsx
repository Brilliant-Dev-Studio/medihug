'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Stethoscope, Salad, Pill, Scale, Accessibility, MessageCircle, Syringe, Thermometer,
  Globe, Activity, HeartHandshake, LifeBuoy, Sun, Bone, House, HeartPulse, Dumbbell,
  type LucideIcon,
} from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

interface Category {
  id: string;
  name: string;
  nameEn: string | null;
  descriptionMm: string | null;
  descriptionEn: string | null;
  iconUrl: string | null;
  bgImageUrl: string | null;
  doctorCount?: number;
  programCount?: number;
}

const ICON_MAP: Record<string, LucideIcon> = {
  'Medical Checkup':                        Stethoscope,
  'Nutrition Meal Service':                 Salad,
  'Supplements & Vitamins':                 Pill,
  'Comprehensive Weight Management Program': Scale,
  'Prosthesis':                             Accessibility,
  'Consultantation with Doctors':           MessageCircle,
  'Medical Devices':                        Syringe,
  'Medicine':                               Thermometer,
  'International Healthcare Service':       Globe,
  'Stroke Rehabilitation Program':          Activity,
  'Special Needs Healthcare Service':       HeartHandshake,
  'Aids and Appliance':                     LifeBuoy,
  'Skincare':                               Sun,
  'Orthosis':                               Bone,
  'Home Medical Checkup':                   House,
  'Home Healthcare Service':                HeartPulse,
  'Home Physiotherapy Service':             Dumbbell,
  'Home Special Needs Healthcare Service':  HeartHandshake,
};
const DEFAULT_ICON = Pill;

/** Soft pastel gradient tints, cycled per card by index — matches the reference design's
 * distinct-color-per-card look without needing per-category color config. */
const GRADIENTS = [
  'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)',
  'linear-gradient(135deg, #fce7f3 0%, #fdf2f8 100%)',
  'linear-gradient(135deg, #fef9c3 0%, #fefce8 100%)',
  'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)',
  'linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%)',
  'linear-gradient(135deg, #e0e7ff 0%, #eef2ff 100%)',
];
const ICON_COLORS = ['#0284c7', '#db2777', '#ca8a04', '#16a34a', '#7c3aed', '#4f46e5'];

const LIMIT = 6;

function SkeletonTile() {
  return <div className="rounded-2xl sm:rounded-3xl bg-gray-100 animate-pulse h-32 sm:h-40" />;
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
      <div className="relative z-10 max-w-4xl mx-auto">
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

        <div className="grid grid-cols-3 auto-rows-fr gap-2.5 sm:gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonTile key={i} />)
          ) : (
            categories.slice(0, LIMIT).map((cat, i) => {
              const Icon = ICON_MAP[cat.nameEn ?? ''] ?? DEFAULT_ICON;
              const gradient = GRADIENTS[i % GRADIENTS.length];
              const iconColor = ICON_COLORS[i % ICON_COLORS.length];
              const label = mm ? cat.name : (cat.nameEn ?? cat.name);
              const desc = mm ? cat.descriptionMm : (cat.descriptionEn ?? cat.descriptionMm);
              const href = (cat.doctorCount ?? 0) > 0
                ? `/doctors?category=${cat.id}`
                : (cat.programCount ?? 0) > 0
                ? `/programs?pcat=${cat.id}`
                : `/products?category=${encodeURIComponent(cat.name)}`;

              return (
                <Link
                  key={cat.id}
                  href={href}
                  className="group relative flex flex-col h-full rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg overflow-hidden min-w-0"
                  style={{ background: cat.bgImageUrl ? undefined : gradient, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                >
                  {cat.bgImageUrl && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0" style={{ backgroundImage: `url(${cat.bgImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                      <div className="absolute inset-0 bg-white/55 group-hover:bg-white/45 transition-colors" />
                    </div>
                  )}

                  <div className="relative shrink-0 mb-2.5 sm:mb-3.5 flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 transition-transform duration-300 group-hover:scale-110">
                    {cat.iconUrl ? (
                      <Image src={cat.iconUrl} alt={label} width={48} height={48} className="w-full h-full object-contain" />
                    ) : (
                      <Icon style={{ color: iconColor }} className="w-full h-full" strokeWidth={1.75} />
                    )}
                  </div>

                  {/* No line-clamp here on purpose — -webkit-line-clamp has previously cut
                      Myanmar text mid-grapheme-cluster and rendered broken/overlapping glyphs.
                      Natural wrapping is slower to overflow but never mangles the script. */}
                  <span className="relative block w-full text-xs sm:text-base font-bold leading-tight wrap-break-word min-h-[2.4em] sm:min-h-[2.5em]" style={{ color: '#0d2b6e' }}>
                    {label}
                  </span>
                  {desc && (
                    <span className="relative block w-full text-[11px] sm:text-sm text-gray-500 mt-1 wrap-break-word">
                      {desc}
                    </span>
                  )}
                </Link>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
