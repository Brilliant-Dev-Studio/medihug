'use client';
import { theme } from '../../lib/theme';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  Search, Stethoscope, Calendar, FileText, Pill,
  Heart, Activity, AlertCircle, Brain, Baby, Eye,
  ChevronRight, Star, Clock, LayoutGrid, MapPin,
  Bone, Droplets, Microscope, Syringe, Wind, Thermometer,
} from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';
import emptyLottie from '../../../public/lottie-empty.json';
import doctorLottie from '../../../public/lottie/Live chatbot.json';
import SpecialOffersBanner from '../../components/SpecialOffersBanner';
import AdSlider from '../../components/AdSlider';
import HealthBlogSlider from '../../components/HealthBlogSlider';
import BlogCategoryCircles from '../../components/BlogCategoryCircles';
import PartnerClinicsSlider from '../../components/PartnerClinicsSlider';
import BestSellingProducts from '../../components/BestSellingProducts';
import SpecialistDoctorsSection from '../../components/SpecialistDoctorsSection';
import OurSuggestingDoctorsSection from '../../components/OurSuggestingDoctorsSection';

const PRIMARY   = 'var(--color-primary)';
const SECONDARY = 'var(--color-primary-dark)';
const ACCENT    = 'var(--color-accent)';

type WeatherData = { temp: number; code: number; city: string };

function weatherIcon(code: number): string {
  if (code === 0)  return '☀️';
  if (code <= 3)   return '⛅';
  if (code <= 48)  return '🌫️';
  if (code <= 55)  return '🌦️';
  if (code <= 65)  return '🌧️';
  if (code <= 75)  return '❄️';
  if (code <= 82)  return '🌨️';
  return '⛈️';
}

function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const { latitude: lat, longitude: lon } = coords;
      try {
        const [wRes, gRes] = await Promise.all([
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`),
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`),
        ]);
        const wJson = await wRes.json();
        const gJson = await gRes.json();
        setWeather({
          temp: Math.round(wJson.current.temperature_2m),
          code: wJson.current.weather_code,
          city: gJson.address?.city || gJson.address?.town || gJson.address?.state || '',
        });
      } catch {}
    });
  }, []);

  if (!weather) return (
    <div className="flex flex-col items-end gap-1">
      <div className="w-16 h-6 rounded-lg bg-white/20 animate-pulse" />
      <div className="w-20 h-3 rounded bg-white/15 animate-pulse" />
    </div>
  );

  return (
    <div className="flex flex-col items-end gap-0.5">
      <div className="flex items-center gap-1.5">
        <span className="text-2xl leading-none">{weatherIcon(weather.code)}</span>
        <span className="text-2xl font-bold text-white leading-none">{weather.temp}°C</span>
      </div>
      {weather.city && (
        <div className="flex items-center gap-0.5">
          <MapPin className="w-3 h-3 text-white/50" />
          <span className="text-xs text-white/50">{weather.city}</span>
        </div>
      )}
    </div>
  );
}

