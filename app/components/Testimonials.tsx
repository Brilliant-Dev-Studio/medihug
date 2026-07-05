'use client';

import { useLang } from '../lib/LanguageContext';

const testimonials = [
  { id: 1, name: 'Aye Myat Thu',  role_mm: 'လူနာ',           role_en: 'Patient',          avatar: 'A', review_mm: 'MediHug ကနေ ဆရာဝန်နဲ့ ဆက်သွယ်ဖို့ အရမ်းလွယ်ကူပါတယ်။ မိနစ်ပိုင်းအတွင်း ဆေးညွှန်းရပြီး အိမ်ကနေမထွက်ဘဲ ကုသမှုခံယူနိုင်ခဲ့တယ်။', review_en: 'MediHug made it so easy to connect with a doctor. Got a prescription within minutes without leaving home.' },
  { id: 2, name: 'Ko Zaw Lin',    role_mm: 'ပုံမှန် သုံးစွဲသူ', role_en: 'Regular Customer', avatar: 'Z', review_mm: 'ဆေးဝါးတွေကို Online ကနေ မှာလိုက်ရင် အမြန်ဆုံး ပို့ပေးတယ်။ ဈေးနှုန်းလည်း မျှတပြီး အရည်အသွေးကောင်းတဲ့ ပစ္စည်းတွေပဲ ရောင်းတာ သိသာပါတယ်။', review_en: 'Orders are delivered super fast. Prices are fair and the product quality is clearly good.' },
  { id: 3, name: 'Ma Thida Oo',   role_mm: 'မိခင်',           role_en: 'Mother',           avatar: 'T', review_mm: 'ကလေးအတွက် ဆေးဝါးတွေ ရှာဖွေရတာ MediHug နဲ့ အရမ်းအဆင်ပြေတယ်။ Baby care products တွေ အကုန်ရှိပြီး ဆရာဝန် consultation လည်း ရနိုင်တယ်။', review_en: 'Finding medicines for my baby is so convenient with MediHug. All baby care products are available and doctor consultation too.' },
  { id: 4, name: 'U Kyaw Zin',    role_mm: 'သက်ကြီးလူနာ',    role_en: 'Elderly Patient',  avatar: 'K', review_mm: 'သက်ကြီးရွယ်အိုဖြစ်တဲ့ ငါ့အတွက် app ကို သုံးဖို့ လွယ်ကူတယ်။ ဆေးရုံသွားစရာမလိုဘဲ ဆရာဝန်ကြီးတွေနဲ့ ဆွေးနွေးနိုင်တာ အရမ်းကောင်းတယ်။', review_en: 'The app is easy to use even for elderly like me. Being able to consult doctors without going to hospital is great.' },
  { id: 5, name: 'Daw Khin May',  role_mm: 'လူနာ',           role_en: 'Patient',          avatar: 'D', review_mm: 'Diabetes ရောဂါအတွက် ဆေးတွေ မှန်မှန်မှာလို့ ရတယ်။ MediHug ကို မိတ်ဆွေတွေကို recommend လုပ်မယ်။', review_en: 'I can regularly order my diabetes medicines. I highly recommend MediHug to my friends.' },
];

const STICKY_COLORS = ['#fde7d9', '#fdf1a8', '#ded4fb', '#fde7d9'];
const ROTATIONS = [-2, 1.5, -1.5, 2];

function TestimonialCard({ t, lang, index }: { t: typeof testimonials[0]; lang: string; index: number }) {
  const bg  = STICKY_COLORS[index % STICKY_COLORS.length];
  const rot = ROTATIONS[index % ROTATIONS.length];

  return (
    <div
      className="shrink-0 w-64 sm:w-72 rounded-2xl p-6 flex flex-col gap-6 transition-transform duration-300 hover:rotate-0 hover:z-10"
      style={{ backgroundColor: bg, transform: `rotate(${rot}deg)`, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
    >
      <span className="text-4xl font-serif leading-none text-black/25">&ldquo;</span>
      <p className="text-[15px] text-gray-800 leading-relaxed -mt-4 flex-1">
        {lang === 'mm' ? t.review_mm : t.review_en}
      </p>
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-gray-700 font-bold text-sm shrink-0 bg-black/10">
          {t.avatar}
        </div>
        <p className="text-sm font-semibold text-gray-800">{t.name}</p>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const { lang, tr } = useLang();

  return (
    <section className="relative w-full py-10 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top left, rgba(13,43,110,0.06) 0%, transparent 55%), radial-gradient(ellipse at bottom right, rgba(245,158,11,0.08) 0%, transparent 55%)' }}
      />
      <div className="relative z-10 max-w-6xl mx-auto px-6 mb-8">
        <h2 className="text-xl sm:text-3xl font-bold text-gray-900">{tr.testimonialsTitle}</h2>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">{tr.testimonialsSubtitle}</p>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div
          className="w-full overflow-hidden py-4"
          style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}
        >
          <div className="flex gap-6 w-max marquee-track">
            {[...testimonials, ...testimonials].map((t, i) => (
              <TestimonialCard key={`${t.id}-${i}`} t={t} lang={lang} index={i} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .marquee-track {
          animation: testimonials-marquee 36s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        @keyframes testimonials-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
