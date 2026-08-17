'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Star, Stethoscope, ArrowRight, ArrowLeft, ChevronRight } from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';

const PRIMARY = '#0d2b6e';

interface Specialty { id: string; name: string; nameEn: string | null; }

interface Doctor {
  id: string; name: string; nameEn: string | null;
  specialty: string; imageUrl: string | null;
  experience: number; rating: number; reviewCount: number; price: number; patientPrice: number;
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

/* ── Step 1: full-page specialty picker ── */
function SpecialtyPicker({ onPick }: { onPick: (name: string) => void }) {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');

  useEffect(() => {
    fetch('/api/admin/specialties')
      .then(r => r.json())
      .then(d => { setSpecialties(d.specialties ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = specialties.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || (s.nameEn ?? '').toLowerCase().includes(q);
  });

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10 sm:py-14">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{mm ? 'ဆရာဝန်များ' : 'Our Doctors'}</h1>
        <p className="text-sm text-gray-500 mt-1.5">{mm ? 'အထူးကုဌာနအလိုက် ရွေးချယ်ပြီး ဆရာဝန်များကို ကြည့်ရှုပါ' : 'Pick a specialty to see the doctors under it'}</p>

        <div className="relative mt-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={mm ? 'အထူးကုဌာန ရှာဖွေရန်...' : 'Search specialties...'}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[#0d2b6e] transition-colors"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-6">
            {Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
            <Stethoscope className="w-10 h-10 text-gray-200" />
            <p className="text-sm">{mm ? 'အထူးကုဌာန မတွေ့ပါ' : 'No specialties found'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-6">
            {filtered.map(s => {
              const label = mm ? s.name : (s.nameEn ?? s.name);
              return (
                <button
                  key={s.id}
                  onClick={() => onPick(s.name)}
                  className="flex items-center justify-between gap-2 bg-white border border-gray-200 rounded-xl px-4 py-4 text-left font-bold text-gray-800 transition-colors hover:border-teal-300 hover:text-teal-600"
                >
                  <span className="leading-snug">{label}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Step 2: doctors under the chosen specialty ── */
function DoctorsBySpecialty({ spec, highlight, onBack }: { spec: string; highlight: string; onBack: () => void }) {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const highlightRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/doctors?limit=60&specialty=${encodeURIComponent(spec)}`)
      .then(r => r.json())
      .then(d => { setDoctors(d.doctors ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [spec]);

  useEffect(() => {
    if (!highlight || loading || !highlightRef.current) return;
    highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlight, loading]);

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10 sm:py-14">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> {mm ? 'အထူးကုဌာနများ' : 'All Specialties'}
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{spec}</h1>
        <p className="text-sm text-gray-500 mt-1.5">
          {loading ? (mm ? 'ရှာနေသည်...' : 'Loading...') : `${doctors.length} ${mm ? 'ဆရာဝန်' : doctors.length === 1 ? 'doctor' : 'doctors'}`}
        </p>

        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : doctors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
              <Stethoscope className="w-10 h-10 text-gray-200" />
              <p className="text-sm">{mm ? 'ဆရာဝန် မတွေ့ပါ' : 'No doctors found'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {doctors.map(d => {
                const name = mm ? d.name : (d.nameEn ?? d.name);
                const isHighlighted = d.id === highlight;
                return (
                  <Link key={d.id} href={`/patient/doctors/${d.id}`}
                    ref={isHighlighted ? highlightRef : undefined}
                    className={`rounded-2xl border bg-white overflow-hidden flex flex-col hover:shadow-md transition-shadow ${
                      isHighlighted ? 'border-2 ring-4' : 'border-gray-100'
                    }`}
                    style={isHighlighted ? { borderColor: PRIMARY, ['--tw-ring-color' as string]: `${PRIMARY}33` } : undefined}>
                    <div className="relative w-full h-48 bg-gray-50">
                      {d.imageUrl ? (
                        <Image src={d.imageUrl} alt={name} fill className="object-cover object-top" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white"
                          style={{ background: `linear-gradient(160deg, ${PRIMARY} 0%, #1a3a8f 100%)` }}>
                          {d.name.charAt(0)}
                        </div>
                      )}
                      <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: PRIMARY }}>
                        {d.specialty}
                      </span>
                    </div>
                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <h3 className="text-sm font-bold text-gray-800 leading-snug line-clamp-2">{name}</h3>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-semibold text-gray-700">{d.rating.toFixed(1)}</span>
                          {d.reviewCount > 0 && <span>({d.reviewCount})</span>}
                        </div>
                        <span>{d.experience} {mm ? 'နှစ်' : 'yrs'}</span>
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                        <p className="text-sm font-bold" style={{ color: PRIMARY }}>{d.patientPrice.toLocaleString()} MMK</p>
                        <span className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: PRIMARY }}>
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

function DoctorsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const spec = searchParams.get('spec') ?? '';
  const highlight = searchParams.get('highlight') ?? '';

  if (spec) {
    return (
      <DoctorsBySpecialty
        spec={spec}
        highlight={highlight}
        onBack={() => router.push('/doctors')}
      />
    );
  }

  return (
    <SpecialtyPicker onPick={name => router.push(`/doctors?spec=${encodeURIComponent(name)}`)} />
  );
}

export default function DoctorsPage() {
  return (
    <Suspense fallback={null}>
      <DoctorsPageInner />
    </Suspense>
  );
}
