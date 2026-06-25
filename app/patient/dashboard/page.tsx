'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  Search, Stethoscope, Calendar, FileText, Pill,
  Heart, Activity, AlertCircle, Brain, Baby, Eye,
  ChevronRight, Star, Clock, LayoutGrid, MapPin,
} from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';
import emptyLottie from '../../../public/lottie-empty.json';
import doctorLottie from '../../../public/lottie/Live chatbot.json';
import SpecialOffersBanner from '../../components/SpecialOffersBanner';
import AdSlider from '../../components/AdSlider';
import HealthBlogSlider from '../../components/HealthBlogSlider';
import PartnerClinicsSlider from '../../components/PartnerClinicsSlider';
import BestSellingProducts from '../../components/BestSellingProducts';

const PRIMARY   = '#0d2b6e';
const SECONDARY = '#1a6bcc';
const ACCENT    = '#4facfe';

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

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

const categories = [
  { icon: Stethoscope, mm: 'ဆရာဝန်\nတိုင်ပင်ရန်',    en: 'Consult\nDoctor',    color: PRIMARY,   bg: '#eff6ff', href: '/patient/doctors' },
  { icon: Calendar,    mm: 'ချိန်းဆိုမှု\nဗုကင်',      en: 'Book\nAppointment', color: ACCENT,    bg: '#f0f9ff', href: '/patient/appointments' },
  { icon: Activity,    mm: 'BMI\nတိုင်းတာ',            en: 'BMI\nChecker',      color: '#10b981', bg: '#f0fdf4', href: '#' },
  { icon: FileText,    mm: 'ကျန်းမာရေး\nမှတ်တမ်း',    en: 'Health\nRecords',   color: '#8b5cf6', bg: '#f5f3ff', href: '/patient/records' },
  { icon: Pill,        mm: 'ဆေးညွှန်း\nများ',          en: 'Prescrip-\ntions',  color: '#f59e0b', bg: '#fffbeb', href: '#' },
  { icon: AlertCircle, mm: 'အရေးပေါ်\nကျန်းမာရေး',   en: 'Emergency\nCare',   color: '#ef4444', bg: '#fef2f2', href: '#' },
  { icon: Heart,       mm: 'သွေးပေါင်\nချိန်',         en: 'Blood\nPressure',  color: '#ec4899', bg: '#fdf2f8', href: '#' },
  { icon: Brain,       mm: 'AI ကျန်းမာရေး\nဆွေးနွေး', en: 'AI Health\nChat',  color: '#06b6d4', bg: '#ecfeff', href: '#' },
  { icon: Baby,        mm: 'မိခင်နှင့်\nကလေး',         en: 'Mother &\nChild',  color: '#f97316', bg: '#fff7ed', href: '#' },
  { icon: Eye,         mm: 'မျက်စိ\nဆေးခန်း',          en: 'Eye\nClinic',      color: '#6366f1', bg: '#eef2ff', href: '#' },
];

