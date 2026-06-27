'use client';
import { theme } from '../../lib/theme';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';

const PRIMARY   = 'var(--color-primary)';
const SECONDARY = 'var(--color-primary-dark)';

const blogCategories = [
  { mm: 'အတ္တအိမ်ကျန်းမာရေး',      en: 'Digestive Health',    img: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop',    slug: 'digestive' },
  { mm: 'သွားကျန်းမာရေး',            en: 'Dental Health',       img: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=400&h=400&fit=crop',    slug: 'dental' },
  { mm: 'မျက်စီကျန်းမာရေး',           en: 'Eye Health',          img: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&h=400&fit=crop',    slug: 'eye' },
  { mm: 'ကလေးကျန်းမာရေး',            en: 'Child Health',        img: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=400&h=400&fit=crop',    slug: 'child' },
  { mm: 'အသည်းကျန်းမာရေး',           en: 'Liver Health',        img: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=400&h=400&fit=crop',    slug: 'liver' },
  { mm: 'အရိုးအကြောကျန်းမာရေး',      en: 'Bone & Joint Health', img: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f3?w=400&h=400&fit=crop',    slug: 'bone-joint' },
  { mm: 'နှလုံးကျန်းမာရေး',           en: 'Heart Health',        img: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=400&h=400&fit=crop',    slug: 'heart' },
  { mm: 'ကင်ဆာ',                      en: 'Cancer',              img: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=400&fit=crop',    slug: 'cancer' },
  { mm: 'အတွေ့အထိကျန်းမာရေး',        en: 'Skin Health',         img: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400&h=400&fit=crop',    slug: 'skin' },
  { mm: 'အဟာရမျှတရေး',                en: 'Nutrition',           img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop',    slug: 'nutrition' },
  { mm: 'စိတ်ကျန်းမာရေး',             en: 'Mental Health',       img: 'https://images.unsplash.com/photo-1620147461831-a97b99ade1d3?w=400&h=400&fit=crop',    slug: 'mental' },
  { mm: 'ကိုယ်လက်လှုပ်ရှားမှု',       en: 'Exercise & Fitness',  img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',    slug: 'fitness' },
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
                {mm ? 'ဆောင်းပါး အမျိုးအစားများ' : 'Article Categories'}
              </h1>
            </div>
            <p className="text-white/60 text-sm ml-11">
              {mm ? 'ကျန်းမာရေး အကြောင်းအရာ တစ်ခုကို ရွေးချယ်ပါ' : 'Choose a health topic to explore'}
            </p>
          </div>

          {/* Grid */}
          <div className="p-6 flex-1">
            <div className="grid grid-cols-6 gap-3">
              {blogCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/patient/blog/${cat.slug}`}
                  className="relative rounded-xl overflow-hidden group active:scale-95 transition-all"
                  style={{ aspectRatio: '1 / 1' }}
                >
                  <Image
                    src={cat.img}
                    alt={cat.en}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72) 50%, transparent 100%)' }}
                  />
                  <span className="absolute bottom-2 left-0 right-0 px-2 text-[11px] font-bold text-white text-center leading-tight">
                    {mm ? cat.mm : cat.en}
                  </span>
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
