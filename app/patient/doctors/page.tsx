'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Search, SlidersHorizontal, Clock } from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';

type Doctor = {
  id: number;
  name_mm: string;
  name_en: string;
  spec_mm: string;
  spec_en: string;
  exp: number;
  price: number;
  waitMin: number;
  nextSlot_mm: string;
  nextSlot_en: string;
  img: string;
  online: boolean;
  myDoctor?: boolean;
};

const ALL_DOCTORS: Doctor[] = [
  {
    id: 1,
    name_mm: 'ပါမောက္ခသိန်းအောင်',
    name_en: 'Prof. Dr. Thein Aung',
    spec_mm: 'ကလေးကျန်းမာရေးအထူးကု',
    spec_en: 'Pediatric Specialist',
    exp: 43,
    price: 22000,
    waitMin: 15,
    nextSlot_mm: 'မနက်ဖြန် မနက် 9:00',
    nextSlot_en: 'Tomorrow 9:00 AM',
    img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face',
    online: true,
    myDoctor: true,
  },
  {
    id: 2,
    name_mm: 'ဒေါ်ကျော်ကျော်သိန်း',
    name_en: 'Dr. Kyaw Kyaw Thein',
    spec_mm: 'နှလုံးအထူးကု',
    spec_en: 'Cardiologist',
    exp: 28,
    price: 15000,
    waitMin: 10,
    nextSlot_mm: 'ယနေ့ မွန်းလွဲ 2:00',
    nextSlot_en: 'Today 2:00 PM',
    img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face',
    online: true,
  },
  {
    id: 3,
    name_mm: 'ဒေါ်သန်းသန်းမြင့်',
    name_en: 'Dr. Than Than Myint',
    spec_mm: 'ကလေးအထူးကု',
    spec_en: 'Pediatrician',
    exp: 18,
    price: 10000,
    waitMin: 30,
    nextSlot_mm: 'မနက်ဖြန် မနက် 10:30',
    nextSlot_en: 'Tomorrow 10:30 AM',
    img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face',
    online: false,
    myDoctor: true,
  },
  {
    id: 4,
    name_mm: 'ဦးမောင်မောင်ဝင်း',
    name_en: 'Dr. Maung Maung Win',
    spec_mm: 'အရေပြားအထူးကု',
    spec_en: 'Dermatologist',
    exp: 12,
    price: 12000,
    waitMin: 20,
    nextSlot_mm: 'ယနေ့ ညနေ 4:00',
    nextSlot_en: 'Today 4:00 PM',
    img: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face',
    online: true,
  },
  {
    id: 5,
    name_mm: 'ဒေါ်နွဲ့နွဲ့မြင့်',
    name_en: 'Dr. Nwe Nwe Myint',
    spec_mm: 'မျက်စိအထူးကု',
    spec_en: 'Ophthalmologist',
    exp: 22,
    price: 18000,
    waitMin: 45,
    nextSlot_mm: 'မနက်ဖြန် မနက် 8:00',
    nextSlot_en: 'Tomorrow 8:00 AM',
    img: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=200&h=200&fit=crop&crop=face',
    online: false,
  },
];

const PRIMARY   = '#0d2b6e';
const SECONDARY = '#1a6bcc';
const ACCENT    = '#4facfe';

