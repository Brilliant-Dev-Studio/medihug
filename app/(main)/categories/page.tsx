'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Thermometer, Salad, Stethoscope, Baby, Sun, Pill, HeartPulse, ChevronRight, type LucideIcon,
} from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';

const PRIMARY = '#0d2b6e';

interface Category { id: string; name: string; nameEn: string | null; iconUrl: string | null; bgImageUrl: string | null; doctorCount?: number; programCount?: number; }

const PRODUCT_ICON_MAP: Record<string, { icon: LucideIcon; color: string }> = {
  'Medicine':               { icon: Pill,        color: '#ef4444' },
  'Supplements & Vitamins':  { icon: Thermometer, color: '#22c55e' },
  'Health Food':             { icon: Salad,       color: '#f97316' },
  'Medical Devices':         { icon: Stethoscope, color: '#0891b2' },
  'Mother & Baby':           { icon: Baby,        color: '#a855f7' },
  'Skincare':                { icon: Sun,         color: '#f59e0b' },
};
const PRODUCT_DEFAULT_ICON = { icon: Pill, color: '#6b7280' };
const PROGRAM_DEFAULT_STYLE = { icon: HeartPulse, color: PRIMARY, bg: '#eff6ff' };

function SkeletonTile() {
  return <div className="rounded-3xl bg-gray-100 animate-pulse h-32 sm:h-48" />;
}

function NoData({ label }: { label: string }) {
  return (
    <div className="col-span-3 md:col-span-6 flex flex-col items-center justify-center py-16 text-gray-300 gap-2">
      <Image src="/9169253-removebg-preview.png" alt="No data" width={80} height={80} className="opacity-70" />
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}

function CategoryList({
  categories,
}: {
  categories: Category[];
}) {
  const { lang } = useLang();
  const mm = lang === 'mm';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {categories.map(cat => {
        const label = mm ? cat.name : (cat.nameEn ?? cat.name);
        const style = PRODUCT_ICON_MAP[cat.nameEn ?? ''] ?? PRODUCT_DEFAULT_ICON;
        const Icon = style.icon;
        // Categories with doctors linked (e.g. "Consult a Doctor") route to the doctor
        // list, and ones with programs linked route to the programs list — see admin's
        // per-category "Assigned Doctors" / "Assigned Programs".
        const href = (cat.doctorCount ?? 0) > 0
          ? `/doctors?category=${cat.id}`
          : (cat.programCount ?? 0) > 0
          ? `/programs?pcat=${cat.id}`
          : `/products?category=${encodeURIComponent(cat.name)}`;
        return (
          <Link
            key={cat.id}
            href={href}
            className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-4 text-left font-bold text-gray-800 transition-colors hover:border-teal-300 hover:text-teal-600"
          >
            <div
              className="shrink-0 w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center"
              style={cat.iconUrl ? undefined : { backgroundColor: `${style.color}1a` }}
            >
              {cat.iconUrl ? (
                <Image src={cat.iconUrl} alt="" width={36} height={36} className="w-full h-full object-cover" />
              ) : (
                <Icon className="w-4 h-4" style={{ color: style.color }} strokeWidth={2} />
              )}
            </div>
            <span className="flex-1 leading-snug">{label}</span>
            <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
          </Link>
        );
      })}
    </div>
  );
}

