'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronLeft, ChevronRight, Star, Building2, Loader2, Phone, MapPin, Globe,
  Stethoscope, ShoppingBag, HeartPulse, CheckCircle2, Navigation, Images, X, Pill,
} from 'lucide-react';
import { FaFacebook, FaTiktok } from 'react-icons/fa6';
import { useLang } from '@/app/lib/LanguageContext';
import { getProductPriceEntries, formatPriceEntries } from '@/lib/productPrice';

const PRIMARY = '#0d2b6e';

interface ClinicDoctor {
  id: string;
  doctor: {
    id: string; name: string; nameEn: string | null; imageUrl: string | null;
    specialty: string; rating: number; patientPrice: number; experience: number; isAvailable: boolean;
  };
}
interface ClinicProduct {
  id: string;
  product: { id: string; name: string; nameEn: string | null; imageUrl: string | null; price: number; priceThb: number | null; priceUsd: number | null; packSize: string | null };
}
interface Clinic {
  id: string;
  name: string; nameEn: string | null;
  phone: string | null; openTime: string | null; closeTime: string | null;
  address: string | null; addressEn: string | null;
  website: string | null;
  facebookUrl: string | null; tiktokUrl: string | null; mapUrl: string | null;
  aboutMm: string | null; aboutEn: string | null;
  tagsMm: string[]; tagsEn: string[];
  imageUrl: string | null; coverUrl: string | null;
  verified: boolean; rating: number; reviewCount: number;
  type: string;
  doctors: ClinicDoctor[];
  products: ClinicProduct[];
  branches: { id: string; title: string; titleEn: string | null; address: string; addressEn: string | null; mapUrl: string | null }[];
  gallery: { id: string; imageUrl: string; captionMm: string | null; captionEn: string | null }[];
  programs: { id: string; imageUrl: string; titleMm: string; titleEn: string | null; price: number }[];
}

