'use client';

import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ChevronLeft, GraduationCap, Languages, MapPin, Stethoscope, BriefcaseMedical, CheckCircle2, Hospital, Images, X, Sunrise, Sun, Sunset, Calendar, Clock } from 'lucide-react';
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
  bio_mm: string;
  bio_en: string;
  languages: string[];
  location: string;
  gallery: { img: string; caption_mm: string; caption_en: string }[];
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
    bio_mm: 'ပါမောက္ခသိန်းအောင်သည် နှစ် ၄၀ ကျော် ကလေးကျန်းမာရေး နယ်ပယ်တွင် တာဝန်ထမ်းဆောင်ခဲ့သည့် ဆရာဝန်ကြီးဖြစ်ပါသည်။ ကလေးသူငယ်များ၏ ရောဂါအထွေထွေ ကနေ ရှုပ်ထွေးသော ကိစ္စရပ်များအထိ ကုသပေးနိုင်သောသူဖြစ်ပြီး နိုင်ငံတကာ ဆေးပညာသင်တန်းများ တက်ရောက်ခဲ့ပါသည်။',
    bio_en: 'Prof. Dr. Thein Aung is a veteran pediatric specialist with over 43 years of experience. He has treated thousands of children across Myanmar and trained internationally in the UK. Known for his patient-centered approach and deep expertise in complex pediatric cases.',
    clinic_note_mm: 'ဆရာကြီးနှင့် Viber application မှတဆင့် ဆွေးနွေးတိုင်ပင်ရန် MyanCare facebook page တွင် booking ရယူနိုင်ပါသည်။',
    clinic_note_en: 'To consult with the doctor via Viber application, you can book through the MyanCare facebook page.',
    clinic_types_mm: ['အထွေထွေကလေးကျန်းမာရေး ပြသနာများ'],
    clinic_types_en: ['General Pediatric Health Issues'],
    languages: ['Myanmar', 'English'],
    location: 'Yangon.',
    gallery: [
      { img: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&h=400&fit=crop', caption_mm: 'ဆေးခန်းအတွင်း', caption_en: 'Clinic Interior' },
      { img: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&h=400&fit=crop', caption_mm: 'တိုင်ပင်ဆွေးနွေးခန်း', caption_en: 'Consultation Room' },
      { img: 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=600&h=400&fit=crop', caption_mm: 'ဆေးကိရိယာများ', caption_en: 'Medical Equipment' },
      { img: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop', caption_mm: 'လုပ်ငန်းခွင်', caption_en: 'Work Environment' },
      { img: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&h=400&fit=crop', caption_mm: 'ဆေးရုံ ပြင်ပ', caption_en: 'Hospital Exterior' },
      { img: 'https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?w=600&h=400&fit=crop', caption_mm: 'ဆေးစစ်ချက်', caption_en: 'Medical Checkup' },
    ],
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
    bio_mm: 'ဒေါ်ကျော်ကျော်သိန်းသည် နှလုံးနှင့် သွေးကြောဆိုင်ရာ ရောဂါများကို ကုသရာတွင် အတွေ့အကြုံ နှစ် ၂၈ ရှိသောဆရာဝန်ဖြစ်သည်။ UK တွင် FRCP ဘွဲ့ရရှိပြီးနောက် မြန်မာနိုင်ငံ၏ နှလုံးကျန်းမာရေးဝန်ဆောင်မှု ဖွံ့ဖြိုးတိုးတက်ရေးအတွက် ဆောင်ရွက်ခဲ့သည်။',
    bio_en: 'Dr. Kyaw Kyaw Thein is a seasoned cardiologist with 28 years of clinical experience. After earning his FRCP in the UK, he returned to Myanmar to advance cardiac care. He specializes in interventional cardiology and preventive heart health programs.',
    clinic_note_mm: 'နှလုံးနှင့် သွေးကြောဆိုင်ရာ ပြသနာများ ဆွေးနွေးနိုင်ပါသည်။',
    clinic_note_en: 'Available for consultation on heart and vascular issues.',
    clinic_types_mm: ['နှလုံးနှင့် သွေးကြောဆိုင်ရာ ပြသနာများ'],
    clinic_types_en: ['Heart and Vascular Issues'],
    languages: ['Myanmar', 'English'],
    location: 'Yangon.',
    gallery: [
      { img: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=600&h=400&fit=crop', caption_mm: 'နှလုံးဆိုင်ရာ စစ်ဆေးမှု', caption_en: 'Cardiac Checkup' },
      { img: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=600&h=400&fit=crop', caption_mm: 'ECG စစ်ဆေးမှု', caption_en: 'ECG Monitoring' },
      { img: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=600&h=400&fit=crop', caption_mm: 'ဆေးရုံ lab', caption_en: 'Hospital Lab' },
      { img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop', caption_mm: 'ကုသမှုခန်း', caption_en: 'Treatment Room' },
      { img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop', caption_mm: 'ဆေးရုံ ပြင်ပ', caption_en: 'Hospital Building' },
      { img: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=600&h=400&fit=crop', caption_mm: 'ဆေးကိရိယာများ', caption_en: 'Medical Devices' },
    ],
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
    bio_mm: 'ဒေါ်သန်းသန်းမြင့်သည် မန္တလေးတွင် ကလေးအထူးကု ဆေးခန်းဖွင့်လှစ်ကာ နှစ် ၁၈ ကျော် လူနာများကို ကုသပေးလျက်ရှိသည်။ ကလေးများ၏ ဖွံ့ဖြိုးတိုးတက်မှု စစ်ဆေးခြင်း နှင့် ကာကွယ်ဆေးထိုးနှံခြင်း အစီအစဉ်များတွင် အထူးကျွမ်းကျင်သည်။',
    bio_en: 'Dr. Than Than Myint has been serving pediatric patients in Mandalay for over 18 years. She runs a dedicated children\'s clinic focusing on growth monitoring, immunization programs, and early childhood illness management.',
    clinic_note_mm: 'ကလေးသူငယ်များ၏ ကျန်းမာရေးပြသနာများ ဆွေးနွေးနိုင်ပါသည်။',
    clinic_note_en: 'Available for pediatric health consultations.',
    clinic_types_mm: ['ကလေးကျန်းမာရေး ပြသနာများ'],
    clinic_types_en: ['Pediatric Health Issues'],
    languages: ['Myanmar'],
    location: 'Mandalay.',
    gallery: [
      { img: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&h=400&fit=crop', caption_mm: 'ကလေးဆေးခန်း', caption_en: 'Pediatric Clinic' },
      { img: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=600&h=400&fit=crop', caption_mm: 'ကလေးကျန်းမာရေး', caption_en: 'Child Healthcare' },
      { img: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&h=400&fit=crop', caption_mm: 'ကုသမှုခန်း', caption_en: 'Treatment Room' },
      { img: 'https://images.unsplash.com/photo-1629909615184-74f495363b67?w=600&h=400&fit=crop', caption_mm: 'ဆေးစစ်ချက်', caption_en: 'Health Screening' },
    ],
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
    bio_mm: 'ဦးမောင်မောင်ဝင်းသည် အရေပြားဆိုင်ရာ ရောဂါများ ကုသခြင်းနှင့် အသားအရေ ပြုစုစောင့်ရှောက်ခြင်းတွင် နှစ် ၁၂ ကျော် အတွေ့အကြုံရှိသည်။ Acne၊ Eczema၊ Psoriasis နှင့် Cosmetic Dermatology ကိစ္စများတွင် ကျွမ်းကျင်ပြီး Online consultation ကိုပါ ဝန်ဆောင်မှုပေးသည်။',
    bio_en: 'Dr. Maung Maung Win has over 12 years of experience in dermatology and aesthetic skin care. He specializes in acne, eczema, psoriasis, and cosmetic procedures. He offers both in-person and online consultations for skin concerns.',
    clinic_note_mm: 'အရေပြားဆိုင်ရာ ပြသနာများ ဆွေးနွေးနိုင်ပါသည်။',
    clinic_note_en: 'Available for skin-related consultations.',
    clinic_types_mm: ['အရေပြားဆိုင်ရာ ပြသနာများ'],
    clinic_types_en: ['Skin-related Issues'],
    languages: ['Myanmar', 'English'],
    location: 'Yangon.',
    gallery: [
      { img: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&h=400&fit=crop', caption_mm: 'အရေပြားကုခန်း', caption_en: 'Dermatology Clinic' },
      { img: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=400&fit=crop', caption_mm: 'အသားအရေ စစ်ဆေးမှု', caption_en: 'Skin Examination' },
      { img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=400&fit=crop', caption_mm: 'ကုသမှုပစ္စည်းများ', caption_en: 'Treatment Products' },
      { img: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=600&h=400&fit=crop', caption_mm: 'ဆေးခန်းပတ်ဝန်းကျင်', caption_en: 'Clinic Environment' },
    ],
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
    bio_mm: 'ဒေါ်နွဲ့နွဲ့မြင့်သည် မျက်စိကျန်းမာရေး နယ်ပယ်တွင် နှစ် ၂၂ ကျော် ဝန်ဆောင်မှုပေးလျက်ရှိပြီး Edinburgh တွင် FRCS ဘွဲ့ရရှိခဲ့သည်။ Cataract ခွဲစိတ်ကုသမှု၊ Glaucoma စီမံကိုင်တွယ်မှုနှင့် Refractive Surgery တို့တွင် ကျွမ်းကျင်ပြီး ရန်ကုန်မြို့တွင် ပင်မ ဆေးခန်းထားရှိသည်။',
    bio_en: 'Dr. Nwe Nwe Myint is an FRCS-qualified ophthalmologist with 22 years of experience based in Yangon. She specializes in cataract surgery, glaucoma management, and refractive procedures. She trained in Edinburgh and has performed thousands of successful eye surgeries.',
    clinic_note_mm: 'မျက်စိဆိုင်ရာ ပြသနာများ ဆွေးနွေးနိုင်ပါသည်။',
    clinic_note_en: 'Available for eye-related consultations.',
    clinic_types_mm: ['မျက်စိဆိုင်ရာ ပြသနာများ'],
    clinic_types_en: ['Eye-related Issues'],
    languages: ['Myanmar', 'English'],
    location: 'Yangon.',
    gallery: [
      { img: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600&h=400&fit=crop', caption_mm: 'မျက်စိဆေးခန်း', caption_en: 'Eye Clinic' },
      { img: 'https://images.unsplash.com/photo-1625217527288-93919d1cdd39?w=600&h=400&fit=crop', caption_mm: 'မျက်စိစစ်ဆေးမှု', caption_en: 'Eye Examination' },
      { img: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=600&h=400&fit=crop', caption_mm: 'ဆေးကိရိယာများ', caption_en: 'Optical Equipment' },
      { img: 'https://images.unsplash.com/photo-1524673360092-c0bd77c5a0bf?w=600&h=400&fit=crop', caption_mm: 'ကုသမှုခန်း', caption_en: 'Treatment Room' },
      { img: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&h=400&fit=crop', caption_mm: 'ဆေးရုံ ခန်းမ', caption_en: 'Hospital Ward' },
    ],
  },
];

type Tab = 'profile' | 'schedule';

function InfoCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100">
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
  const searchParams = useSearchParams();
  const { lang } = useLang();
  const mm = lang === 'mm';

  const [favorited, setFavorited]   = useState(false);
  const [tab, setTab]               = useState<Tab>(searchParams.get('tab') === 'schedule' ? 'schedule' : 'profile');
  const [lightbox, setLightbox]     = useState<number | null>(null);
  const [selectedDay,    setSelectedDay]    = useState(0);
  const [selectionMode,  setSelectionMode]  = useState<'single' | 'range'>('single');
  const [selectedSlot,   setSelectedSlot]   = useState<string | null>(null);
  const [rangeStart,     setRangeStart]     = useState<string | null>(null);
  const [rangeEnd,       setRangeEnd]       = useState<string | null>(null);
  const [hoveredSlot,    setHoveredSlot]    = useState<string | null>(null);

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

  /* ── Gallery grid (shared) ── */
  const GALLERY_MAX = 8;
  const galleryGrid = (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Images className="w-4 h-4" style={{ color: SECONDARY }} />
          <h3 className="text-sm font-bold" style={{ color: PRIMARY }}>{mm ? 'ဓာတ်ပုံများ' : 'Gallery'}</h3>
        </div>
        <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{doctor.gallery.length} {mm ? 'ပုံ' : 'photos'}</span>
      </div>
      <div className="p-3 grid grid-cols-2 lg:grid-cols-4 gap-2">
        {doctor.gallery.slice(0, GALLERY_MAX).map((g, i) => {
          const isLast = i === GALLERY_MAX - 1 && doctor.gallery.length > GALLERY_MAX;
          return (
            <button
              key={i}
              onClick={() => setLightbox(i)}
              className="relative overflow-hidden rounded-lg group"
              style={{ paddingBottom: '75%' }}
            >
              <Image
                src={g.img}
                alt={g.caption_en}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {isLast ? (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1">
                  <span className="text-white text-lg font-bold">+{doctor.gallery.length - GALLERY_MAX}</span>
                  <span className="text-white/70 text-[10px]">{mm ? 'ပိုမိုကြည့်ရန်' : 'more'}</span>
                </div>
              ) : (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  /* ── Tab content ── */
  const tabContent = tab === 'profile' ? (
    <>
      {/* ── Mobile: InfoCard list ── */}
      <div className="lg:hidden px-4 pt-4 pb-4 flex flex-col gap-3">
        <InfoCard icon={<BriefcaseMedical className="w-5 h-5" style={{ color: SECONDARY }} />} title={mm ? 'ဆွေးနွေးနိုင်သည့်အကြောင်းအရာ' : 'Consultation Topics'}>
          {doctor.clinic_types_mm.map((type, i) => (
            <div key={i} className="flex items-start gap-2 mb-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: ACCENT }} />
              <p className="text-sm text-gray-600">{mm ? type : doctor.clinic_types_en[i]}</p>
            </div>
          ))}
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">[ {mm ? doctor.clinic_note_mm : doctor.clinic_note_en} ]</p>
        </InfoCard>
        <InfoCard icon={<GraduationCap className="w-5 h-5" style={{ color: SECONDARY }} />} title={mm ? 'ဘွဲ့' : 'Qualifications'}>
          <p className="text-sm text-gray-600 leading-relaxed">{doctor.qualifications}</p>
        </InfoCard>
        <InfoCard icon={<Stethoscope className="w-5 h-5" style={{ color: SECONDARY }} />} title={mm ? 'ကိုယ်ရေးအကျဉ်း' : 'About'}>
          <p className="text-sm font-semibold text-gray-700 mb-1.5">{mm ? doctor.career_mm : doctor.career_en}</p>
          <p className="text-sm text-gray-500 leading-relaxed">{mm ? doctor.bio_mm : doctor.bio_en}</p>
        </InfoCard>
        <InfoCard icon={<Languages className="w-5 h-5" style={{ color: SECONDARY }} />} title={mm ? 'ဘာသာစကား' : 'Languages'}>
          <p className="text-sm text-gray-600">{doctor.languages.join(' | ')}</p>
        </InfoCard>
        <InfoCard icon={<MapPin className="w-5 h-5" style={{ color: SECONDARY }} />} title={mm ? 'လိပ်စာ' : 'Location'}>
          <div className="flex items-center gap-2">
            <Hospital className="w-4 h-4 shrink-0" style={{ color: ACCENT }} />
            <p className="text-sm text-gray-600">{doctor.location}</p>
          </div>
        </InfoCard>
        {galleryGrid}
      </div>

      {/* ── Desktop: Info grid ── */}
      <div className="hidden lg:block px-6 pt-3 pb-6">
        <div className="grid grid-cols-2 gap-2">

          {/* 1. Consultation Topics — full width */}
          <div className="col-span-2 bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: `${PRIMARY}0d` }}>
                <BriefcaseMedical className="w-3 h-3" style={{ color: PRIMARY }} />
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {mm ? 'ဆွေးနွေးနိုင်သည့် အကြောင်းအရာ' : 'Consultation Topics'}
              </p>
              <p className="text-[10px] text-gray-400 ml-auto italic truncate max-w-xs hidden xl:block">
                {mm ? doctor.clinic_note_mm : doctor.clinic_note_en}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
              {doctor.clinic_types_mm.map((type, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: ACCENT }} />
                  <p className="text-sm text-gray-700">{mm ? type : doctor.clinic_types_en[i]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Career + Bio */}
          <div className="col-span-2 bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: `${SECONDARY}0d` }}>
                <Stethoscope className="w-3 h-3" style={{ color: SECONDARY }} />
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider flex-1">{mm ? 'ကိုယ်ရေးအကျဉ်း' : 'About'}</p>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-gray-200 text-gray-500 shrink-0">
                {doctor.exp} {mm ? 'နှစ်' : 'yrs exp'}
              </span>
            </div>
            <p className="text-sm font-semibold text-gray-800 mb-1.5">{mm ? doctor.career_mm : doctor.career_en}</p>
            <p className="text-sm text-gray-500 leading-relaxed">{mm ? doctor.bio_mm : doctor.bio_en}</p>
          </div>

          {/* 3. Location */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-start gap-3">
            <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 bg-emerald-50">
              <MapPin className="w-3 h-3 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{mm ? 'နေရာ' : 'Location'}</p>
              <p className="text-sm font-semibold text-gray-800 leading-snug">{doctor.location}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0 mt-0.5">
              <Hospital className="w-3 h-3 text-gray-300" />
            </div>
          </div>

          {/* 4. Languages */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-start gap-3">
            <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: '#f5f3ff' }}>
              <Languages className="w-3 h-3" style={{ color: '#7c3aed' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">{mm ? 'ဘာသာစကား' : 'Languages'}</p>
              <div className="flex flex-wrap gap-1">
                {doctor.languages.map(lang => (
                  <span key={lang} className="text-xs font-medium px-2 py-0.5 rounded-full border border-gray-200 text-gray-600">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Qualifications */}
          <div className="col-span-2 bg-white border border-gray-100 rounded-xl p-4 flex items-start gap-3">
            <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 bg-amber-50">
              <GraduationCap className="w-3 h-3 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                {mm ? 'ဘွဲ့ / အရည်အချင်း' : 'Qualifications'}
              </p>
              <div className="flex flex-wrap gap-1">
                {doctor.qualifications.split('|').filter(q => q.trim()).map((q, i) => (
                  <span key={i} className="text-xs font-medium px-2 py-0.5 rounded-full border border-gray-200 text-gray-600">
                    {q.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 6. Gallery — full width */}
          <div className="col-span-2">
            {galleryGrid}
          </div>

        </div>
      </div>
    </>
  ) : (() => {
    /* ── static helpers ── */
    const today    = new Date();
    const DAY_MM   = ['တနင်္ဂနွေ','တနင်္လာ','အင်္ဂါ','ဗုဒ္ဓဟူး','ကြာသပတေး','သောကြာ','စနေ'];
    const DAY_EN   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const MONTH_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d;
    });

    function gen15Min(startH: number, endH: number) {
      const slots: string[] = [];
      let h = startH, m = 0;
      while (h < endH) {
        slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
        m += 15;
        if (m >= 60) { m = 0; h++; }
      }
      return slots;
    }

    function toMin(t: string) {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    }
    function fmtDuration(a: string, b: string) {
      const mins = Math.abs(toMin(b) - toMin(a)) + 15;
      const h = Math.floor(mins / 60), m = mins % 60;
      return h > 0 ? `${h} hr${m ? ` ${m} min` : ''}` : `${m} min`;
    }

    const periods = [
      { label_mm: 'မနက်ပိုင်း',   label_en: 'Morning',   Icon: Sunrise, iconColor: '#f97316', slots: gen15Min(9,  12) },
      { label_mm: 'နေ့လည်ပိုင်း', label_en: 'Afternoon', Icon: Sun,     iconColor: '#eab308', slots: gen15Min(13, 17) },
      { label_mm: 'ညနေပိုင်း',    label_en: 'Evening',   Icon: Sunset,  iconColor: '#6366f1', slots: gen15Min(17, 19) },
    ];

    const allSlots = periods.flatMap(p => p.slots);

    const BOOKED_SEEDS = [
      ['09:00','09:30','10:15','11:00','13:15','14:00','14:45','16:30','17:00','18:15'],
      ['09:15','10:00','10:45','13:00','13:45','15:00','15:30','16:00','17:30'],
      ['09:00','09:45','11:15','13:30','14:15','15:45','16:15','17:15','18:00'],
      ['10:30','11:00','13:00','14:30','15:00','16:45','17:00','17:45'],
      ['09:00','09:30','10:00','13:15','14:00','16:00','17:30','18:30'],
      ['09:45','10:30','11:15','13:45','15:15','16:30','17:15'],
      ['09:15','10:15','11:00','13:00','14:45','15:30','16:00','18:00'],
    ];
    const bookedSet = new Set(BOOKED_SEEDS[selectedDay % 7]);

    /* range helpers */
    const startIdx  = rangeStart   ? allSlots.indexOf(rangeStart)   : -1;
    const endIdx    = rangeEnd     ? allSlots.indexOf(rangeEnd)     : -1;
    const hoverIdx  = hoveredSlot  ? allSlots.indexOf(hoveredSlot)  : -1;
    const loIdx     = rangeEnd ? Math.min(startIdx, endIdx) : startIdx;
    const hiIdx     = rangeEnd ? Math.max(startIdx, endIdx) : (hoveredSlot && hoverIdx > startIdx ? hoverIdx : startIdx);

    /* reset helper */
    const resetAll = () => {
      setSelectedSlot(null);
      setRangeStart(null);
      setRangeEnd(null);
      setHoveredSlot(null);
    };

    /* day label */
    const dayLabel = `${DAY_EN[days[selectedDay].getDay()]} ${days[selectedDay].getDate()} ${MONTH_EN[days[selectedDay].getMonth()]}`;

    /* show confirm? */
    const showConfirm = selectionMode === 'single'
      ? selectedSlot !== null
      : (rangeStart !== null && rangeEnd !== null);

    return (
      <div className="px-4 lg:px-6 pt-4 pb-6 flex flex-col gap-4">

        {/* ── Mode toggle ── */}
        <div className="flex items-center gap-3">
          <div
            className="flex rounded-xl p-1 gap-1"
            style={{ backgroundColor: '#f3f4f6' }}
          >
            {(['single', 'range'] as const).map(mode => {
              const active = selectionMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => { setSelectionMode(mode); resetAll(); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all"
                  style={{
                    backgroundColor: active ? PRIMARY : 'transparent',
                    color: active ? '#fff' : '#6b7280',
                    boxShadow: active ? `0 2px 8px ${PRIMARY}35` : 'none',
                  }}
                >
                  <span>{mode === 'single' ? '◆' : '↔'}</span>
                  <span>{mode === 'single' ? (mm ? 'တစ်ကြိမ်' : 'Single') : (mm ? 'အပိုင်းအခြား' : 'Range')}</span>
                </button>
              );
            })}
          </div>
          {selectionMode === 'range' && (
            <p className="text-[11px] text-gray-400 leading-tight">
              {mm
                ? (rangeStart ? (rangeEnd ? '' : 'ကုန်ဆုံးချိန် ရွေးပါ') : 'စတင်ချိန် ရွေးပါ')
                : (rangeStart ? (rangeEnd ? '' : 'Pick end time') : 'Pick start time')
              }
            </p>
          )}
        </div>

        {/* ── Date selector ── */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {days.map((d, i) => {
            const active  = i === selectedDay;
            const isToday = i === 0;
            return (
              <button
                key={i}
                onClick={() => { setSelectedDay(i); resetAll(); }}
                className="shrink-0 flex flex-col items-center px-3.5 py-2.5 rounded-2xl transition-all"
                style={{
                  minWidth: 60,
                  backgroundColor: active ? PRIMARY : '#fff',
                  border: `1.5px solid ${active ? PRIMARY : '#e5e7eb'}`,
                  boxShadow: active ? `0 4px 14px ${PRIMARY}30` : 'none',
                }}
              >
                <span className="text-[10px] font-semibold" style={{ color: active ? 'rgba(255,255,255,0.7)' : '#9ca3af' }}>
                  {mm ? DAY_MM[d.getDay()] : DAY_EN[d.getDay()]}
                </span>
                <span className="text-lg font-bold leading-tight mt-0.5" style={{ color: active ? '#fff' : '#111827' }}>
                  {d.getDate()}
                </span>
                {isToday ? (
                  <span className="text-[9px] font-bold mt-0.5 px-1.5 py-0.5 rounded-full" style={{ backgroundColor: active ? 'rgba(255,255,255,0.25)' : '#eff6ff', color: active ? '#fff' : PRIMARY }}>
                    {mm ? 'ယနေ့' : 'Today'}
                  </span>
                ) : (
                  <span className="text-[10px] mt-0.5" style={{ color: active ? 'rgba(255,255,255,0.6)' : '#d1d5db' }}>
                    {MONTH_EN[d.getMonth()]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Legend ── */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {[
            { fill: '#fff',    border: '#e5e7eb', label_mm: 'ရနိုင်သည်',   label_en: 'Available' },
            { fill: PRIMARY,   border: PRIMARY,   label_mm: 'ရွေးချယ်',    label_en: 'Selected'  },
            { fill: '#f3f4f6', border: '#e5e7eb', label_mm: 'ပြည့်သည်',    label_en: 'Booked'    },
            ...(selectionMode === 'range' ? [
              { fill: '#eff6ff', border: '#bfdbfe', label_mm: 'ရွေးချယ်ထားသော အပိုင်း', label_en: 'In range' },
            ] : []),
          ].map(l => (
            <div key={l.label_en} className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-md border" style={{ backgroundColor: l.fill, borderColor: l.border }} />
              <span className="text-[11px] text-gray-500">{mm ? l.label_mm : l.label_en}</span>
            </div>
          ))}
        </div>

        {/* ── Time periods ── */}
        {periods.map(period => (
          <div key={period.label_en} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
              <period.Icon className="w-4 h-4 shrink-0" style={{ color: period.iconColor }} />
              <p className="text-sm font-bold" style={{ color: PRIMARY }}>
                {mm ? period.label_mm : period.label_en}
              </p>
              <span className="ml-auto text-[11px] text-gray-400">
                {period.slots[0]} – {period.slots[period.slots.length - 1]}
              </span>
            </div>
            <div className="p-3 grid grid-cols-4 lg:grid-cols-6 gap-2">
              {period.slots.map(slot => {
                const booked = bookedSet.has(slot);
                const idx    = allSlots.indexOf(slot);

                /* single mode */
                const isSingleSelected = selectionMode === 'single' && selectedSlot === slot;

                /* range mode */
                const isEndpoint   = selectionMode === 'range' && (slot === rangeStart || slot === rangeEnd);
                const isInRange    = selectionMode === 'range' && rangeStart !== null && rangeEnd !== null
                                     && idx > loIdx && idx < hiIdx;
                const isHoverRange = selectionMode === 'range' && rangeStart !== null && rangeEnd === null
                                     && hoverIdx > startIdx && idx > startIdx && idx <= hoverIdx;

                const bg = booked       ? '#f3f4f6'
                         : isSingleSelected || isEndpoint ? PRIMARY
                         : isInRange    ? '#eff6ff'
                         : isHoverRange ? '#f0f9ff'
                         : '#fff';
                const fg = booked       ? '#d1d5db'
                         : isSingleSelected || isEndpoint ? '#fff'
                         : isInRange    ? PRIMARY
                         : '#374151';
                const bd = booked       ? '#e5e7eb'
                         : isSingleSelected || isEndpoint ? PRIMARY
                         : isInRange    ? '#bfdbfe'
                         : isHoverRange ? '#93c5fd'
                         : '#e5e7eb';
                const shadow = (isSingleSelected || isEndpoint) ? `0 3px 10px ${PRIMARY}35` : 'none';

                const handleClick = () => {
                  if (booked) return;
                  if (selectionMode === 'single') {
                    setSelectedSlot(slot === selectedSlot ? null : slot);
                    return;
                  }
                  /* range mode */
                  if (!rangeStart) {
                    setRangeStart(slot);
                  } else if (!rangeEnd) {
                    if (slot === rangeStart) { setRangeStart(null); return; }
                    const lo = Math.min(allSlots.indexOf(rangeStart), idx);
                    const hi = Math.max(allSlots.indexOf(rangeStart), idx);
                    const blocked = allSlots.slice(lo + 1, hi).some(s => bookedSet.has(s));
                    if (blocked) return;
                    setRangeEnd(slot);
                    setHoveredSlot(null);
                  } else {
                    setRangeStart(slot); setRangeEnd(null); setHoveredSlot(null);
                  }
                };

                return (
                  <button
                    key={slot}
                    disabled={booked}
                    onClick={handleClick}
                    onMouseEnter={() => selectionMode === 'range' && !booked && setHoveredSlot(slot)}
                    onMouseLeave={() => selectionMode === 'range' && setHoveredSlot(null)}
                    className="rounded-xl py-2.5 text-xs font-semibold transition-all text-center"
                    style={{
                      backgroundColor: bg,
                      color: fg,
                      border: `1.5px solid ${bd}`,
                      boxShadow: shadow,
                      cursor: booked ? 'not-allowed' : 'pointer',
                      textDecoration: booked ? 'line-through' : 'none',
                    }}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* ── Confirm bar ── */}
        {showConfirm && (
          <div
            className="sticky bottom-0 -mx-4 lg:-mx-6 px-4 lg:px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3"
            style={{ backgroundColor: '#fff', boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}
          >
            <div className="min-w-0">
              <p className="text-xs text-gray-400 mb-0.5">
                {mm ? 'ရွေးချယ်ထားသောအချိန်' : 'Selected time'}
              </p>
              {selectionMode === 'single' ? (
                <p className="text-base font-bold truncate" style={{ color: PRIMARY }}>
                  {dayLabel} · {selectedSlot}
                </p>
              ) : (
                <div>
                  <p className="text-base font-bold leading-tight" style={{ color: PRIMARY }}>
                    {dayLabel} · {[rangeStart, rangeEnd].sort((a,b) => toMin(a!) - toMin(b!)).join(' → ')}
                  </p>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: ACCENT }}>
                    {fmtDuration(rangeStart!, rangeEnd!)}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={goToBooking}
              className="shrink-0 px-5 py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}
            >
              {mm ? 'ချိန်းဆိုမည်' : 'Confirm Booking'}
            </button>
          </div>
        )}

      </div>
    );
  })();

  /* shared booking navigation — used by sidebar button, mobile bottom bar, and confirm bar */
  function goToBooking() {
    if (!doctor) return;
    const hasSlot = selectionMode === 'single' ? selectedSlot !== null
                                                : (rangeStart !== null && rangeEnd !== null);
    if (!hasSlot) { setTab('schedule'); return; }

    const DAY_EN2   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const MONTH_EN2 = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const today2    = new Date();
    const days2     = Array.from({ length: 7 }, (_, i) => { const d = new Date(today2); d.setDate(today2.getDate() + i); return d; });
    const dayLabel2 = `${DAY_EN2[days2[selectedDay].getDay()]} ${days2[selectedDay].getDate()} ${MONTH_EN2[days2[selectedDay].getMonth()]}`;

    function toMin2(t: string) { const [h, m] = t.split(':').map(Number); return h * 60 + m; }
    function fmtDur(a: string, b: string) {
      const mins = Math.abs(toMin2(b) - toMin2(a)) + 15;
      const h = Math.floor(mins / 60), m = mins % 60;
      return h > 0 ? `${h} hr${m ? ` ${m} min` : ''}` : `${m} min`;
    }

    const sorted = selectionMode === 'range' && rangeStart && rangeEnd
      ? [rangeStart, rangeEnd].sort((a, b) => toMin2(a) - toMin2(b))
      : [selectedSlot ?? '', ''];

    const q = new URLSearchParams({
      doctorId: String(doctor.id),
      name:     doctor.name_en,
      nameMm:   doctor.name_mm,
      spec:     doctor.spec_en,
      specMm:   doctor.spec_mm,
      img:      doctor.img,
      date:     dayLabel2,
      start:    sorted[0],
      end:      sorted[1],
      duration: selectionMode === 'range' && rangeStart && rangeEnd ? fmtDur(rangeStart, rangeEnd) : '',
      fee:      doctor.price.toLocaleString(),
    });
    router.push(`/patient/booking?${q.toString()}`);
  }

  return (
    <div className="min-h-full bg-gray-50 lg:bg-gray-100">

      {/* ══ DESKTOP: h-screen two-column ══ */}
      <div className="hidden lg:flex gap-5 h-screen overflow-hidden px-6 py-6">

        {/* Left: scrollable content */}
        <div className="flex-1 overflow-y-auto rounded-2xl bg-gray-50 flex flex-col">

          {/* Gradient hero */}
          <div
            className="px-6 pt-8 pb-5 rounded-t-2xl shrink-0"
            style={{ background: `linear-gradient(180deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}
          >
            {/* Back / Title / Heart */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-opacity hover:opacity-80"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                <ChevronLeft className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">{mm ? 'နောက်သို့' : 'Back'}</span>
              </button>
              <h1 className="text-base font-bold text-white">{mm ? 'ဆရာဝန်အကြောင်း' : 'Doctor Info'}</h1>
              <button
                onClick={() => setFavorited(p => !p)}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                <Heart className="w-5 h-5" style={{ color: favorited ? '#fca5a5' : 'rgba(255,255,255,0.8)', fill: favorited ? '#fca5a5' : 'transparent' }} />
              </button>
            </div>
            {/* Tabs */}
            <div className="flex gap-2 rounded-2xl p-1" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              {(['profile', 'schedule'] as Tab[]).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ backgroundColor: tab === t ? '#fff' : 'transparent', color: tab === t ? PRIMARY : 'rgba(255,255,255,0.7)' }}
                >
                  {t === 'profile' ? (mm ? 'ကိုယ်ရေးအကျဉ်း' : 'Profile') : (mm ? 'အချိန်ဇယား' : 'Schedule')}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          {tabContent}
        </div>

        {/* Right: doctor card + booking */}
        <div className="shrink-0 w-72 flex flex-col gap-4">

          {/* Doctor summary card */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Photo banner */}
            <div className="relative w-full" style={{ height: 200 }}>
              <Image src={doctor.img} alt={doctor.name_en} fill className="object-cover" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,43,110,0.7) 0%, transparent 60%)' }} />
              <div className="absolute bottom-3 left-4 right-4">
                <p className="text-white font-bold text-base leading-tight">{mm ? doctor.name_mm : doctor.name_en}</p>
                <p className="text-white/80 text-xs mt-0.5">{mm ? doctor.spec_mm : doctor.spec_en}</p>
              </div>
              {doctor.online && (
                <span className="absolute top-3 right-3 text-[10px] font-bold text-white px-2 py-0.5 rounded-full" style={{ backgroundColor: '#22c55e' }}>
                  {mm ? 'အွန်လိုင်း' : 'Online'}
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
              {[
                { label: mm ? 'အတွေ့အကြုံ' : 'Experience', value: `${doctor.exp}${mm ? 'နှစ်' : 'yrs'}` },
                { label: mm ? 'နေရာ' : 'Location',   value: doctor.location.replace('.','') },
                { label: mm ? 'ဘာသာ' : 'Languages',  value: doctor.languages.length.toString() },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center py-3 px-2">
                  <p className="text-sm font-bold" style={{ color: PRIMARY }}>{s.value}</p>
                  <p className="text-[10px] text-gray-400 text-center leading-tight mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Details */}
            <div className="p-4 flex flex-col gap-2.5">
              <div className="flex items-start gap-2.5">
                <GraduationCap className="w-4 h-4 shrink-0 mt-0.5" style={{ color: SECONDARY }} />
                <p className="text-xs text-gray-500 leading-relaxed">{doctor.qualifications}</p>
              </div>
              <div className="flex items-center gap-2.5">
                <Languages className="w-4 h-4 shrink-0" style={{ color: SECONDARY }} />
                <p className="text-xs text-gray-500">{doctor.languages.join(' · ')}</p>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 shrink-0" style={{ color: SECONDARY }} />
                <p className="text-xs text-gray-500">{doctor.location}</p>
              </div>
            </div>
          </div>

          {/* Booking card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4">
            {/* Selected slot display */}
            {(() => {
              const DAY_EN_S   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
              const MONTH_EN_S = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
              const today_s    = new Date();
              const d_s        = new Date(today_s); d_s.setDate(today_s.getDate() + selectedDay);
              const dl         = `${DAY_EN_S[d_s.getDay()]} ${d_s.getDate()} ${MONTH_EN_S[d_s.getMonth()]}`;
              const hasSingle  = selectionMode === 'single' && selectedSlot;
              const hasRange   = selectionMode === 'range' && rangeStart && rangeEnd;

              function toMin_s(t: string) { const [h, m] = t.split(':').map(Number); return h * 60 + m; }
              const sortedRange = hasRange
                ? [rangeStart!, rangeEnd!].sort((a, b) => toMin_s(a) - toMin_s(b))
                : null;
              const durMins = sortedRange
                ? Math.abs(toMin_s(sortedRange[1]) - toMin_s(sortedRange[0])) + 15
                : null;
              const dur = durMins
                ? (Math.floor(durMins / 60) > 0
                    ? `${Math.floor(durMins / 60)} hr${durMins % 60 ? ` ${durMins % 60} min` : ''}`
                    : `${durMins} min`)
                : null;

              if (!hasSingle && !hasRange) return (
                <div
                  className="flex items-center gap-2.5 px-3 py-3 rounded-xl"
                  style={{ backgroundColor: '#f8faff', border: '1px dashed #bfdbfe' }}
                >
                  <Clock className="w-4 h-4 shrink-0 text-gray-300" />
                  <p className="text-xs text-gray-400">
                    {mm ? 'အချိန်ဇယားမှ အချိန်ရွေးပါ' : 'Select a time from Schedule'}
                  </p>
                </div>
              );

              return (
                <div
                  className="px-3 py-3 rounded-xl flex flex-col gap-1"
                  style={{ backgroundColor: '#eff6ff', border: `1px solid ${PRIMARY}20` }}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: SECONDARY }} />
                    <p className="text-xs font-semibold" style={{ color: PRIMARY }}>{dl}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: SECONDARY }} />
                    <p className="text-sm font-bold" style={{ color: PRIMARY }}>
                      {hasSingle
                        ? selectedSlot
                        : `${sortedRange![0]} → ${sortedRange![1]}`}
                    </p>
                    {dur && (
                      <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${PRIMARY}15`, color: PRIMARY }}>
                        {dur}
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}

            <div>
              <p className="text-xs text-gray-400 mb-1">{mm ? 'တိုင်ပင်ဆွေးနွေးခ' : 'Consultation Fee'}</p>
              <p className="text-2xl font-bold" style={{ color: PRIMARY }}>
                {doctor.price.toLocaleString()} <span className="text-sm font-semibold text-gray-400">MMK</span>
              </p>
            </div>
            <button
              onClick={goToBooking}
              className="block w-full text-center text-sm font-bold py-3.5 rounded-xl text-white transition-opacity hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}
            >
              {mm ? 'ချိန်းဆိုမည်' : 'Book Appointment'}
            </button>
            <button
              onClick={() => setFavorited(p => !p)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all"
              style={{
                borderColor: favorited ? '#fca5a5' : '#e5e7eb',
                color: favorited ? '#ef4444' : '#6b7280',
                backgroundColor: favorited ? '#fef2f2' : 'transparent',
              }}
            >
              <Heart className="w-4 h-4" style={{ fill: favorited ? '#ef4444' : 'transparent', color: favorited ? '#ef4444' : '#6b7280' }} />
              {favorited ? (mm ? 'သိမ်းဆည်းပြီး' : 'Saved') : (mm ? 'သိမ်းဆည်းမည်' : 'Save Doctor')}
            </button>
          </div>
        </div>
      </div>

      {/* ══ MOBILE ══ */}
      <div className="lg:hidden min-h-full pb-36">
        {/* Gradient hero */}
        <div
          className="-mt-18 pt-21 px-4 pb-5"
          style={{
            background: `linear-gradient(180deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => router.back()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl active:opacity-70" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <ChevronLeft className="w-4 h-4 text-white" />
              <span className="text-sm font-semibold text-white">{mm ? 'နောက်သို့' : 'Back'}</span>
            </button>
            <h1 className="text-base font-bold text-white">{mm ? 'ဆရာဝန်အကြောင်း' : 'Doctor Info'}</h1>
            <button onClick={() => setFavorited(p => !p)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <Heart className="w-5 h-5" style={{ color: favorited ? '#fca5a5' : 'rgba(255,255,255,0.8)', fill: favorited ? '#fca5a5' : 'transparent' }} />
            </button>
          </div>
          <div className="flex gap-4 items-center mb-5">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/30">
                <Image src={doctor.img} alt={doctor.name_en} width={80} height={80} className="w-full h-full object-cover" />
              </div>
              {doctor.online && <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-white" style={{ backgroundColor: '#22c55e' }} />}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white leading-tight">{mm ? doctor.name_mm : doctor.name_en}</h2>
              <p className="text-sm text-white/70 mt-0.5">{mm ? doctor.spec_mm : doctor.spec_en}</p>
              <p className="text-sm text-white/70 mt-0.5">{mm ? `အတွေ့အကြုံ (${doctor.exp}) နှစ်` : `${doctor.exp} years experience`}</p>
            </div>
          </div>
          <div className="flex gap-2 rounded-2xl p-1" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            {(['profile', 'schedule'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ backgroundColor: tab === t ? '#fff' : 'transparent', color: tab === t ? PRIMARY : 'rgba(255,255,255,0.7)' }}
              >
                {t === 'profile' ? (mm ? 'ကိုယ်ရေးအကျဉ်း' : 'Profile') : (mm ? 'အချိန်ဇယား' : 'Schedule')}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        {tabContent}

        {/* Bottom bar */}
        <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 px-4 pt-3 pb-4 z-30">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-sm text-gray-500">{mm ? 'တိုင်ပင်ဆွေးနွေးခ' : 'Consultation Fee'}</span>
            <span className="text-sm text-gray-400">-</span>
            <span className="text-xl font-bold" style={{ color: PRIMARY }}>{doctor.price.toLocaleString()} MMK</span>
          </div>
          <button onClick={goToBooking} className="block w-full text-center text-base font-bold py-4 rounded-2xl text-white active:scale-95 transition-transform" style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
            {mm ? 'ချိန်းဆိုမည်' : 'Book Appointment'}
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {lightbox > 0 && (
            <button
              onClick={e => { e.stopPropagation(); setLightbox(lightbox - 1); }}
              className="absolute left-4 w-10 h-10 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          )}

          <div
            className="relative mx-16 rounded-2xl overflow-hidden shadow-2xl"
            style={{ width: 'min(720px, 90vw)', height: 'min(480px, 60vh)' }}
            onClick={e => e.stopPropagation()}
          >
            <Image src={doctor.gallery[lightbox].img} alt={doctor.gallery[lightbox].caption_en} fill className="object-cover" />
            <div className="absolute bottom-0 left-0 right-0 px-5 py-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)' }}>
              <p className="text-white text-sm font-semibold">
                {mm ? doctor.gallery[lightbox].caption_mm : doctor.gallery[lightbox].caption_en}
              </p>
              <p className="text-white/60 text-xs mt-0.5">{lightbox + 1} / {doctor.gallery.length}</p>
            </div>
          </div>

          {lightbox < doctor.gallery.length - 1 && (
            <button
              onClick={e => { e.stopPropagation(); setLightbox(lightbox + 1); }}
              className="absolute right-4 w-10 h-10 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white rotate-180" />
            </button>
          )}

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
            {doctor.gallery.map((_, i) => (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); setLightbox(i); }}
                className="rounded-full transition-all"
                style={{ width: i === lightbox ? 20 : 6, height: 6, backgroundColor: i === lightbox ? '#fff' : 'rgba(255,255,255,0.4)' }}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
