'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Building2, ArrowRight, MapPin, BadgeCheck } from 'lucide-react';
import { useLang } from '@/app/lib/LanguageContext';

const PRIMARY = '#0d2b6e';

export interface PartnerClinic {
  id: string; name: string; nameEn: string | null;
  type: string;
  address: string | null; addressEn: string | null;
  township: string | null;
  imageUrl: string | null;
  rating: number; reviewCount: number;
}

export function PartnerCardSkeleton() {
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

export function PartnerCard({ clinic: c, highlighted, linkRef }: {
  clinic: PartnerClinic; highlighted?: boolean; linkRef?: React.Ref<HTMLAnchorElement>;
}) {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const name = mm ? c.name : (c.nameEn ?? c.name);
  const address = mm ? (c.address ?? c.addressEn) : (c.addressEn ?? c.address);
  const location = [address, c.township].filter(Boolean).join(', ');

  return (
    <Link href={`/clinics/${c.id}`}
      ref={linkRef}
      className={`rounded-2xl border bg-white overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        highlighted ? 'border-2 ring-4' : 'border-gray-100'
      }`}
      style={highlighted ? { borderColor: PRIMARY, ['--tw-ring-color' as string]: `${PRIMARY}33` } : undefined}>
      <div className="relative w-full h-48" style={{ backgroundColor: `${PRIMARY}08` }}>
        {c.imageUrl ? (
          <Image src={c.imageUrl} alt={name} fill className="object-contain p-6" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-10 h-10" style={{ color: `${PRIMARY}40` }} />
          </div>
        )}
        <span className="absolute top-3 left-3 flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: PRIMARY }}>
          <BadgeCheck className="w-3.5 h-3.5" /> {c.type}
        </span>
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="text-sm font-bold text-gray-800 leading-snug line-clamp-2">{name}</h3>
        {location && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <p className="text-xs text-gray-400 truncate">{location}</p>
          </div>
        )}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold text-gray-700">{c.rating.toFixed(1)}</span>
            {c.reviewCount > 0 && <span className="text-xs text-gray-400">({c.reviewCount})</span>}
          </div>
          <span className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: PRIMARY }}>
            {mm ? 'ကြည့်ရန်' : 'View'} <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** The partners the SuperAdmin tagged onto a landing-page category. Renders nothing when the
 * category has none (and while loading, a skeleton row only if `showSkeleton` is set), so it can be
 * dropped under a doctors/programs list without adding an empty heading. */
export default function CategoryPartners({ categoryId, showSkeleton = false }: { categoryId: string; showSkeleton?: boolean }) {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const [clinics, setClinics] = useState<PartnerClinic[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/clinics?limit=60&categoryId=${encodeURIComponent(categoryId)}`)
      .then(r => r.json())
      .then(d => { if (!cancelled) setClinics(d.clinics ?? []); })
      .catch(() => { if (!cancelled) setClinics([]); });
    return () => { cancelled = true; };
  }, [categoryId]);

  if (clinics === null) {
    return showSkeleton ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => <PartnerCardSkeleton key={i} />)}
      </div>
    ) : null;
  }
  if (clinics.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="flex items-baseline gap-2 mb-5">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{mm ? 'မိတ်ဖက်များ' : 'Partners'}</h2>
        <span className="text-sm text-gray-400">{clinics.length}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {clinics.map(c => <PartnerCard key={c.id} clinic={c} />)}
      </div>
    </section>
  );
}
