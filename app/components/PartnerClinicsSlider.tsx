'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, Clock } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

const PRIMARY = '#0d2b6e';
const ACCENT  = '#4facfe';

const clinics = [
  {
    name_mm: 'အေးမြသာ ဆေးခန်း',
    name_en: 'Aye Myat Tha Clinic',
    phone: '09 777 123 456',
    open: '08:00',
    close: '17:00',
    img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=240&fit=crop',
  },
  {
    name_mm: 'မင်္ဂလာ ဆေးရုံ',
    name_en: 'Mingalar Hospital',
    phone: '09 250 456 789',
    open: '07:00',
    close: '20:00',
    img: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&h=240&fit=crop',
  },
  {
    name_mm: 'ပန်းပွင့် ဆေးခန်း',
    name_en: 'Pan Pwint Clinic',
    phone: '09 451 789 012',
    open: '09:00',
    close: '18:00',
    img: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&h=240&fit=crop',
  },
  {
    name_mm: 'ရွှေနန်း ဆေးရုံ',
    name_en: 'Shwe Nan Hospital',
    phone: '09 312 234 567',
    open: '06:00',
    close: '22:00',
    img: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=400&h=240&fit=crop',
  },
  {
    name_mm: 'ကြာသာပတေး ဆေးခန်း',
    name_en: 'Kyar Tha Patay Clinic',
    phone: '09 420 678 901',
    open: '08:30',
    close: '16:30',
    img: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400&h=240&fit=crop',
  },
];

export default function PartnerClinicsSlider() {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <h2 className="font-bold text-base lg:text-xl" style={{ color: PRIMARY }}>
          {mm ? 'မိတ်ဖက် ဆေးရုံ ဆေးခန်းများ' : 'Partner Clinics'}
        </h2>
      </div>

      {/* Mobile: horizontal scroll */}
      <div
        ref={scrollRef}
        className="lg:hidden flex flex-nowrap gap-2.5 overflow-x-auto pb-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {clinics.map((c, i) => (
          <Link
            key={i}
            href={`/patient/clinics/${i + 1}`}
            className="shrink-0 w-44 rounded-xl overflow-hidden border border-gray-100 bg-white flex flex-col active:scale-95 transition-all"
          >
            <div className="relative w-full h-28 overflow-hidden bg-gray-100">
              <Image src={c.img} alt={mm ? c.name_mm : c.name_en} fill className="object-cover" />
            </div>
            <div className="px-3 py-2.5 flex flex-col gap-1.5">
              <p className="text-xs font-bold truncate" style={{ color: PRIMARY, lineHeight: '1.8' }}>
                {mm ? c.name_mm : c.name_en}
              </p>
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3 shrink-0" style={{ color: ACCENT }} />
                <span className="text-[11px] text-gray-400 truncate">{c.phone}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 shrink-0" style={{ color: '#10b981' }} />
                <span className="text-[11px] font-medium" style={{ color: '#10b981' }}>
                  {c.open} – {c.close}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Desktop: 3-col grid with larger cards */}
      <div className="hidden lg:grid grid-cols-3 gap-5">
        {clinics.map((c, i) => (
          <Link
            key={i}
            href={`/patient/clinics/${i + 1}`}
            className="rounded-2xl overflow-hidden border border-gray-100 bg-white flex flex-col active:scale-95 transition-all group"
          >
            <div className="relative w-full overflow-hidden bg-gray-100" style={{ height: 180 }}>
              <Image
                src={c.img}
                alt={mm ? c.name_mm : c.name_en}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="px-5 py-4 flex flex-col gap-2.5">
              <p className="text-sm font-bold" style={{ color: PRIMARY }}>
                {mm ? c.name_mm : c.name_en}
              </p>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" style={{ color: ACCENT }} />
                <span className="text-sm text-gray-400">{c.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0" style={{ color: '#10b981' }} />
                <span className="text-sm font-semibold" style={{ color: '#10b981' }}>
                  {c.open} – {c.close}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
