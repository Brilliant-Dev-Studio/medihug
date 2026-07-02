'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Star, Stethoscope, Package, Loader2 } from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';

const PRIMARY   = 'var(--color-primary)';
const SECONDARY = 'var(--color-primary-dark)';

interface FavDoctor {
  id: string; name: string; nameEn: string | null;
  specialty: string; rating: number; price: number; imageUrl: string | null;
}
interface FavProduct {
  id: string; name: string; nameEn: string | null;
  category: string | null; price: number; rating: number; imageUrl: string | null;
}

function getPatientPhone(): string | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('medihug_patient');
  if (!raw) return null;
  try { return JSON.parse(raw).phone ?? null; } catch { return null; }
}

function EmptyState({ mm, kind }: { mm: boolean; kind: 'doctor' | 'product' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <Heart className="w-7 h-7 text-gray-300" />
      </div>
      <p className="text-sm font-semibold text-gray-400">
        {kind === 'doctor'
          ? (mm ? 'ကြိုက်နှစ်သက်သော ဆရာဝန် မရှိသေးပါ' : 'No favourite doctors yet')
          : (mm ? 'ကြိုက်နှစ်သက်သော ကုန်ပစ္စည်း မရှိသေးပါ' : 'No favourite products yet')}
      </p>
      <Link href={kind === 'doctor' ? '/patient/doctors' : '/patient/records'}
        className="text-xs font-semibold mt-2" style={{ color: PRIMARY }}>
        {kind === 'doctor'
          ? (mm ? 'ဆရာဝန်များ ကြည့်ရန်' : 'Browse doctors')
          : (mm ? 'ကုန်ပစ္စည်းများ ကြည့်ရန်' : 'Browse products')}
      </Link>
    </div>
  );
}

export default function FavouritesPage() {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const [tab, setTab] = useState<'doctors' | 'products'>('doctors');
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<FavDoctor[]>([]);
  const [products, setProducts] = useState<FavProduct[]>([]);

  useEffect(() => {
    const phone = getPatientPhone();
    if (!phone) { setLoading(false); return; }
    Promise.all([
      fetch(`/api/patient/favorites/doctors?phone=${encodeURIComponent(phone)}&full=true`).then(r => r.json()),
      fetch(`/api/patient/favorites/products?phone=${encodeURIComponent(phone)}&full=true`).then(r => r.json()),
    ]).then(([d, p]) => {
      setDoctors(d.doctors ?? []);
      setProducts(p.products ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-full bg-gray-50 lg:bg-gray-100">
      <div className="lg:px-6 lg:py-6 lg:max-w-4xl lg:mx-auto">
        <div className="lg:rounded-2xl lg:overflow-hidden lg:bg-gray-50">

          {/* Hero */}
          <div className="-mt-18 pt-21 pb-6 px-4 lg:mt-0 lg:pt-8 lg:px-8 lg:rounded-t-2xl"
            style={{ background: `linear-gradient(180deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
            <h1 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-2">
              <Heart className="w-5 h-5 lg:w-6 lg:h-6 fill-white" />
              {mm ? 'ကြိုက်နှစ်သက်သည်များ' : 'My Favourites'}
            </h1>
            <p className="text-white/60 text-sm mt-1">{mm ? 'သင်ကြိုက်နှစ်သက်သော ဆရာဝန်နှင့် ကုန်ပစ္စည်းများ' : 'Doctors and products you\'ve saved'}</p>

            <div className="flex gap-1 rounded-xl p-1 mt-4 w-fit" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
              {(['doctors', 'products'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                  style={tab === t ? { backgroundColor: '#fff', color: PRIMARY } : { color: 'rgba(255,255,255,0.65)' }}>
                  {t === 'doctors' ? <Stethoscope className="w-3.5 h-3.5" /> : <Package className="w-3.5 h-3.5" />}
                  {t === 'doctors'
                    ? `${mm ? 'ဆရာဝန်' : 'Doctors'} · ${doctors.length}`
                    : `${mm ? 'ကုန်ပစ္စည်း' : 'Products'} · ${products.length}`}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="px-4 lg:px-8 py-5 pb-24">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
              </div>
            ) : tab === 'doctors' ? (
              doctors.length === 0 ? <EmptyState mm={mm} kind="doctor" /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {doctors.map(d => {
                    const name = mm ? d.name : (d.nameEn ?? d.name);
                    return (
                      <Link key={d.id} href={`/patient/doctors/${d.id}`}
                        className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex items-center gap-3 p-3 hover:shadow-sm transition-shadow">
                        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-50 flex items-center justify-center">
                          {d.imageUrl
                            ? <img src={d.imageUrl} alt={name} className="w-full h-full object-cover" />
                            : <span className="text-lg font-bold" style={{ color: PRIMARY }}>{d.name.charAt(0)}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate" style={{ color: PRIMARY }}>{name}</p>
                          <p className="text-xs text-gray-400 truncate">{d.specialty}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span className="text-[11px] font-semibold text-gray-600">{d.rating.toFixed(1)}</span>
                            </div>
                            <span className="text-[11px] font-bold" style={{ color: PRIMARY }}>{d.price.toLocaleString()} MMK</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )
            ) : (
              products.length === 0 ? <EmptyState mm={mm} kind="product" /> : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {products.map(p => {
                    const name = mm ? p.name : (p.nameEn ?? p.name);
                    return (
                      <Link key={p.id} href={`/patient/records/${p.id}`}
                        className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col hover:shadow-sm transition-shadow">
                        <div className="relative bg-gray-50 flex items-center justify-center" style={{ paddingBottom: '75%' }}>
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={name} className="absolute inset-0 w-full h-full object-cover" />
                          ) : (
                            <Package className="absolute inset-0 m-auto w-8 h-8 text-gray-300" />
                          )}
                        </div>
                        <div className="p-2.5 flex flex-col gap-1">
                          <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2">{name}</p>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-[10px] font-semibold text-gray-600">{p.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-sm font-bold" style={{ color: PRIMARY }}>{p.price.toLocaleString()} Ks</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
