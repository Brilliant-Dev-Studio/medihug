'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';

interface Ad {
  id: string;
  imageUrl: string;
  alt: string | null;
  link: string | null;
}

export default function AdSlider() {
  const [ads, setAds]         = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch('/api/ads')
      .then(r => r.json())
      .then(d => { setAds(d.ads ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (ads.length < 2) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % ads.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [ads.length]);

  if (loading) {
    return (
      <div className="w-full px-1 sm:px-6 py-4 sm:py-6">
        <div className="max-w-6xl mx-auto rounded-2xl bg-gray-100 animate-pulse" style={{ aspectRatio: '16 / 5' }} />
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="w-full px-1 sm:px-6 py-4 sm:py-6">
        <div className="max-w-6xl mx-auto rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center gap-2 text-gray-300" style={{ aspectRatio: '16 / 5' }}>
          <Image src="/9169253-removebg-preview.png" alt="No data" width={80} height={80} className="opacity-70" />
          <p className="text-sm text-gray-400">No data yet</p>
        </div>
      </div>
    );
  }

  const ad = ads[current];

  return (
    <div className="w-full px-1 sm:px-6 py-4 sm:py-6">
      <div className="max-w-6xl mx-auto relative overflow-hidden sm:rounded-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={ad.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {ad.link ? (
              <a href={ad.link}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ad.imageUrl} alt={ad.alt ?? 'Advertisement'} className="w-full h-auto block" />
              </a>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={ad.imageUrl} alt={ad.alt ?? 'Advertisement'} className="w-full h-auto block" />
            )}
          </motion.div>
        </AnimatePresence>

        {ads.length > 1 && (
          <>
            {/* Chevron Left */}
            <button
              onClick={() => setCurrent(prev => (prev - 1 + ads.length) % ads.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white transition-colors rounded-full w-9 h-9 flex items-center justify-center shadow"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Chevron Right */}
            <button
              onClick={() => setCurrent(prev => (prev + 1) % ads.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white transition-colors rounded-full w-9 h-9 flex items-center justify-center shadow"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {ads.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{ backgroundColor: i === current ? '#fff' : 'rgba(255,255,255,0.45)' }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