function DoctorCard({ doc, mm, favorited, onToggleFav }: {
  doc: Doctor;
  mm: boolean;
  favorited: boolean;
  onToggleFav: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Top section */}
      <div className="p-4">
        <div className="flex gap-3">
          {/* Photo */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-100">
              <Image
                src={doc.img}
                alt={doc.name_en}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
            {doc.online && (
              <span
                className="absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white"
                style={{ backgroundColor: '#22c55e' }}
              />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="font-bold text-base leading-tight" style={{ color: PRIMARY }}>
                {mm ? doc.name_mm : doc.name_en}
              </p>
              <button
                onClick={onToggleFav}
                className="shrink-0 mt-0.5 transition-transform active:scale-90"
              >
                <Heart
                  className="w-5 h-5"
                  style={{
                    color: favorited ? '#ef4444' : '#d1d5db',
                    fill: favorited ? '#ef4444' : 'transparent',
                  }}
                />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              {mm ? doc.spec_mm : doc.spec_en}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              {mm
                ? `အတွေ့အကြုံ (${doc.exp}) နှစ်`
                : `${doc.exp} years experience`}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-sm font-bold" style={{ color: PRIMARY }}>
                {doc.price.toLocaleString()} MMK
              </span>
              <span className="text-gray-300 text-sm">|</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {mm ? `${doc.waitMin} မိနစ်အတွင်း` : `in ${doc.waitMin} min`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider + availability */}
      <div className="border-t border-gray-100 px-4 py-2.5 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {mm ? 'အစောဆုံးပြန်နိုင်သည်အချိန်' : 'Earliest available'}
        </p>
        <p className="text-xs font-semibold" style={{ color: PRIMARY }}>
          {mm ? doc.nextSlot_mm : doc.nextSlot_en}
        </p>
      </div>

      {/* Buttons */}
      <div className="px-4 pb-4 flex gap-2">
        <Link
          href={`/patient/doctors/${doc.id}`}
          className="flex-1 text-center text-sm font-semibold py-2.5 rounded-full border transition-all active:scale-95"
          style={{ borderColor: PRIMARY, color: PRIMARY }}
        >
          {mm ? 'ကိုယ်ရေးအကျဉ်း' : 'View Profile'}
        </Link>
        <Link
          href="/patient/appointments"
          className="flex-1 text-center text-sm font-bold py-2.5 rounded-full text-white transition-all active:scale-95"
          style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}
        >
          {mm ? 'ချိန်းဆိုမည်' : 'Book Now'}
        </Link>
      </div>
    </div>
  );
}

type Tab = 'all' | 'my';

export default function DoctorsPage() {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const [tab, setTab] = useState<Tab>('all');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState('');

  const toggleFav = (id: number) =>
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const filtered = ALL_DOCTORS.filter(d => {
    if (tab === 'my') return d.myDoctor;
    return true;
  }).filter(d => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      d.name_mm.includes(search) ||
      d.name_en.toLowerCase().includes(q) ||
      d.spec_mm.includes(search) ||
      d.spec_en.toLowerCase().includes(q)
    );
  });

  const tabs: { key: Tab; mm: string; en: string }[] = [
    { key: 'all', mm: 'အားလုံး',    en: 'All' },
    { key: 'my',  mm: 'မိမိဆရာဝန်', en: 'My Doctors' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div
        className="px-4 pb-5"
        style={{
          background: 'linear-gradient(180deg, #0d2b6e 0%, #1a6bcc 100%)',
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          marginTop: -72,
          paddingTop: 84,
        }}
      >
        <h1 className="text-xl font-bold text-white mb-3">
          {mm ? 'ဆရာဝန်များ' : 'Doctors'}
        </h1>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <Search className="w-4 h-4 shrink-0" style={{ color: 'rgba(255,255,255,0.6)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={mm ? 'ဆရာဝန် ရှာဖွေပါ...' : 'Search doctors...'}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/50 text-white"
            />
          </div>
          <button
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <SlidersHorizontal className="w-4 h-4 text-white/70" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                backgroundColor: tab === t.key ? PRIMARY : 'transparent',
                color: tab === t.key ? '#fff' : '#9ca3af',
              }}
            >
              {mm ? t.mm : t.en}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="px-4 py-2">
        <p className="text-xs text-gray-400">
          {mm
            ? `ဆရာဝန် ${filtered.length} ဦး တွေ့ရှိသည်`
            : `${filtered.length} doctor${filtered.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Doctor list */}
      <div className="px-4 pb-24 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Search className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-400">
              {mm ? 'ဆရာဝန် မတွေ့ပါ' : 'No doctors found'}
            </p>
            <p className="text-xs text-gray-300 mt-1">
              {mm ? 'ရှာဖွေမှု နည်းနည်း ပြောင်းကြည့်ပါ' : 'Try a different search'}
            </p>
          </div>
        ) : (
          filtered.map(doc => (
            <DoctorCard
              key={doc.id}
              doc={doc}
              mm={mm}
              favorited={favorites.has(doc.id)}
              onToggleFav={() => toggleFav(doc.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
