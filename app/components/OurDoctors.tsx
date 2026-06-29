'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star, Briefcase, Stethoscope } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

const AVATAR_COLORS = ['#0d2b6e', '#f59e0b', '#22c55e', '#a855f7', '#ef4444', '#ec4899', '#2ab5ad', '#3b82f6', '#10b981'];

interface Doctor {
  id: string; name: string; nameEn: string | null;
  specialty: string; experience: number; rating: number;
  reviewCount: number; price: number; imageUrl: string | null;
}

export default function OurDoctors() {
  const scrollRef            = useRef<HTMLDivElement>(null);
  const { tr, lang }         = useLang();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/doctors?limit=10')
      .then(r => r.json())
      .then(d => { setDoctors(d.doctors ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  return (
    <section className="w-full px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold" style={{ color: '#0d2b6e' }}>{tr.doctorsTitle}</h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">{tr.doctorsSubtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/patient/doctors" className="text-xs font-semibold px-4 py-2 rounded-full border-2 transition-colors hidden sm:block" style={{ color: '#0d2b6e', borderColor: '#0d2b6e' }}>
              {tr.seeAll}
            </Link>
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

        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="shrink-0 w-72 h-72 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
            <Stethoscope className="w-10 h-10 text-gray-200" />
            <p className="text-sm">No doctors available yet.</p>
          </div>
        ) : (
          <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {doctors.map((d, i) => {
              const displayName = lang === 'mm' ? d.name : (d.nameEn ?? d.name);
              return (
                <div key={d.id} className="shrink-0 w-72 bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
                  <div className="w-full h-48 relative overflow-hidden bg-gray-100 flex items-center justify-center"
                    style={{ backgroundColor: `${AVATAR_COLORS[i % AVATAR_COLORS.length]}15` }}>
                    {d.imageUrl ? (
                      <img src={d.imageUrl} alt={displayName} className="w-full h-full object-cover object-top" />
                    ) : (
                      <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white"
                        style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                        {d.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col gap-2.5">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 leading-snug">{displayName}</h3>
                      <span className="text-xs font-medium mt-0.5 inline-block" style={{ color: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                        {d.specialty}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                      {d.experience} {tr.experience}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-semibold text-gray-700">{d.rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-400">({d.reviewCount} {tr.reviews})</span>
                      </div>
                      <span className="text-xs font-bold" style={{ color: '#0d2b6e' }}>
                        {d.price.toLocaleString()} MMK
                      </span>
                    </div>
                    <Link
                      href={`/patient/doctors/${d.id}`}
                      className="w-full mt-1 py-2.5 rounded-xl text-xs font-semibold text-white text-center"
                      style={{ backgroundColor: '#0d2b6e' }}
                    >
                      {tr.bookConsultation}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
