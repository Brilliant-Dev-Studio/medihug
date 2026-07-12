'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

interface Blog {
  id: string;
  title: string; titleEn: string | null;
  slug: string;
  excerpt: string | null;
  imageUrl: string | null;
  category: string | null;
  publishedAt: string | null;
  createdAt: string;
}

const CATEGORY_COLOR = '#0d2b6e';

function SkeletonCard() {
  return (
    <div className="shrink-0 w-72 bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
      <div className="h-40 bg-gray-100 animate-pulse" />
      <div className="p-4 flex flex-col gap-2">
        <div className="h-4 bg-gray-100 rounded-lg animate-pulse w-4/5" />
        <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-full" />
        <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-1/3" />
      </div>
    </div>
  );
}

export default function BlogArticles() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { lang, tr } = useLang();
  const mm = lang === 'mm';
  const [blogs, setBlogs]     = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blogs?limit=10')
      .then(r => r.json())
      .then(d => { setBlogs(d.blogs ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  };

  return (
    <section className="relative w-full px-6 py-10 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-3xl font-bold text-gray-900">{tr.blogTitle}</h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">{tr.blogSubtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/patient/blog" className="text-xs font-semibold px-4 py-2 rounded-full border-2 transition-colors hidden sm:block" style={{ color: '#0d2b6e', borderColor: '#0d2b6e' }}>
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

        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : blogs.length === 0
            ? (
              <div className="w-full flex flex-col items-center justify-center py-14 text-gray-300">
                <Image src="/9169253-removebg-preview.png" alt="No data" width={80} height={80} className="opacity-70 mb-2" />
                <p className="text-sm text-gray-400">{mm ? 'ဒေတာ မရှိသေးပါ' : 'No data yet'}</p>
              </div>
            )
            : blogs.map(b => {
                const title = mm ? b.title : (b.titleEn ?? b.title);
                const date  = new Date(b.publishedAt ?? b.createdAt).toLocaleDateString(mm ? 'en-GB' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                return (
                  <Link key={b.id} href={`/patient/blog/article/${b.slug}`}
                    className="shrink-0 w-72 bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">

                    {/* Image */}
                    <div className="relative w-full h-40 overflow-hidden bg-gray-50">
                      {b.imageUrl && <Image src={b.imageUrl} alt={title} fill className="object-cover" />}
                      {b.category && (
                        <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: CATEGORY_COLOR }}>
                          {b.category}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <h3 className="text-sm font-bold text-gray-800 leading-snug line-clamp-2">{title}</h3>
                      {b.excerpt && (
                        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{b.excerpt}</p>
                      )}

                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-auto pt-2 border-t border-gray-50">
                        <Calendar className="w-3 h-3" />
                        <span>{date}</span>
                      </div>
                    </div>
                  </Link>
                );
              })
          }
        </div>

      </div>
    </section>
  );
}
