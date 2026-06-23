'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

const products = [
  { id: 1, name: 'Paracetamol 500mg',        category: 'Fever & Pain Relief',   price: '1,500',  rating: 4.8, reviews: 320, color: '#ef4444', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop' },
  { id: 2, name: 'Vitamin C 1000mg',          category: 'Fitness & Supplements', price: '3,200',  rating: 4.9, reviews: 512, color: '#22c55e', img: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=300&h=300&fit=crop' },
  { id: 3, name: 'Cetaphil Face Wash',        category: 'Skin Care',             price: '12,500', rating: 4.7, reviews: 198, color: '#f59e0b', img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&h=300&fit=crop' },
  { id: 4, name: 'Dettol Antiseptic',         category: 'First Aid',             price: '2,800',  rating: 4.6, reviews: 275, color: '#e11d48', img: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=300&h=300&fit=crop' },
  { id: 5, name: 'Omega-3 Fish Oil',          category: 'Fitness & Supplements', price: '8,900',  rating: 4.8, reviews: 430, color: '#3b82f6', img: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=300&h=300&fit=crop' },
  { id: 6, name: 'Baby Dove Body Lotion',     category: 'Mother & Baby Care',    price: '5,500',  rating: 4.9, reviews: 610, color: '#a855f7', img: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&h=300&fit=crop' },
  { id: 7, name: 'Strepsils Throat Lozenges', category: 'Cough, Cold & Flu',     price: '1,800',  rating: 4.5, reviews: 160, color: '#06b6d4', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop&sat=-100' },
  { id: 8, name: 'Glucometer Device',         category: 'Medical Devices',       price: '45,000', rating: 4.7, reviews: 88,  color: '#8b5cf6', img: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=300&h=300&fit=crop' },
];

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
          {products.map(product => (
            <div key={product.id} className="shrink-0 w-72 rounded-2xl border border-gray-100 bg-white overflow-hidden flex flex-col">
              <div className="w-full h-44 relative overflow-hidden bg-gray-50">
                <Image src={product.img} alt={product.name} fill className="object-cover" />
              </div>
              <div className="p-4 flex flex-col gap-2 flex-1">
                <span className="text-xs font-medium" style={{ color: product.color }}>{product.category}</span>
                <h3 className="text-sm font-semibold text-gray-800 leading-snug">{product.name}</h3>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-semibold text-gray-700">{product.rating}</span>
                  <span className="text-xs text-gray-400">({product.reviews})</span>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2">
                  <span className="text-sm font-bold" style={{ color: '#0d2b6e' }}>{product.price} Ks</span>
                  <button className="text-white text-xs font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: '#0d2b6e' }}>
                    {tr.add}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
