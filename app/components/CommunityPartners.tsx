'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Phone, MapPin, ArrowRight, HeartHandshake } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

const PRIMARY = '#0d2b6e';

interface CommunityPartner {
  id: string;
  name: string; nameEn: string | null;
  descriptionMm: string | null; descriptionEn: string | null;
  location: string | null;
  phone: string | null; viber: string | null;
  imageUrl: string | null;
}

function SkeletonCard() {
  return (
    <div className="shrink-0 w-48 sm:w-72 rounded-xl bg-white border border-gray-100 overflow-hidden">
      <div className="h-32 sm:h-40 bg-gray-100 animate-pulse" />
      <div className="p-3 sm:p-5 flex flex-col gap-2">
        <div className="h-4 bg-gray-100 rounded-lg animate-pulse w-3/4" />
        <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-1/2" />
        <div className="h-9 bg-gray-100 rounded-full animate-pulse w-full mt-2" />
      </div>
    </div>
  );
}

export default function CommunityPartners() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { lang } = useLang();
  const mm = lang === 'mm';
  const [partners, setPartners] = useState<CommunityPartner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/community-partners')
      .then(r => r.json())
      .then(d => { setPartners(d.partners ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  if (!loading && partners.length === 0) return null;

  return (
    <section className="relative w-full py-10 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6 flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl sm:text-3xl font-bold text-gray-900">
            {mm ? 'အစိုးရဆေးရုံ၊ လူမှုကူညီရေးအသင်းများ' : 'Government Hospitals & Charity Associations'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {mm ? 'အများပြည်သူ ကျန်းမာရေးဝန်ဆောင်မှုနှင့် အသင်းအဖွဲ့များ' : 'Public health services and community aid organizations'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => scroll('left')} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </button>
          <button onClick={() => scroll('right')} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="relative z-10 flex gap-5 overflow-x-auto pb-2 max-w-6xl mx-auto px-6"
        style={{ scrollbarWidth: 'none' }}
      >
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          partners.map(p => {
            const name = mm ? p.name : (p.nameEn ?? p.name);
            const description = mm ? p.descriptionMm : (p.descriptionEn ?? p.descriptionMm);

            return (
              <div key={p.id} className="shrink-0 w-48 sm:w-72 rounded-xl bg-white border border-gray-100 overflow-hidden flex flex-col">
                <div className="relative w-full h-32 sm:h-40 overflow-hidden" style={{ backgroundColor: `${PRIMARY}08` }}>
                  {p.imageUrl ? (
                    <Image src={p.imageUrl} alt={name} fill className="object-contain p-4" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <HeartHandshake className="w-9 h-9" style={{ color: `${PRIMARY}40` }} />
                    </div>
                  )}
                </div>

                <div className="p-3 sm:p-5 flex flex-col gap-1.5 sm:gap-2.5 flex-1">
                  <div>
                    <h3 className="text-sm sm:text-lg font-bold text-gray-900 leading-snug line-clamp-2 min-h-[2.4em] sm:min-h-[2.6em]">{name}</h3>
                    {p.location && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        <p className="text-xs text-gray-400 truncate">{p.location}</p>
                      </div>
                    )}
                  </div>

                  {description && (
                    <p className="hidden sm:block text-xs text-gray-500 leading-relaxed line-clamp-2">{description}</p>
                  )}

                  <div className="flex items-center gap-2 mt-auto pt-1.5 sm:pt-2">
                    {p.phone && (
                      <a
                        href={`tel:${p.phone}`}
                        className="w-8 h-8 sm:w-11 sm:h-11 shrink-0 rounded-full border border-gray-200 flex items-center justify-center transition-colors hover:bg-gray-50"
                      >
                        <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
                      </a>
                    )}
                    <Link
                      href={`/community-partners/${p.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-2.5 rounded-full text-white text-[11px] sm:text-xs font-bold hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: PRIMARY }}
                    >
                      {mm ? 'အသေးစိတ်ကြည့်ရန်' : 'View details'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