const doctors = [
  { id: 2, name_mm: 'ဒေါ်ကျော်ကျော်သိန်း', name_en: 'Dr. Kyaw Kyaw Thein', spec_mm: 'နှလုံးအထူးကု',   spec_en: 'Cardiologist',  rating: 4.9, price: 15000, img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face' },
  { id: 4, name_mm: 'ဦးမောင်မောင်ဝင်း',     name_en: 'Dr. Maung Maung Win',  spec_mm: 'အရေပြားအထူးကု', spec_en: 'Dermatologist', rating: 4.8, price: 12000, img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face' },
  { id: 3, name_mm: 'ဒေါ်သန်းသန်းမြင့်',   name_en: 'Dr. Than Than Myint',  spec_mm: 'ကလေးအထူးကု',   spec_en: 'Pediatrician',  rating: 4.7, price: 10000, img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop&crop=face' },
];

const upcomingAppointments: {
  doctor_mm: string; doctor_en: string; spec_mm: string; spec_en: string;
  date: string; time: string; img: string;
}[] = [];

export default function PatientDashboard() {
  const { lang } = useLang();
  const mm = lang === 'mm';

  return (
    <div className="bg-gray-50 min-h-full w-full lg:bg-gray-100 lg:min-h-screen">

      {/* Desktop container wrapper */}
      <div className="lg:max-w-7xl lg:mx-auto lg:px-6 lg:py-6 lg:flex lg:gap-5 lg:h-screen lg:overflow-hidden">

      {/* ════════════════ LEFT COLUMN ════════════════ */}
      <div className="flex-1 lg:overflow-y-auto lg:rounded-2xl lg:bg-gray-50">

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
          <Link
            href="/patient/doctors"
            className="flex items-center gap-3 rounded-2xl px-5 py-4 w-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <Search className="w-5 h-5 shrink-0 text-white/70" />
            <span className="text-base text-white/60">{mm ? 'ဆရာဝန် ရှာဖွေပါ...' : 'Search doctors...'}</span>
          </Link>
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

          {/* Health Blog */}
          <HealthBlogSlider />

          {/* Mobile-only: Top Doctors */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-base" style={{ color: PRIMARY }}>
                {mm ? 'အကြံပြုသော ဆရာဝန်များ' : 'Top Doctors'}
              </h2>
              <Link href="/patient/doctors" className="text-xs font-semibold flex items-center gap-0.5" style={{ color: ACCENT }}>
                {mm ? 'အားလုံး' : 'See all'} <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              {doctors.map((d, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-100 bg-white">
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full overflow-hidden" style={{ boxShadow: '0 0 0 2px #e8eeff, 0 0 0 3px #fff' }}>
                      <Image src={d.img} alt={d.name_en} width={44} height={44} className="w-full h-full object-cover" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white" style={{ backgroundColor: '#22c55e' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs truncate" style={{ color: PRIMARY }}>{mm ? d.name_mm : d.name_en}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#eff6ff', color: SECONDARY }}>
                        {mm ? d.spec_mm : d.spec_en}
                      </span>
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      <span className="text-[10px] font-bold text-amber-700">{d.rating}</span>
                    </div>
                    <span className="text-xs font-semibold" style={{ color: PRIMARY }}>{d.price.toLocaleString()} {mm ? 'ကျပ်' : 'MMK'}</span>
                  </div>
                  <Link href="/patient/appointments" className="text-xs font-bold px-3 py-1.5 rounded-full shrink-0 text-white" style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
                    {mm ? 'ချိန်းဆို' : 'Book'}
                  </Link>
                </div>
              ))}
            </div>
          </div>

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
                { label_mm: 'ချိန်းဆိုမှု', label_en: 'Appointments',  value: '0', color: PRIMARY,   bg: '#eff6ff' },
                { label_mm: 'မှတ်တမ်း',      label_en: 'Records',       value: '0', color: '#8b5cf6', bg: '#f5f3ff' },
                { label_mm: 'ဆေးညွှန်း',     label_en: 'Prescriptions', value: '0', color: '#f59e0b', bg: '#fffbeb' },
                { label_mm: 'ကြိုက်သော',     label_en: 'Favourites',    value: '0', color: '#ec4899', bg: '#fdf2f8' },
              ].map(s => (
                <div key={s.label_en} className="rounded-xl p-4" style={{ backgroundColor: s.bg }}>
                  <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{mm ? s.label_mm : s.label_en}</p>
                </div>
              ))}
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
              {doctors.map((d, i) => (
                <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden" style={{ boxShadow: `0 0 0 2px #e8eeff, 0 0 0 3px #fff` }}>
                      <Image src={d.img} alt={d.name_en} width={48} height={48} className="w-full h-full object-cover" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: '#22c55e' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: PRIMARY }}>{mm ? d.name_mm : d.name_en}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#eff6ff', color: SECONDARY }}>
                        {mm ? d.spec_mm : d.spec_en}
                      </span>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-amber-700">{d.rating}</span>
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
              ))}
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
