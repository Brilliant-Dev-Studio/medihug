'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

const offers = [
  {
    id: 1,
    bg: 'linear-gradient(135deg, #0d2b6e 0%, #1a6bcc 100%)',
    img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=400&fit=crop&q=90',
    badge_mm: 'အထူးလျှော့စျေး',
    badge_en: 'Special Discount',
    title_mm: 'ပထမဆုံး Consultation ၅၀% လျှော့ပေးမည်',
    title_en: '50% Off Your First Consultation',
    desc_mm: 'ယနေ့ပင် ဆရာဝန်နှင့် ဆက်သွယ်ပြီး ကျန်းမာရေး စစ်ဆေးပါ',
    desc_en: 'Connect with a doctor today and get your health checked',
    cta_mm: 'ယခုပင် ချိန်းဆိုရန်',
    cta_en: 'Book Now',
    ctaBg: '#ffffff',
    ctaColor: '#0d2b6e',
  },
  {
    id: 2,
    bg: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)',
    img: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=1200&h=400&fit=crop&q=90',
    badge_mm: 'ဆေးဝါး အစီအစဉ်',
    badge_en: 'Medicine Deal',
    title_mm: 'ဆေးဝါး မှာယူခြင်း အခမဲ့ ပို့ဆောင်',
    title_en: 'Free Delivery on All Medicine Orders',
    desc_mm: 'ကျပ် ၅,၀၀၀ နှင့် အထက် မှာယူသောအခါ အိမ်တိုင်ရောက် ပို့ဆောင်ပေးမည်',
    desc_en: 'Free home delivery for orders above 5,000 Ks',
    cta_mm: 'ဆေးမှာရန်',
    cta_en: 'Order Now',
    ctaBg: '#ffffff',
    ctaColor: '#065f46',
  },
  {
    id: 3,
    bg: 'linear-gradient(135deg, #7c2d12 0%, #f97316 100%)',
    img: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1200&h=400&fit=crop&q=90',
    badge_mm: 'မိတ်ဖက် ဆေးရုံ',
    badge_en: 'Partner Hospital',
    title_mm: 'Asia Royal Hospital တွင် ၃၀% လျှော့စျေး',
    title_en: '30% Discount at Asia Royal Hospital',
    desc_mm: 'MediHug မှတဆင့် ချိန်းဆိုသောအခါ အထူးလျှော့ပေးမည်',
    desc_en: 'Get exclusive discount when booking through MediHug',
    cta_mm: 'ချိန်းဆိုရန်',
    cta_en: 'Book Appointment',
    ctaBg: '#ffffff',
    ctaColor: '#7c2d12',
  },
];

export default function SpecialOffersBanner() {
  const [current, setCurrent] = useState(0);
  const { lang, tr } = useLang();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % offers.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const offer = offers[current];

  return (
    <section className="w-full px-6 py-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-lg sm:text-2xl font-bold mb-4" style={{ color: '#0d2b6e' }}>{tr.specialOffersTitle}</h2>

        <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: '160px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={offer.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              {/* Background Image */}
              <Image src={offer.img} alt="offer" fill className="object-cover" />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/40" />
            </motion.div>
          </AnimatePresence>

          {/* Content — outside AnimatePresence so it doesn't flicker */}
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 sm:px-10 py-5 sm:py-8 gap-3 sm:gap-4">
            <div className="flex-1">
              <span className="text-xs font-semibold bg-white/20 text-white px-3 py-1 rounded-full inline-block mb-2">
                {lang === 'mm' ? offer.badge_mm : offer.badge_en}
              </span>
              <h3 className="text-white text-base sm:text-2xl font-bold leading-snug mb-1">
                {lang === 'mm' ? offer.title_mm : offer.title_en}
              </h3>
              <p className="text-white/80 text-xs sm:text-sm">
                {lang === 'mm' ? offer.desc_mm : offer.desc_en}
              </p>
            </div>
            <a
              href="#"
              className="shrink-0 font-semibold text-xs sm:text-sm px-5 sm:px-7 py-2.5 sm:py-3 rounded-full hover:opacity-90 transition-opacity"
              style={{ backgroundColor: offer.ctaBg, color: offer.ctaColor }}
            >
              {lang === 'mm' ? offer.cta_mm : offer.cta_en}
            </a>
          </div>

          {/* Controls */}
          <div className="relative z-10 flex items-center justify-end gap-2 px-4 pb-3">
            <button onClick={() => setCurrent(prev => (prev - 1 + offers.length) % offers.length)} className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <div className="flex gap-1.5">
              {offers.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} className="w-1.5 h-1.5 rounded-full transition-all" style={{ backgroundColor: i === current ? '#fff' : 'rgba(255,255,255,0.4)' }} />
              ))}
            </div>
            <button onClick={() => setCurrent(prev => (prev + 1) % offers.length)} className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