function SectionHeader({ icon, label, count, unit }: { icon: React.ReactNode; label: string; count: number; unit: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${PRIMARY}15` }}>
        {icon}
      </div>
      <p className="text-sm font-bold text-gray-800">{label}</p>
      <span className="ml-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
        {count} {unit}
      </span>
    </div>
  );
}

export default function PublicClinicDetailPage() {
  const { id }   = useParams();
  const { lang } = useLang();
  const mm       = lang === 'mm';

  const [clinic,    setClinic]    = useState<Clinic | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [notFound,  setNotFound]  = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [lightbox,  setLightbox]  = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/clinics/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => { setClinic(d.clinic); setLoading(false); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: PRIMARY }} />
      </div>
    );
  }

  if (notFound || !clinic) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center px-6">
        <Building2 className="w-12 h-12 text-gray-200" />
        <p className="text-gray-400">{mm ? 'ဆေးခန်း မတွေ့ပါ' : 'Clinic not found'}</p>
        <Link href="/clinics" className="text-sm font-semibold" style={{ color: PRIMARY }}>
          ← {mm ? 'မိတ်ဖက်များသို့' : 'Back to Partners'}
        </Link>
      </div>
    );
  }

  const name    = mm ? clinic.name    : (clinic.nameEn    ?? clinic.name);
  const about   = mm ? clinic.aboutMm : (clinic.aboutEn   ?? clinic.aboutMm);
  const address = mm ? clinic.address : (clinic.addressEn ?? clinic.address);
  const tags    = mm ? clinic.tagsMm  : clinic.tagsEn;

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Link href="/clinics" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6">
          <ChevronLeft className="w-4 h-4" /> {mm ? 'မိတ်ဖက်များသို့' : 'Back to Partners'}
        </Link>

        {/* header */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="relative aspect-video lg:aspect-square rounded-2xl overflow-hidden bg-white border border-gray-100">
            {clinic.coverUrl || clinic.imageUrl ? (
              <Image src={clinic.coverUrl ?? clinic.imageUrl!} alt={name} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(160deg, ${PRIMARY} 0%, #1a3a8f 100%)` }}>
                <Building2 className="w-16 h-16 text-white/40" strokeWidth={1.2} />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{clinic.type}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{name}</h1>
              {clinic.verified && <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: PRIMARY }} />}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="w-4 h-4" fill={s < Math.round(clinic.rating) ? '#f59e0b' : 'none'} stroke={s < Math.round(clinic.rating) ? '#f59e0b' : '#d1d5db'} />
                ))}
              </div>
              <span className="text-sm text-gray-500">{clinic.rating.toFixed(1)} ({clinic.reviewCount})</span>
              {(clinic.openTime || clinic.closeTime) && (
                <>
                  <span className="text-gray-200">·</span>
                  <span className="flex items-center gap-1 text-sm font-semibold text-green-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    {clinic.openTime ?? '—'} – {clinic.closeTime ?? '—'}
                  </span>
                </>
              )}
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: `${PRIMARY}12`, color: PRIMARY }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-0 rounded-2xl border border-gray-100 overflow-hidden">
              {clinic.phone && (
                <a href={`tel:${clinic.phone}`} className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors border-b border-gray-100">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${PRIMARY}15` }}>
                    <Phone className="w-4 h-4" style={{ color: PRIMARY }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-400 font-medium">{mm ? 'ဖုန်းနံပါတ်' : 'Phone'}</p>
                    <p className="text-sm font-bold truncate" style={{ color: PRIMARY }}>{clinic.phone}</p>
                  </div>
                </a>
              )}
              {address && (
                <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
                  <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-400 font-medium">{mm ? 'လိပ်စာ' : 'Address'}</p>
                    <p className="text-sm font-semibold text-gray-700">{address}</p>
                  </div>
                </div>
              )}
              {(clinic.website || clinic.facebookUrl || clinic.tiktokUrl) && (
                <div className="flex items-center gap-2.5 px-4 py-3 bg-white">
                  {clinic.website && (
                    <a href={clinic.website} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors">
                      <Globe className="w-4 h-4 text-blue-400" />
                    </a>
                  )}
                  {clinic.facebookUrl && (
                    <a href={clinic.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors">
                      <FaFacebook className="w-4 h-4 text-blue-600" />
                    </a>
                  )}
                  {clinic.tiktokUrl && (
                    <a href={clinic.tiktokUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-900 hover:bg-gray-800 flex items-center justify-center transition-colors">
                      <FaTiktok className="w-4 h-4 text-white" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* map */}
        {(address || clinic.mapUrl) && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
            <a
              href={clinic.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address ?? name)}`}
              target="_blank" rel="noopener noreferrer" className="relative block w-full h-56"
            >
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(address ?? name)}&output=embed`}
                className="w-full h-full border-0 pointer-events-none" loading="lazy"
                referrerPolicy="no-referrer-when-downgrade" title="Google Map"
              />
            </a>
            <a
              href={clinic.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address ?? name)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <Navigation className="w-4 h-4" style={{ color: PRIMARY }} />
              <span className="text-sm font-semibold" style={{ color: PRIMARY }}>
                {mm ? 'Google Maps တွင် ဖွင့်ရန်' : 'Open in Google Maps'}
              </span>
            </a>
          </div>
        )}

        {/* branches */}
        {clinic.branches.length > 0 && (
          <div className="mb-6">
            <SectionHeader icon={<MapPin className="w-4 h-4" style={{ color: PRIMARY }} />} label={mm ? 'ဆိုင်ခွဲများ' : 'Branches'} count={clinic.branches.length} unit={mm ? 'ခု' : 'branches'} />
            <div className="grid sm:grid-cols-2 gap-2.5">
              {clinic.branches.map(b => {
                const bTitle = mm ? b.title : (b.titleEn ?? b.title);
                const bAddress = mm ? b.address : (b.addressEn ?? b.address);
                return (
                  <a key={b.id}
                    href={b.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bAddress)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 px-4 py-3 hover:border-gray-200 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-800 truncate">{bTitle}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{bAddress}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* about */}
        {about && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
            <p className="text-xs font-bold uppercase tracking-widest mb-2.5" style={{ color: PRIMARY }}>
              {mm ? 'ဆေးခန်းအကြောင်း' : 'About'}
            </p>
            <p className={`text-sm text-gray-600 leading-relaxed ${aboutOpen ? '' : 'line-clamp-3'}`}>{about}</p>
            {about.length > 140 && (
              <button onClick={() => setAboutOpen(p => !p)} className="text-xs font-bold mt-2" style={{ color: PRIMARY }}>
                {aboutOpen ? (mm ? 'လျှော့ပြ' : 'Show less') : (mm ? 'ဆက်ဖတ်မည်' : 'Read more')}
              </button>
            )}
          </div>
        )}

        {/* stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { value: clinic.rating.toFixed(1), label: mm ? 'အဆင့်သတ်မှတ်' : 'Rating', icon: Star, color: '#f59e0b' },
            { value: clinic.doctors.length,    label: mm ? 'ဆရာဝန်'         : 'Doctors', icon: Stethoscope, color: PRIMARY },
            { value: clinic.products.length,   label: mm ? 'ထုတ်ကုန်'        : 'Products', icon: Pill, color: PRIMARY },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 px-3 py-3.5 flex flex-col items-center gap-1 text-center">
              <s.icon className="w-5 h-5" style={{ color: s.color }} strokeWidth={2} />
              <span className="text-base font-extrabold text-gray-900">{s.value}</span>
              <span className="text-[10px] text-gray-400 font-medium">{s.label}</span>
            </div>
          ))}
        </div>

        {/* gallery */}
        {clinic.gallery.length > 0 && (
          <div className="mb-6">
            <SectionHeader icon={<Images className="w-4 h-4" style={{ color: PRIMARY }} />} label={mm ? 'ဓာတ်ပုံများ' : 'Gallery'} count={clinic.gallery.length} unit={mm ? 'ပုံ' : 'photos'} />
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {clinic.gallery.map(g => {
                const caption = mm ? (g.captionMm ?? g.captionEn) : (g.captionEn ?? g.captionMm);
                return (
                  <button key={g.id} type="button" onClick={() => setLightbox(g.imageUrl)}
                    className="relative rounded-xl overflow-hidden border border-gray-100 bg-gray-50" style={{ aspectRatio: '1' }}>
                    <Image src={g.imageUrl} alt={caption ?? ''} fill className="object-cover" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* doctors */}
        {clinic.doctors.length > 0 && (
          <div className="mb-6">
            <SectionHeader icon={<Stethoscope className="w-4 h-4" style={{ color: PRIMARY }} />} label={mm ? 'ဆရာဝန်များ' : 'Our Doctors'} count={clinic.doctors.length} unit={mm ? 'ဦး' : 'doctors'} />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {clinic.doctors.map(cd => {
                const doc = cd.doctor;
                const docName = mm ? doc.name : (doc.nameEn ?? doc.name);
                return (
                  <Link key={cd.id} href={`/doctors/${doc.id}`}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                    <div className="relative overflow-hidden bg-gray-100" style={{ height: 160 }}>
                      {doc.imageUrl ? (
                        <Image src={doc.imageUrl} alt={docName} fill sizes="25vw" className="object-cover object-top" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white" style={{ background: `linear-gradient(160deg, ${PRIMARY} 0%, #1a3a8f 100%)` }}>
                          {doc.name.charAt(0)}
                        </div>
                      )}
                      {doc.isAvailable && (
                        <span className="absolute top-2 left-2 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full bg-green-500">
                          {mm ? 'ရနိုင်' : 'Available'}
                        </span>
                      )}
                    </div>
                    <div className="p-3 flex flex-col gap-1.5">
                      <p className="text-xs font-bold text-gray-800 leading-snug line-clamp-2">{docName}</p>
                      <p className="text-[10px] text-gray-400">{doc.specialty}</p>
                      <div className="flex items-center justify-between mt-auto pt-1">
                        <span className="text-xs font-extrabold" style={{ color: PRIMARY }}>{doc.patientPrice.toLocaleString()} MMK</span>
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-[10px] font-semibold text-gray-600">{doc.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* products */}
        {clinic.products.length > 0 && (
          <div className="mb-6">
            <SectionHeader icon={<ShoppingBag className="w-4 h-4" style={{ color: PRIMARY }} />} label={mm ? 'ထုတ်ကုန်များ' : 'Products'} count={clinic.products.length} unit={mm ? 'မျိုး' : 'items'} />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {clinic.products.map(cp => {
                const p = cp.product;
                const pName = mm ? p.name : (p.nameEn ?? p.name);
                return (
                  <Link key={cp.id} href={`/products/${p.id}`}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative w-full h-32 bg-gray-50 overflow-hidden">
                      {p.imageUrl ? (
                        <Image src={p.imageUrl} alt={pName} fill sizes="25vw" className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Pill className="w-8 h-8 text-gray-300" strokeWidth={1.2} /></div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-bold text-gray-800 line-clamp-2 leading-snug">{pName}</p>
                      {p.packSize && <p className="text-[10px] text-gray-400 mt-0.5">{p.packSize}</p>}
                      <p className="text-sm font-extrabold mt-2" style={{ color: PRIMARY }}>{formatPriceEntries(getProductPriceEntries(p, { labels: { MMK: 'Ks' } }))}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* healthcare programs */}
        {clinic.programs.length > 0 && (
          <div>
            <SectionHeader icon={<HeartPulse className="w-4 h-4" style={{ color: PRIMARY }} />} label={mm ? 'ကျန်းမာရေး အစီအစဉ်များ' : 'Healthcare Programs'} count={clinic.programs.length} unit={mm ? 'ခု' : 'items'} />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {clinic.programs.map(pr => {
                const prName = mm ? pr.titleMm : (pr.titleEn ?? pr.titleMm);
                return (
                  <Link key={pr.id} href={`/programs/${pr.id}`}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative w-full h-32 bg-gray-50 overflow-hidden">
                      <Image src={pr.imageUrl} alt={prName} fill sizes="25vw" className="object-cover" />
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-bold text-gray-800 line-clamp-2 leading-snug">{prName}</p>
                      <p className="text-sm font-extrabold mt-2" style={{ color: PRIMARY }}>{pr.price.toLocaleString()} MMK</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center px-4" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="relative w-full max-w-2xl aspect-square" onClick={e => e.stopPropagation()}>
            <Image src={lightbox} alt="" fill className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
