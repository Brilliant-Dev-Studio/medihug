'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, Star } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

const PRIMARY   = '#0d2b6e';
const SECONDARY = '#1a6bcc';
const ACCENT    = '#4facfe';

const products = [
  { id: 1, name: 'Paracetamol 500mg',        category_mm: 'ဖျားနာ & နာကျင်မှုသက်သာရေး', category_en: 'Fever & Pain Relief',   price: '1,500',  rating: 4.8, reviews: 320,
    imgs: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop','https://images.unsplash.com/photo-1550572017-edd951b55104?w=300&h=300&fit=crop','https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=300&h=300&fit=crop'] },
  { id: 2, name: 'Vitamin C 1000mg',          category_mm: 'ကျန်းမာရေး ဖြည့်စွက်',        category_en: 'Fitness & Supplements', price: '3,200',  rating: 4.9, reviews: 512,
    imgs: ['https://images.unsplash.com/photo-1550572017-edd951b55104?w=300&h=300&fit=crop','https://images.unsplash.com/photo-1559757175-5700dde675bc?w=300&h=300&fit=crop','https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop'] },
  { id: 3, name: 'Cetaphil Face Wash',        category_mm: 'အရေပြားပြုစုခြင်း',           category_en: 'Skin Care',             price: '12,500', rating: 4.7, reviews: 198,
    imgs: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&h=300&fit=crop','https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=300&h=300&fit=crop','https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=300&h=300&fit=crop'] },
  { id: 4, name: 'Dettol Antiseptic',         category_mm: 'ပထမဆုံး အကူအညီ',              category_en: 'First Aid',             price: '2,800',  rating: 4.6, reviews: 275,
    imgs: ['https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=300&h=300&fit=crop','https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop','https://images.unsplash.com/photo-1550572017-edd951b55104?w=300&h=300&fit=crop'] },
  { id: 5, name: 'Omega-3 Fish Oil',          category_mm: 'ကျန်းမာရေး ဖြည့်စွက်',        category_en: 'Fitness & Supplements', price: '8,900',  rating: 4.8, reviews: 430,
    imgs: ['https://images.unsplash.com/photo-1559757175-5700dde675bc?w=300&h=300&fit=crop','https://images.unsplash.com/photo-1550572017-edd951b55104?w=300&h=300&fit=crop','https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=300&h=300&fit=crop'] },
  { id: 6, name: 'Baby Dove Body Lotion',     category_mm: 'မိခင်နှင့်ကလေးပြုစု',          category_en: 'Mother & Baby Care',    price: '5,500',  rating: 4.9, reviews: 610,
    imgs: ['https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&h=300&fit=crop','https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&h=300&fit=crop','https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=300&h=300&fit=crop'] },
  { id: 7, name: 'Strepsils Throat Lozenges', category_mm: 'ချောင်းဆိုး & အအေးမိ',        category_en: 'Cough, Cold & Flu',     price: '1,800',  rating: 4.5, reviews: 160,
    imgs: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop&sat=-100','https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=300&h=300&fit=crop','https://images.unsplash.com/photo-1559757175-5700dde675bc?w=300&h=300&fit=crop'] },
  { id: 8, name: 'Glucometer Device',         category_mm: 'ဆေးပစ္စည်းများ',               category_en: 'Medical Devices',       price: '45,000', rating: 4.7, reviews: 88,
    imgs: ['https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=300&h=300&fit=crop','https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300&h=300&fit=crop','https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=300&h=300&fit=crop'] },
];

type Product = typeof products[0];

function ProductCard({ p, mm }: { p: Product; mm: boolean }) {
  const [slide, setSlide] = useState(0);
  const total = p.imgs.length;
  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setSlide(s => (s - 1 + total) % total); };
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setSlide(s => (s + 1) % total); };

  return (
    <Link href={`/patient/records/${p.id}`} className="shrink-0 w-44 lg:w-auto rounded-2xl border border-gray-100 bg-white overflow-hidden flex flex-col active:scale-95 transition-all hover:border-gray-200 hover:shadow-sm">
      {/* Slider */}
      <div className="relative overflow-hidden bg-gray-50" style={{ height: 140 }}>
        {p.imgs.map((src, i) => (
          <div key={i} className="absolute inset-0 transition-opacity duration-300" style={{ opacity: i === slide ? 1 : 0, zIndex: i === slide ? 1 : 0 }}>
            <Image src={src} alt={p.name} fill className="object-cover" />
          </div>
        ))}
        <button onClick={prev} className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-black/30 flex items-center justify-center">
          <ChevronLeft className="w-3.5 h-3.5 text-white" />
        </button>
        <button onClick={next} className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-black/30 flex items-center justify-center">
          <ChevronRight className="w-3.5 h-3.5 text-white" />
        </button>
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1">
          {p.imgs.map((_, i) => (
            <button key={i} onClick={e => { e.stopPropagation(); setSlide(i); }}
              className="rounded-full transition-all"
              style={{ width: i === slide ? 12 : 4, height: 4, backgroundColor: i === slide ? '#fff' : 'rgba(255,255,255,0.5)' }} />
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <h3 className="text-xs font-semibold text-gray-800 leading-snug lg:text-sm">{p.name}</h3>
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-semibold text-gray-700">{p.rating}</span>
          <span className="text-[10px] text-gray-400">({p.reviews})</span>
        </div>
        <div className="mt-auto pt-1">
          <span className="text-sm font-bold" style={{ color: PRIMARY }}>{p.price} Ks</span>
        </div>
      </div>
    </Link>
  );
}

export default function BestSellingProducts() {
  const { lang } = useLang();
  const mm = lang === 'mm';

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
        <Link href="/patient/records" className="text-xs font-semibold flex items-center gap-0.5 lg:text-sm" style={{ color: ACCENT }}>
          {mm ? 'အားလုံး' : 'See all'} <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-x-visible lg:pb-0" style={{ scrollbarWidth: 'none' }}>
        {products.map(p => <ProductCard key={p.id} p={p} mm={mm} />)}
      </div>
    </div>
  );
}
