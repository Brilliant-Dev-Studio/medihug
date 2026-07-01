'use client';

import { use, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Phone, Clock, MapPin, Globe, Star,
  Stethoscope, ShoppingBag, CheckCircle2, Heart,
  Building2, ChevronRight, Share2,
} from 'lucide-react';
import { useLang } from '../../../lib/LanguageContext';

const PRIMARY   = 'var(--color-primary)';
const SECONDARY = 'var(--color-primary-dark)';

interface ClinicDoctor {
  id: string;
  doctor: {
    id: string; name: string; nameEn: string | null;
    imageUrl: string | null; specialty: string;
    rating: number; price: number; experience: number;
    isAvailable: boolean;
  };
}
interface ClinicProduct {
  id: string;
  product: {
    id: string; name: string; nameEn: string | null;
    imageUrl: string | null; price: number; packSize: string | null;
  };
}
interface Clinic {
  id: string;
  name: string; nameEn: string | null;
  phone: string | null; openTime: string | null; closeTime: string | null;
  address: string | null; addressEn: string | null;
  website: string | null;
  aboutMm: string | null; aboutEn: string | null;
  tagsMm: string[]; tagsEn: string[];
  imageUrl: string | null; coverUrl: string | null;
  verified: boolean; rating: number; reviewCount: number;
  type: string;
  doctors: ClinicDoctor[];
  products: ClinicProduct[];
}

