'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, BadgeCheck, Bookmark, ArrowRight } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';
import { useFavorites } from '../lib/useFavorites';
import IdentifyModal from './IdentifyModal';

const PRIMARY = '#0d2b6e';

interface Product {
  id: string; name: string; nameEn: string | null;
  imageUrl: string | null; price: number;
  rating: number; reviewCount: number; category: string | null;
}

function SkeletonCard() {
  return (
    <div className="shrink-0 w-44 sm:w-72 rounded-2xl bg-white shadow-[0_2px_20px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="aspect-4/5 bg-gray-100 animate-pulse" />
      <div className="p-5 flex flex-col gap-2">
        <div className="h-4 bg-gray-100 rounded-lg animate-pulse w-3/4" />
        <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-1/2" />
      </div>
    </div>
  );
}

export default function TopSellingProducts() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { tr, lang } = useLang();
  const mm = lang === 'mm';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const { favorites, toggle: toggleFav, needsIdentity, closeIdentity, submitIdentity } = useFavorites('product');

  useEffect(() => {
    fetch('/api/admin/products?isActive=true&pageSize=8')
      .then(r => r.json())
      .then(d => { setProducts(d.products ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  if (!loading && products.length === 0) return null;

  return (
    <section className="relative w-full py-10 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top right, rgba(13,43,110,0.06) 0%, transparent 55%), radial-gradient(ellipse at bottom left, rgba(245,158,11,0.08) 0%, transparent 55%)' }}
      />
      <div className="relative z-10 max-w-6xl mx-auto px-6 flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl sm:text-3xl font-bold text-gray-900">{tr.topProductsTitle}</h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">{tr.topProductsSubtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/patient/records" className="text-xs font-semibold px-4 py-2 rounded-full border-2 transition-colors hidden sm:block" style={{ color: PRIMARY, borderColor: PRIMARY }}>
            {tr.viewAll}
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

      {/* Card row — bleeds past the container's right edge */}
      <div
        ref={scrollRef}
        className="relative z-10 flex gap-5 overflow-x-auto pb-2 pl-6 sm:pl-8 pr-6"
        style={{ scrollbarWidth: 'none', paddingLeft: 'max(1.5rem, calc((100vw - 72rem) / 2 + 1.5rem))' }}
      >
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          products.map(p => {
            const name = mm ? p.name : (p.nameEn ?? p.name);
            const favorited = favorites.has(p.id);

            return (
              <div key={p.id} className="shrink-0 w-44 sm:w-72 rounded-2xl bg-white shadow-[0_2px_20px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">

                {/* Image */}
                <div className="relative w-full aspect-4/5 overflow-hidden bg-gray-50">
                  {p.imageUrl ? (
                    <Image src={p.imageUrl} alt={name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">💊</div>
                  )}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <BadgeCheck className="w-3.5 h-3.5 text-white" />
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-white">{mm ? 'အာမခံပစ္စည်း' : 'Verified Product'}</span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-3 sm:p-5 flex flex-col gap-2 sm:gap-3">
                  <div>
                    {p.category && <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{p.category}</p>}
                    <h3 className="text-base font-semibold text-gray-900 leading-snug mt-1 truncate">{name}</h3>
                    <p className="text-xs text-gray-400 mt-1.5">
                      {p.price.toLocaleString()} MMK · {p.rating.toFixed(1)} {mm ? 'ရေးတင်ချက်' : 'rating'}{p.reviewCount > 0 ? ` (${p.reviewCount})` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => toggleFav(p.id)}
                      className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 rounded-full border border-gray-200 flex items-center justify-center transition-colors hover:bg-gray-50"
                    >
                      <Bookmark className="w-4 h-4" fill={favorited ? '#111827' : 'none'} stroke={favorited ? '#111827' : '#374151'} />
                    </button>
                    <Link
                      href={`/patient/records/${p.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-full bg-gray-900 text-white text-xs font-bold uppercase tracking-wide hover:opacity-90 transition-opacity"
                    >
                      {mm ? 'ဝယ်ယူရန်' : 'Buy Now'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {needsIdentity && <IdentifyModal mm={mm} onClose={closeIdentity} onSubmit={submitIdentity} />}
    </section>
  );
}
