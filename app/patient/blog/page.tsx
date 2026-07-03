'use client';
import { theme } from '../../lib/theme';

import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronLeft, ArrowRight, Soup, Smile, Eye, Baby, Droplet, Bone,
  HeartPulse, Ribbon, Sparkles, Apple, Brain, Dumbbell,
} from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';

const PRIMARY   = 'var(--color-primary)';
const SECONDARY = 'var(--color-primary-dark)';

const blogCategories = [
  { mm: 'အတ္တအိမ်ကျန်းမာရေး',      en: 'Digestive Health',    img: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&h=500&fit=crop',    slug: 'digestive',  icon: Soup,      color: '#f97316' },
  { mm: 'သွားကျန်းမာရေး',            en: 'Dental Health',       img: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=500&h=500&fit=crop',    slug: 'dental',     icon: Smile,     color: '#06b6d4' },
  { mm: 'မျက်စီကျန်းမာရေး',           en: 'Eye Health',          img: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=500&h=500&fit=crop',    slug: 'eye',        icon: Eye,       color: '#3b82f6' },
  { mm: 'ကလေးကျန်းမာရေး',            en: 'Child Health',        img: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=500&h=500&fit=crop',    slug: 'child',      icon: Baby,      color: '#f59e0b' },
  { mm: 'အသည်းကျန်းမာရေး',           en: 'Liver Health',        img: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=500&h=500&fit=crop',    slug: 'liver',      icon: Droplet,   color: '#0ea5e9' },
  { mm: 'အရိုးအကြောကျန်းမာရေး',      en: 'Bone & Joint Health', img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&h=500&fit=crop',    slug: 'bone-joint', icon: Bone,      color: '#78716c' },
  { mm: 'နှလုံးကျန်းမာရေး',           en: 'Heart Health',        img: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=500&h=500&fit=crop',    slug: 'heart',      icon: HeartPulse,color: '#ef4444' },
  { mm: 'ကင်ဆာ',                      en: 'Cancer',              img: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=500&h=500&fit=crop',    slug: 'cancer',     icon: Ribbon,    color: '#ec4899' },
  { mm: 'အတွေ့အထိကျန်းမာရေး',        en: 'Skin Health',         img: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=500&h=500&fit=crop',    slug: 'skin',       icon: Sparkles,  color: '#a855f7' },
  { mm: 'အဟာရမျှတရေး',                en: 'Nutrition',           img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=500&fit=crop',    slug: 'nutrition',  icon: Apple,     color: '#22c55e' },
  { mm: 'စိတ်ကျန်းမာရေး',             en: 'Mental Health',       img: 'https://images.unsplash.com/photo-1620147461831-a97b99ade1d3?w=500&h=500&fit=crop',    slug: 'mental',     icon: Brain,     color: '#8b5cf6' },
  { mm: 'ကိုယ်လက်လှုပ်ရှားမှု',       en: 'Exercise & Fitness',  img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop',    slug: 'fitness',    icon: Dumbbell,  color: '#14b8a6' },
];

export default function BlogCategoriesPage() {
  const { lang } = useLang();
  const mm = lang === 'mm';

  return (
    <div className="min-h-full bg-gray-50 lg:bg-gray-100">

      {/* ══ DESKTOP ══ */}
      <div className="hidden lg:flex gap-5 h-screen overflow-hidden px-6 py-6">
        <div className="flex-1 overflow-y-auto rounded-2xl bg-gray-50 flex flex-col">

          {/* Hero */}
          <div
            className="relative overflow-hidden px-8 pt-8 pb-6 rounded-t-2xl shrink-0"
            style={{ background: `linear-gradient(180deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}
          >
            {/* Decorative SVG pattern */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='34' height='34'%3E%3Cpath d='M17 5 L17 29 M5 17 L29 17' stroke='%23ffffff' stroke-opacity='0.25' stroke-width='2' stroke-linecap='round'/%3E%3Ccircle cx='17' cy='17' r='2' fill='%23ffffff' fill-opacity='0.3'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat',
              }}
            />
            <div
              className="absolute -right-10 -top-16 w-56 h-56 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 70%)' }}
            />

            <div className="relative flex items-center gap-3 mb-1">
              <Link
                href="/patient/dashboard"
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </Link>
              <h1 className="text-2xl font-bold text-white">
                {mm ? 'ဆောင်းပါး အမျိုးအစားများ' : 'Article Categories'}
              </h1>
            </div>
            <p className="relative text-white/60 text-sm ml-11">
              {mm ? 'ကျန်းမာရေး အကြောင်းအရာ တစ်ခုကို ရွေးချယ်ပါ' : 'Choose a health topic to explore'}
            </p>
          </div>

          {/* Grid */}
          <div className="p-6 pt-8 flex-1">
            <div className="grid grid-cols-4 gap-x-4 gap-y-8">
              {blogCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/patient/blog/${cat.slug}`}
                  className="group relative rounded-[28px] overflow-hidden bg-white border border-gray-100"
                >
                  <div className="relative w-full" style={{ aspectRatio: '4 / 3' }}>
                    <Image src={cat.img} alt={cat.en} fill className="object-cover" />
                    <div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.05) 45%, transparent 70%)' }}
                    />
                  </div>

                  {/* Floating icon badge, overlapping the image/body seam */}
                  <div
                    className="relative z-10 -mt-6 ml-4 rounded-2xl flex items-center justify-center"
                    style={{ width: 44, height: 44, backgroundColor: PRIMARY, boxShadow: '0 0 0 4px #fff' }}
                  >
                    <cat.icon className="w-5 h-5 text-white" />
                  </div>

                  <div className="pt-3 pb-4 px-4">
                    <p className="text-[15px] font-bold text-gray-800 leading-snug truncate">{mm ? cat.mm : cat.en}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] font-semibold" style={{ color: PRIMARY }}>
                        {mm ? 'ဖတ်ရှုရန်' : 'Explore'}
                      </span>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: `${PRIMARY}15` }}>
                        <ArrowRight className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
                      </div>
                    </div>
                  </div>
                </Link>
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
              {mm ? 'ဆောင်းပါး အမျိုးအစားများ' : 'Article Categories'}
            </h1>
          </div>
          <p className="text-white/60 text-sm ml-11">
            {mm ? 'ကျန်းမာရေး အကြောင်းအရာ တစ်ခုကို ရွေးချယ်ပါ' : 'Choose a health topic to explore'}
          </p>
        </div>

        {/* Grid */}
        <div className="px-4 pt-5 pb-24">
          <div className="grid grid-cols-3 gap-2.5">
            {blogCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/patient/blog/${cat.slug}`}
                className="relative rounded-xl overflow-hidden active:scale-95 transition-all"
                style={{ aspectRatio: '1 / 1' }}
              >
                <Image
                  src={cat.img}
                  alt={cat.en}
                  fill
                  className="object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72) 50%, transparent 100%)' }}
                />
                <span className="absolute bottom-2 left-0 right-0 px-1.5 text-[10px] font-bold text-white text-center leading-tight">
                  {mm ? cat.mm : cat.en}
                </span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
