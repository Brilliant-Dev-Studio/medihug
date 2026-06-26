'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, SlidersHorizontal, Star, Heart, Check, RotateCcw, ListFilter, Banknote, Tag, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';

const PRIMARY   = '#0d2b6e';
const SECONDARY = '#1a6bcc';

type Product = {
  id: number;
  name: string;
  category_mm: string;
  category_en: string;
  size: string;
  price: number;
  rating: number;
  reviews: number;
  imgs: string[];
};

const ALL_PRODUCTS: Product[] = [
  { id: 1,  name: 'Paracetamol 500mg',        category_mm: 'ဆေးဝါး',           category_en: 'Medicine',       size: '500mg',   price: 1500,  rating: 4.8, reviews: 320,
    imgs: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=400&fit=crop'] },
  { id: 2,  name: 'Vitamin C 1000mg',          category_mm: 'ဖြည့်စွက်စာ',      category_en: 'Supplements',    size: '1000mg',  price: 3200,  rating: 4.9, reviews: 512,
    imgs: ['https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop'] },
  { id: 3,  name: 'Cetaphil Face Wash',        category_mm: 'အရေပြားပြုစု',     category_en: 'Skincare',       size: '250ml',   price: 12500, rating: 4.7, reviews: 198,
    imgs: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400&h=400&fit=crop'] },
  { id: 4,  name: 'Dettol Antiseptic',         category_mm: 'ပထမဆုံးအကူအညီ',  category_en: 'First Aid',      size: '250ml',   price: 2800,  rating: 4.6, reviews: 275,
    imgs: ['https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=400&fit=crop'] },
  { id: 5,  name: 'Omega-3 Fish Oil',          category_mm: 'ဖြည့်စွက်စာ',      category_en: 'Supplements',    size: '1000mg',  price: 8900,  rating: 4.8, reviews: 430,
    imgs: ['https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400&h=400&fit=crop'] },
  { id: 6,  name: 'Baby Dove Body Lotion',     category_mm: 'မိခင်နှင့်ကလေး',   category_en: 'Mother & Baby',  size: '400ml',   price: 5500,  rating: 4.9, reviews: 610,
    imgs: ['https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=400&fit=crop'] },
  { id: 7,  name: 'Strepsils Throat Lozenges', category_mm: 'ဆေးဝါး',           category_en: 'Medicine',       size: '100mg',   price: 1800,  rating: 4.5, reviews: 160,
    imgs: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&sat=-100','https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=400&fit=crop'] },
  { id: 8,  name: 'Glucometer Device',         category_mm: 'ဆေးကိရိယာ',        category_en: 'Medical Device', size: 'Standard',price: 45000, rating: 4.7, reviews: 88,
    imgs: ['https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400&h=400&fit=crop'] },
  { id: 9,  name: 'Zinc Tablet 50mg',          category_mm: 'ဖြည့်စွက်စာ',      category_en: 'Supplements',    size: '50mg',    price: 2200,  rating: 4.4, reviews: 95,
    imgs: ['https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=400&fit=crop'] },
  { id: 10, name: 'Sunscreen SPF 50',          category_mm: 'အရေပြားပြုစု',     category_en: 'Skincare',       size: '100ml',   price: 9800,  rating: 4.6, reviews: 230,
    imgs: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=400&fit=crop'] },
  { id: 11, name: 'Blood Pressure Monitor',    category_mm: 'ဆေးကိရိယာ',        category_en: 'Medical Device', size: 'Standard',price: 38000, rating: 4.8, reviews: 145,
    imgs: ['https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400&h=400&fit=crop'] },
  { id: 12, name: 'Baby Wipes 80pcs',          category_mm: 'မိခင်နှင့်ကလေး',   category_en: 'Mother & Baby',  size: '80pcs',   price: 3500,  rating: 4.7, reviews: 380,
    imgs: ['https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=400&fit=crop'] },
];

const ALL_CATEGORIES = [...new Set(ALL_PRODUCTS.map(p => p.category_en))];
const ALL_SIZES      = [...new Set(ALL_PRODUCTS.map(p => p.size))];
const CAT_COUNTS: Record<string, number> = { all: ALL_PRODUCTS.length };
ALL_CATEGORIES.forEach(c => { CAT_COUNTS[c] = ALL_PRODUCTS.filter(p => p.category_en === c).length; });

function RadioRow({ active, label, count, onClick }: { active: boolean; label: string; count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all"
      style={{ backgroundColor: active ? `${PRIMARY}08` : 'transparent' }}
    >
      <span
        className="shrink-0 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all"
        style={{ borderColor: active ? PRIMARY : '#d1d5db', backgroundColor: active ? PRIMARY : 'transparent' }}
      >
        {active && <Check className="w-2 h-2 text-white" strokeWidth={3} />}
      </span>
      <span className="flex-1 text-xs text-left" style={{ color: active ? PRIMARY : '#374151', fontWeight: active ? 600 : 400 }}>
        {label}
      </span>
      <span
        className="text-[10px] px-1.5 py-0.5 rounded min-w-4.5 text-center"
        style={{ backgroundColor: active ? `${PRIMARY}18` : '#f3f4f6', color: active ? PRIMARY : '#9ca3af', fontWeight: active ? 600 : 400 }}
      >
        {count}
      </span>
    </button>
  );
}

function ProductCard({ product, mm, favorited, onToggleFav }: { product: Product; mm: boolean; favorited: boolean; onToggleFav: () => void }) {
  const [slide, setSlide] = useState(0);
  const total = product.imgs.length;

  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setSlide(s => (s - 1 + total) % total); };
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setSlide(s => (s + 1) % total); };

  return (
    <Link href={`/patient/records/${product.id}`} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
      {/* Image slider */}
      <div className="relative overflow-hidden" style={{ paddingBottom: '75%' }}>
        {product.imgs.map((src, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-300"
            style={{ opacity: i === slide ? 1 : 0, zIndex: i === slide ? 1 : 0 }}
          >
            <Image src={src} alt={product.name} fill className="object-cover" />
          </div>
        ))}

        {/* Favorite */}
        <button onClick={e => { e.stopPropagation(); onToggleFav(); }} className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center">
          <Heart className="w-3.5 h-3.5" fill={favorited ? '#ef4444' : 'none'} stroke={favorited ? '#ef4444' : '#9ca3af'} />
        </button>

        {/* Prev / Next */}
        {total > 1 && (
          <>
            <button onClick={prev} className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-black/30 flex items-center justify-center">
              <ChevronLeft className="w-3.5 h-3.5 text-white" />
            </button>
            <button onClick={next} className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-black/30 flex items-center justify-center">
              <ChevronRight className="w-3.5 h-3.5 text-white" />
            </button>
          </>
        )}

        {/* Dots */}
        {total > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1">
            {product.imgs.map((_, i) => (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); setSlide(i); }}
                className="rounded-full transition-all"
                style={{ width: i === slide ? 14 : 5, height: 5, backgroundColor: i === slide ? '#fff' : 'rgba(255,255,255,0.5)' }}
              />
            ))}
          </div>
        )}

        {/* Size badge */}
        <span className="absolute bottom-2 left-2 z-10 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/40 text-white">
          {product.size}
        </span>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <p className="text-xs font-semibold text-gray-800 leading-snug">{product.name}</p>
        <p className="text-[10px] text-gray-400">{mm ? product.category_mm : product.category_en}</p>
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-[10px] font-semibold text-gray-700">{product.rating}</span>
          <span className="text-[10px] text-gray-400">({product.reviews})</span>
        </div>
        <div className="mt-auto pt-1">
          <span className="text-sm font-bold" style={{ color: PRIMARY }}>{product.price.toLocaleString()} Ks</span>
        </div>
      </div>
    </Link>
  );
}