/* ── Dashboard hero search box with dropdown autosuggest ── */
function DashboardDoctorSearchBox({ doctors, mm }: { doctors: DoctorItem[]; mm: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const q = value.trim().toLowerCase();
  const suggestions = q.length === 0 ? [] : doctors.filter(d =>
    d.name.toLowerCase().includes(q) ||
    (d.nameEn ?? '').toLowerCase().includes(q) ||
    d.specialty.toLowerCase().includes(q)
  ).slice(0, 6);

  return (
    <div ref={boxRef} className="relative w-full">
      <div className="flex items-center gap-3 rounded-2xl px-5 py-4 w-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
        <Search className="w-5 h-5 shrink-0 text-white/70" />
        <input
          value={value}
          onChange={e => { setValue(e.target.value); setOpen(true); setHi(0); }}
          onFocus={() => { if (value.trim()) setOpen(true); }}
          onKeyDown={e => {
            if (!open || suggestions.length === 0) return;
            if (e.key === 'ArrowDown') { e.preventDefault(); setHi(h => Math.min(h + 1, suggestions.length - 1)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setHi(h => Math.max(h - 1, 0)); }
            else if (e.key === 'Enter' && suggestions[hi]) { e.preventDefault(); setOpen(false); router.push(`/patient/doctors/${suggestions[hi].id}`); }
            else if (e.key === 'Escape') { setOpen(false); }
          }}
          placeholder={mm ? 'ဆရာဝန် ရှာဖွေပါ...' : 'Search doctors...'}
          className="flex-1 min-w-0 bg-transparent text-base outline-none placeholder:text-white/60 text-white"
        />
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden py-1.5">
          {suggestions.map((d, i) => {
            const name = mm ? d.name : (d.nameEn ?? d.name);
            return (
              <Link key={d.id} href={`/patient/doctors/${d.id}`}
                onClick={() => setOpen(false)}
                onMouseEnter={() => setHi(i)}
                className="flex items-center gap-3 px-3.5 py-2.5 transition-colors"
                style={{ backgroundColor: i === hi ? '#f3f4f6' : 'transparent' }}
              >
                <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                  {d.imageUrl
                    ? <img src={d.imageUrl} alt={name} className="w-full h-full object-cover" />
                    : <span className="text-xs font-bold" style={{ color: PRIMARY }}>{d.name.charAt(0)}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
                  <p className="text-xs text-gray-400 truncate">{d.specialty}</p>
                </div>
                <span className="text-xs font-bold shrink-0" style={{ color: PRIMARY }}>{d.price.toLocaleString()} MMK</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

const categories = [
  { icon: Stethoscope,  mm: 'ဆရာဝန်\nတိုင်ပင်ရန်',      en: 'Consult\nDoctor',      color: PRIMARY,   bg: '#eff6ff', href: '/patient/doctors' },
  { icon: Calendar,     mm: 'ချိန်းဆိုမှု\nများ',          en: 'My\nAppointments',    color: '#3b82f6', bg: '#eff6ff', href: '/patient/appointments' },
  { icon: Activity,     mm: 'BMI\nတိုင်းတာ',              en: 'BMI\nChecker',         color: '#10b981', bg: '#f0fdf4', href: '/patient/bmi' },
  { icon: FileText,     mm: 'ကျန်းမာရေး\nမှတ်တမ်း',      en: 'Health\nRecords',      color: '#8b5cf6', bg: '#f5f3ff', href: '/patient/records' },
  { icon: LayoutGrid,   mm: 'ကုသမှု\nအမျိုးအစား',         en: 'Categories',           color: '#f59e0b', bg: '#fffbeb', href: '/patient/categories' },
  { icon: Heart,        mm: 'ဆောင်းပါး\nများ',             en: 'Health\nBlog',         color: '#ef4444', bg: '#fef2f2', href: '/patient/blog' },
];

const specialtyCategories = [
  { icon: Heart,       mm: 'နှလုံး သွေးကြော\nအထူးကု',              en: 'Cardiology',                color: '#ef4444', bg: '#fef2f2', href: '/patient/doctors' },
  { icon: Baby,        mm: 'ကလေးကျန်းမာရေး\nအထူးကု',              en: 'Pediatrics',                color: '#f97316', bg: '#fff7ed', href: '/patient/doctors' },
  { icon: Brain,       mm: 'ဦးနောက်နှင့်\nအကြောအထူးကု',           en: 'Neurology',                 color: '#8b5cf6', bg: '#f5f3ff', href: '/patient/doctors' },
  { icon: Eye,         mm: 'မျက်စိ\nအထူးကု',                       en: 'Ophthalmology',             color: '#06b6d4', bg: '#ecfeff', href: '/patient/doctors' },
  { icon: Bone,        mm: 'အရိုးနှင့်\nဆစ်ကြောအထူးကု',            en: 'Orthopedics',               color: '#78716c', bg: '#f5f5f4', href: '/patient/doctors' },
  { icon: Droplets,    mm: 'ဆီးချို သွေးချို\nအထူးကု',             en: 'Endocrinology',             color: '#0ea5e9', bg: '#f0f9ff', href: '/patient/doctors' },
  { icon: Stethoscope, mm: 'အစာအိမ်နှင့် အူ\nလမ်းကြောင်းအထူးကု', en: 'Gastroenterology',          color: '#10b981', bg: '#f0fdf4', href: '/patient/doctors' },
  { icon: Activity,    mm: 'သားဖွားမီးယပ်\nအထူးကု',                en: 'Obstetrics & Gynecology',   color: '#ec4899', bg: '#fdf2f8', href: '/patient/doctors' },
  { icon: Brain,       mm: 'ကလေးစိတ်ကျန်းမာ\nရေးအထူးကု',          en: 'Child Psychiatry',          color: '#6366f1', bg: '#eef2ff', href: '/patient/doctors' },
  { icon: Wind,        mm: 'အဆုတ်နှင့်\nအသက်ရှူအထူးကု',            en: 'Pulmonology',               color: '#14b8a6', bg: '#f0fdfa', href: '/patient/doctors' },
  { icon: Microscope,  mm: 'ကင်ဆာ\nကုသမှုအထူးကု',                  en: 'Oncology',                  color: '#dc2626', bg: '#fef2f2', href: '/patient/doctors' },
  { icon: Droplets,    mm: 'ကျောက်ကပ်\nအထူးကု',                    en: 'Nephrology',                color: '#2563eb', bg: '#eff6ff', href: '/patient/doctors' },
  { icon: Syringe,     mm: 'အရေပြား\nအထူးကု',                      en: 'Dermatology',               color: '#d97706', bg: '#fffbeb', href: '/patient/doctors' },
  { icon: Thermometer, mm: 'ကူးစက်ရောဂါ\nအထူးကု',                  en: 'Infectious Disease',        color: '#16a34a', bg: '#f0fdf4', href: '/patient/doctors' },
];

interface DoctorItem {
  id: string; name: string; nameEn: string | null;
  specialty: string; rating: number; price: number; imageUrl: string | null;
}

const upcomingAppointments: {
  doctor_mm: string; doctor_en: string; spec_mm: string; spec_en: string;
  date: string; time: string; img: string;
}[] = [];

const AVATAR_COLORS = ['#2ab5ad', '#8b5cf6', '#f59e0b', '#3b82f6', '#10b981', '#ef4444'];

export default function PatientDashboard() {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [favCount, setFavCount] = useState(0);

  useEffect(() => {
    fetch('/api/doctors?limit=100')
      .then(r => r.json())
      .then(d => setDoctors(d.doctors ?? []));
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem('medihug_patient');
    if (!raw) return;
    const { phone } = JSON.parse(raw) as { phone: string };
    Promise.all([
      fetch(`/api/patient/favorites/doctors?phone=${encodeURIComponent(phone)}`).then(r => r.json()),
      fetch(`/api/patient/favorites/products?phone=${encodeURIComponent(phone)}`).then(r => r.json()),
    ]).then(([d, p]) => setFavCount((d.ids?.length ?? 0) + (p.ids?.length ?? 0))).catch(() => {});
  }, []);

  return (
    <div className="bg-gray-50 min-h-full w-full lg:bg-gray-100 lg:min-h-screen">

      {/* Desktop container wrapper */}
      <div className="lg:px-6 lg:py-6 lg:flex lg:gap-5 lg:h-screen lg:overflow-hidden">

      {/* ════════════════ LEFT COLUMN ════════════════ */}
      <div className="flex-1 min-w-0 lg:overflow-y-auto lg:rounded-2xl lg:bg-gray-50">

        {/* ── Hero ── */}
        <div
          className="-mt-18 pt-21 pb-16 px-4 lg:mt-0 lg:pt-8 lg:px-8 lg:rounded-t-2xl"
          style={{
            background: `linear-gradient(180deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-white/60 lg:text-base">{mm ? 'မင်္ဂလာပါ 👋' : 'Hello 👋'}</p>
              <h1 className="text-xl font-bold text-white lg:text-3xl lg:mt-1">Patient User</h1>
            </div>
            <WeatherWidget />
          </div>
          <DashboardDoctorSearchBox doctors={doctors} mm={mm} />
        </div>

        {/* ── Left content (overlaps hero bottom) ── */}
        <div className="px-4 lg:px-8 pb-8 flex flex-col gap-4 lg:gap-5 -mt-11">

          {/* Ad Banner */}
          <div
            className="overflow-hidden bg-white border border-gray-100 flex items-center px-4 py-3 gap-3 lg:px-6 lg:py-5 lg:gap-5"
            style={{ position: 'relative', zIndex: 10, borderRadius: 28 }}
          >
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm leading-snug mb-1 lg:text-lg lg:mb-2" style={{ color: PRIMARY }}>
                {mm ? 'ဆရာဝန်နှင့် တိုင်ပင်ဆွေးနွေးရန်' : 'Consult a Doctor Online'}
              </p>
              <p className="text-xs text-gray-400 mb-3 leading-snug lg:text-sm lg:mb-4">
                {mm ? 'Video Call ဖြင့် တိုက်ရိုက် ဆွေးနွေးနိုင်သည်' : 'Connect via live video call anytime'}
              </p>
              <Link
                href="/patient/doctors"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-5 py-2.5 rounded-full text-white lg:text-sm"
                style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}
              >
                {mm ? 'ချိန်းဆိုရန်' : 'Book Now'} <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <Lottie
              animationData={doctorLottie}
              loop autoplay
              style={{ width: 110, height: 110, flexShrink: 0 }}
            />
          </div>

          {/* Categories */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-base" style={{ color: PRIMARY }}>
                {mm ? 'ဝန်ဆောင်မှု အမျိုးအစားများ' : 'Services'}
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-2 lg:grid-cols-6 lg:gap-2">
              {categories.slice(0, 5).map(({ icon: Icon, mm: labelMm, en: labelEn, color, bg, href }) => (
                <Link
                  key={labelEn}
                  href={href}
                  className="flex flex-col items-center gap-1.5 px-1 py-3 bg-white rounded-xl border border-gray-100 active:scale-95 transition-all lg:py-3"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center lg:w-10 lg:h-10 lg:rounded-xl"
                    style={{ background: `linear-gradient(135deg, ${bg} 0%, ${color}22 100%)`, border: `1.5px solid ${color}20` }}
                  >
                    <Icon style={{ width: 20, height: 20, color }} />
                  </div>
                  <span className="text-xs font-semibold text-center whitespace-pre-line text-gray-700">
                    {mm ? labelMm : labelEn}
                  </span>
                </Link>
              ))}
              <Link
                href="/patient/categories"
                className="flex flex-col items-center gap-1.5 px-1 py-3 bg-white rounded-xl border border-gray-100 active:scale-95 transition-all lg:py-3"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center lg:w-10 lg:h-10"
                  style={{ background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)', border: '1.5px solid #e5e7eb' }}
                >
                  <LayoutGrid style={{ width: 20, height: 20, color: '#6b7280' }} />
                </div>
                <span className="text-xs font-semibold text-center text-gray-700">
                  {mm ? 'နောက်ထပ်' : 'More'}
                </span>
              </Link>
            </div>
          </div>

          {/* Ads Slider */}
          <AdSlider />

          {/* Upcoming Appointments */}
          <div>
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <h2 className="font-bold text-base lg:text-xl" style={{ color: PRIMARY }}>
                {mm ? 'လာမည့် ချိန်းဆိုမှုများ' : 'Upcoming Appointments'}
              </h2>
              <Link href="/patient/appointments" className="text-xs font-semibold flex items-center gap-0.5 lg:text-sm" style={{ color: ACCENT }}>
                {mm ? 'အားလုံး' : 'See all'} <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {upcomingAppointments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 flex items-center gap-4 px-5 py-5 lg:px-10 lg:py-10 lg:gap-8">
                <Lottie
                  animationData={emptyLottie}
                  loop autoplay
                  style={{ width: 80, height: 80, flexShrink: 0 }}
                  className="lg:w-28! lg:h-28!"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-500 lg:text-xl lg:font-bold">
                    {mm ? 'ချိန်းဆိုမှု မရှိသေးပါ' : 'No upcoming appointments'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 lg:text-base lg:mt-2">
                    {mm ? 'ဆရာဝန်နှင့် ချိန်းဆိုရန် နှိပ်ပါ' : 'Tap below to book a doctor'}
                  </p>
                </div>
                <Link
                  href="/patient/appointments"
                  className="text-xs font-bold px-5 py-2.5 rounded-full text-white shrink-0 lg:text-base lg:px-7 lg:py-3.5"
                  style={{ backgroundColor: PRIMARY }}
                >
                  {mm ? 'ချိန်းဆို' : 'Book Now'}
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2 lg:gap-4">
                {upcomingAppointments.map((a, i) => (
                  <div key={i} className="bg-white rounded-2xl px-4 py-4 border border-gray-100 flex items-center gap-4 lg:px-8 lg:py-6 lg:gap-6">
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-gray-100 lg:w-16 lg:h-16">
                      <Image src={a.img} alt={a.doctor_en} width={64} height={64} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate lg:text-lg lg:font-bold" style={{ color: PRIMARY }}>
                        {mm ? a.doctor_mm : a.doctor_en}
                      </p>
                      <p className="text-xs text-gray-400 lg:text-sm lg:mt-0.5">{mm ? a.spec_mm : a.spec_en}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 lg:mt-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-400 lg:text-sm">{a.date} · {a.time}</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 lg:text-sm lg:px-4 lg:py-2" style={{ backgroundColor: '#eff6ff', color: PRIMARY }}>
                      {mm ? 'အတည်ပြု' : 'Confirmed'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Blog Categories */}
          <BlogCategoryCircles />

          {/* Health Blog */}
          <HealthBlogSlider />

          {/* Specialist Doctors */}
          <SpecialistDoctorsSection />

          {/* Our Suggesting Doctors */}
          <OurSuggestingDoctorsSection />

          {/* Best Selling Products */}
          <BestSellingProducts />

          {/* Partner Clinics */}
          <PartnerClinicsSlider />

        </div>

        {/* Mobile Special Offers */}
        <div className="lg:hidden">
          <SpecialOffersBanner />
        </div>

      </div>
      {/* ════════ END LEFT COLUMN ════════ */}

      {/* ════════════════ RIGHT PANEL (desktop only) ════════════════ */}
      {/* Outer column: gray bg + padding so cards appear to "float" */}
      <div
        className="hidden lg:block shrink-0 overflow-y-auto bg-gray-100"
        style={{ width: 360 }}
      >
        {/* Sticky inner wrapper — cards float over the gray bg */}
        <div className="sticky top-0 flex flex-col gap-4 p-4 max-h-screen overflow-y-auto">

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-bold text-base mb-4" style={{ color: PRIMARY }}>
              {mm ? 'ကျန်းမာရေး အချက်အလက်' : 'Health Summary'}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label_mm: 'ချိန်းဆိုမှု', label_en: 'Appointments',  value: '0', color: PRIMARY,   bg: '#eff6ff', href: '/patient/appointments' },
                { label_mm: 'မှတ်တမ်း',      label_en: 'Records',       value: '0', color: '#8b5cf6', bg: '#f5f3ff', href: null },
                { label_mm: 'ဆေးညွှန်း',     label_en: 'Prescriptions', value: '0', color: '#f59e0b', bg: '#fffbeb', href: null },
                { label_mm: 'ကြိုက်သော',     label_en: 'Favourites',    value: String(favCount), color: '#ec4899', bg: '#fdf2f8', href: '/patient/favourites' },
              ].map(s => {
                const card = (
                  <div className="rounded-xl p-4" style={{ backgroundColor: s.bg }}>
                    <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{mm ? s.label_mm : s.label_en}</p>
                  </div>
                );
                return s.href
                  ? <Link key={s.label_en} href={s.href} className="hover:opacity-80 transition-opacity">{card}</Link>
                  : <div key={s.label_en}>{card}</div>;
              })}
            </div>
          </div>

          {/* Top Doctors */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base" style={{ color: PRIMARY }}>
                {mm ? 'အကြံပြုသော ဆရာဝန်များ' : 'Top Doctors'}
              </h3>
              <Link href="/patient/doctors" className="text-xs font-semibold flex items-center gap-0.5" style={{ color: ACCENT }}>
                {mm ? 'အားလုံး' : 'See all'} <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex flex-col divide-y divide-gray-100">
              {doctors.slice(0, 5).map((d, i) => {
                const displayName = mm ? d.name : (d.nameEn ?? d.name);
                return (
                  <div key={d.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center"
                        style={{ backgroundColor: `${AVATAR_COLORS[i % AVATAR_COLORS.length]}20`, boxShadow: '0 0 0 2px #e8eeff, 0 0 0 3px #fff' }}>
                        {d.imageUrl ? (
                          <img src={d.imageUrl} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-base font-bold" style={{ color: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                            {d.name.charAt(0)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate" style={{ color: PRIMARY }}>{displayName}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#eff6ff', color: SECONDARY }}>
                          {d.specialty}
                        </span>
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-amber-700">{d.rating.toFixed(1)}</span>
                      </div>
                      <p className="text-xs font-semibold mt-0.5" style={{ color: PRIMARY }}>
                        {d.price.toLocaleString()} {mm ? 'ကျပ်' : 'MMK'}
                      </p>
                    </div>
                    <Link
                      href={`/patient/doctors/${d.id}`}
                      className="text-xs font-bold px-3 py-2 rounded-full shrink-0 text-white"
                      style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}
                    >
                      {mm ? 'ကြည့်ရန်' : 'View'}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Special Offer */}
          <div
            className="rounded-2xl p-5 text-white"
            style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}
          >
            <p className="font-bold text-base mb-1">
              {mm ? 'အထူး လျှော့စျေး' : 'Special Offer'}
            </p>
            <p className="text-xs text-white/70 mb-4">
              {mm ? 'ဆရာဝန် ချိန်းဆိုမှု ၁၀% လျှော့ပေးသည်' : '10% off on all appointments this month'}
            </p>
            <Link
              href="/patient/doctors"
              className="inline-flex items-center gap-1 text-xs font-bold px-4 py-2 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              {mm ? 'ယခုပင် ချိန်းဆိုပါ' : 'Book Now'} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

        </div>
      </div>
      {/* ════════ END RIGHT PANEL ════════ */}

      </div>{/* end desktop container */}
    </div>
  );
}
