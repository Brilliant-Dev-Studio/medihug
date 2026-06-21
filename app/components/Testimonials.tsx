'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

const testimonials = [
  { id: 1, name: 'Aye Myat Thu',  role_mm: 'လူနာ',           role_en: 'Patient',          avatar: 'A', color: '#0d2b6e', rating: 5, review_mm: 'MediHug ကနေ ဆရာဝန်နဲ့ ဆက်သွယ်ဖို့ အရမ်းလွယ်ကူပါတယ်။ မိနစ်ပိုင်းအတွင်း ဆေးညွှန်းရပြီး အိမ်ကနေမထွက်ဘဲ ကုသမှုခံယူနိုင်ခဲ့တယ်။', review_en: 'MediHug made it so easy to connect with a doctor. Got a prescription within minutes without leaving home.' },
  { id: 2, name: 'Ko Zaw Lin',    role_mm: 'ပုံမှန် သုံးစွဲသူ', role_en: 'Regular Customer', avatar: 'Z', color: '#1a6bcc', rating: 5, review_mm: 'ဆေးဝါးတွေကို Online ကနေ မှာလိုက်ရင် အမြန်ဆုံး ပို့ပေးတယ်။ ဈေးနှုန်းလည်း မျှတပြီး အရည်အသွေးကောင်းတဲ့ ပစ္စည်းတွေပဲ ရောင်းတာ သိသာပါတယ်။', review_en: 'Orders are delivered super fast. Prices are fair and the product quality is clearly good.' },
  { id: 3, name: 'Ma Thida Oo',   role_mm: 'မိခင်',           role_en: 'Mother',           avatar: 'T', color: '#a855f7', rating: 5, review_mm: 'ကလေးအတွက် ဆေးဝါးတွေ ရှာဖွေရတာ MediHug နဲ့ အရမ်းအဆင်ပြေတယ်။ Baby care products တွေ အကုန်ရှိပြီး ဆရာဝန် consultation လည်း ရနိုင်တယ်။', review_en: 'Finding medicines for my baby is so convenient with MediHug. All baby care products are available and doctor consultation too.' },
  { id: 4, name: 'U Kyaw Zin',    role_mm: 'သက်ကြီးလူနာ',    role_en: 'Elderly Patient',  avatar: 'K', color: '#22c55e', rating: 4, review_mm: 'သက်ကြီးရွယ်အိုဖြစ်တဲ့ ငါ့အတွက် app ကို သုံးဖို့ လွယ်ကူတယ်။ ဆေးရုံသွားစရာမလိုဘဲ ဆရာဝန်ကြီးတွေနဲ့ ဆွေးနွေးနိုင်တာ အရမ်းကောင်းတယ်။', review_en: 'The app is easy to use even for elderly like me. Being able to consult doctors without going to hospital is great.' },
  { id: 5, name: 'Daw Khin May',  role_mm: 'လူနာ',           role_en: 'Patient',          avatar: 'D', color: '#ef4444', rating: 5, review_mm: 'Diabetes ရောဂါအတွက် ဆေးတွေ မှန်မှန်မှာလို့ ရတယ်။ MediHug ကို မိတ်ဆွေတွေကို recommend လုပ်မယ်။', review_en: 'I can regularly order my diabetes medicines. I highly recommend MediHug to my friends.' },
];

export default function Testimonials() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { lang, tr } = useLang();

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -340 : 340, behavior: 'smooth' });
  };

  return (
    <section className="w-full px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold" style={{ color: '#0d2b6e' }}>{tr.testimonialsTitle}</h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">{tr.testimonialsSubtitle}</p>
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
          {testimonials.map(({ id, name, role_mm, role_en, avatar, color, rating, review_mm, review_en }) => (
            <div key={id} className="shrink-0 w-72 sm:w-80 bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-4">
              <div className="flex gap-0.5">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed flex-1">
                "{lang === 'mm' ? review_mm : review_en}"
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: color }}>
                  {avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{name}</p>
                  <p className="text-xs text-gray-400">{lang === 'mm' ? role_mm : role_en}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
