'use client';

import Link from 'next/link';
import {
  Stethoscope, Calendar, FileText, Pill,
  Heart, Activity, AlertCircle, Brain, Baby, Eye,
  ChevronLeft,
} from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';

const categories = [
  { icon: Stethoscope, mm: 'ဆရာဝန်\nတိုင်ပင်ရန်',    en: 'Consult\nDoctor',    color: '#0d2b6e', bg: '#eff6ff', href: '/patient/doctors' },
  { icon: Calendar,    mm: 'ချိန်းဆိုမှု\nဗုကင်',      en: 'Book\nAppointment', color: '#4facfe', bg: '#f0f9ff', href: '/patient/appointments' },
  { icon: Activity,    mm: 'BMI\nတိုင်းတာ',            en: 'BMI\nChecker',      color: '#10b981', bg: '#f0fdf4', href: '#' },
  { icon: FileText,    mm: 'ကျန်းမာရေး\nမှတ်တမ်း',    en: 'Health\nRecords',   color: '#8b5cf6', bg: '#f5f3ff', href: '/patient/records' },
  { icon: Pill,        mm: 'ဆေးညွှန်း\nများ',          en: 'Prescrip-\ntions',  color: '#f59e0b', bg: '#fffbeb', href: '#' },
  { icon: AlertCircle, mm: 'အရေးပေါ်\nကျန်းမာရေး',   en: 'Emergency\nCare',   color: '#ef4444', bg: '#fef2f2', href: '#' },
  { icon: Heart,       mm: 'သွေးပေါင်\nချိန်',         en: 'Blood\nPressure',  color: '#ec4899', bg: '#fdf2f8', href: '#' },
  { icon: Brain,       mm: 'AI ကျန်းမာရေး\nဆွေးနွေး', en: 'AI Health\nChat',  color: '#06b6d4', bg: '#ecfeff', href: '#' },
  { icon: Baby,        mm: 'မိခင်နှင့်\nကလေး',         en: 'Mother &\nChild',  color: '#f97316', bg: '#fff7ed', href: '#' },
  { icon: Eye,         mm: 'မျက်စိ\nဆေးခန်း',          en: 'Eye\nClinic',      color: '#6366f1', bg: '#eef2ff', href: '#' },
];

export default function CategoriesPage() {
  const { lang } = useLang();
  const mm = lang === 'mm';

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="bg-white px-4 pt-4 pb-4 border-b border-gray-100 flex items-center gap-3">
        <Link href="/patient/dashboard" className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100">
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </Link>
        <h1 className="font-bold text-base" style={{ color: '#0d2b6e' }}>
          {mm ? 'ဝန်ဆောင်မှု အမျိုးအစားများ' : 'All Services'}
        </h1>
      </div>

      <div className="px-4 pt-4 pb-6">
        <div className="grid grid-cols-4 gap-2">
          {categories.map(({ icon: Icon, mm: labelMm, en: labelEn, color, bg, href }) => (
            <Link
              key={labelEn}
              href={href}
              className="flex flex-col items-center gap-1.5 p-2.5 bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-95 transition-all"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${bg} 0%, ${color}22 100%)`, border: `1.5px solid ${color}20` }}
              >
                <Icon style={{ width: 20, height: 20, color }} />
              </div>
              <span className="text-[10px] font-semibold text-center leading-tight whitespace-pre-line" style={{ color: '#374151' }}>
                {mm ? labelMm : labelEn}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
