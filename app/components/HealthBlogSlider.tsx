'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

const PRIMARY = '#0d2b6e';
const ACCENT  = '#4facfe';

const blogCategories = [
  { mm: 'အတ္တအိမ်\nကျန်းမာရေး',   en: 'Digestive\nHealth',    img: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop' },
  { mm: 'သွားကျန်းမာရေး',          en: 'Dental\nHealth',       img: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=400&h=400&fit=crop' },
  { mm: 'မျက်စီကျန်းမာရေး',         en: 'Eye\nHealth',          img: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&h=400&fit=crop' },
  { mm: 'ကလေးကျန်းမာရေး',          en: 'Child\nHealth',        img: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=400&h=400&fit=crop' },
  { mm: 'အသည်း\nကျန်းမာရေး',       en: 'Liver\nHealth',        img: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=400&h=400&fit=crop' },
  { mm: 'အရိုးအကြော\nကျန်းမာရေး',  en: 'Bone & Joint\nHealth', img: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f3?w=400&h=400&fit=crop' },
  { mm: 'နှလုံးကျန်းမာရေး',         en: 'Heart\nHealth',        img: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=400&h=400&fit=crop' },
  { mm: 'ကင်ဆာ',                    en: 'Cancer',               img: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=400&fit=crop' },
  { mm: 'အတွေ့အထိ\nကျန်းမာရေး',   en: 'Skin\nHealth',         img: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400&h=400&fit=crop' },
  { mm: 'အဟာရမျှတရေး',              en: 'Nutrition',            img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop' },
];

export default function HealthBlogSlider() {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <h2 className="font-bold text-base lg:text-xl" style={{ color: PRIMARY }}>
          {mm ? 'ဆောင်းပါးများ' : 'Articles'}
        </h2>
        <button className="text-xs font-semibold flex items-center gap-0.5 lg:text-sm" style={{ color: ACCENT }}>
          {mm ? 'အားလုံး' : 'See all'} <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Mobile: horizontal scroll */}
      <div
        ref={scrollRef}
        className="lg:hidden flex flex-nowrap gap-2 overflow-x-auto pb-1 w-full"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {blogCategories.map((cat, i) => (
          <button
            key={i}
            className="shrink-0 relative w-24 h-24 rounded-xl overflow-hidden active:scale-95 transition-all"
          >
            <Image src={cat.img} alt={cat.en} fill className="object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 50%, transparent 100%)' }} />
            <span className="absolute bottom-1.5 left-0 right-0 px-1.5 text-[9px] font-bold text-white text-center leading-tight whitespace-pre-line">
              {mm ? cat.mm : cat.en}
            </span>
          </button>
        ))}
      </div>

      {/* Desktop: 6-col grid */}
      <div className="hidden lg:grid grid-cols-6 gap-3">
        {blogCategories.slice(0, 6).map((cat, i) => (
          <button
            key={i}
            className="relative rounded-xl overflow-hidden active:scale-95 transition-all group"
            style={{ aspectRatio: '1 / 1' }}
          >
            <Image src={cat.img} alt={cat.en} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 50%, transparent 100%)' }} />
            <span className="absolute bottom-2 left-0 right-0 px-1.5 text-[11px] font-bold text-white text-center leading-tight whitespace-pre-line">
              {mm ? cat.mm : cat.en}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
