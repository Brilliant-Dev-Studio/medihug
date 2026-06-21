'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, MapPin, Phone, Clock } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

const clinics = [
  {
    id: 1,
    name: 'Asia Royal Hospital',
    type_mm: 'ဆေးရုံ',
    type_en: 'Hospital',
    location_mm: 'မင်္ဂလာတောင်ညွန့်မြို့နယ်၊ ရန်ကုန်',
    location_en: 'Mingalar Taung Nyunt, Yangon',
    phone: '09 123 456 789',
    hours_mm: 'နေ့ ၂၄ နာရီ ဖွင့်',
    hours_en: 'Open 24 Hours',
    color: '#0d2b6e',
    bg: '#eff6ff',
    img: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&h=200&fit=crop',
    specialties_mm: ['အထွေထွေ', 'နှလုံးရောဂါ', 'ကလေးသူငယ်'],
    specialties_en: ['General', 'Cardiology', 'Pediatrics'],
  },
  {
    id: 2,
    name: 'Pun Hlaing Hospital',
    type_mm: 'ဆေးရုံ',
    type_en: 'Hospital',
    location_mm: 'လှိုင်သာယာ၊ ရန်ကုန်',
    location_en: 'Hlaing Thar Yar, Yangon',
    phone: '09 987 654 321',
    hours_mm: 'နံနက် ၈ နာရီ — ည ၁၀ နာရီ',
    hours_en: '8:00 AM — 10:00 PM',
    color: '#22c55e',
    bg: '#f0fdf4',
    img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=200&fit=crop',
    specialties_mm: ['အရေပြား', 'မျက်စိ', 'အဆစ်ရောဂါ'],
    specialties_en: ['Dermatology', 'Ophthalmology', 'Orthopedics'],
  },
  {
    id: 3,
    name: 'Shwe Minn Thar Clinic',
    type_mm: 'ဆေးခန်း',
    type_en: 'Clinic',
    location_mm: 'ဗဟန်းမြို့နယ်၊ ရန်ကုန်',
    location_en: 'Bahan Township, Yangon',
    phone: '09 456 789 123',
    hours_mm: 'နံနက် ၉ နာရီ — ည ၉ နာရီ',
    hours_en: '9:00 AM — 9:00 PM',
    color: '#f59e0b',
    bg: '#fffbeb',
    img: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=400&h=200&fit=crop',
    specialties_mm: ['သွားဘက်', 'ကိုယ်ဝန်', 'ဆေးဝါး'],
    specialties_en: ['Dentistry', 'Obstetrics', 'Pharmacy'],
  },
  {
    id: 4,
    name: 'Naypyidaw General Hospital',
    type_mm: 'ဆေးရုံ',
    type_en: 'Hospital',
    location_mm: 'နေပြည်တော်',
    location_en: 'Naypyidaw',
    phone: '09 321 654 987',
    hours_mm: 'နေ့ ၂၄ နာရီ ဖွင့်',
    hours_en: 'Open 24 Hours',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    img: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&h=200&fit=crop',
    specialties_mm: ['အထွေထွေ', 'ဦးနှောက်', 'ကင်ဆာ'],
    specialties_en: ['General', 'Neurology', 'Oncology'],
  },
  {
    id: 5,
    name: 'Mandalay Specialist Hospital',
    type_mm: 'ဆေးရုံ',
    type_en: 'Hospital',
    location_mm: 'ချမ်းအေးသာစံ၊ မန္တလေး',
    location_en: 'Chan Aye Thar San, Mandalay',
    phone: '09 789 123 456',
    hours_mm: 'နံနက် ၇ နာရီ — ည ၁၁ နာရီ',
    hours_en: '7:00 AM — 11:00 PM',
    color: '#ef4444',
    bg: '#fef2f2',
    img: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400&h=200&fit=crop',
    specialties_mm: ['နှလုံး', 'ကျောက်ကပ်', 'ဆေးဝါး'],
    specialties_en: ['Cardiology', 'Nephrology', 'Pharmacy'],
  },
  {
    id: 6,
    name: 'City Care Clinic',
    type_mm: 'ဆေးခန်း',
    type_en: 'Clinic',
    location_mm: 'ဒဂုံမြို့နယ်၊ ရန်ကုန်',
    location_en: 'Dagon Township, Yangon',
    phone: '09 654 321 789',
    hours_mm: 'နံနက် ၈ နာရီ — ညနေ ၆ နာရီ',
    hours_en: '8:00 AM — 6:00 PM',
    color: '#06b6d4',
    bg: '#ecfeff',
    img: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&h=200&fit=crop',
    specialties_mm: ['ကလေးသူငယ်', 'မိခင်', 'ဆေးဝါး'],
    specialties_en: ['Pediatrics', 'Maternity', 'Pharmacy'],
  },
];

export default function PartnerClinics() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { lang, tr } = useLang();

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  };

  return (
    <section className="w-full px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold" style={{ color: '#0d2b6e' }}>{tr.partnerTitle}</h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">{tr.partnerSubtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="#" className="text-xs font-semibold px-4 py-2 rounded-full border-2 transition-colors hidden sm:block" style={{ color: '#0d2b6e', borderColor: '#0d2b6e' }}>
              {tr.seeAll}
            </a>
            <div className="flex gap-2">
              <button onClick={() => scroll('left')} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
              <button onClick={() => scroll('right')} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {clinics.map(({ id, name, type_mm, type_en, location_mm, location_en, phone, hours_mm, hours_en, color, bg, img, specialties_mm, specialties_en }) => (
            <div key={id} className="shrink-0 w-72 bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">

              {/* Image */}
              <div className="relative w-full h-36 overflow-hidden">
                <Image src={img} alt={name} fill className="object-cover" />
                {/* Type Badge */}
                <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: color }}>
                  {lang === 'mm' ? type_mm : type_en}
                </span>
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col gap-2.5 flex-1">
                <h3 className="text-sm font-bold text-gray-800 leading-snug">{name}</h3>

                <div className="flex items-start gap-2 text-xs text-gray-500">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color }} />
                  {lang === 'mm' ? location_mm : location_en}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Phone className="w-3.5 h-3.5 shrink-0" style={{ color }} />
                  {phone}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5 shrink-0" style={{ color }} />
                  {lang === 'mm' ? hours_mm : hours_en}
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {(lang === 'mm' ? specialties_mm : specialties_en).map(s => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded-full" style={{ color, backgroundColor: bg }}>
                      {s}
                    </span>
                  ))}
                </div>

                {/* Button */}
                <button className="w-full mt-auto py-2.5 rounded-xl text-xs font-semibold text-white" style={{ backgroundColor: '#0d2b6e' }}>
                  {tr.viewDetails}
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
