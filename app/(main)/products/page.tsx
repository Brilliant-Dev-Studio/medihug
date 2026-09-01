'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Star, Package } from 'lucide-react';
import { useLang } from '@/app/lib/LanguageContext';
import ContactSupportInline from '@/components/ContactSupportInline';

const PRIMARY = '#0d2b6e';

interface Category { id: string; name: string; nameEn: string | null; }
interface Product {
  id: string; name: string; nameEn: string | null;
  imageUrl: string | null; category: string | null;
  price: number; rating: number; reviewCount: number;
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

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10 sm:py-14">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{mm ? 'ကုန်ပစ္စည်းများ' : 'Products'}</h1>
        <p className="text-sm text-gray-500 mt-1.5">{mm ? 'သိုက်စွဲသူများ အကြိုက်ဆုံး ဆေးဝါးနှင့် ကျန်းမာရေးပစ္စည်းများ' : 'Browse trusted health and wellness products'}</p>

        {!catalogEmpty && (
          <>
            <div className="relative mt-6 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={mm ? 'ကုန်ပစ္စည်း ရှာဖွေပါ...' : 'Search products...'}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[#0d2b6e] transition-colors"
              />
            </div>

            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                <button onClick={() => setFilterCat('all')}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all"
                  style={{ backgroundColor: filterCat === 'all' ? PRIMARY : 'transparent', borderColor: filterCat === 'all' ? PRIMARY : '#e5e7eb', color: filterCat === 'all' ? '#fff' : '#6b7280' }}>
                  {mm ? 'အားလုံး' : 'All'}
                </button>
                {categories.map(c => (
                  <button key={c.id} onClick={() => setFilterCat(c.name)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all"
                    style={{ backgroundColor: filterCat === c.name ? PRIMARY : 'transparent', borderColor: filterCat === c.name ? PRIMARY : '#e5e7eb', color: filterCat === c.name ? '#fff' : '#6b7280' }}>
                    {mm ? c.name : (c.nameEn ?? c.name)}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 mt-8">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
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
                <Link key={p.id} href={`/products/${p.id}`} className="group rounded-2xl border border-gray-100 bg-white overflow-hidden flex flex-col">
                  <div className="relative aspect-square bg-gray-50">
                    {p.imageUrl ? (
                      <Image src={p.imageUrl} alt={name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-200" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex flex-col gap-1.5">
                    {p.category && <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 truncate">{p.category}</p>}
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug line-clamp-2 min-h-[2.4em]">{name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-[10px] text-gray-500">{p.rating.toFixed(1)} ({p.reviewCount})</span>
                    </div>
                    <p className="text-sm sm:text-base font-extrabold mt-1" style={{ color: PRIMARY }}>
                      {p.price.toLocaleString()} <span className="text-[10px] font-semibold text-gray-400">MMK</span>
                    </p>
                  </div>
                </Link>
              );
            })
          )}
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
