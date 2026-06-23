'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ChevronLeft, GraduationCap, Languages, MapPin, Stethoscope, BriefcaseMedical, CheckCircle2, Hospital, CalendarX2 } from 'lucide-react';
import { useLang } from '../../../lib/LanguageContext';

const PRIMARY   = '#0d2b6e';
const SECONDARY = '#1a6bcc';
const ACCENT    = '#4facfe';

type Doctor = {
  id: number;
  name_mm: string;
  name_en: string;
  spec_mm: string;
  spec_en: string;
  exp: number;
  price: number;
  img: string;
  online: boolean;
  qualifications: string;
  career_mm: string;
  career_en: string;
  clinic_note_mm: string;
  clinic_note_en: string;
  clinic_types_mm: string[];
  clinic_types_en: string[];
  languages: string[];
  location: string;
};

const ALL_DOCTORS: Doctor[] = [
  {
    id: 1,
    name_mm: 'ပါမောက္ခသိန်းအောင်',
    name_en: 'Prof. Dr. Thein Aung',
    spec_mm: 'ကလေးကျန်းမာရေးအထူးကု',
    spec_en: 'Pediatric Specialist',
    exp: 43,
    price: 22000,
    img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face',
    online: true,
    qualifications: 'M.B.,B.S | DCH (London) | MRCP (UK) | FRCP (Edin) | Dr.Med.Sc (Paed) |',
    career_mm: 'ကလေးအထူးကုဆရာဝန်ကြီး',
    career_en: 'Senior Pediatric Specialist',
    clinic_note_mm: 'ဆရာကြီးနှင့် Viber application မှတဆင့် ဆွေးနွေးတိုင်ပင်ရန် MyanCare facebook page တွင် booking ရယူနိုင်ပါသည်။',
    clinic_note_en: 'To consult with the doctor via Viber application, you can book through the MyanCare facebook page.',
    clinic_types_mm: ['အထွေထွေကလေးကျန်းမာရေး ပြသနာများ'],
    clinic_types_en: ['General Pediatric Health Issues'],
    languages: ['Myanmar', 'English'],
    location: 'Yangon.',
  },
  {
    id: 2,
    name_mm: 'ဒေါ်ကျော်ကျော်သိန်း',
    name_en: 'Dr. Kyaw Kyaw Thein',
    spec_mm: 'နှလုံးအထူးကု',
    spec_en: 'Cardiologist',
    exp: 28,
    price: 15000,
    img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face',
    online: true,
    qualifications: 'M.B.,B.S | M.Med.Sc (Cardiology) | FRCP (UK) |',
    career_mm: 'နှလုံးအထူးကုဆရာဝန်',
    career_en: 'Cardiologist',
    clinic_note_mm: 'နှလုံးနှင့် သွေးကြောဆိုင်ရာ ပြသနာများ ဆွေးနွေးနိုင်ပါသည်။',
    clinic_note_en: 'Available for consultation on heart and vascular issues.',
    clinic_types_mm: ['နှလုံးနှင့် သွေးကြောဆိုင်ရာ ပြသနာများ'],
    clinic_types_en: ['Heart and Vascular Issues'],
    languages: ['Myanmar', 'English'],
    location: 'Yangon.',
  },
  {
    id: 3,
    name_mm: 'ဒေါ်သန်းသန်းမြင့်',
    name_en: 'Dr. Than Than Myint',
    spec_mm: 'ကလေးအထူးကု',
    spec_en: 'Pediatrician',
    exp: 18,
    price: 10000,
    img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face',
    online: false,
    qualifications: 'M.B.,B.S | DCH | M.Med.Sc (Paed) |',
    career_mm: 'ကလေးအထူးကုဆရာဝန်',
    career_en: 'Pediatrician',
    clinic_note_mm: 'ကလေးသူငယ်များ၏ ကျန်းမာရေးပြသနာများ ဆွေးနွေးနိုင်ပါသည်။',
    clinic_note_en: 'Available for pediatric health consultations.',
    clinic_types_mm: ['ကလေးကျန်းမာရေး ပြသနာများ'],
    clinic_types_en: ['Pediatric Health Issues'],
    languages: ['Myanmar'],
    location: 'Mandalay.',
  },
  {
    id: 4,
    name_mm: 'ဦးမောင်မောင်ဝင်း',
    name_en: 'Dr. Maung Maung Win',
    spec_mm: 'အရေပြားအထူးကု',
    spec_en: 'Dermatologist',
    exp: 12,
    price: 12000,
    img: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face',
    online: true,
    qualifications: 'M.B.,B.S | Dip.Derm | M.Med.Sc (Derm) |',
    career_mm: 'အရေပြားအထူးကုဆရာဝန်',
    career_en: 'Dermatologist',
    clinic_note_mm: 'အရေပြားဆိုင်ရာ ပြသနာများ ဆွေးနွေးနိုင်ပါသည်။',
    clinic_note_en: 'Available for skin-related consultations.',
    clinic_types_mm: ['အရေပြားဆိုင်ရာ ပြသနာများ'],
    clinic_types_en: ['Skin-related Issues'],
    languages: ['Myanmar', 'English'],
    location: 'Yangon.',
  },
  {
    id: 5,
    name_mm: 'ဒေါ်နွဲ့နွဲ့မြင့်',
    name_en: 'Dr. Nwe Nwe Myint',
    spec_mm: 'မျက်စိအထူးကု',
    spec_en: 'Ophthalmologist',
    exp: 22,
    price: 18000,
    img: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=200&h=200&fit=crop&crop=face',
    online: false,
    qualifications: 'M.B.,B.S | D.O | M.Med.Sc (Ophth) | FRCS (Edin) |',
    career_mm: 'မျက်စိအထူးကုဆရာဝန်',
    career_en: 'Ophthalmologist',
    clinic_note_mm: 'မျက်စိဆိုင်ရာ ပြသနာများ ဆွေးနွေးနိုင်ပါသည်။',
    clinic_note_en: 'Available for eye-related consultations.',
    clinic_types_mm: ['မျက်စိဆိုင်ရာ ပြသနာများ'],
    clinic_types_en: ['Eye-related Issues'],
    languages: ['Myanmar', 'English'],
    location: 'Yangon.',
  },
];

