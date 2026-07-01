'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, Clock, Star, Stethoscope, CheckCircle2, ChevronRight } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';

const PRIMARY = 'var(--color-primary)';
const ACCENT  = 'var(--color-accent)';

interface Clinic {
  id: string; name: string; nameEn: string | null;
  phone: string | null; openTime: string | null; closeTime: string | null;
  imageUrl: string | null; type: string;
  rating: number; reviewCount: number; verified: boolean;
  _count: { doctors: number };
}

function SkeletonMobile() {
  return (
    <div className="shrink-0 w-52 rounded-2xl overflow-hidden border border-gray-100 bg-white flex flex-col">
      <div className="h-36 bg-gray-200 animate-pulse" />
      <div className="px-3 py-3 flex flex-col gap-2">
        <div className="h-3 bg-gray-200 rounded animate-pulse w-4/5" />
        <div className="h-2 bg-gray-100 rounded animate-pulse w-3/5" />
        <div className="flex gap-2 mt-1">
          <div className="h-5 bg-gray-100 rounded-full animate-pulse w-16" />
          <div className="h-5 bg-gray-100 rounded-full animate-pulse w-20" />
        </div>
      </div>
    </div>
  );
}

function SkeletonDesktop() {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white flex flex-col">
      <div className="bg-gray-200 animate-pulse" style={{ height: 200 }} />
      <div className="px-4 py-4 flex flex-col gap-2.5">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
        <div className="flex gap-2 mt-1">
          <div className="h-5 bg-gray-100 rounded-full animate-pulse w-16" />
          <div className="h-5 bg-gray-100 rounded-full animate-pulse w-20" />
        </div>
        <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
      </div>
    </div>
  );
}

export default function PartnerClinicsSlider() {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const scrollRef = useRef<HTMLDivElement>(null);
  const [clinics,  setClinics]  = useState<Clinic[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    fetch('/api/admin/clinics?isActive=true&isPartner=true&pageSize=8')
      .then(r => r.json())
      .then(d => { setClinics(d.clinics ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (!loading && clinics.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <div>
          <h2 className="font-bold text-base lg:text-xl" style={{ color: PRIMARY }}>
            {mm ? 'မိတ်ဖက် ဆေးရုံ ဆေးခန်းများ' : 'Partner Clinics'}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5 lg:hidden">
            {mm ? 'တည်ထောင်ထားသော မိတ်ဖက်များ' : 'Our trusted partners'}
          </p>
        </div>
        <Link href="/patient/clinics" className="text-xs font-semibold flex items-center gap-0.5 lg:text-sm" style={{ color: ACCENT }}>
          {mm ? 'အားလုံး' : 'See all'} <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Mobile */}
      <div ref={scrollRef} className="lg:hidden flex flex-nowrap gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonMobile key={i} />)
          : clinics.map(c => {
              const name = mm ? c.name : (c.nameEn ?? c.name);
              return (
                <Link key={c.id} href={`/patient/clinics/${c.id}`}
                  className="shrink-0 w-52 rounded-2xl overflow-hidden border border-gray-100 bg-white flex flex-col active:scale-95 transition-all shadow-sm">

                  {/* image with overlay */}
                  <div className="relative w-full h-36 overflow-hidden bg-gray-100">
                    {c.imageUrl
                      ? <Image src={c.imageUrl} alt={name} fill className="object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-50">🏥</div>
                    }
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)' }} />

                    {/* type + verified */}
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <span className="text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: `${PRIMARY}cc` }}>
                        {c.type}
                      </span>
                      {c.verified && <CheckCircle2 className="w-3.5 h-3.5 text-white drop-shadow" />}
                    </div>

                    {/* rating */}
                    <div className="absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-black/40 backdrop-blur-sm">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      <span className="text-[10px] font-bold text-white">{c.rating.toFixed(1)}</span>
                    </div>

                    {/* name overlay */}
                    <div className="absolute bottom-0 left-0 right-0 px-3 pb-2.5">
                      <p className="text-xs font-bold text-white leading-snug line-clamp-1">{name}</p>
                    </div>
                  </div>

                  {/* info */}
                  <div className="px-3 py-2.5 flex flex-col gap-1.5">
                    {c.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 shrink-0 text-gray-400" />
                        <span className="text-[11px] text-gray-500 truncate">{c.phone}</span>
                      </div>
                    )}
                    {(c.openTime || c.closeTime) && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 shrink-0 text-emerald-500" />
                        <span className="text-[11px] font-semibold text-emerald-600">{c.openTime ?? '—'} – {c.closeTime ?? '—'}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-50 border border-gray-100">
                        <Stethoscope className="w-2.5 h-2.5" style={{ color: PRIMARY }} />
                        <span className="text-[10px] font-semibold" style={{ color: PRIMARY }}>
                          {c._count.doctors} {mm ? 'ဦး' : 'doctors'}
                        </span>
                      </div>
                      {c.reviewCount > 0 && (
                        <span className="text-[10px] text-gray-400">{c.reviewCount} reviews</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
        }
      </div>

      {/* Desktop */}
      <div className="hidden lg:grid grid-cols-3 gap-5">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonDesktop key={i} />)
          : clinics.map(c => {
              const name = mm ? c.name : (c.nameEn ?? c.name);
              return (
                <Link key={c.id} href={`/patient/clinics/${c.id}`}
                  className="rounded-2xl overflow-hidden border border-gray-100 bg-white flex flex-col active:scale-[0.98] transition-all group hover:shadow-lg">

                  <div className="relative w-full overflow-hidden bg-gray-100" style={{ height: 200 }}>
                    {c.imageUrl
                      ? <Image src={c.imageUrl} alt={name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full flex items-center justify-center text-6xl bg-gray-50">🏥</div>
                    }
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)' }} />

                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${PRIMARY}cc` }}>
                        {c.type}
                      </span>
                      {c.verified && <CheckCircle2 className="w-4 h-4 text-white drop-shadow" />}
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-white">{c.rating.toFixed(1)}</span>
                      {c.reviewCount > 0 && <span className="text-[10px] text-white/70">({c.reviewCount})</span>}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
                      <p className="text-sm font-bold text-white leading-snug">{name}</p>
                    </div>
                  </div>

                  <div className="px-4 py-3.5 flex flex-col gap-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      {c.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                          <span className="text-xs text-gray-500">{c.phone}</span>
                        </div>
                      )}
                      {(c.openTime || c.closeTime) && (
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-xs font-semibold text-emerald-600">{c.openTime ?? '—'} – {c.closeTime ?? '—'}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100">
                        <Stethoscope className="w-3 h-3" style={{ color: PRIMARY }} />
                        <span className="text-xs font-semibold" style={{ color: PRIMARY }}>
                          {c._count.doctors} {mm ? 'ဦး' : 'doctors'}
                        </span>
                      </div>
                      <span className="text-xs font-bold ml-auto" style={{ color: ACCENT }}>
                        {mm ? 'ကြည့်ရှုမည်' : 'View'} →
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
