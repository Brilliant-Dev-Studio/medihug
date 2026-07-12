'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

const PRIMARY = 'var(--color-primary)';
const ACCENT  = 'var(--color-accent)';

const DUMMY_IMAGES = [
  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1530026405186-ed1f139313f3?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1620147461831-a97b99ade1d3?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
];

interface BlogCategory {
  id: string;
  name: string;
  nameEn: string | null;
  imageUrl: string | null;
}

function SkeletonCircle() {
  return (
    <div className="shrink-0 flex flex-col items-center gap-2">
      <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
      <div className="h-2.5 w-14 bg-gray-200 rounded animate-pulse" />
    </div>
  );
}

export default function BlogCategoryCircles() {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const [cats,    setCats]    = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/blog-categories')
      .then(r => r.json())
      .then(d => { setCats(d.categories ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <h2 className="font-bold text-base lg:text-xl" style={{ color: PRIMARY }}>
          {mm ? 'ဆောင်းပါး အမျိုးအစားများ' : 'Blog Categories'}
        </h2>
        <Link href="/patient/blog" className="text-xs font-semibold flex items-center gap-0.5 lg:text-sm" style={{ color: ACCENT }}>
          {mm ? 'အားလုံး' : 'See all'} <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCircle key={i} />)
          : cats.length === 0
          ? (
            <div className="w-full flex flex-col items-center justify-center py-8 text-gray-300">
              <Image src="/9169253-removebg-preview.png" alt="No data" width={64} height={64} className="opacity-70 mb-2" />
              <p className="text-xs text-gray-400">{mm ? 'ဒေတာ မရှိသေးပါ' : 'No data yet'}</p>
            </div>
          )
          : cats.map((cat, i) => {
              const label = mm ? cat.name : (cat.nameEn ?? cat.name);
              const img   = cat.imageUrl ?? DUMMY_IMAGES[i % DUMMY_IMAGES.length];
              return (
                <Link key={cat.id}
                  href={`/patient/blog?category=${encodeURIComponent(cat.name)}`}
                  className="shrink-0 flex flex-col items-center gap-2 active:scale-95 transition-transform">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md">
                    <Image src={img} alt={label} fill sizes="64px" className="object-cover" />
                    <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 60%)' }} />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-600 text-center leading-tight max-w-18 line-clamp-2">
                    {label}
                  </span>
                </Link>
              );
            })
        }
      </div>
    </div>
  );
}
