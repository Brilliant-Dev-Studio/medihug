'use client';

import Link from 'next/link';
import {
  Stethoscope, Calendar, FileText, Pill,
  Heart, Activity, AlertCircle, Brain, Baby, Eye,
  ChevronLeft,
} from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';

const PRIMARY   = '#0d2b6e';
const SECONDARY = '#1a6bcc';

const categories = [
  { icon: Stethoscope, mm: 'ဆရာဝန်တိုင်ပင်ရန်',    en: 'Consult Doctor',      color: '#0d2b6e', bg: '#eff6ff', href: '/patient/doctors' },
  { icon: Calendar,    mm: 'ချိန်းဆိုမှု ဗုကင်',     en: 'Book Appointment',    color: '#4facfe', bg: '#f0f9ff', href: '/patient/appointments' },
  { icon: Activity,    mm: 'BMI တိုင်းတာ',            en: 'BMI Checker',         color: '#10b981', bg: '#f0fdf4', href: '#' },
  { icon: FileText,    mm: 'ကျန်းမာရေး မှတ်တမ်း',   en: 'Health Records',      color: '#8b5cf6', bg: '#f5f3ff', href: '/patient/records' },
  { icon: Pill,        mm: 'ဆေးညွှန်းများ',           en: 'Prescriptions',       color: '#f59e0b', bg: '#fffbeb', href: '#' },
  { icon: AlertCircle, mm: 'အရေးပေါ် ကျန်းမာရေး',  en: 'Emergency Care',      color: '#ef4444', bg: '#fef2f2', href: '#' },
  { icon: Heart,       mm: 'သွေးပေါင်ချိန်',          en: 'Blood Pressure',      color: '#ec4899', bg: '#fdf2f8', href: '#' },
  { icon: Brain,       mm: 'AI ကျန်းမာရေး ဆွေးနွေး', en: 'AI Health Chat',      color: '#06b6d4', bg: '#ecfeff', href: '#' },
  { icon: Baby,        mm: 'မိခင်နှင့် ကလေး',         en: 'Mother & Child',      color: '#f97316', bg: '#fff7ed', href: '#' },
  { icon: Eye,         mm: 'မျက်စိ ဆေးခန်း',          en: 'Eye Clinic',          color: '#6366f1', bg: '#eef2ff', href: '#' },
];

function CategoryCard({ icon: Icon, mm: labelMm, en: labelEn, color, bg, href, large = false }: {
  icon: React.ElementType; mm: string; en: string; color: string; bg: string; href: string; large?: boolean;
}) {
  const { lang } = useLang();
  const isMm = lang === 'mm';
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-3 bg-white rounded-2xl border border-gray-100 active:scale-95 transition-all hover:border-gray-200"
      style={{ padding: large ? '20px 12px' : '14px 10px' }}
    >
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{
          width: large ? 64 : 48,
          height: large ? 64 : 48,
          backgroundColor: bg,
          border: `1.5px solid ${color}20`,
        }}
      >
        <Icon style={{ width: large ? 28 : 22, height: large ? 28 : 22, color }} />
      </div>
      <span
        className="text-center leading-snug font-semibold"
        style={{ fontSize: large ? 13 : 11, color: '#374151' }}
      >
        {isMm ? labelMm : labelEn}
      </span>
    </Link>
  );
}

export default function CategoriesPage() {
  const { lang } = useLang();
  const mm = lang === 'mm';

  return (
    <div className="min-h-full bg-gray-50 lg:bg-gray-100">

      {/* ══ DESKTOP ══ */}
      <div className="hidden lg:flex gap-5 h-screen overflow-hidden px-6 py-6">
        <div className="flex-1 overflow-y-auto rounded-2xl bg-gray-50 flex flex-col">

          {/* Hero */}
          <div
            className="px-8 pt-8 pb-6 rounded-t-2xl shrink-0"
            style={{ background: `linear-gradient(180deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}
          >
            <div className="flex items-center gap-3 mb-1">
              <Link
                href="/patient/dashboard"
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </Link>
              <h1 className="text-2xl font-bold text-white">
                {mm ? 'ဝန်ဆောင်မှု အမျိုးအစားများ' : 'All Services'}
              </h1>
            </div>
            <p className="text-white/60 text-sm ml-11">
              {mm ? 'ဝန်ဆောင်မှု တစ်ခုကို ရွေးချယ်ပါ' : 'Choose a service to get started'}
            </p>
          </div>

          {/* Grid */}
          <div className="p-6 flex-1">
            <div className="grid grid-cols-5 gap-3">
              {categories.map(c => (
                <CategoryCard key={c.en} {...c} />
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ══ MOBILE ══ */}
      <div className="lg:hidden">

        {/* Hero */}
        <div
          className="-mt-18 pt-21 pb-6 px-4 w-full"
          style={{
            background: `linear-gradient(180deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
          }}
        >
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/patient/dashboard"
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </Link>
            <h1 className="text-xl font-bold text-white">
              {mm ? 'ဝန်ဆောင်မှု အမျိုးအစားများ' : 'All Services'}
            </h1>
          </div>
          <p className="text-white/60 text-sm ml-11">
            {mm ? 'ဝန်ဆောင်မှု တစ်ခုကို ရွေးချယ်ပါ' : 'Choose a service to get started'}
          </p>
        </div>

        {/* List */}
        <div className="px-4 pt-5 pb-24 flex flex-col gap-2">
          {categories.map(({ icon: Icon, mm: labelMm, en: labelEn, color, bg, href }) => (
            <Link
              key={labelEn}
              href={href}
              className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 px-4 py-3.5 active:scale-[0.98] transition-all"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: bg, border: `1.5px solid ${color}20` }}
              >
                <Icon style={{ width: 22, height: 22, color }} />
              </div>
              <span className="text-sm font-semibold text-gray-700 flex-1">{mm ? labelMm : labelEn}</span>
              <ChevronLeft className="w-4 h-4 text-gray-300 rotate-180 shrink-0" />
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
