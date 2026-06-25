'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

const products = [
  { id: 1, name: 'Paracetamol 500mg',        category: 'Fever & Pain Relief',   price: '1,500',  rating: 4.8, reviews: 320, color: '#ef4444',
    imgs: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop','https://images.unsplash.com/photo-1550572017-edd951b55104?w=300&h=300&fit=crop','https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=300&h=300&fit=crop'] },
  { id: 2, name: 'Vitamin C 1000mg',          category: 'Fitness & Supplements', price: '3,200',  rating: 4.9, reviews: 512, color: '#22c55e',
    imgs: ['https://images.unsplash.com/photo-1550572017-edd951b55104?w=300&h=300&fit=crop','https://images.unsplash.com/photo-1559757175-5700dde675bc?w=300&h=300&fit=crop','https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop'] },
  { id: 3, name: 'Cetaphil Face Wash',        category: 'Skin Care',             price: '12,500', rating: 4.7, reviews: 198, color: '#f59e0b',
    imgs: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&h=300&fit=crop','https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=300&h=300&fit=crop','https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=300&h=300&fit=crop'] },
  { id: 4, name: 'Dettol Antiseptic',         category: 'First Aid',             price: '2,800',  rating: 4.6, reviews: 275, color: '#e11d48',
    imgs: ['https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=300&h=300&fit=crop','https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop','https://images.unsplash.com/photo-1550572017-edd951b55104?w=300&h=300&fit=crop'] },
  { id: 5, name: 'Omega-3 Fish Oil',          category: 'Fitness & Supplements', price: '8,900',  rating: 4.8, reviews: 430, color: '#3b82f6',
    imgs: ['https://images.unsplash.com/photo-1559757175-5700dde675bc?w=300&h=300&fit=crop','https://images.unsplash.com/photo-1550572017-edd951b55104?w=300&h=300&fit=crop','https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=300&h=300&fit=crop'] },
  { id: 6, name: 'Baby Dove Body Lotion',     category: 'Mother & Baby Care',    price: '5,500',  rating: 4.9, reviews: 610, color: '#a855f7',
    imgs: ['https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&h=300&fit=crop','https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&h=300&fit=crop','https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=300&h=300&fit=crop'] },
  { id: 7, name: 'Strepsils Throat Lozenges', category: 'Cough, Cold & Flu',     price: '1,800',  rating: 4.5, reviews: 160, color: '#06b6d4',
    imgs: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop&sat=-100','https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=300&h=300&fit=crop','https://images.unsplash.com/photo-1559757175-5700dde675bc?w=300&h=300&fit=crop'] },
  { id: 8, name: 'Glucometer Device',         category: 'Medical Devices',       price: '45,000', rating: 4.7, reviews: 88,  color: '#8b5cf6',
    imgs: ['https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=300&h=300&fit=crop','https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300&h=300&fit=crop','https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=300&h=300&fit=crop'] },
];

type Product = typeof products[0];

function ProductCard({ product }: { product: Product }) {
  const [slide, setSlide] = useState(0);
  const total = product.imgs.length;
  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setSlide(s => (s - 1 + total) % total); };
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setSlide(s => (s + 1) % total); };

  return (
    <div className="shrink-0 w-72 rounded-2xl border border-gray-100 bg-white overflow-hidden flex flex-col">
      {/* Slider */}
      <div className="relative overflow-hidden bg-gray-50" style={{ height: 176 }}>
        {product.imgs.map((src, i) => (
          <div key={i} className="absolute inset-0 transition-opacity duration-300" style={{ opacity: i === slide ? 1 : 0, zIndex: i === slide ? 1 : 0 }}>
            <Image src={src} alt={product.name} fill className="object-cover" />
          </div>
        ))}
        <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/30 flex items-center justify-center">
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
        <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/30 flex items-center justify-center">
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1">
          {product.imgs.map((_, i) => (
            <button key={i} onClick={e => { e.stopPropagation(); setSlide(i); }}
              className="rounded-full transition-all"
              style={{ width: i === slide ? 14 : 5, height: 5, backgroundColor: i === slide ? '#fff' : 'rgba(255,255,255,0.5)' }} />
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className="text-xs font-medium" style={{ color: product.color }}>{product.category}</span>
        <h3 className="text-sm font-semibold text-gray-800 leading-snug">{product.name}</h3>
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-semibold text-gray-700">{product.rating}</span>
          <span className="text-xs text-gray-400">({product.reviews})</span>
        </div>
        <div className="mt-auto pt-2">
          <span className="text-sm font-bold" style={{ color: '#0d2b6e' }}>{product.price} Ks</span>
        </div>
      </div>
    </div>
  );
}

export default function TopSellingProducts() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { tr } = useLang();

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  };

  return (
    <section className="w-full px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold" style={{ color: '#0d2b6e' }}>{tr.topProductsTitle}</h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">{tr.topProductsSubtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="#" className="text-xs font-semibold px-4 py-2 rounded-full border-2 transition-colors hidden sm:block" style={{ color: '#0d2b6e', borderColor: '#0d2b6e' }}>
              {tr.viewAll}
            </a>
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

        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
}