/* ─── skeleton ─── */
function Sh({ w = 'w-full', h = 'h-3', r = 'rounded-lg' }: { w?: string; h?: string; r?: string }) {
  return <div className={`bg-gray-200 animate-pulse ${w} ${h} ${r}`} />;
}
function ClinicDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative w-full h-64 bg-gray-300 animate-pulse">
        <div className="absolute top-12 left-4 w-9 h-9 rounded-full bg-white/40 animate-pulse" />
      </div>
      <div className="relative -mt-16 mx-4 lg:mx-auto lg:max-w-5xl">
        <div className="bg-white rounded-3xl shadow-xl p-5 flex flex-col gap-4">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-2xl bg-gray-200 animate-pulse shrink-0" />
            <div className="flex-1 flex flex-col gap-2 pt-1">
              <Sh w="w-2/3" h="h-5" />
              <Sh w="w-1/3" h="h-3" />
              <Sh w="w-24" h="h-2.5" />
            </div>
          </div>
          <div className="flex gap-2">
            {[1,2,3].map(i => <Sh key={i} w="w-20" h="h-10" r="rounded-2xl" />)}
          </div>
        </div>
      </div>
      <div className="px-4 pt-4 pb-28 flex flex-col gap-4 lg:max-w-5xl lg:mx-auto lg:px-6 mt-4">
        <div className="bg-white rounded-2xl p-4 flex flex-col gap-3 border border-gray-100">
          {[1,2,3].map(i => <div key={i} className="flex gap-3 items-center"><Sh w="w-8" h="h-8" r="rounded-xl" /><div className="flex-1 flex flex-col gap-1"><Sh w="w-1/4" h="h-2" /><Sh w="w-1/2" h="h-3" /></div></div>)}
        </div>
        <div className="bg-white rounded-2xl p-4 flex flex-col gap-2 border border-gray-100">
          {[1,2,3,4].map(i => <Sh key={i} w={i % 2 === 0 ? 'w-4/5' : 'w-full'} h="h-3" />)}
        </div>
        <div className="flex flex-col gap-3">
          <Sh w="w-36" h="h-5" />
          <div className="flex gap-3 overflow-x-hidden">
            {[1,2,3].map(i => (
              <div key={i} className="w-48 shrink-0 bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="h-44 bg-gray-200 animate-pulse" />
                <div className="p-3 flex flex-col gap-2"><Sh w="w-3/4" h="h-3.5" /><Sh w="w-1/2" h="h-2.5" /><Sh w="w-full" h="h-8" r="rounded-full" /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── section header ─── */
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

export default function ClinicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { lang } = useLang();
  const mm = lang === 'mm';

  const [clinic,    setClinic]    = useState<Clinic | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/clinics/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => { setClinic(d.clinic); setLoading(false); })
      .catch(() => { setClinic(null); setLoading(false); });
  }, [id]);

  const toggleFav = (docId: string) => setFavorites(prev => {
    const next = new Set(prev);
    next.has(docId) ? next.delete(docId) : next.add(docId);
    return next;
  });

  if (loading) return <ClinicDetailSkeleton />;

  if (!clinic) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center">
        <Building2 className="w-10 h-10 text-gray-300" />
      </div>
      <p className="text-gray-500 font-semibold">{mm ? 'ဆေးခန်း မတွေ့ပါ' : 'Clinic not found'}</p>
      <Link href="/patient/clinics"
        className="mt-1 px-5 py-2.5 rounded-full text-sm font-bold text-white"
        style={{ backgroundColor: PRIMARY }}>
        {mm ? 'ပြန်သွားမည်' : 'Go back'}
      </Link>
    </div>
  );

  const name    = mm ? clinic.name    : (clinic.nameEn    ?? clinic.name);
  const about   = mm ? clinic.aboutMm : (clinic.aboutEn   ?? clinic.aboutMm);
  const address = mm ? clinic.address : (clinic.addressEn ?? clinic.address);
  const tags    = mm ? clinic.tagsMm  : clinic.tagsEn;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── hero ── */}
      <div className="relative w-full h-64 lg:h-80">
        {clinic.coverUrl || clinic.imageUrl
          ? <Image src={clinic.coverUrl ?? clinic.imageUrl!} alt={name} fill sizes="100vw"
              className="object-cover" priority />
          : <div className="w-full h-full"
              style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
              <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-20">🏥</div>
            </div>
        }
        {/* gradient overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 100%)' }} />

        {/* top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-12 lg:pt-6">
          <button onClick={() => router.back()}
            className="w-9 h-9 rounded-full backdrop-blur-md bg-white/20 border border-white/30 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <button className="w-9 h-9 rounded-full backdrop-blur-md bg-white/20 border border-white/30 flex items-center justify-center">
            <Share2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* ── floating identity card ── */}
      <div className="relative -mt-14 mx-4 lg:mx-auto lg:max-w-5xl z-10">
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 p-5">
          <div className="flex gap-4 items-start">
            {/* clinic avatar */}
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-lg shrink-0"
              style={{ boxShadow: `0 4px 16px ${PRIMARY}30` }}>
              {clinic.imageUrl
                ? <Image src={clinic.imageUrl} alt={name} width={64} height={64} className="object-cover w-full h-full" />
                : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white"
                    style={{ backgroundColor: PRIMARY }}>
                    {clinic.name.charAt(0)}
                  </div>
              }
            </div>

            {/* name + meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-base font-extrabold text-gray-900 leading-tight">{name}</h1>
                {clinic.verified && <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: PRIMARY }} />}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{clinic.type}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-gray-800">{clinic.rating.toFixed(1)}</span>
                  {clinic.reviewCount > 0 && (
                    <span className="text-xs text-gray-400">({clinic.reviewCount})</span>
                  )}
                </div>
                {(clinic.openTime || clinic.closeTime) && (
                  <>
                    <span className="text-gray-200 text-sm">·</span>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs font-semibold text-green-600">
                        {clinic.openTime} – {clinic.closeTime}
                      </span>
                    </div>
                  </>
                )}
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{ backgroundColor: `${PRIMARY}12`, color: PRIMARY }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* info rows */}
          <div className="flex flex-col gap-0 mt-4 rounded-2xl border border-gray-100 overflow-hidden">
            {clinic.phone && (
              <a href={`tel:${clinic.phone}`}
                className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 active:bg-gray-100 transition-colors border-b border-gray-100">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${PRIMARY}15` }}>
                  <Phone className="w-4 h-4" style={{ color: PRIMARY }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-400 font-medium">{mm ? 'ဖုန်းနံပါတ်' : 'Phone'}</p>
                  <p className="text-sm font-bold truncate" style={{ color: PRIMARY }}>{clinic.phone}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </a>
            )}
            {(clinic.openTime || clinic.closeTime) && (
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-400 font-medium">{mm ? 'ဆေးခန်းချိန်' : 'Opening Hours'}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-sm font-bold text-green-600">{clinic.openTime ?? '—'} – {clinic.closeTime ?? '—'}</p>
                  </div>
                </div>
              </div>
            )}
            {address && (
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-400 font-medium">{mm ? 'လိပ်စာ' : 'Address'}</p>
                  <p className="text-sm font-semibold text-gray-700 line-clamp-1">{address}</p>
                </div>
              </div>
            )}
            {clinic.website && (
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-400 font-medium">{mm ? 'ဝက်ဘ်ဆိုက်' : 'Website'}</p>
                  <p className="text-sm font-semibold text-blue-500 truncate">{clinic.website}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── body ── */}
      <div className="px-4 pt-4 pb-28 flex flex-col gap-4 lg:max-w-5xl lg:mx-auto lg:px-6 mt-2">

        {/* stats strip */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: clinic.rating.toFixed(1), label: mm ? 'အဆင့်သတ်မှတ်' : 'Rating', icon: '⭐' },
            { value: clinic.doctors.length,    label: mm ? 'ဆရာဝန်'         : 'Doctors', icon: '🩺' },
            { value: clinic.products.length,   label: mm ? 'ထုတ်ကုန်'        : 'Products', icon: '💊' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 px-3 py-3.5 flex flex-col items-center gap-1 text-center">
              <span className="text-lg leading-none">{s.icon}</span>
              <span className="text-base font-extrabold text-gray-900">{s.value}</span>
              <span className="text-[10px] text-gray-400 font-medium">{s.label}</span>
            </div>
          ))}
        </div>

        {/* about */}
        {about && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5"
              style={{ color: PRIMARY }}>
              {mm ? 'ဆေးခန်းအကြောင်း' : 'About'}
            </p>
            <p className={`text-sm text-gray-600 leading-relaxed ${aboutOpen ? '' : 'line-clamp-3'}`}>
              {about}
            </p>
            {about.length > 140 && (
              <button onClick={() => setAboutOpen(p => !p)}
                className="text-xs font-bold mt-2" style={{ color: PRIMARY }}>
                {aboutOpen ? (mm ? 'လျှော့ပြ' : 'Show less') : (mm ? 'ဆက်ဖတ်မည်' : 'Read more')}
              </button>
            )}
          </div>
        )}

        {/* doctors */}
        {clinic.doctors.length > 0 && (
          <div>
            <SectionHeader
              icon={<Stethoscope className="w-4 h-4" style={{ color: PRIMARY }} />}
              label={mm ? 'ဆရာဝန်များ' : 'Our Doctors'}
              count={clinic.doctors.length}
              unit={mm ? 'ဦး' : 'doctors'}
            />
            {/* mobile: horizontal scroll */}
            <div className="lg:hidden flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {clinic.doctors.map(cd => {
                const doc = cd.doctor;
                const docName = mm ? doc.name : (doc.nameEn ?? doc.name);
                const fav = favorites.has(doc.id);
                return (
                  <div key={cd.id} className="shrink-0 w-44 bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col shadow-sm">
                    <div className="relative overflow-hidden bg-gray-100" style={{ height: 170 }}>
                      {doc.imageUrl
                        ? <Image src={doc.imageUrl} alt={docName} fill sizes="176px" className="object-cover object-top" />
                        : <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white"
                            style={{ background: `linear-gradient(160deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
                            {doc.name.charAt(0)}
                          </div>
                      }
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 55%)' }} />
                      {doc.isAvailable && (
                        <span className="absolute top-2 left-2 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full bg-green-500">
                          {mm ? 'ရနိုင်' : 'Available'}
                        </span>
                      )}
                      <button onClick={() => toggleFav(doc.id)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center">
                        <Heart className="w-3.5 h-3.5" style={{ color: fav ? '#ef4444' : '#9ca3af', fill: fav ? '#ef4444' : 'transparent' }} />
                      </button>
                      {/* name overlay */}
                      <div className="absolute bottom-0 left-0 right-0 px-3 pb-2.5">
                        <p className="text-xs font-bold text-white leading-tight line-clamp-2">{docName}</p>
                        <p className="text-[10px] text-white/70 mt-0.5">{doc.specialty}</p>
                      </div>
                    </div>
                    <div className="p-3 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[10px] text-gray-400">
                        <span>{doc.experience} {mm ? 'နှစ်' : 'yrs'}</span>
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="font-semibold text-gray-600 text-xs">{doc.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="text-xs font-bold" style={{ color: PRIMARY }}>{doc.price.toLocaleString()} MMK</p>
                      <div className="flex gap-1.5">
                        <Link href={`/patient/doctors/${doc.id}`}
                          className="flex-1 text-center text-[10px] font-semibold py-1.5 rounded-full border"
                          style={{ borderColor: PRIMARY, color: PRIMARY }}>
                          {mm ? 'ကိုယ်ရေး' : 'Profile'}
                        </Link>
                        <Link href={`/patient/doctors/${doc.id}?tab=schedule`}
                          className="flex-1 text-center text-[10px] font-bold py-1.5 rounded-full text-white"
                          style={{ backgroundColor: PRIMARY }}>
                          {mm ? 'ချိန်းဆို' : 'Book'}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* desktop: grid */}
            <div className="hidden lg:grid grid-cols-4 gap-4">
              {clinic.doctors.map(cd => {
                const doc = cd.doctor;
                const docName = mm ? doc.name : (doc.nameEn ?? doc.name);
                const fav = favorites.has(doc.id);
                return (
                  <div key={cd.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative overflow-hidden bg-gray-100" style={{ height: 200 }}>
                      {doc.imageUrl
                        ? <Image src={doc.imageUrl} alt={docName} fill sizes="25vw" className="object-cover object-top" />
                        : <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-white"
                            style={{ background: `linear-gradient(160deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
                            {doc.name.charAt(0)}
                          </div>
                      }
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)' }} />
                      {doc.isAvailable && (
                        <span className="absolute top-3 left-3 text-[10px] font-bold text-white px-2 py-0.5 rounded-full bg-green-500">
                          {mm ? 'ရနိုင်' : 'Available'}
                        </span>
                      )}
                      <button onClick={() => toggleFav(doc.id)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center transition-transform active:scale-90">
                        <Heart className="w-4 h-4" style={{ color: fav ? '#ef4444' : '#9ca3af', fill: fav ? '#ef4444' : 'transparent' }} />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
                        <p className="text-sm font-bold text-white leading-snug line-clamp-2">{docName}</p>
                        <p className="text-xs text-white/70 mt-0.5">{doc.specialty}</p>
                      </div>
                    </div>
                    <div className="p-3 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-bold text-gray-700">{doc.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-xs text-gray-400">{doc.experience} {mm ? 'နှစ်' : 'yrs exp'}</span>
                      </div>
                      <p className="text-sm font-bold" style={{ color: PRIMARY }}>{doc.price.toLocaleString()} MMK</p>
                      <div className="flex gap-2">
                        <Link href={`/patient/doctors/${doc.id}`}
                          className="flex-1 text-center text-xs font-semibold py-2 rounded-full border transition-all active:scale-95"
                          style={{ borderColor: PRIMARY, color: PRIMARY }}>
                          {mm ? 'ကိုယ်ရေး' : 'Profile'}
                        </Link>
                        <Link href={`/patient/doctors/${doc.id}?tab=schedule`}
                          className="flex-1 text-center text-xs font-bold py-2 rounded-full text-white transition-all active:scale-95"
                          style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
                          {mm ? 'ချိန်းဆို' : 'Book'}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* products */}
        {clinic.products.length > 0 && (
          <div>
            <SectionHeader
              icon={<ShoppingBag className="w-4 h-4" style={{ color: PRIMARY }} />}
              label={mm ? 'ထုတ်ကုန်များ' : 'Products'}
              count={clinic.products.length}
              unit={mm ? 'မျိုး' : 'items'}
            />
            <div className="flex gap-3 overflow-x-auto pb-1 lg:grid lg:grid-cols-4 lg:overflow-x-visible lg:pb-0" style={{ scrollbarWidth: 'none' }}>
              {clinic.products.map(cp => {
                const p = cp.product;
                const pName = mm ? p.name : (p.nameEn ?? p.name);
                return (
                  <Link key={cp.id} href={`/patient/records/${p.id}`}
                    className="shrink-0 w-40 lg:w-auto bg-white rounded-2xl border border-gray-100 overflow-hidden active:scale-[0.97] transition-transform shadow-sm hover:shadow-md">
                    <div className="relative w-full h-32 bg-gray-50 overflow-hidden">
                      {p.imageUrl
                        ? <Image src={p.imageUrl} alt={pName} fill sizes="(max-width: 768px) 160px, 25vw" className="object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-4xl">💊</div>
                      }
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-bold text-gray-800 line-clamp-2 leading-snug">{pName}</p>
                      {p.packSize && <p className="text-[10px] text-gray-400 mt-0.5">{p.packSize}</p>}
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm font-extrabold" style={{ color: PRIMARY }}>
                          {p.price.toLocaleString()} Ks
                        </p>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