function CategoryGrid({
  categories, iconMap, defaultStyle, hrefBase,
}: {
  categories: Category[];
  iconMap: Record<string, { icon: LucideIcon; color: string; bg: string }>;
  defaultStyle: { icon: LucideIcon; color: string; bg: string };
  hrefBase: string;
}) {
  const { lang } = useLang();
  const mm = lang === 'mm';

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 auto-rows-fr gap-3 sm:gap-5">
      {categories.map(cat => {
        const style = iconMap[cat.nameEn ?? ''] ?? defaultStyle;
        const Icon = style.icon;
        const label = mm ? cat.name : (cat.nameEn ?? cat.name);

        return (
          <Link
            key={cat.id}
            href={`${hrefBase}${encodeURIComponent(cat.name)}`}
            className="group relative flex flex-col items-center justify-center gap-2.5 sm:gap-4 rounded-3xl p-3 sm:p-6 py-5 sm:py-8 text-center transition-all duration-300 hover:-translate-y-1.5 border border-black/3"
            style={{
              ...(cat.bgImageUrl ? {} : { backgroundColor: style.bg }),
              boxShadow: '0 1px 2px rgba(16,24,40,0.04), 0 8px 24px -12px rgba(16,24,40,0.08)',
            }}
          >
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
              {cat.bgImageUrl && (
                <div className="absolute inset-0" style={{ backgroundImage: `url(${cat.bgImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              )}
              {cat.bgImageUrl && <div className="absolute inset-0 bg-white/55 group-hover:bg-white/40 transition-colors" />}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: `inset 0 0 0 2px ${style.color}55` }} />
            </div>
            <div
              className="relative shrink-0 flex items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 w-12 h-12 sm:w-20 sm:h-20 overflow-hidden"
              style={{
                ...(cat.iconUrl ? {} : { backgroundColor: `${style.color}1a` }),
                boxShadow: `0 4px 14px -6px ${style.color}40`,
              }}
            >
              {cat.iconUrl ? (
                <Image src={cat.iconUrl} alt={label} width={80} height={80} className="w-full h-full object-cover" />
              ) : (
                <Icon style={{ color: style.color }} className="w-6 h-6 sm:w-10 sm:h-10" strokeWidth={2} />
              )}
            </div>

            <span className="relative text-[11px] sm:text-base font-bold text-gray-900 leading-snug w-full wrap-break-word">
              {label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export default function AllCategoriesPage() {
  const { lang, tr } = useLang();
  const mm = lang === 'mm';
  const [productCategories, setProductCategories] = useState<Category[]>([]);
  const [programCategories, setProgramCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/product-categories').then(r => r.json()),
      fetch('/api/program-categories').then(r => r.json()),
    ]).then(([pd, gd]) => {
      setProductCategories(pd.categories ?? []);
      setProgramCategories(gd.categories ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <div className="w-full pt-20 pb-16 relative overflow-hidden" style={{ backgroundColor: PRIMARY }}>
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(79,172,254,0.18) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)' }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <p className="text-white/50 text-xs uppercase tracking-widest mb-3">MediHug</p>
          <h1 className="text-3xl sm:text-5xl font-bold text-white">{tr.categoriesTitle}</h1>
          <p className="text-white/70 text-sm sm:text-base mt-3 max-w-xl leading-relaxed">
            {mm ? 'ကျန်းမာရေး ကုန်ပစ္စည်း၊ ဝန်ဆောင်မှုနှင့် အစီအစဉ် အမျိုးအစားအားလုံး' : 'Browse every health product, service, and program category'}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 sm:py-16 flex flex-col gap-14">

        {/* Product & Service categories */}
        <section>
          <div className="flex items-center gap-3 mb-7">
            <div className="w-1 h-7 rounded-full" style={{ backgroundColor: PRIMARY }} />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {mm ? 'ဝန်ဆောင်မှု အမျိုးအစားများ' : 'Service Categories'}
            </h2>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />)}
            </div>
          ) : productCategories.length === 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 sm:gap-5">
              <NoData label={mm ? 'ဒေတာ မရှိသေးပါ' : 'No data yet'} />
            </div>
          ) : (
            <CategoryList categories={productCategories} />
          )}
        </section>

        {/* Program categories */}
        <section>
          <div className="flex items-center gap-3 mb-7">
            <div className="w-1 h-7 rounded-full" style={{ backgroundColor: PRIMARY }} />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {mm ? 'ကျန်းမာရေး အစီအစဉ် အမျိုးအစားများ' : 'Program Categories'}
            </h2>
          </div>
          {loading ? (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 sm:gap-5">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonTile key={i} />)}
            </div>
          ) : programCategories.length === 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 sm:gap-5">
              <NoData label={mm ? 'အစီအစဉ် အမျိုးအစား မရှိသေးပါ' : 'No program categories yet'} />
            </div>
          ) : (
            <CategoryGrid categories={programCategories} iconMap={{}} defaultStyle={PROGRAM_DEFAULT_STYLE} hrefBase="/programs?category=" />
          )}
        </section>

      </div>
    </main>
  );
}
