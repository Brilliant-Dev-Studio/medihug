'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

const articles = [
  {
    id: 1,
    title_mm: 'ဆီးချိုရောဂါ ကာကွယ်ရန် နေ့စဉ် လုပ်ဆောင်ရမည့် အချက် ၅ ချက်',
    title_en: '5 Daily Habits to Prevent Diabetes',
    excerpt_mm: 'ကျန်းမာသော အစားအသောက် ပုံစံနှင့် ကိုယ်လက်လေ့ကျင့်ခြင်းဖြင့် ဆီးချိုရောဂါကို ကာကွယ်နိုင်သည်။',
    excerpt_en: 'Healthy eating habits and regular exercise can significantly reduce your risk of developing diabetes.',
    category_mm: 'ကျန်းမာရေး အကြံဉာဏ်',
    category_en: 'Health Tips',
    author: 'Dr. Aung Kyaw Zin',
    date_mm: 'ဇွန် ၁၅၊ ၂၀၂၅',
    date_en: 'Jun 15, 2025',
    readTime: '5',
    color: '#0d2b6e',
    img: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400&h=250&fit=crop&q=80',
  },
  {
    id: 2,
    title_mm: 'မိသားစု ဆရာဝန်ကို မည်သည့်အချိန်တွင် ဆက်သွယ်သင့်သနည်း',
    title_en: 'When Should You See a General Practitioner?',
    excerpt_mm: 'ရောဂါလက္ခဏာများကို နေမနာချင်ဆိုးမဆိုး သိရမည့် အချိန်အချက်များကို ရှင်းလင်းသိရှိပါ။',
    excerpt_en: 'Learn the warning signs that mean it\'s time to stop waiting and book a doctor\'s appointment.',
    category_mm: 'ဆရာဝန် အကြံဉာဏ်',
    category_en: 'Doctor Advice',
    author: 'Dr. Zaw Myo Htun',
    date_mm: 'ဇွန် ၁၀၊ ၂၀၂၅',
    date_en: 'Jun 10, 2025',
    readTime: '4',
    color: '#22c55e',
    img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=250&fit=crop&q=80',
  },
  {
    id: 3,
    title_mm: 'အရေပြား ကျန်းမာရေးအတွက် နေ့စဉ် လုပ်ဆောင်ရမည့် အချက်များ',
    title_en: 'Daily Skincare Routine for Healthy Skin',
    excerpt_mm: 'မြန်မာနိုင်ငံ၏ ရာသီဥတုနှင့် လိုက်ဖက်သော အရေပြား ထိန်းသိမ်းမှု နည်းလမ်းများကို လေ့လာပါ။',
    excerpt_en: 'Discover the best skincare practices suited to Myanmar\'s tropical climate and skin types.',
    category_mm: 'အလှအပ နှင့် ကြည့်ရှုမှု',
    category_en: 'Beauty & Wellness',
    author: 'Dr. Thida Oo',
    date_mm: 'မေ ၂၈၊ ၂၀၂၅',
    date_en: 'May 28, 2025',
    readTime: '6',
    color: '#f59e0b',
    img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=250&fit=crop&q=80',
  },
  {
    id: 4,
    title_mm: 'ကလေးများ၏ ကိုယ်ခံအားကို မြင့်တင်ရန် အစားအသောက်များ',
    title_en: 'Foods That Boost Your Child\'s Immunity',
    excerpt_mm: 'ဗိုင်းရပ်စ်များနှင့် ဘက်တီးရီးယားများကို ခုခံနိုင်ရန် ကလေးများ စားသင့်သော အာဟာရများ။',
    excerpt_en: 'The right nutrients can strengthen your child\'s immune system and keep them healthy year-round.',
    category_mm: 'ကလေးကျန်းမာရေး',
    category_en: 'Child Health',
    author: 'Dr. Khin Yadanar',
    date_mm: 'မေ ၂၀၊ ၂၀၂၅',
    date_en: 'May 20, 2025',
    readTime: '5',
    color: '#a855f7',
    img: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&h=250&fit=crop&q=80',
  },
  {
    id: 5,
    title_mm: 'နှလုံးကျန်းမာရေးအတွက် သိထားသင့်သော အချက်များ',
    title_en: 'Essential Heart Health Facts Everyone Should Know',
    excerpt_mm: 'နှလုံးရောဂါ ကာကွယ်ရန် ကျွမ်းကျင်သူ ဆရာဝန်တစ်ဦးက အကြံပေးသော နည်းလမ်းများ။',
    excerpt_en: 'A cardiologist shares the most important steps you can take to protect your heart health.',
    category_mm: 'နှလုံးကျန်းမာရေး',
    category_en: 'Heart Health',
    author: 'Dr. Nay Lin Tun',
    date_mm: 'မေ ၁၂၊ ၂၀၂၅',
    date_en: 'May 12, 2025',
    readTime: '7',
    color: '#ef4444',
    img: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=400&h=250&fit=crop&q=80',
  },
];

export default function BlogArticles() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { lang, tr } = useLang();

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  };

  return (
    <section className="w-full px-6 py-10">
      <div className="max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold" style={{ color: '#0d2b6e' }}>{tr.blogTitle}</h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">{tr.blogSubtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="#" className="text-xs font-semibold px-4 py-2 rounded-full border-2 transition-colors hidden sm:block" style={{ color: '#0d2b6e', borderColor: '#0d2b6e' }}>
              {tr.seeAll}
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

        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {articles.map(({ id, title_mm, title_en, excerpt_mm, excerpt_en, category_mm, category_en, author, date_mm, date_en, readTime, color, img }) => (
            <div key={id} className="shrink-0 w-72 bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-shadow">

              {/* Image */}
              <div className="relative w-full h-40 overflow-hidden">
                <Image src={img} alt={lang === 'mm' ? title_mm : title_en} fill className="object-cover" />
                <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: color }}>
                  {lang === 'mm' ? category_mm : category_en}
                </span>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col gap-2 flex-1">
                <h3 className="text-sm font-bold text-gray-800 leading-snug line-clamp-2">
                  {lang === 'mm' ? title_mm : title_en}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                  {lang === 'mm' ? excerpt_mm : excerpt_en}
                </p>

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <User className="w-3 h-3" />
                    <span className="truncate max-w-[100px]">{author}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{readTime} {tr.minRead}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
