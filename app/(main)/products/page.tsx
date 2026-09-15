'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Star, Package, SlidersHorizontal, ChevronDown, Check, X } from 'lucide-react';
import { useLang } from '@/app/lib/LanguageContext';
import ContactSupportInline from '@/components/ContactSupportInline';
import { getProductPriceEntries, formatPriceEntries } from '@/lib/productPrice';

const PRIMARY = '#0d2b6e';
const ACCENT = '#2ab5ad';
const CATEGORY_COLORS = [ACCENT, '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9', '#ec4899', '#10b981', '#f97316'];

interface Category { id: string; name: string; nameEn: string | null; }
interface Product {
  id: string; name: string; nameEn: string | null;
  imageUrl: string | null; category: string | null;
  price: number; priceThb: number | null; priceUsd: number | null; rating: number; reviewCount: number;
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
      <div className="aspect-square bg-gray-100 animate-pulse" />
      <div className="p-4 flex flex-col gap-2">
        <div className="h-4 bg-gray-100 rounded-lg animate-pulse w-4/5" />
        <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-1/2" />
      </div>
    </div>
  );
}

function PublicProductsPageInner() {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const searchParams = useSearchParams();

  const [products,   setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,     setLoading]   = useState(true);
  const [search,      setSearch]    = useState('');
  const [filterCat,   setFilterCat] = useState(() => searchParams.get('category') ?? 'all');
  const [filterOpen,  setFilterOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/products?isActive=true&pageSize=500').then(r => r.json()),
      fetch('/api/admin/product-categories').then(r => r.json()),
    ]).then(([pd, cd]) => {
      setProducts(pd.products ?? []);
      setCategories(cd.categories ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = products.filter(p => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !(p.nameEn ?? '').toLowerCase().includes(q)) return false;
    }
    if (filterCat !== 'all' && p.category !== filterCat) return false;
    return true;
  });

  // Whole catalog is empty (nothing set up yet) vs. a search/filter that just matched
  // nothing — the former hides the search+filter chrome entirely and offers a way to reach
  // support instead of dead-ending on "no products found".
  const catalogEmpty = !loading && products.length === 0;

  const selectedCategoryIndex = categories.findIndex(c => c.name === filterCat);
  const selectedCategory = selectedCategoryIndex >= 0 ? categories[selectedCategoryIndex] : undefined;
  const selectedLabel = filterCat === 'all'
    ? (mm ? 'အားလုံး' : 'All')
    : (selectedCategory ? (mm ? selectedCategory.name : (selectedCategory.nameEn ?? selectedCategory.name)) : filterCat);
  const selectedColor = filterCat === 'all' || selectedCategoryIndex < 0
    ? PRIMARY
    : CATEGORY_COLORS[selectedCategoryIndex % CATEGORY_COLORS.length];

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      {/* Hero band — only really visible on wider screens, gives the page a laptop-sized anchor */}
      <div className="hidden lg:block relative overflow-hidden border-b border-gray-100" style={{ background: `linear-gradient(135deg, ${PRIMARY}06 0%, ${PRIMARY}0f 100%)` }}>
        <svg className="absolute inset-0 w-full h-full opacity-[0.07]" aria-hidden="true">
          <defs>
            <pattern id="products-hero-dots" width="26" height="26" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="2" fill={PRIMARY} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#products-hero-dots)" />
        </svg>
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full opacity-[0.08] pointer-events-none" style={{ background: PRIMARY }} />
        <div className="absolute right-32 -bottom-16 w-48 h-48 rounded-full opacity-10 pointer-events-none" style={{ background: ACCENT }} />
        <Image
          src="/medihug-icon.png" alt="" width={340} height={340} aria-hidden
          className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-[0.07] pointer-events-none select-none object-contain"
        />

        <div className="max-w-7xl mx-auto px-8 pt-14 pb-10 relative">
          <div className="flex items-center gap-2">
            <Image src="/medihug-icon.png" alt="" width={20} height={20} aria-hidden className="object-contain" />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: PRIMARY }}>MediHug Shop</p>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mt-2">{mm ? 'ကျန်းမာရေးဆိုင်ရာ ဝန်ဆောင်မှု၊ ဆေးနှင့် ပစ္စည်းများ' : 'Products'}</h1>
          <p className="text-sm text-gray-500 mt-2 max-w-lg">{mm ? 'သုံးစွဲသူများအကြိုက်ဆုံး ဆေးဝါးနှင့် ကျန်းမာရေးပစ္စည်းများ' : 'Browse trusted health and wellness products'}</p>
          <div className="h-1 w-14 rounded-full mt-4" style={{ background: `linear-gradient(90deg, ${PRIMARY} 0%, ${ACCENT} 100%)` }} />
        </div>
      </div>

      {/* Mobile/tablet hero — dark, colorful banner instead of a plain heading */}
      <div className="lg:hidden relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #163a8a 100%)` }}>
        <svg className="absolute inset-0 w-full h-full opacity-[0.08]" aria-hidden="true">
          <defs>
            <pattern id="products-hero-dots-mobile" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.6" fill="#fff" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#products-hero-dots-mobile)" />
        </svg>
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-10 pointer-events-none" style={{ background: ACCENT }} />
        <div className="absolute -right-6 bottom-0 w-28 h-28 rounded-full opacity-10 pointer-events-none translate-y-1/2" style={{ background: '#4facfe' }} />
        <Image
          src="/medihug-icon.png" alt="" width={150} height={150} aria-hidden
          className="absolute -right-2 -bottom-4 opacity-[0.12] pointer-events-none select-none object-contain"
        />

        <div className="relative px-6 pt-8 pb-8">
          <div className="flex items-center gap-2 mb-2">
            <Image src="/medihug-icon.png" alt="" width={16} height={16} aria-hidden className="object-contain" />
            <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest">MediHug Shop</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{mm ? 'ကျန်းမာရေးဆိုင်ရာ ဝန်ဆောင်မှု၊ ဆေးနှင့် ပစ္စည်းများ' : 'Products'}</h1>
          <p className="text-white/70 text-sm mt-1.5 max-w-xs">{mm ? 'သုံးစွဲသူများအကြိုက်ဆုံး ဆေးဝါးနှင့် ကျန်းမာရေးပစ္စည်းများ' : 'Browse trusted health and wellness products'}</p>
          <div className="h-1 w-12 rounded-full mt-4" style={{ background: `linear-gradient(90deg, ${ACCENT} 0%, #fff 100%)`, opacity: 0.9 }} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-10 pt-6 lg:pt-8">
        {!catalogEmpty && categories.length > 0 && (
          <>
            {/* Mobile: compact trigger opening a bottom sheet — many categories don't fit a scroll row cleanly */}
            <button onClick={() => setFilterOpen(true)}
              className="sm:hidden mt-6 w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border bg-white text-sm font-semibold transition-colors"
              style={{ borderColor: `${selectedColor}40`, color: selectedColor }}>
              <span className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: selectedColor }} />
                <SlidersHorizontal className="w-4 h-4 shrink-0" style={{ color: selectedColor }} />
                <span className="truncate">{selectedLabel}</span>
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
            </button>

            {/* Mobile filter sheet */}
            {filterOpen && (
              <div className="sm:hidden">
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setFilterOpen(false)} />
                <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col max-h-[75vh] rounded-t-3xl bg-white shadow-2xl overflow-hidden">
                  <div className="flex justify-center pt-2.5 pb-1 shrink-0">
                    <div className="w-10 h-1 rounded-full bg-gray-200" />
                  </div>
                  <div className="flex items-center justify-between px-5 pt-2 pb-3 border-b border-gray-100 shrink-0">
                    <div>
                      <p className="text-sm font-bold text-gray-800">{mm ? 'အမျိုးအစား ရွေးရန်' : 'Select Category'}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{mm ? 'ကုန်ပစ္စည်း အမျိုးအစား ရွေးချယ်ပါ' : 'Pick a category to filter products'}</p>
                    </div>
                    <button onClick={() => setFilterOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5 p-3 overflow-y-auto">
                    <button onClick={() => { setFilterCat('all'); setFilterOpen(false); }}
                      className="relative flex items-center gap-3 pl-4 pr-3 py-3 rounded-xl text-sm font-semibold transition-colors"
                      style={{ backgroundColor: filterCat === 'all' ? `${PRIMARY}0f` : '#fff', color: filterCat === 'all' ? PRIMARY : '#374151' }}>
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full transition-opacity" style={{ backgroundColor: PRIMARY, opacity: filterCat === 'all' ? 1 : 0 }} />
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PRIMARY }} />
                      <span className="flex-1 text-left truncate">{mm ? 'အားလုံး' : 'All'}</span>
                      <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md shrink-0"
                        style={{ backgroundColor: filterCat === 'all' ? `${PRIMARY}1a` : '#f3f4f6', color: filterCat === 'all' ? PRIMARY : '#9ca3af' }}>
                        {products.length}
                      </span>
                      <Check className="w-4 h-4 shrink-0" style={{ opacity: filterCat === 'all' ? 1 : 0, color: PRIMARY }} />
                    </button>
                    {categories.map((c, i) => {
                      const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
                      const active = filterCat === c.name;
                      const count = products.filter(p => p.category === c.name).length;
                      return (
                        <button key={c.id} onClick={() => { setFilterCat(c.name); setFilterOpen(false); }}
                          className="relative flex items-center gap-3 pl-4 pr-3 py-3 rounded-xl text-sm font-semibold transition-colors"
                          style={{ backgroundColor: active ? `${color}12` : '#fff', color: active ? color : '#374151' }}>
                          <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full transition-opacity" style={{ backgroundColor: color, opacity: active ? 1 : 0 }} />
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                          <span className="flex-1 text-left truncate">{mm ? c.name : (c.nameEn ?? c.name)}</span>
                          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md shrink-0"
                            style={{ backgroundColor: active ? `${color}1a` : '#f3f4f6', color: active ? color : '#9ca3af' }}>
                            {count}
                          </span>
                          <Check className="w-4 h-4 shrink-0" style={{ opacity: active ? 1 : 0, color }} />
                        </button>
                      );
                    })}
                  </div>
                  <div className="shrink-0" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
                </div>
              </div>
            )}
          </>
        )}

        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-8 lg:items-start mt-6 lg:mt-8">
          {/* Laptop: colorful vertical category menu instead of a chip row */}
          {!catalogEmpty && categories.length > 0 && (
            <aside className="hidden lg:block lg:sticky lg:top-8">
              <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 px-3 pt-2 pb-3">
                  {mm ? 'အမျိုးအစားများ' : 'Categories'}
                </p>
                <div className="flex flex-col gap-1">
                  <button onClick={() => setFilterCat('all')}
                    className="relative flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{ backgroundColor: filterCat === 'all' ? `${PRIMARY}0f` : 'transparent', color: filterCat === 'all' ? PRIMARY : '#4b5563' }}>
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full transition-opacity" style={{ backgroundColor: PRIMARY, opacity: filterCat === 'all' ? 1 : 0 }} />
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PRIMARY }} />
                    <span className="flex-1 text-left truncate">{mm ? 'အားလုံး' : 'All'}</span>
                    <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md shrink-0"
                      style={{ backgroundColor: filterCat === 'all' ? `${PRIMARY}1a` : '#f3f4f6', color: filterCat === 'all' ? PRIMARY : '#9ca3af' }}>
                      {products.length}
                    </span>
                  </button>
                  {categories.map((c, i) => {
                    const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
                    const active = filterCat === c.name;
                    const count = products.filter(p => p.category === c.name).length;
                    return (
                      <button key={c.id} onClick={() => setFilterCat(c.name)}
                        className="relative flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                        style={{ backgroundColor: active ? `${color}12` : 'transparent', color: active ? color : '#4b5563' }}>
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full transition-opacity" style={{ backgroundColor: color, opacity: active ? 1 : 0 }} />
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span className="flex-1 text-left truncate">{mm ? c.name : (c.nameEn ?? c.name)}</span>
                        <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md shrink-0"
                          style={{ backgroundColor: active ? `${color}1a` : '#f3f4f6', color: active ? color : '#9ca3af' }}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>
          )}

          <div>
            {!catalogEmpty && (
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={mm ? 'ကုန်ပစ္စည်း ရှာဖွေပါ...' : 'Search products...'}
                  className="w-full pl-9 pr-4 py-2.5 lg:py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[#0d2b6e] transition-colors shadow-sm"
                />
              </div>
            )}

            {/* Tablet: chip row (below lg, where the sidebar takes over) */}
            {!catalogEmpty && categories.length > 0 && (
              <div className="hidden sm:flex lg:hidden flex-wrap gap-2 mt-4">
                <button onClick={() => setFilterCat('all')}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all hover:border-gray-300"
                  style={{ backgroundColor: filterCat === 'all' ? PRIMARY : '#fff', borderColor: filterCat === 'all' ? PRIMARY : '#e5e7eb', color: filterCat === 'all' ? '#fff' : '#6b7280' }}>
                  {mm ? 'အားလုံး' : 'All'}
                </button>
                {categories.map(c => (
                  <button key={c.id} onClick={() => setFilterCat(c.name)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all hover:border-gray-300"
                    style={{ backgroundColor: filterCat === c.name ? PRIMARY : '#fff', borderColor: filterCat === c.name ? PRIMARY : '#e5e7eb', color: filterCat === c.name ? '#fff' : '#6b7280' }}>
                    {mm ? c.name : (c.nameEn ?? c.name)}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mt-6 lg:mt-2">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)
              ) : catalogEmpty ? (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center gap-4">
                  <Package className="w-10 h-10 text-gray-200" />
                  <p className="text-sm text-gray-400">{mm ? 'ကုန်ပစ္စည်းများ မကြာမီ ရောက်ရှိလာပါမည်' : 'Products are coming soon'}</p>
                  <ContactSupportInline mm={mm} />
                </div>
              ) : filtered.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                  <Package className="w-10 h-10 text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">{mm ? 'ကုန်ပစ္စည်း မတွေ့ပါ' : 'No products found'}</p>
                </div>
              ) : (
                filtered.map(p => {
                  const name = mm ? p.name : (p.nameEn ?? p.name);
                  return (
                    <Link key={p.id} href={`/products/${p.id}`}
                      className="group rounded-2xl lg:rounded-3xl border border-gray-100 bg-white overflow-hidden flex flex-col transition-all duration-300 lg:hover:-translate-y-1 lg:hover:shadow-xl lg:hover:border-transparent">
                      <div className="relative aspect-square bg-gray-50">
                        {p.imageUrl ? (
                          <Image src={p.imageUrl} alt={name} fill sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 28vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-200" />
                          </div>
                        )}
                      </div>
                      <div className="p-3 lg:p-4 flex flex-col gap-1.5 lg:gap-2">
                        {p.category && <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-gray-400 truncate">{p.category}</p>}
                        <h3 className="text-xs sm:text-sm lg:text-[15px] font-semibold text-gray-900 leading-snug line-clamp-2 min-h-[2.4em]">{name}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-[10px] lg:text-xs text-gray-500">{p.rating.toFixed(1)} ({p.reviewCount})</span>
                        </div>
                        <p className="text-sm sm:text-base lg:text-lg font-extrabold mt-1" style={{ color: PRIMARY }}>
                          {formatPriceEntries(getProductPriceEntries(p))}
                        </p>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PublicProductsPage() {
  return (
    <Suspense fallback={null}>
      <PublicProductsPageInner />
    </Suspense>
  );
}