type Tab = 'profile' | 'schedule';

function InfoCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <h3 className="font-bold text-base" style={{ color: PRIMARY }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function DoctorDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { lang } = useLang();
  const mm = lang === 'mm';

  const [favorited, setFavorited] = useState(false);
  const [tab, setTab] = useState<Tab>('profile');

  const doctor = ALL_DOCTORS.find(d => d.id === Number(id));

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <p className="text-gray-400 text-sm">{mm ? 'ဆရာဝန် မတွေ့ပါ' : 'Doctor not found'}</p>
        <Link href="/patient/doctors" className="text-sm font-semibold" style={{ color: PRIMARY }}>
          {mm ? 'ပြန်သွားမည်' : 'Go back'}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-36">

      {/* Gradient Hero — replaces separate white header + white profile section */}
      <div
        className="px-4 pb-5"
        style={{
          background: `linear-gradient(180deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          marginTop: -72,
          paddingTop: 84,
        }}
      >
        {/* Back / Title / Heart row */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl active:opacity-70 transition-opacity"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <ChevronLeft className="w-4 h-4 text-white" />
            <span className="text-sm font-semibold text-white">{mm ? 'နောက်သို့' : 'Back'}</span>
          </button>

          <h1 className="text-base font-bold text-white">
            {mm ? 'ဆရာဝန်အကြောင်း' : 'Doctor Info'}
          </h1>

          <button
            onClick={() => setFavorited(prev => !prev)}
            className="w-9 h-9 rounded-full flex items-center justify-center active:opacity-70 transition-opacity"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <Heart
              className="w-5 h-5"
              style={{
                color: favorited ? '#fca5a5' : 'rgba(255,255,255,0.8)',
                fill: favorited ? '#fca5a5' : 'transparent',
              }}
            />
          </button>
        </div>

        {/* Doctor Profile */}
        <div className="flex gap-4 items-center mb-5">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/30">
              <Image
                src={doctor.img}
                alt={doctor.name_en}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
            {doctor.online && (
              <span
                className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-white"
                style={{ backgroundColor: '#22c55e' }}
              />
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-bold text-white leading-tight">
              {mm ? doctor.name_mm : doctor.name_en}
            </h2>
            <p className="text-sm text-white/70 mt-0.5">
              {mm ? doctor.spec_mm : doctor.spec_en}
            </p>
            <p className="text-sm text-white/70 mt-0.5">
              {mm ? `အတွေ့အကြုံ (${doctor.exp}) နှစ်` : `${doctor.exp} years experience`}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 rounded-2xl p-1" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
          <button
            onClick={() => setTab('profile')}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              backgroundColor: tab === 'profile' ? '#fff' : 'transparent',
              color: tab === 'profile' ? PRIMARY : 'rgba(255,255,255,0.7)',
            }}
          >
            {mm ? 'ကိုယ်ရေးအကျဉ်း' : 'Profile'}
          </button>
          <button
            onClick={() => setTab('schedule')}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              backgroundColor: tab === 'schedule' ? '#fff' : 'transparent',
              color: tab === 'schedule' ? PRIMARY : 'rgba(255,255,255,0.7)',
            }}
          >
            {mm ? 'အချိန်ဇယား' : 'Schedule'}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {tab === 'profile' ? (
        <div className="px-4 pt-4 flex flex-col gap-3">

          {/* Clinic topics */}
          <InfoCard
            icon={<BriefcaseMedical className="w-5 h-5" style={{ color: SECONDARY }} />}
            title={mm ? 'ဆွေးနွေးနိုင်သည့်အကြောင်းအရာ' : 'Consultation Topics'}
          >
            {doctor.clinic_types_mm.map((type, i) => (
              <div key={i} className="flex items-start gap-2 mb-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: ACCENT }} />
                <p className="text-sm text-gray-600">{mm ? type : doctor.clinic_types_en[i]}</p>
              </div>
            ))}
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              [ {mm ? doctor.clinic_note_mm : doctor.clinic_note_en} ]
            </p>
          </InfoCard>

          {/* Qualifications */}
          <InfoCard
            icon={<GraduationCap className="w-5 h-5" style={{ color: SECONDARY }} />}
            title={mm ? 'ဘွဲ့' : 'Qualifications'}
          >
            <p className="text-sm text-gray-600 leading-relaxed">{doctor.qualifications}</p>
          </InfoCard>

          {/* Career */}
          <InfoCard
            icon={<Stethoscope className="w-5 h-5" style={{ color: SECONDARY }} />}
            title={mm ? 'ကိုယ်ရေးအကျဉ်း' : 'Career'}
          >
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 shrink-0" style={{ color: ACCENT }} />
              <p className="text-sm text-gray-600">{mm ? doctor.career_mm : doctor.career_en}</p>
            </div>
          </InfoCard>

          {/* Languages */}
          <InfoCard
            icon={<Languages className="w-5 h-5" style={{ color: SECONDARY }} />}
            title={mm ? 'ဘာသာစကား' : 'Languages'}
          >
            <p className="text-sm text-gray-600">{doctor.languages.join(' | ')}</p>
          </InfoCard>

          {/* Location */}
          <InfoCard
            icon={<MapPin className="w-5 h-5" style={{ color: SECONDARY }} />}
            title={mm ? 'လိပ်စာ' : 'Location'}
          >
            <div className="flex items-center gap-2">
              <Hospital className="w-4 h-4 shrink-0" style={{ color: ACCENT }} />
              <p className="text-sm text-gray-600">{doctor.location}</p>
            </div>
          </InfoCard>

        </div>
      ) : (
        <div className="px-4 pt-4 flex flex-col gap-3">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-2">
            <CalendarX2 className="w-12 h-12 text-gray-300" />
            <p className="text-sm font-semibold text-gray-400">
              {mm ? 'အချိန်ဇယား မရှိသေးပါ' : 'No schedule available yet'}
            </p>
          </div>
        </div>
      )}

      {/* Bottom Bar — sits above bottom nav (h-16 = 64px) */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 px-4 pt-3 pb-4 z-30 lg:bottom-0">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-sm text-gray-500">{mm ? 'တိုင်ပင်ဆွေးနွေးခ' : 'Consultation Fee'}</span>
          <span className="text-sm text-gray-400">-</span>
          <span className="text-xl font-bold" style={{ color: PRIMARY }}>
            {doctor.price.toLocaleString()} MMK
          </span>
        </div>
        <Link
          href="/patient/appointments"
          className="block w-full text-center text-base font-bold py-4 rounded-2xl text-white active:scale-95 transition-transform"
          style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}
        >
          {mm ? 'ချိန်းဆိုမည်' : 'Book Appointment'}
        </Link>
      </div>
    </div>
  );
}
