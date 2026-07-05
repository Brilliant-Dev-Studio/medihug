'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Calendar, Newspaper } from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';

const PRIMARY = '#0d2b6e';

interface BlogCategory {
  id: string;
  name: string;
  nameEn: string | null;
}

interface Blog {
  id: string;
  title: string;
  titleEn: string | null;
  slug: string;
  excerpt: string | null;
  imageUrl: string | null;
  category: string | null;
  publishedAt: string | null;
  createdAt: string;
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
      <div className="h-40 bg-gray-100 animate-pulse" />
      <div className="p-4 flex flex-col gap-2">
        <div className="h-4 bg-gray-100 rounded-lg animate-pulse w-4/5" />
        <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-full" />
        <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-1/3" />
      </div>
    </div>
  );
}

function BlogPageInner() {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [blogs, setBlogs]           = useState<Blog[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [activeCategory, setActiveCategory] = useState(() => searchParams.get('category') ?? '');

  useEffect(() => {
    fetch('/api/blog-categories')
      .then(r => r.json())
      .then(d => setCategories(d.categories ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams({ limit: '60' });
    if (search) qs.set('search', search);
    if (activeCategory) qs.set('category', activeCategory);
    fetch(`/api/blogs?${qs.toString()}`)
      .then(r => r.json())
      .then(d => { setBlogs(d.blogs ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [search, activeCategory]);

  const categoryOptions = useMemo(() => [
    { name: '', label: mm ? 'အားလုံး' : 'All' },
    ...categories.map(c => ({ name: c.name, label: mm ? c.name : (c.nameEn ?? c.name) })),
  ], [categories, mm]);

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10 sm:py-14">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{mm ? 'ကျန်းမာရေး ဆောင်းပါးများ' : 'Health Articles'}</h1>
        <p className="text-sm text-gray-500 mt-1.5">{mm ? 'အသိပညာပေး ဆောင်းပါးများနှင့် ကျန်းမာရေးအကြံပြုချက်များ' : 'Insights and health tips from our team'}</p>

        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          {/* Sidebar */}
          <aside className="lg:w-56 shrink-0">
            <div className="relative mb-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={mm ? 'ရှာဖွေရန်...' : 'Search...'}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[#0d2b6e] transition-colors"
              />
            </div>

            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{mm ? 'အမျိုးအစားများ' : 'Categories'}</p>
            <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
              {categoryOptions.map(opt => (
                <button
                  key={opt.name}
                  onClick={() => setActiveCategory(opt.name)}
                  className="shrink-0 text-left text-sm font-medium px-3 py-2 rounded-xl transition-colors whitespace-nowrap"
                  style={{
                    backgroundColor: activeCategory === opt.name ? `${PRIMARY}12` : 'transparent',
                    color: activeCategory === opt.name ? PRIMARY : '#6b7280',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : blogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
                <Newspaper className="w-10 h-10 text-gray-200" />
                <p className="text-sm">{mm ? 'ဆောင်းပါး မတွေ့ပါ' : 'No articles found'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {blogs.map(b => {
                  const title = mm ? b.title : (b.titleEn ?? b.title);
                  const date  = new Date(b.publishedAt ?? b.createdAt).toLocaleDateString(mm ? 'en-GB' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                  return (
                    <Link key={b.id} href={`/blog/${b.slug}`}
                      className="rounded-2xl border border-gray-100 bg-white overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                      <div className="relative w-full h-40 bg-gray-50">
                        {b.imageUrl && <Image src={b.imageUrl} alt={title} fill className="object-cover" />}
                        {b.category && (
                          <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: PRIMARY }}>
                            {b.category}
                          </span>
                        )}
                      </div>
                      <div className="p-4 flex flex-col gap-2 flex-1">
                        <h3 className="text-sm font-bold text-gray-800 leading-snug line-clamp-2">{title}</h3>
                        {b.excerpt && <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{b.excerpt}</p>}
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-auto pt-2 border-t border-gray-50">
                          <Calendar className="w-3 h-3" />
                          <span>{date}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={null}>
      <BlogPageInner />
    </Suspense>
  );
}
