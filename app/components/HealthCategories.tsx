'use client';

import Image from 'next/image';
import {
  Thermometer, Heart, Droplets, Wind, Activity, Leaf,
  User, Baby, Sparkles, LayoutGrid, Stethoscope, Sun, Dumbbell, ShieldPlus,
} from 'lucide-react';
import { ElementType } from 'react';
import { useLang } from '../lib/LanguageContext';

type Category = {
  key: keyof typeof import('../lib/translations').t['mm']['categories'];
  color: string;
  bg: string;
  image?: string;
  icon?: ElementType;
};

const categories: Category[] = [
  { key: 'Fever & Pain Relief',    icon: Thermometer,  color: '#ef4444', bg: '#fef2f2' },
  { key: 'Sexual Wellness',         icon: Heart,        color: '#ec4899', bg: '#fdf2f8' },
  { key: 'Bath & Body Care',        icon: Droplets,     color: '#06b6d4', bg: '#ecfeff' },
  { key: 'Cough, Cold & Flu',       icon: Wind,         color: '#3b82f6', bg: '#eff6ff' },
  { key: 'Diabetes & Hypertension', icon: Activity,     color: '#8b5cf6', bg: '#f5f3ff' },
  { key: 'Traditional Remedies',    icon: Leaf,         color: '#22c55e', bg: '#f0fdf4' },
  { key: 'Personal Care',           icon: User,         color: '#f97316', bg: '#fff7ed' },
  { key: 'Mother & Baby Care',      icon: Baby,         color: '#a855f7', bg: '#faf5ff' },
  { key: 'Hair Care',               icon: Sparkles,     color: '#eab308', bg: '#fefce8' },
  { key: 'All Products',            icon: LayoutGrid,   color: '#0d2b6e', bg: '#eff6ff' },
  { key: 'Medical Devices',         icon: Stethoscope,  color: '#0891b2', bg: '#ecfeff' },
  { key: 'Skin Care',               icon: Sun,          color: '#f59e0b', bg: '#fffbeb' },
  { key: 'Fitness & Supplements',   icon: Dumbbell,     color: '#10b981', bg: '#f0fdf4' },
  { key: 'First Aid & Emergency',   icon: ShieldPlus,   color: '#e11d48', bg: '#fff1f2' },
];

export default function HealthCategories() {
  const { tr } = useLang();

  return (
    <section className="w-full px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8" style={{ color: '#0d2b6e' }}>
          {tr.categoriesTitle}
        </h2>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-0.5 sm:gap-2">
          {categories.map(({ key, icon: Icon, image, color }) => (
            <button
              key={key}
              className="flex flex-col items-center gap-1.5 bg-white rounded-xl border border-gray-100 px-1.5 py-2.5 cursor-pointer text-center sm:rounded-2xl sm:px-2 sm:pt-5 sm:pb-4 sm:gap-2"
            >
              {image ? (
                <Image src={image} alt={key} width={40} height={40} className="object-contain w-8 h-8 sm:w-14 sm:h-14" />
              ) : (
                Icon && <Icon style={{ color }} className="w-6 h-6 sm:w-10 sm:h-10" strokeWidth={2.5} />
              )}
              <span className="text-[10px] sm:text-xs leading-tight font-semibold text-gray-600">
                {tr.categories[key]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
