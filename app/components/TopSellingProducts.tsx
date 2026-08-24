'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, BadgeCheck, Bookmark, ShoppingBag, Star, Pill } from 'lucide-react';
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
    <div className="shrink-0 w-40 sm:w-64 rounded-xl bg-white border border-gray-100 overflow-hidden">
      <div className="aspect-square bg-gray-100 animate-pulse" />
      <div className="p-2.5 sm:p-4 flex flex-col gap-2">
        <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-3/4" />
        <div className="h-4 bg-gray-100 rounded-lg animate-pulse w-full" />
        <div className="h-4 bg-gray-100 rounded-lg animate-pulse w-1/2 mt-2" />
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
          <Link href="/products" className="text-xs font-semibold px-4 py-2 rounded-full border-2 transition-colors hidden sm:block" style={{ color: PRIMARY, borderColor: PRIMARY }}>
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

            const roundedRating = Math.round(p.rating);

            return (
              <Link
                href={`/products/${p.id}`}
                key={p.id}
                className="group shrink-0 w-40 sm:w-64 rounded-xl bg-white border border-gray-100 overflow-hidden flex flex-col"
              >
                {/* Image */}
                <div className="relative w-full aspect-square overflow-hidden bg-gray-50">
                  {p.imageUrl ? (
                    <Image src={p.imageUrl} alt={name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${PRIMARY}0a` }}>
                      <Pill className="w-9 h-9" style={{ color: `${PRIMARY}55` }} />
                    </div>
                  )}

                  <span className="absolute top-2 left-2 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
                    <BadgeCheck className="w-3 h-3" style={{ color: PRIMARY }} />
                    <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: PRIMARY }}>{mm ? 'အာမခံ' : 'Verified'}</span>
                  </span>

                  <button
                    onClick={e => { e.preventDefault(); toggleFav(p.id); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/95 backdrop-blur-sm shadow-sm flex items-center justify-center transition-transform active:scale-90"
                  >
                    <Bookmark className="w-3.5 h-3.5" fill={favorited ? '#0d2b6e' : 'none'} stroke={favorited ? '#0d2b6e' : '#6b7280'} />
                  </button>
                </div>

                {/* Body */}
                <div className="p-2.5 sm:p-4 flex flex-col gap-1.5 sm:gap-2 flex-1">
                  {p.category && <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 truncate">{p.category}</p>}
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug line-clamp-2 min-h-[2.4em]">{name}</h3>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="w-3 h-3" fill={s < roundedRating ? '#f59e0b' : 'none'} stroke={s < roundedRating ? '#f59e0b' : '#d1d5db'} />
                    ))}
                    {p.reviewCount > 0 && <span className="text-[10px] text-gray-400 ml-0.5">({p.reviewCount})</span>}
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-auto pt-1.5 sm:pt-2">
                    <p className="text-sm sm:text-lg font-extrabold" style={{ color: PRIMARY }}>
                      {p.price.toLocaleString()}<span className="text-[10px] sm:text-xs font-semibold text-gray-400 ml-1">MMK</span>
                    </p>
                    <span
                      className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
                      style={{ backgroundColor: PRIMARY }}
                    >
                      <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {needsIdentity && <IdentifyModal mm={mm} onClose={closeIdentity} onSubmit={submitIdentity} />}
    </section>
  );
}
