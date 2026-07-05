'use client';
import { theme } from '../../lib/theme'; void theme;

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search, SlidersHorizontal, Star, Heart, Check,
  RotateCcw, ListFilter, Banknote, Tag, Layers,
  ChevronLeft, ChevronRight, Package, Loader2,
} from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';
import { useFavorites } from '../../lib/useFavorites';
import IdentifyModal from '../../components/IdentifyModal';

const PRIMARY   = 'var(--color-primary)';
const SECONDARY = 'var(--color-primary-dark)';

type Product = {
  id: string;
  name: string;
  nameEn: string | null;
  imageUrl: string | null;
  category: string | null;
  packSize: string | null;
  price: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
};
type Category = { id: string; name: string; nameEn: string | null };

/* ── Search box with dropdown autosuggest ── */
function ProductSearchBox({ products, value, onChange, mm, placeholder, pillClassName }: {
  products: Product[]; value: string; onChange: (v: string) => void; mm: boolean;
  placeholder: string; pillClassName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const q = value.trim().toLowerCase();
  const suggestions = q.length === 0 ? [] : products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.nameEn ?? '').toLowerCase().includes(q) ||
    (p.category ?? '').toLowerCase().includes(q)
  ).slice(0, 6);

  return (
    <div ref={boxRef} className="relative flex-1 min-w-0">
      <div className={pillClassName}>
        <Search className="w-4 h-4 shrink-0 text-white/60" />
        <input
          type="text"
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true); setHi(0); }}
          onFocus={() => { if (value.trim()) setOpen(true); }}
          onKeyDown={e => {
            if (!open || suggestions.length === 0) return;
            if (e.key === 'ArrowDown') { e.preventDefault(); setHi(h => Math.min(h + 1, suggestions.length - 1)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setHi(h => Math.max(h - 1, 0)); }
            else if (e.key === 'Enter' && suggestions[hi]) { e.preventDefault(); setOpen(false); router.push(`/patient/records/${suggestions[hi].id}`); }
            else if (e.key === 'Escape') { setOpen(false); }
          }}
          placeholder={placeholder}
          className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-white/50 text-white" />
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden py-1.5">
          {suggestions.map((p, i) => {
            const name = mm ? p.name : (p.nameEn ?? p.name);
            return (
              <Link key={p.id} href={`/patient/records/${p.id}`}
                onClick={() => setOpen(false)}
                onMouseEnter={() => setHi(i)}
                className="flex items-center gap-3 px-3.5 py-2.5 transition-colors"
                style={{ backgroundColor: i === hi ? '#f3f4f6' : 'transparent' }}
              >
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt={name} className="w-full h-full object-cover" />
                    : <Package className="w-4 h-4 text-gray-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
                  <p className="text-xs text-gray-400 truncate">{p.category ?? ''}</p>
                </div>
                <span className="text-xs font-bold shrink-0" style={{ color: PRIMARY }}>{p.price.toLocaleString()} Ks</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Radio row ── */
function RadioRow({ active, label, count, onClick }: { active: boolean; label: string; count: number; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all"
      style={{ backgroundColor: active ? `${PRIMARY}08` : 'transparent' }}>
      <span className="shrink-0 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all"
        style={{ borderColor: active ? PRIMARY : '#d1d5db', backgroundColor: active ? PRIMARY : 'transparent' }}>
        {active && <Check className="w-2 h-2 text-white" strokeWidth={3} />}
      </span>
      <span className="flex-1 text-xs text-left" style={{ color: active ? PRIMARY : '#374151', fontWeight: active ? 600 : 400 }}>{label}</span>
      <span className="text-[10px] px-1.5 py-0.5 rounded min-w-4.5 text-center"
        style={{ backgroundColor: active ? `${PRIMARY}18` : '#f3f4f6', color: active ? PRIMARY : '#9ca3af', fontWeight: active ? 600 : 400 }}>
        {count}
      </span>
    </button>
  );
}

/* ── Product card ── */
function ProductCard({ product, mm, catLabel, favorited, onToggleFav }: {
  product: Product; mm: boolean; catLabel: string; favorited: boolean; onToggleFav: () => void;
}) {
  return (
    <Link href={`/patient/records/${product.id}`} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-100" style={{ paddingBottom: '75%' }}>
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt={product.name} fill className="object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="w-10 h-10 text-gray-300" />
          </div>
        )}
        {/* Favorite */}
        <button onClick={e => { e.preventDefault(); e.stopPropagation(); onToggleFav(); }}
          className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center">
          <Heart className="w-3.5 h-3.5" fill={favorited ? '#ef4444' : 'none'} stroke={favorited ? '#ef4444' : '#9ca3af'} />
        </button>
        {/* Pack size badge */}
        {product.packSize && (
          <span className="absolute bottom-2 left-2 z-10 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/40 text-white">
            {product.packSize}
          </span>
        )}
      </div>
      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <p className="text-xs font-semibold text-gray-800 leading-snug">{product.name}</p>
        {product.nameEn && <p className="text-[10px] text-gray-500 leading-snug">{product.nameEn}</p>}
        <p className="text-[10px] text-gray-400">{catLabel}</p>
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-[10px] font-semibold text-gray-700">{product.rating.toFixed(1)}</span>
          <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
        </div>
        <div className="mt-auto pt-1">
          <span className="text-sm font-bold" style={{ color: PRIMARY }}>{product.price.toLocaleString()} Ks</span>
        </div>
      </div>
    </Link>
  );
}

/* ── Loading skeleton ── */
function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="bg-gray-100" style={{ paddingBottom: '75%' }} />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-4/5" />
        <div className="h-2.5 bg-gray-100 rounded w-1/2" />
        <div className="h-4 bg-gray-100 rounded w-1/3 mt-2" />
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsPageInner />
    </Suspense>
  );
}

function ProductsPageInner() {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const searchParams = useSearchParams();

  const [allProducts, setAllProducts]           = useState<Product[]>([]);
  const [categories,  setCategories]            = useState<Category[]>([]);
  const [loading,     setLoading]               = useState(true);
  const [search,      setSearch]                = useState('');
  const [filterCat,   setFilterCat]             = useState(() => searchParams.get('category') ?? 'all');
  const [filterSize,  setFilterSize]            = useState('all');
  const [priceMin,    setPriceMin]              = useState(0);
  const [priceMax,    setPriceMax]              = useState(50000);
  const { favorites, toggle: toggleFav, needsIdentity, closeIdentity, submitIdentity } = useFavorites('product');
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/products?isActive=true&pageSize=500').then(r => r.json()),
      fetch('/api/admin/product-categories').then(r => r.json()),
    ]).then(([pd, cd]) => {
      const prods: Product[] = pd.products ?? [];
      setAllProducts(prods);
      setCategories(cd.categories ?? []);
      if (prods.length > 0) {
        const maxP = Math.ceil(Math.max(...prods.map(p => p.price)) / 1000) * 1000;
        setPriceMax(maxP);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const dynamicMaxPrice = useMemo(
    () => allProducts.length > 0 ? Math.ceil(Math.max(...allProducts.map(p => p.price)) / 1000) * 1000 : 50000,
    [allProducts],
  );

  // All unique pack sizes from products
  const allPackSizes = useMemo(
    () => [...new Set(allProducts.map(p => p.packSize).filter((s): s is string => !!s))],
    [allProducts],
  );

  // Category count map (by category.name = MM name stored in product.category)
  const catCounts = useMemo(() => {
    const map: Record<string, number> = { all: allProducts.length };
    categories.forEach(c => { map[c.name] = allProducts.filter(p => p.category === c.name).length; });
    return map;
  }, [allProducts, categories]);

  const hasFilter  = filterCat !== 'all' || filterSize !== 'all' || priceMin > 0 || priceMax < dynamicMaxPrice;
  const activeCount = (filterCat !== 'all' ? 1 : 0) + (filterSize !== 'all' ? 1 : 0) + (priceMin > 0 || priceMax < dynamicMaxPrice ? 1 : 0);
  const resetFilters = () => { setFilterCat('all'); setFilterSize('all'); setPriceMin(0); setPriceMax(dynamicMaxPrice); };

  const filtered = allProducts.filter(p => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !(p.nameEn ?? '').toLowerCase().includes(q) &&
          !(p.category ?? '').toLowerCase().includes(q)) return false;
    }
    if (filterCat !== 'all' && p.category !== filterCat) return false;
    if (filterSize !== 'all' && p.packSize !== filterSize) return false;
    if (p.price < priceMin || p.price > priceMax) return false;
    return true;
  });

  // Helper: get display category label for a product
  const getCatLabel = (p: Product) => {
    if (!p.category) return '';
    if (!mm) {
      const cat = categories.find(c => c.name === p.category);
      return cat?.nameEn ?? p.category;
    }
    return p.category;
  };

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
          <RadioRow active={filterCat === 'all'} label={mm ? 'အားလုံး' : 'All'} count={catCounts['all'] ?? 0} onClick={() => setFilterCat('all')} />
          {categories.map(cat => (
            <RadioRow key={cat.id}
              active={filterCat === cat.name}
              label={mm ? cat.name : (cat.nameEn ?? cat.name)}
              count={catCounts[cat.name] ?? 0}
              onClick={() => setFilterCat(cat.name)}
            />
          ))}
        </div>
      </div>

      {/* Pack Size */}
      {allPackSizes.length > 0 && (
        <div className="px-3 py-3 border-b border-gray-100">
          <div className="flex items-center gap-1.5 mb-2">
            <Layers className="w-3 h-3 text-gray-400" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{mm ? 'အရွယ်အစား' : 'Pack Size'}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(['all', ...allPackSizes]).map(s => (
              <button key={s} onClick={() => setFilterSize(s)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all"
                style={{
                  backgroundColor: filterSize === s ? PRIMARY : 'transparent',
                  borderColor: filterSize === s ? PRIMARY : '#e5e7eb',
                  color: filterSize === s ? '#fff' : '#6b7280',
                }}>
                {s === 'all' ? (mm ? 'အားလုံး' : 'All') : s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price */}
      <div className="px-3 pt-2.5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Banknote className="w-3 h-3 text-gray-400" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{mm ? 'စျေးနှုန်း' : 'Price'}</p>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${PRIMARY}10`, color: PRIMARY }}>
            {(priceMin > 0 || priceMax < dynamicMaxPrice)
              ? `${(priceMin / 1000).toFixed(0)}K–${(priceMax / 1000).toFixed(0)}K`
              : (mm ? 'အားလုံး' : 'Any')}
          </span>
        </div>
        <div className="relative py-2.5 px-1">
          <div className="h-1 bg-gray-200 rounded-full relative">
            <div className="absolute h-full rounded-full"
              style={{ left: `${(priceMin / dynamicMaxPrice) * 100}%`, right: `${100 - (priceMax / dynamicMaxPrice) * 100}%`, backgroundColor: PRIMARY }} />
          </div>
          <input type="range" min={0} max={dynamicMaxPrice} step={Math.max(500, Math.round(dynamicMaxPrice / 100) * 100)} value={priceMin}
            onChange={e => { const v = Number(e.target.value); if (v < priceMax - 1000) setPriceMin(v); }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" style={{ zIndex: priceMin > dynamicMaxPrice * 0.88 ? 5 : 3 }} />
          <input type="range" min={0} max={dynamicMaxPrice} step={Math.max(500, Math.round(dynamicMaxPrice / 100) * 100)} value={priceMax}
            onChange={e => { const v = Number(e.target.value); if (v > priceMin + 1000) setPriceMax(v); }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" style={{ zIndex: 4 }} />
          <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow pointer-events-none"
            style={{ left: `calc(${(priceMin / dynamicMaxPrice) * 100}% - 6px)`, backgroundColor: PRIMARY }} />
          <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow pointer-events-none"
            style={{ left: `calc(${(priceMax / dynamicMaxPrice) * 100}% - 6px)`, backgroundColor: PRIMARY }} />
        </div>
        <div className="flex justify-between px-1">
          <span className="text-[10px] text-gray-400">0</span>
          <span className="text-[10px] text-gray-400">{(dynamicMaxPrice / 1000).toFixed(0)}K Ks</span>
        </div>
      </div>

      {/* Result count */}
      <div className="px-3 pb-3">
        <div className="w-full py-2.5 rounded-xl text-xs font-bold text-white text-center"
          style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
          {loading
            ? (mm ? 'တင်နေသည်...' : 'Loading...')
            : (mm ? `ကုန်ပစ္စည်း ${filtered.length} ခု တွေ့ရှိသည်` : `${filtered.length} product${filtered.length !== 1 ? 's' : ''} found`)}
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
            <ProductSearchBox products={allProducts} value={search} onChange={setSearch} mm={mm}
              placeholder={mm ? 'ကုန်ပစ္စည်း ရှာဖွေပါ...' : 'Search products...'}
              pillClassName="flex items-center gap-2 rounded-2xl px-4 py-3 w-full bg-white/15"
            />
          </div>
          <div className="px-6 pt-4 pb-2 flex items-center justify-between shrink-0">
            <p className="text-sm font-semibold" style={{ color: PRIMARY }}>{mm ? 'ကုန်ပစ္စည်းများ' : 'All Products'}</p>
            <p className="text-sm text-gray-400">
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin inline" />
                : (mm ? `${filtered.length} ခု` : `${filtered.length} items`)}
            </p>
          </div>
          <div className="flex-1 px-6 pb-8">
            {loading ? (
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : filtered.length === 0 ? emptyState : (
              <div className="grid grid-cols-3 gap-4">
                {filtered.map(p => (
                  <ProductCard key={p.id} product={p} mm={mm} catLabel={getCatLabel(p)}
                    favorited={favorites.has(p.id)} onToggleFav={() => toggleFav(p.id)} />
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Right: filter */}
        <div className="shrink-0 w-64 bg-gray-100">
          <div className="sticky top-0 pb-4 max-h-screen overflow-y-auto">{filterPanel}</div>
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
            <ProductSearchBox products={allProducts} value={search} onChange={setSearch} mm={mm}
              placeholder={mm ? 'ကုန်ပစ္စည်း ရှာဖွေပါ...' : 'Search products...'}
              pillClassName="flex items-center gap-2 rounded-xl px-4 py-3 bg-white/15"
            />
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
          <p className="text-sm text-gray-400">{loading ? '...' : (mm ? `${filtered.length} ခု` : `${filtered.length} items`)}</p>
        </div>
        <div className="px-4 pb-24">
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? emptyState : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} mm={mm} catLabel={getCatLabel(p)}
                  favorited={favorites.has(p.id)} onToggleFav={() => toggleFav(p.id)} />
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Unused imports suppressor */}
      {false && <span><ChevronLeft /><ChevronRight /></span>}

      {needsIdentity && <IdentifyModal mm={mm} onClose={closeIdentity} onSubmit={submitIdentity} />}
    </div>
  );
}
