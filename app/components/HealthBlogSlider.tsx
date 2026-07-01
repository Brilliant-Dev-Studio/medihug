'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Calendar } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

const PRIMARY = 'var(--color-primary)';
const ACCENT  = 'var(--color-accent)';

interface Blog {
  id: string; title: string; titleEn: string | null;
  slug: string; excerpt: string | null;
  imageUrl: string | null; category: string | null;
  publishedAt: string | null;
}

function SkeletonMobile() {
  return (
    <div className="shrink-0 w-48 rounded-2xl border border-gray-100 bg-white overflow-hidden flex flex-col">
      <div className="h-28 bg-gray-200 animate-pulse" />
      <div className="p-3 flex flex-col gap-2">
        <div className="h-2.5 bg-gray-200 rounded animate-pulse w-4/5" />
        <div className="h-2 bg-gray-100 rounded animate-pulse w-3/5" />
        <div className="h-2 bg-gray-100 rounded animate-pulse w-2/5" />
      </div>
    </div>
  );
}

function SkeletonDesktop() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden flex flex-col">
      <div className="bg-gray-200 animate-pulse" style={{ height: 160 }} />
      <div className="p-4 flex flex-col gap-2.5">
        <div className="h-3.5 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-2.5 bg-gray-100 rounded animate-pulse w-full" />
        <div className="h-2 bg-gray-100 rounded animate-pulse w-2/5" />
      </div>
    </div>
  );
}

function formatDate(dateStr: string | null, mm: boolean): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return mm
    ? d.toLocaleDateString('my-MM', { year: 'numeric', month: 'short', day: 'numeric' })
    : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function HealthBlogSlider() {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const [blogs,   setBlogs]   = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/blogs?isPublished=true&pageSize=8')
      .then(r => r.json())
      .then(d => { setBlogs(d.blogs ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (!loading && blogs.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <h2 className="font-bold text-base lg:text-xl" style={{ color: PRIMARY }}>
          {mm ? 'ဆောင်းပါးများ' : 'Health Articles'}
        </h2>
        <Link href="/patient/blog" className="text-xs font-semibold flex items-center gap-0.5 lg:text-sm" style={{ color: ACCENT }}>
          {mm ? 'အားလုံး' : 'See all'} <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="lg:hidden flex flex-nowrap gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonMobile key={i} />)
          : blogs.map(b => {
              const title = mm ? b.title : (b.titleEn ?? b.title);
              return (
                <Link key={b.id} href={`/patient/blog/article/${b.slug}`}
                  className="shrink-0 w-48 rounded-2xl border border-gray-100 bg-white overflow-hidden flex flex-col active:scale-95 transition-all">
                  <div className="relative w-full h-28 overflow-hidden bg-gray-100">
                    {b.imageUrl
                      ? <Image src={b.imageUrl} alt={title} fill className="object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-3xl bg-linear-to-br from-teal-50 to-teal-100">📰</div>
                    }
                    {b.category && (
                      <span className="absolute top-2 left-2 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: PRIMARY }}>
                        {b.category}
                      </span>
                    )}
                  </div>
                  <div className="p-3 flex flex-col gap-1.5 flex-1">
                    <p className="text-xs font-bold text-gray-800 leading-snug line-clamp-2">{title}</p>
                    {b.publishedAt && (
                      <div className="flex items-center gap-1 mt-auto">
                        <Calendar className="w-3 h-3 text-gray-300" />
                        <span className="text-[10px] text-gray-400">{formatDate(b.publishedAt, mm)}</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })
        }
      </div>

      {/* Desktop: 3-col grid */}
      <div className="hidden lg:grid grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonDesktop key={i} />)
          : blogs.slice(0, 3).map(b => {
              const title   = mm ? b.title   : (b.titleEn ?? b.title);
              const excerpt = b.excerpt ?? '';
              return (
                <Link key={b.id} href={`/patient/blog/article/${b.slug}`}
                  className="rounded-2xl border border-gray-100 bg-white overflow-hidden flex flex-col active:scale-[0.98] transition-all group hover:shadow-md">
                  <div className="relative w-full overflow-hidden bg-gray-100" style={{ height: 160 }}>
                    {b.imageUrl
                      ? <Image src={b.imageUrl} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full flex items-center justify-center text-5xl bg-linear-to-br from-teal-50 to-teal-100">📰</div>
                    }
                    {b.category && (
                      <span className="absolute top-3 left-3 text-[11px] font-bold text-white px-2 py-1 rounded-full"
                        style={{ backgroundColor: PRIMARY }}>
                        {b.category}
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <p className="text-sm font-bold text-gray-800 leading-snug line-clamp-2">{title}</p>
                    {excerpt && (
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{excerpt}</p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                      {b.publishedAt
                        ? <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-300" />
                            <span className="text-[11px] text-gray-400">{formatDate(b.publishedAt, mm)}</span>
                          </div>
                        : <span />
                      }
                      <span className="text-xs font-semibold" style={{ color: PRIMARY }}>
                        {mm ? 'ဆက်ဖတ်မည်' : 'Read more'} →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })
        }
      </div>
    </div>
  );
}
