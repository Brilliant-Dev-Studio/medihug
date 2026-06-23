'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { Phone } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

const clinics = [
  {
    name_mm: 'အေးမြသာ ဆေးခန်း',
    name_en: 'Aye Myat Tha Clinic',
    phone: '09 777 123 456',
    img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=200&h=120&fit=crop',
  },
  {
    name_mm: 'မင်္ဂလာ ဆေးရုံ',
    name_en: 'Mingalar Hospital',
    phone: '09 250 456 789',
    img: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=200&h=120&fit=crop',
  },
  {
    name_mm: 'ပန်းပွင့် ဆေးခန်း',
    name_en: 'Pan Pwint Clinic',
    phone: '09 451 789 012',
    img: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=200&h=120&fit=crop',
  },
  {
    name_mm: 'ရွှေနန်း ဆေးရုံ',
    name_en: 'Shwe Nan Hospital',
    phone: '09 312 234 567',
    img: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=200&h=120&fit=crop',
  },
  {
    name_mm: 'ကြာသာပတေး ဆေးခန်း',
    name_en: 'Kyar Tha Patay Clinic',
    phone: '09 420 678 901',
    img: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=200&h=120&fit=crop',
  },
];

export default function PartnerClinicsSlider() {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-sm" style={{ color: '#0d2b6e' }}>
          {mm ? 'မိတ်ဖက် ဆေးရုံ ဆေးခန်းများ' : 'Partner Clinics'}
        </h2>
      </div>

      <div
        ref={scrollRef}
        className="flex flex-nowrap gap-2.5 overflow-x-auto pb-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {clinics.map((c, i) => (
          <a
            key={i}
            href={`tel:${c.phone.replace(/\s/g, '')}`}
            className="shrink-0 w-36 rounded-2xl overflow-hidden border border-gray-100 bg-white flex flex-col active:scale-95 transition-all"
          >
            <div className="relative w-full h-20 overflow-hidden bg-gray-100">
              <Image src={c.img} alt={mm ? c.name_mm : c.name_en} fill className="object-cover" />
            </div>
            <div className="px-2.5 py-2 flex flex-col gap-1">
              <p className="text-[11px] font-bold leading-tight truncate" style={{ color: '#0d2b6e' }}>
                {mm ? c.name_mm : c.name_en}
              </p>
              <div className="flex items-center gap-1">
                <Phone className="w-2.5 h-2.5 shrink-0" style={{ color: '#4facfe' }} />
                <span className="text-[10px] text-gray-400 truncate">{c.phone}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
