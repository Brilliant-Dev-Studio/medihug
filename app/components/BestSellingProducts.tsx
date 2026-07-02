'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Star, ShoppingCart, Tag, Flame } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

const PRIMARY = 'var(--color-primary)';
const ACCENT  = 'var(--color-accent)';

interface Product {
  id: string; name: string; nameEn: string | null;
  imageUrl: string | null; price: number; reviewCount: number;
  packSize: string | null; category: string | null;
}

function SkeletonCard() {
  return (
    <div className="shrink-0 w-52 lg:w-auto rounded-2xl border border-gray-100 bg-white overflow-hidden flex flex-col">
      <div className="bg-gray-200 animate-pulse" style={{ height: 160 }} />
      <div className="p-3 flex flex-col gap-2">
        <div className="h-3 bg-gray-200 rounded-lg animate-pulse w-4/5" />
        <div className="h-2 bg-gray-100 rounded-lg animate-pulse w-1/2" />
        <div className="flex items-center gap-1">
          <div className="h-3 bg-gray-100 rounded animate-pulse w-16" />
        </div>
        <div className="h-8 bg-gray-100 rounded-xl animate-pulse mt-1" />
      </div>
    </div>
  );
}

function ProductCard({ p, mm, rank }: { p: Product; mm: boolean; rank: number }) {
  const name = mm ? p.name : (p.nameEn ?? p.name);
  const isHot = rank < 3;
  return (
    <Link href={`/patient/records/${p.id}`}
      className="shrink-0 w-52 lg:w-auto rounded-2xl border border-gray-100 bg-white overflow-hidden flex flex-col active:scale-95 transition-all hover:shadow-md group">

      {/* image */}
      <div className="relative overflow-hidden bg-gray-50" style={{ height: 160 }}>
        {p.imageUrl
          ? <Image src={p.imageUrl} alt={name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center text-5xl">💊</div>
        }
        {/* gradient overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.18) 0%, transparent 50%)' }} />

        {/* hot badge */}
        {isHot && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: '#ef4444' }}>
            <Flame className="w-2.5 h-2.5" />
            {mm ? 'ရေပန်းစား' : 'Hot'}
          </div>
        )}

        {/* category badge */}
        {p.category && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{ backgroundColor: `${PRIMARY}dd`, color: '#fff' }}>
            {p.category}
          </div>
        )}
      </div>

      {/* info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <h3 className="text-xs font-bold text-gray-800 leading-snug lg:text-sm line-clamp-2">{name}</h3>

        {p.packSize && (
          <div className="flex items-center gap-1">
            <Tag className="w-3 h-3 text-gray-300" />
            <span className="text-[10px] text-gray-400">{p.packSize}</span>
          </div>
        )}

        {/* rating row */}
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map(s => (
            <Star key={s} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
          ))}
          <span className="text-[10px] font-semibold text-gray-600 ml-0.5">4.8</span>
          {p.reviewCount > 0 && (
            <span className="text-[10px] text-gray-400">({p.reviewCount})</span>
          )}
        </div>

        {/* price + cart */}
        <div className="mt-auto pt-2 flex items-center justify-between border-t border-gray-50">
          <div>
            <p className="text-[10px] text-gray-400">{mm ? 'တစ်ထုပ်' : 'per pack'}</p>
            <span className="text-sm font-extrabold" style={{ color: PRIMARY }}>{p.price.toLocaleString()} Ks</span>
          </div>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{ backgroundColor: PRIMARY }}>
            <ShoppingCart className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function BestSellingProducts() {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    fetch('/api/admin/products?isActive=true&pageSize=8')
      .then(r => r.json())
      .then(d => { setProducts(d.products ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <div>
          <h2 className="font-bold text-base lg:text-lg" style={{ color: PRIMARY }}>
            {mm ? 'အရောင်းရဆုံး ကုန်ပစ္စည်းများ' : 'Best Selling Products'}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {mm ? 'သုံးစွဲသူများ အကြိုက်ဆုံးများ' : 'Most loved by our customers'}
          </p>
        </div>
        <Link href="/patient/records"
          className="text-xs font-semibold flex items-center gap-0.5 lg:text-sm" style={{ color: ACCENT }}>
          {mm ? 'အားလုံး' : 'See all'} <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-x-visible lg:pb-0" style={{ scrollbarWidth: 'none' }}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : products.length === 0
            ? <p className="text-sm text-gray-400 py-4">{mm ? 'ကုန်ပစ္စည်း မရှိသေး' : 'No products yet'}</p>
            : products.map((p, i) => <ProductCard key={p.id} p={p} mm={mm} rank={i} />)
        }
      </div>
    </div>
  );
}
