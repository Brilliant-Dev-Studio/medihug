'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Star, Stethoscope, Loader2, Calendar, Briefcase, Languages, MapPin } from 'lucide-react';
import { useLang } from '@/app/lib/LanguageContext';

const PRIMARY = '#0d2b6e';

type Doctor = {
  id: string;
  name: string;
  nameEn: string | null;
  specialty: string;
  specialtyEn: string | null;
  bio: string | null;
  imageUrl: string | null;
  experience: number;
  rating: number;
  reviewCount: number;
  patientPrice: number;
  qualifications: string | null;
  careerMm: string | null;
  careerEn: string | null;
  languages: string[];
  location: string | null;
  isActive: boolean;
};

export default function PublicDoctorDetailPage() {
  const { id }   = useParams();
  const { lang } = useLang();
  const mm       = lang === 'mm';
  const router   = useRouter();

  const [doctor,   setDoctor]   = useState<Doctor | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/doctors/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => { setDoctor(d.doctor); setLoading(false); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [id]);

  function handleBookNow() {
    let isAuthed = false;
    try { isAuthed = !!JSON.parse(localStorage.getItem('medihug_patient') ?? 'null')?.phone; } catch {}
    router.push(isAuthed ? `/patient/doctors/${id}` : '/signin');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: PRIMARY }} />
      </div>
    );
  }

  if (notFound || !doctor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center px-6">
        <Stethoscope className="w-12 h-12 text-gray-200" />
        <p className="text-gray-400">{mm ? 'ဆရာဝန် မတွေ့ပါ' : 'Doctor not found'}</p>
        <Link href="/doctors" className="text-sm font-semibold" style={{ color: PRIMARY }}>
          ← {mm ? 'ပြန်သွားမည်' : 'Back to doctors'}
        </Link>
      </div>
    );
  }

  const name = mm ? doctor.name : (doctor.nameEn ?? doctor.name);
  const specialty = mm ? doctor.specialty : (doctor.specialtyEn ?? doctor.specialty);
  const career = mm ? doctor.careerMm : (doctor.careerEn ?? doctor.careerMm);

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Link href="/doctors" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6">
          <ChevronLeft className="w-4 h-4" /> {mm ? 'ဆရာဝန်များသို့' : 'Back to Doctors'}
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-gray-100">
            {doctor.imageUrl ? (
              <Image src={doctor.imageUrl} alt={name} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover object-top" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-white"
                style={{ background: `linear-gradient(160deg, ${PRIMARY} 0%, #1a3a8f 100%)` }}>
                {doctor.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{specialty}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{name}</h1>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="w-4 h-4" fill={s < Math.round(doctor.rating) ? '#f59e0b' : 'none'} stroke={s < Math.round(doctor.rating) ? '#f59e0b' : '#d1d5db'} />
                ))}
              </div>
              <span className="text-sm text-gray-500">{doctor.rating.toFixed(1)} ({doctor.reviewCount})</span>
            </div>

            <p className="text-3xl font-extrabold" style={{ color: PRIMARY }}>
              {doctor.patientPrice.toLocaleString()} <span className="text-base font-semibold text-gray-400">MMK</span>
            </p>

            <button
              onClick={handleBookNow}
              className="inline-flex items-center justify-center gap-2 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity w-full sm:w-fit"
              style={{ backgroundColor: PRIMARY }}
            >
              <Calendar className="w-4 h-4" />
              {mm ? 'ချိန်းဆိုမည်' : 'Book Now'}
            </button>

            {doctor.bio && <p className="text-sm text-gray-500 leading-relaxed">{doctor.bio}</p>}

            <ul className="flex flex-col gap-2.5 mt-2">
              <li className="flex items-center gap-2.5 text-sm text-gray-600">
                <Briefcase className="w-4 h-4 shrink-0" style={{ color: PRIMARY }} />
                {doctor.experience} {mm ? 'နှစ် အတွေ့အကြုံ' : 'years of experience'}
              </li>
              {doctor.qualifications && (
                <li className="flex items-center gap-2.5 text-sm text-gray-600">
                  <Stethoscope className="w-4 h-4 shrink-0" style={{ color: PRIMARY }} />
                  {doctor.qualifications}
                </li>
              )}
              {doctor.languages?.length > 0 && (
                <li className="flex items-center gap-2.5 text-sm text-gray-600">
                  <Languages className="w-4 h-4 shrink-0" style={{ color: PRIMARY }} />
                  {doctor.languages.join(', ')}
                </li>
              )}
              {doctor.location && (
                <li className="flex items-center gap-2.5 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 shrink-0" style={{ color: PRIMARY }} />
                  {doctor.location}
                </li>
              )}
            </ul>

            {career && (
              <div className="mt-2">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">{mm ? 'အတွေ့အကြုံ' : 'Career'}</p>
                <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap">{career}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
