'use client';

import { useEffect, useState } from 'react';
import { useLang } from '../lib/LanguageContext';

interface Testimonial {
  id: string; name: string; roleMm: string; roleEn: string | null;
  reviewMm: string; reviewEn: string | null; rating: number; imageUrl: string | null;
}

const PRIMARY = 'var(--color-primary)';
const ACCENT  = 'var(--color-accent)';

function TestimonialCard({ t, lang }: { t: Testimonial; lang: string }) {
  return (
    <div className="shrink-0 w-64 sm:w-80 rounded-2xl border border-gray-100 bg-white p-6 flex flex-col gap-4 shadow-[0_2px_20px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-md">
      <div className="flex gap-0.5 text-amber-400">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} viewBox="0 0 20 20" fill={i < t.rating ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={i < t.rating ? 0 : 1} className="w-3.5 h-3.5">
            <path d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7z" />
          </svg>
        ))}
      </div>
      <p className="text-[15px] text-gray-700 leading-relaxed flex-1">
        {lang === 'mm' ? t.reviewMm : (t.reviewEn ?? t.reviewMm)}
      </p>
      <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
        {t.imageUrl ? (
          <img src={t.imageUrl} alt={t.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})` }}
          >
            {t.name.charAt(0)}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-gray-900">{t.name}</p>
          <p className="text-xs text-gray-400">{lang === 'mm' ? t.roleMm : (t.roleEn ?? t.roleMm)}</p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const { lang, tr } = useLang();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    fetch('/api/testimonials').then(r => r.json()).then(d => setTestimonials(d.testimonials ?? [])).catch(() => {});
  }, []);

  if (testimonials.length === 0) return null;

  return (
    <section className="relative w-full py-10 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top left, color-mix(in srgb, ${PRIMARY} 8%, transparent) 0%, transparent 55%), radial-gradient(ellipse at bottom right, color-mix(in srgb, ${ACCENT} 8%, transparent) 0%, transparent 55%)` }}
      />
      <div className="relative z-10 max-w-6xl mx-auto px-6 mb-8">
        <h2 className="text-xl sm:text-3xl font-bold text-gray-900">{tr.testimonialsTitle}</h2>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">{tr.testimonialsSubtitle}</p>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div
          className="w-full overflow-hidden py-4"
          style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}
        >
          <div className="flex gap-6 w-max marquee-track">
            {[...testimonials, ...testimonials].map((t, i) => (
              <TestimonialCard key={`${t.id}-${i}`} t={t} lang={lang} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .marquee-track {
          animation: testimonials-marquee 36s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        @keyframes testimonials-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