export default function ProductsPage() {
  const { lang } = useLang();
  const mm = lang === 'mm';

  const [search, setSearch]                     = useState('');
  const [filterCat, setFilterCat]               = useState('all');
  const [filterSize, setFilterSize]             = useState('all');
  const [priceMin, setPriceMin]                 = useState(0);
  const [priceMax, setPriceMax]                 = useState(50000);
  const [favorites, setFavorites]               = useState<Set<number>>(new Set());
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const toggleFav = (id: number) =>
    setFavorites(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const hasFilter  = filterCat !== 'all' || filterSize !== 'all' || priceMin > 0 || priceMax < 50000;
  const activeCount = (filterCat !== 'all' ? 1 : 0) + (filterSize !== 'all' ? 1 : 0) + (priceMin > 0 || priceMax < 50000 ? 1 : 0);
  const resetFilters = () => { setFilterCat('all'); setFilterSize('all'); setPriceMin(0); setPriceMax(50000); };

  const filtered = ALL_PRODUCTS
    .filter(p => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.category_en.toLowerCase().includes(q) || p.category_mm.includes(search);
    })
    .filter(p => filterCat === 'all' || p.category_en === filterCat)
    .filter(p => filterSize === 'all' || p.size === filterSize)
    .filter(p => p.price >= priceMin && p.price <= priceMax);

  const filterPanel = (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${PRIMARY}10` }}>
            <ListFilter className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
          </div>
          <div>
            <p className="text-xs font-bold" style={{ color: PRIMARY }}>{mm ? 'စစ်ထုတ်မှု' : 'Filter'}</p>
            <p className="text-[10px] text-gray-400 leading-none mt-0.5">
              {activeCount > 0 ? (mm ? `${activeCount} ခု ရွေးချယ်ထား` : `${activeCount} active`) : (mm ? 'မရှိသေး' : 'No filters')}
            </p>
          </div>
        </div>
        {hasFilter && (
          <button onClick={resetFilters} className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg hover:bg-red-50" style={{ color: '#ef4444' }}>
            <RotateCcw className="w-3 h-3" />{mm ? 'ရှင်းမည်' : 'Reset'}
          </button>
        )}
      </div>

      {/* Category */}
      <div className="px-3 py-3 border-b border-gray-100">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Tag className="w-3 h-3 text-gray-400" />
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{mm ? 'အမျိုးအစား' : 'Category'}</p>
        </div>
        <div className="flex flex-col">
          <RadioRow active={filterCat === 'all'} label={mm ? 'အားလုံး' : 'All'} count={CAT_COUNTS['all']} onClick={() => setFilterCat('all')} />
          {ALL_CATEGORIES.map(cat => (
            <RadioRow
              key={cat}
              active={filterCat === cat}
              label={mm ? (ALL_PRODUCTS.find(p => p.category_en === cat)?.category_mm ?? cat) : cat}
              count={CAT_COUNTS[cat] ?? 0}
              onClick={() => setFilterCat(cat)}
            />
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="px-3 py-3 border-b border-gray-100">
        <div className="flex items-center gap-1.5 mb-2">
          <Layers className="w-3 h-3 text-gray-400" />
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{mm ? 'အရွယ်အစား' : 'Size'}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['all', ...ALL_SIZES]).map(s => (
            <button
              key={s}
              onClick={() => setFilterSize(s)}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all"
              style={{
                backgroundColor: filterSize === s ? PRIMARY : 'transparent',
                borderColor: filterSize === s ? PRIMARY : '#e5e7eb',
                color: filterSize === s ? '#fff' : '#6b7280',
              }}
            >
              {s === 'all' ? (mm ? 'အားလုံး' : 'All') : s}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="px-3 pt-2.5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Banknote className="w-3 h-3 text-gray-400" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{mm ? 'စျေးနှုန်း' : 'Price'}</p>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${PRIMARY}10`, color: PRIMARY }}>
            {priceMin > 0 || priceMax < 50000 ? `${(priceMin/1000).toFixed(0)}K–${(priceMax/1000).toFixed(0)}K` : (mm ? 'အားလုံး' : 'Any')}
          </span>
        </div>
        <div className="relative py-2.5 px-1">
          <div className="h-1 bg-gray-200 rounded-full relative">
            <div className="absolute h-full rounded-full" style={{ left: `${(priceMin/50000)*100}%`, right: `${100-(priceMax/50000)*100}%`, backgroundColor: PRIMARY }} />
          </div>
          <input type="range" min={0} max={50000} step={1000} value={priceMin}
            onChange={e => { const v = Number(e.target.value); if (v < priceMax - 2000) setPriceMin(v); }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" style={{ zIndex: priceMin > 44000 ? 5 : 3 }} />
          <input type="range" min={0} max={50000} step={1000} value={priceMax}
            onChange={e => { const v = Number(e.target.value); if (v > priceMin + 2000) setPriceMax(v); }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" style={{ zIndex: 4 }} />
          <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow pointer-events-none"
            style={{ left: `calc(${(priceMin/50000)*100}% - 6px)`, backgroundColor: PRIMARY }} />
          <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow pointer-events-none"
            style={{ left: `calc(${(priceMax/50000)*100}% - 6px)`, backgroundColor: PRIMARY }} />
        </div>
        <div className="flex justify-between px-1">
          <span className="text-[10px] text-gray-400">0</span>
          <span className="text-[10px] text-gray-400">50,000 Ks</span>
        </div>
      </div>

      {/* Result count */}
      <div className="px-3 pb-3">
        <div className="w-full py-2.5 rounded-xl text-xs font-bold text-white text-center"
          style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
          {mm ? `ကုန်ပစ္စည်း ${filtered.length} ခု တွေ့ရှိသည်` : `${filtered.length} product${filtered.length !== 1 ? 's' : ''} found`}
        </div>
      </div>
    </div>
  );

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <Search className="w-7 h-7 text-gray-300" />
      </div>
      <p className="text-sm font-semibold text-gray-400">{mm ? 'ကုန်ပစ္စည်း မတွေ့ပါ' : 'No products found'}</p>
      <p className="text-xs text-gray-300 mt-1">{mm ? 'Filter ပြောင်းကြည့်ပါ' : 'Try adjusting filters'}</p>
    </div>
  );

  return (
    <div className="min-h-full bg-gray-50 lg:bg-gray-100">

      {/* ══ DESKTOP ══ */}
      <div className="hidden lg:flex gap-5 h-screen overflow-hidden px-6 py-6">

        {/* Left */}
        <div className="flex-1 overflow-y-auto rounded-2xl bg-gray-50 flex flex-col">
          <div className="px-8 pt-8 pb-6 rounded-t-2xl shrink-0" style={{ background: `linear-gradient(180deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
            <h1 className="text-2xl font-bold text-white mb-4">{mm ? 'Products များ' : 'Products'}</h1>
            <div className="flex items-center gap-2 rounded-2xl px-4 py-3" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <Search className="w-4 h-4 shrink-0 text-white/60" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder={mm ? 'ကုန်ပစ္စည်း ရှာဖွေပါ...' : 'Search products...'}
                className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-white/50 text-white" />
            </div>
          </div>
          <div className="px-6 pt-4 pb-2 flex items-center justify-between shrink-0">
            <p className="text-sm font-semibold" style={{ color: PRIMARY }}>{mm ? 'ကုန်ပစ္စည်းများ' : 'All Products'}</p>
            <p className="text-sm text-gray-400">{mm ? `${filtered.length} ခု` : `${filtered.length} items`}</p>
          </div>
          <div className="flex-1 px-6 pb-8">
            {filtered.length === 0 ? emptyState : (
              <div className="grid grid-cols-3 gap-4">
                {filtered.map(p => <ProductCard key={p.id} product={p} mm={mm} favorited={favorites.has(p.id)} onToggleFav={() => toggleFav(p.id)} />)}
              </div>
            )}
          </div>
        </div>

        {/* Right: filter */}
        <div className="shrink-0 w-64 bg-gray-100">
          <div className="sticky top-0 pb-4 max-h-screen overflow-y-auto">
            {filterPanel}
          </div>
        </div>
      </div>

      {/* ══ MOBILE: filter slide-in ══ */}
      {showMobileFilter && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileFilter(false)} />
          <div className="relative bg-white w-72 h-full flex flex-col shadow-2xl">
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${PRIMARY}10` }}>
                  <ListFilter className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
                </div>
                <p className="text-sm font-bold" style={{ color: PRIMARY }}>{mm ? 'စစ်ထုတ်မှု' : 'Filter'}</p>
                {activeCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: PRIMARY }}>{activeCount}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {hasFilter && (
                  <button onClick={resetFilters} className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg hover:bg-red-50" style={{ color: '#ef4444' }}>
                    <RotateCcw className="w-3 h-3" />{mm ? 'ရှင်းမည်' : 'Reset'}
                  </button>
                )}
                <button onClick={() => setShowMobileFilter(false)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400 text-sm leading-none">✕</span>
                </button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1">{filterPanel}</div>
            <div className="px-4 py-4 border-t border-gray-100 shrink-0">
              <button onClick={() => setShowMobileFilter(false)}
                className="w-full py-3.5 rounded-2xl text-sm font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
                {mm ? `ကုန်ပစ္စည်း ${filtered.length} ခု ကြည့်မည်` : `View ${filtered.length} product${filtered.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MOBILE ══ */}
      <div className="lg:hidden">
        <div className="-mt-18 pt-21 pb-5 px-4 w-full"
          style={{ background: `linear-gradient(180deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
          <h1 className="text-xl font-bold text-white mb-3">{mm ? 'Products များ' : 'Products'}</h1>
          <div className="flex items-center gap-2 w-full">
            <div className="flex-1 flex items-center gap-2 rounded-xl px-4 py-3" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <Search className="w-4 h-4 shrink-0 text-white/60" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder={mm ? 'ကုန်ပစ္စည်း ရှာဖွေပါ...' : 'Search products...'}
                className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-white/50 text-white" />
            </div>
            <button onClick={() => setShowMobileFilter(true)}
              className="relative w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <SlidersHorizontal className="w-4 h-4 text-white/70" />
              {activeCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: '#ef4444' }}>
                  {activeCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <p className="text-sm font-semibold" style={{ color: PRIMARY }}>{mm ? 'ကုန်ပစ္စည်းများ' : 'All Products'}</p>
          <p className="text-sm text-gray-400">{mm ? `${filtered.length} ခု` : `${filtered.length} items`}</p>
        </div>

        <div className="px-4 pb-24">
          {filtered.length === 0 ? emptyState : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map(p => <ProductCard key={p.id} product={p} mm={mm} favorited={favorites.has(p.id)} onToggleFav={() => toggleFav(p.id)} />)}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
