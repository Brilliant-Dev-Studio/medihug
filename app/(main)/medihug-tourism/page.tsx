'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Star, Plane, ArrowRight, MapPin, BadgeCheck, Stethoscope, Stamp, Hotel, Luggage, HeartHandshake } from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';

const PRIMARY = '#0d2b6e';
const ACCENT = '#2ab5ad';

interface Clinic {
  id: string; name: string; nameEn: string | null;
  type: string;
  address: string | null; addressEn: string | null;
  township: string | null;
  country: string | null; countryEn: string | null;
  imageUrl: string | null;
  rating: number; reviewCount: number;
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
      <div className="h-48 bg-gray-100 animate-pulse" />
      <div className="p-4 flex flex-col gap-2">
        <div className="h-4 bg-gray-100 rounded-lg animate-pulse w-4/5" />
        <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-1/2" />
      </div>
    </div>
  );
}

function PageHero({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="relative overflow-hidden">
      <Image
        src="/shutterstock_175007894_Travel-the-world-monument-concept.jpg" alt="" fill priority aria-hidden sizes="100vw"
        className="object-cover pointer-events-none select-none"
      />

      <div className="relative max-w-6xl mx-auto px-6 sm:px-8 pt-12 sm:pt-16 lg:pt-20 pb-10 sm:pb-14">
        <div className="flex items-center gap-2 mb-2">
          <Image src="/medihug-icon.png" alt="" width={20} height={20} aria-hidden className="object-contain drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]" />
          <p className="text-white text-xs font-bold uppercase tracking-widest drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">{eyebrow}</p>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white max-w-2xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">{title}</h1>
        <p className="text-white text-sm mt-2 max-w-lg drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">{subtitle}</p>
        <div className="h-1 w-14 rounded-full mt-4" style={{ background: `linear-gradient(90deg, ${ACCENT} 0%, #fff 100%)` }} />
      </div>
    </div>
  );
}

interface ServiceItem { icon: React.ElementType; titleMm: string; titleEn: string; color: string; }
const SERVICES: ServiceItem[] = [
  { icon: Stethoscope,    titleMm: 'ကုသမှုနှင့် ကျန်းမာရေး အစီအစဉ် ချိန်ညှိပေးခြင်း', titleEn: 'Customized Treatment and Wellness Packages', color: ACCENT },
  { icon: Stamp,          titleMm: 'ဗီဇာ ကူညီဆောင်ရွက်ပေးခြင်း',                    titleEn: 'Visa Assistance for Extended Stays',          color: '#f59e0b' },
  { icon: Hotel,          titleMm: 'ခရီးစဉ်နှင့် တည်းခိုခန်း စီစဉ်ပေးခြင်း',           titleEn: 'Travel and Accommodation Arrangements',      color: '#8b5cf6' },
  { icon: Luggage,        titleMm: 'ခရီးသွား အခွင့်အလမ်းများ',                       titleEn: 'Tourism Opportunities',                      color: '#0ea5e9' },
  { icon: HeartHandshake, titleMm: 'ကျန်းမာရေး ဝန်ဆောင်မှု ပေါင်းစည်းညှိနှိုင်းမှု',    titleEn: 'Integrated Healthcare Coordination',         color: '#ef4444' },
];

