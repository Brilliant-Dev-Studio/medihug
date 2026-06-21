'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Star, Briefcase } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

const doctors = [
  { id: 1, name: 'Dr. Aung Kyaw Zin', experience: '12', rating: 4.9, reviews: 320, category: 'Cardiology',       color: '#0d2b6e', img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop' },
  { id: 2, name: 'Dr. Thida Oo',       experience: '8',  rating: 4.8, reviews: 215, category: 'Dermatology',     color: '#f59e0b', img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop' },
  { id: 3, name: 'Dr. Zaw Myo Htun',   experience: '15', rating: 4.9, reviews: 510, category: 'General Medicine', color: '#22c55e', img: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=300&fit=crop' },
  { id: 4, name: 'Dr. Khin Yadanar',   experience: '6',  rating: 4.7, reviews: 178, category: 'Pediatrics',      color: '#a855f7', img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=300&h=300&fit=crop' },
  { id: 5, name: 'Dr. Nay Lin Tun',    experience: '10', rating: 4.8, reviews: 290, category: 'Orthopedics',     color: '#ef4444', img: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=300&h=300&fit=crop' },
  { id: 6, name: 'Dr. Su Myat Noe',    experience: '9',  rating: 4.6, reviews: 145, category: 'Gynecology',      color: '#ec4899', img: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=300&h=300&fit=crop' },
];

export default function OurDoctors() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { tr } = useLang();

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  return (
    <section className="w-full px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold" style={{ color: '#0d2b6e' }}>{tr.doctorsTitle}</h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">{tr.doctorsSubtitle}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scroll('left')} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
            <button onClick={() => scroll('right')} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {doctors.map(({ id, name, experience, rating, reviews, category, color, img }) => (
            <div key={id} className="shrink-0 w-64 bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
              <div className="w-full h-48 relative overflow-hidden bg-gray-100">
                <Image src={img} alt={name} fill className="object-cover object-top" />
              </div>
              <div className="p-4 flex flex-col gap-2.5">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 leading-snug">{name}</h3>
                  <span className="text-xs font-medium mt-0.5 inline-block" style={{ color }}>{category}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                  {experience} {tr.experience}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-semibold text-gray-700">{rating}</span>
                  <span className="text-xs text-gray-400">({reviews} {tr.reviews})</span>
                </div>
                <button className="w-full mt-1 py-2.5 rounded-xl text-xs font-semibold text-white" style={{ backgroundColor: '#0d2b6e' }}>
                  {tr.bookConsultation}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
