'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

interface Offer {
  id: string;
  imageUrl: string;
  badgeMm: string; badgeEn: string | null;
  titleMm: string; titleEn: string | null;
  descMm: string | null; descEn: string | null;
  ctaMm: string; ctaEn: string | null;
  ctaLink: string | null;
  ctaColor: string;
}

export default function SpecialOffersBanner() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const { lang, tr } = useLang();

  useEffect(() => {
    fetch('/api/special-offers')
      .then(r => r.json())
      .then(d => { setOffers(d.offers ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (offers.length < 2) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % offers.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [offers.length]);

  if (loading) {
    return (
      <section className="w-full px-4 sm:px-6 pt-0 pb-4 sm:py-6">
        <div className="max-w-6xl mx-auto">
          <div className="h-5 w-40 bg-gray-100 rounded animate-pulse mb-3" />
          <div className="rounded-2xl bg-gray-100 animate-pulse" style={{ minHeight: '120px' }} />
        </div>
      </section>
    );
  }

  const offer = offers[current];

  return (
    <section className="w-full px-4 sm:px-6 pt-0 pb-4 sm:py-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-sm sm:text-2xl font-bold mb-3" style={{ color: '#0d2b6e' }}>{tr.specialOffersTitle}</h2>

        {offers.length === 0 ? (
          <div className="rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center gap-2 text-gray-300" style={{ minHeight: '260px' }}>
            <Image src="/9169253-removebg-preview.png" alt="No data" width={90} height={90} className="opacity-70" />
            <p className="text-sm text-gray-400">{lang === 'mm' ? 'ဒေတာ မရှိသေးပါ' : 'No data yet'}</p>
          </div>
        ) : (
        <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: '260px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={offer.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <Image src={offer.imageUrl} alt="offer" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/40" />
            </motion.div>
          </AnimatePresence>

          {/* Content */}
          <div className="relative z-10 flex items-center justify-between px-4 sm:px-10 py-8 sm:py-16 gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <span className="text-[10px] sm:text-xs font-semibold bg-white/20 text-white px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                {lang === 'mm' ? offer.badgeMm : (offer.badgeEn ?? offer.badgeMm)}
              </span>
              <h3 className="text-white text-xs sm:text-2xl font-bold leading-snug mb-1">
                {lang === 'mm' ? offer.titleMm : (offer.titleEn ?? offer.titleMm)}
              </h3>
              {(offer.descMm || offer.descEn) && (
                <p className="text-white/80 text-[10px] sm:text-sm line-clamp-1">
                  {lang === 'mm' ? (offer.descMm ?? offer.descEn) : (offer.descEn ?? offer.descMm)}
                </p>
              )}
            </div>
            <a
              href={offer.ctaLink || '#'}
              className="shrink-0 font-semibold text-[10px] sm:text-sm px-3 sm:px-7 py-1.5 sm:py-3 rounded-full hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#ffffff', color: offer.ctaColor }}
            >
              {lang === 'mm' ? offer.ctaMm : (offer.ctaEn ?? offer.ctaMm)}
            </a>
          </div>

          {/* Controls */}
          {offers.length > 1 && (
            <div className="relative z-10 flex items-center justify-end gap-1.5 px-3 pb-2">
              <button onClick={() => setCurrent(prev => (prev - 1 + offers.length) % offers.length)} className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                <ChevronLeft className="w-3 h-3 text-white" />
              </button>
              <div className="flex gap-1">
                {offers.map((_, i) => (
                  <button key={i} onClick={() => setCurrent(i)} className="w-1.5 h-1.5 rounded-full transition-all" style={{ backgroundColor: i === current ? '#fff' : 'rgba(255,255,255,0.4)' }} />
                ))}
              </div>
              <button onClick={() => setCurrent(prev => (prev + 1) % offers.length)} className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                <ChevronRight className="w-3 h-3 text-white" />
              </button>
            </div>
          )}
        </div>
        )}
      </div>
    </section>
  );
}