function ServicesSection({ mm }: { mm: boolean }) {
  return (
    <div className="relative overflow-hidden py-10 lg:py-14">
      {/* Soft colorful wash behind the cards, one blurred blob per service color */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {SERVICES.map(({ color, titleEn }, i) => (
          <div key={titleEn}
            className="absolute rounded-full blur-3xl opacity-20"
            style={{
              background: color,
              width: 260, height: 260,
              left: `${8 + i * 22}%`,
              top: i % 2 === 0 ? '-60px' : 'auto',
              bottom: i % 2 === 1 ? '-80px' : 'auto',
            }}
          />
        ))}
      </div>

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {mm ? 'MediHug ၏ နိုင်ငံတကာ ကျန်းမာရေး ခရီးစဉ် ဝန်ဆောင်မှုများ' : 'Medical Tourism Services by MediHug'}
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            {mm
              ? 'ကျွန်ုပ်တို့သည် ခရီးသွား လုပ်ငန်းတစ်ခုထက် ပိုပါသည် — လူနာတစ်ဦးချင်းစီအတွက် ကုသမှုခရီးစဉ် တစ်ခုလုံးကို စိတ်ချရအောင် စီစဉ်ဆောင်ရွက်ပေးပါသည်'
              : 'We are far more than a medical tourism agency; we are a distinguished provider of comprehensive healthcare solutions, dedicated to facilitating seamless, tailored patient journeys.'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
          {SERVICES.map(({ icon: Icon, titleMm, titleEn, color }) => (
            <div key={titleEn}
              className="relative flex flex-col items-center text-center gap-3 rounded-3xl border overflow-hidden shadow-sm p-5 pt-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
              style={{ borderColor: `${color}30`, background: `linear-gradient(160deg, ${color}30 0%, ${color}0d 100%)` }}>
              <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${color} 0%, ${color}55 100%)` }} />
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${color}33 0%, ${color}18 100%)` }}>
                <Icon className="w-6.5 h-6.5" style={{ color }} />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-gray-700 leading-snug">{mm ? titleMm : titleEn}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MedihugTourismPage() {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    fetch('/api/clinics?international=true&limit=60')
      .then(r => r.json())
      .then(d => { setClinics(d.clinics ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = clinics.filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q)
      || (c.nameEn ?? '').toLowerCase().includes(q)
      || (c.country ?? '').toLowerCase().includes(q)
      || (c.countryEn ?? '').toLowerCase().includes(q);
  });

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <PageHero
        eyebrow="MediHug Tourism"
        title={mm ? 'နိုင်ငံတကာ ကျန်းမာရေး ခရီးစဉ်' : 'Medical Tourism Partners'}
        subtitle={mm ? 'ကျွန်ုပ်တို့၏ နိုင်ငံတကာ မိတ်ဖက်ဆေးရုံများနှင့် ဆရာဝန်များကို ရှာဖွေပါ' : 'Trusted international hospitals and doctors, hand-picked for MediHug patients'}
      />

      <ServicesSection mm={mm} />

      <div className="max-w-6xl mx-auto px-6 lg:px-8 pb-10 pt-6 lg:pt-8">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={mm ? 'နိုင်ငံ (သို့) မိတ်ဖက် ရှာဖွေရန်...' : 'Search by name or country...'}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[#0d2b6e] transition-colors shadow-sm"
          />
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
              <Plane className="w-10 h-10 text-gray-200" />
              <p className="text-sm">{mm ? 'မိတ်ဖက် မတွေ့ပါ' : 'No international partners found'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(c => {
                const name = mm ? c.name : (c.nameEn ?? c.name);
                const country = mm ? (c.country ?? c.countryEn) : (c.countryEn ?? c.country);
                const address = mm ? (c.address ?? c.addressEn) : (c.addressEn ?? c.address);
                const location = [address, c.township].filter(Boolean).join(', ');
                return (
                  <Link key={c.id} href={`/clinics/${c.id}`}
                    className="group relative rounded-3xl border border-gray-100 bg-white overflow-hidden flex flex-col shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-transparent">
                    <div className="absolute top-0 left-0 right-0 h-1 z-10" style={{ background: `linear-gradient(90deg, ${PRIMARY} 0%, ${ACCENT} 100%)` }} />
                    <div className="relative w-full h-48 overflow-hidden" style={{ background: `linear-gradient(135deg, ${PRIMARY}12 0%, ${ACCENT}12 100%)` }}>
                      {c.imageUrl ? (
                        <Image src={c.imageUrl} alt={name} fill className="object-contain p-6 transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Plane className="w-10 h-10" style={{ color: `${PRIMARY}40` }} />
                        </div>
                      )}
                      {country && (
                        <span className="absolute top-3 left-3 flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full text-white shadow-sm" style={{ background: `linear-gradient(90deg, ${ACCENT} 0%, #22c1a8 100%)` }}>
                          <BadgeCheck className="w-3.5 h-3.5" /> {country}
                        </span>
                      )}
                    </div>
                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-gray-800 leading-snug line-clamp-2">{name}</h3>
                      </div>
                      <span className="self-start text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ backgroundColor: `${PRIMARY}0f`, color: PRIMARY }}>
                        {c.type}
                      </span>
                      {location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <p className="text-xs text-gray-400 truncate">{location}</p>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-bold text-gray-700">{c.rating.toFixed(1)}</span>
                          {c.reviewCount > 0 && <span className="text-xs text-gray-400">({c.reviewCount})</span>}
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full text-white transition-transform group-hover:translate-x-0.5" style={{ backgroundColor: PRIMARY }}>
                          {mm ? 'ကြည့်ရန်' : 'View'} <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
