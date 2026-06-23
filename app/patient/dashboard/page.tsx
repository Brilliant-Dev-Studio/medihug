'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  Search, Stethoscope, Calendar, FileText, Pill,
  Heart, Activity, AlertCircle, Brain, Baby, Eye,
  ChevronRight, Star, Clock, LayoutGrid,
  MapPin,
} from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';
import emptyLottie from '../../../public/lottie-empty.json';
import doctorLottie from '../../../public/lottie/Live chatbot.json';
import SpecialOffersBanner from '../../components/SpecialOffersBanner';
import AdSlider from '../../components/AdSlider';
import HealthBlogSlider from '../../components/HealthBlogSlider';
import PartnerClinicsSlider from '../../components/PartnerClinicsSlider';


type WeatherData = { temp: number; code: number; city: string };

function weatherEmoji(code: number): string {
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
      <div className="w-12 h-5 rounded-lg bg-white/20 animate-pulse" />
      <div className="w-16 h-3 rounded bg-white/15 animate-pulse" />
    </div>
  );

  return (
    <div className="flex flex-col items-end gap-0.5">
      <div className="flex items-center gap-1.5">
        <span className="text-xl leading-none">{weatherEmoji(weather.code)}</span>
        <span className="text-xl font-bold text-white leading-none">{weather.temp}°C</span>
      </div>
      {weather.city && (
        <div className="flex items-center gap-0.5">
          <MapPin className="w-2.5 h-2.5 text-white/50" />
          <span className="text-[10px] text-white/50">{weather.city}</span>
        </div>
      )}
    </div>
  );
}

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

const categories = [
  { icon: Stethoscope, mm: 'ဆရာဝန်\nတိုင်ပင်ရန်',    en: 'Consult\nDoctor',    color: '#0d2b6e', bg: '#eff6ff', href: '/patient/doctors' },
  { icon: Calendar,    mm: 'ချိန်းဆိုမှု\nဗုကင်',      en: 'Book\nAppointment', color: '#4facfe', bg: '#f0f9ff', href: '/patient/appointments' },
  { icon: Activity,    mm: 'BMI\nတိုင်းတာ',            en: 'BMI\nChecker',      color: '#10b981', bg: '#f0fdf4', href: '#' },
  { icon: FileText,    mm: 'ကျန်းမာရေး\nမှတ်တမ်း',    en: 'Health\nRecords',   color: '#8b5cf6', bg: '#f5f3ff', href: '/patient/records' },
  { icon: Pill,        mm: 'ဆေးညွှန်း\nများ',          en: 'Prescrip-\ntions',  color: '#f59e0b', bg: '#fffbeb', href: '#' },
  { icon: AlertCircle, mm: 'အရေးပေါ်\nကျန်းမာရေး',   en: 'Emergency\nCare',   color: '#ef4444', bg: '#fef2f2', href: '#' },
  { icon: Heart,       mm: 'သွေးပေါင်\nချိန်',         en: 'Blood\nPressure',  color: '#ec4899', bg: '#fdf2f8', href: '#' },
  { icon: Brain,       mm: 'AI ကျန်းမာရေး\nဆွေးနွေး', en: 'AI Health\nChat',  color: '#06b6d4', bg: '#ecfeff', href: '#' },
  { icon: Baby,        mm: 'မိခင်နှင့်\nကလေး',         en: 'Mother &\nChild',  color: '#f97316', bg: '#fff7ed', href: '#' },
  { icon: Eye,         mm: 'မျက်စိ\nဆေးခန်း',          en: 'Eye\nClinic',      color: '#6366f1', bg: '#eef2ff', href: '#' },
];

const ads = [
  { bg: '#0d2b6e', title_mm: 'ဆရာဝန်နှင့် တိုင်ပင်ဆွေးနွေးရန်', title_en: 'Consult a Doctor Online', desc_mm: 'Video Call ဖြင့် တိုက်ရိုက် ဆွေးနွေးနိုင်သည်', desc_en: 'Connect via live video call anytime' },
  { bg: '#1a6bcc', title_mm: 'အထူး လျှော့စျေး အစီအစဉ်', title_en: 'Special Discount Offer', desc_mm: 'ဆရာဝန် ချိန်းဆိုမှု ၁၀% လျှော့ပေးသည်', desc_en: '10% off on all appointments this month' },
];

const doctors = [
  { name_mm: 'ဒေါ်ကျော်ကျော်သိန်း', name_en: 'Dr. Kyaw Kyaw Thein', spec_mm: 'နှလုံးအထူးကု',   spec_en: 'Cardiologist',  rating: 4.9, price: 15000, img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face' },
  { name_mm: 'ဦးမောင်မောင်ဝင်း',     name_en: 'Dr. Maung Maung Win',  spec_mm: 'အရေပြားအထူးကု', spec_en: 'Dermatologist', rating: 4.8, price: 12000, img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face' },
  { name_mm: 'ဒေါ်သန်းသန်းမြင့်',   name_en: 'Dr. Than Than Myint',  spec_mm: 'ကလေးအထူးကု',   spec_en: 'Pediatrician',  rating: 4.7, price: 10000, img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop&crop=face' },
];

const upcomingAppointments: { doctor_mm: string; doctor_en: string; spec_mm: string; spec_en: string; date: string; time: string; img: string }[] = [
  // ချိန်းဆိုမှု မရှိသေးရင် array ကို ဗလာထားပါ
  // { doctor_mm: 'ဒေါ်ကျော်ကျော်သိန်း', doctor_en: 'Dr. Kyaw Kyaw Thein', spec_mm: 'နှလုံးအထူးကု', spec_en: 'Cardiologist', date: '25 Jun', time: '10:00 AM', img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face' },
];

export default function PatientDashboard() {
  const { lang } = useLang();
  const mm = lang === 'mm';

  return (
    <div className="bg-gray-50 min-h-full w-full" style={{ maxWidth: '100vw', overflowX: 'clip' }}>

      {/* ── Hero: header + search seamless ── */}
      <div
        className="px-4"
        style={{
          background: 'linear-gradient(180deg, #0d2b6e 0%, #1a6bcc 100%)',
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          marginTop: -72,
          paddingTop: 84,
          paddingBottom: 60,
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm text-white/60">{mm ? 'မင်္ဂလာပါ 👋' : 'Hello 👋'}</p>
            <h1 className="text-xl font-bold text-white">Patient User</h1>
          </div>
          <WeatherWidget />
        </div>
        <Link href="/patient/doctors" className="flex items-center gap-3 rounded-xl px-4 py-3.5 w-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
          <Search className="w-4 h-4 shrink-0" style={{ color: 'rgba(255,255,255,0.7)' }} />
          <span className="text-base" style={{ color: 'rgba(255,255,255,0.6)' }}>{mm ? 'ဆရာဝန် ရှာဖွေပါ...' : 'Search doctors...'}</span>
        </Link>
      </div>

      <div className="px-4 pb-4 space-y-3" style={{ marginTop: -44 }}>

        {/* ── Ad Banner (50% overlap on hero) ── */}
        <div className="overflow-hidden bg-white border border-gray-100 shadow-sm flex items-center px-4 py-3 gap-3" style={{ position: 'relative', zIndex: 10, borderRadius: 28 }}>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm leading-snug mb-0.5" style={{ color: '#0d2b6e' }}>
              {mm ? ads[0].title_mm : ads[0].title_en}
            </p>
            <p className="text-xs text-gray-400 mb-3 leading-snug">{mm ? ads[0].desc_mm : ads[0].desc_en}</p>
            <Link
              href="/patient/doctors"
              className="inline-flex items-center gap-1 text-xs font-bold px-4 py-2 rounded-full text-white"
              style={{ background: 'linear-gradient(135deg, #0d2b6e 0%, #1a6bcc 100%)' }}
            >
              {mm ? 'ချိန်းဆိုရန်' : 'Book Now'} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <Lottie
            animationData={doctorLottie}
            loop
            autoplay
            style={{ width: 110, height: 110, flexShrink: 0 }}
          />
        </div>

        {/* ── Categories ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base" style={{ color: '#0d2b6e' }}>
              {mm ? 'ဝန်ဆောင်မှု အမျိုးအစားများ' : 'Services'}
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {categories.slice(0, 5).map(({ icon: Icon, mm: labelMm, en: labelEn, color, bg, href }) => (
              <Link
                key={labelEn}
                href={href}
                className="flex flex-col items-center gap-1.5 px-0.5 py-2.5 bg-white rounded-xl border border-gray-100 active:scale-95 transition-all"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${bg} 0%, ${color}22 100%)`, border: `1.5px solid ${color}20` }}
                >
                  <Icon style={{ width: 20, height: 20, color }} />
                </div>
                <span className="text-xs font-semibold text-center whitespace-pre-line" style={{ color: '#374151' }}>
                  {mm ? labelMm : labelEn}
                </span>
              </Link>
            ))}
            <Link
              href="/patient/categories"
              className="flex flex-col items-center gap-1.5 px-0.5 py-2.5 bg-white rounded-xl border border-gray-100 active:scale-95 transition-all"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)', border: '1.5px solid #e5e7eb' }}
              >
                <LayoutGrid style={{ width: 20, height: 20, color: '#6b7280' }} />
              </div>
              <span className="text-xs font-semibold text-center" style={{ color: '#374151' }}>
                {mm ? 'နောက်ထပ်' : 'More'}
              </span>
            </Link>
          </div>
        </div>

        {/* ── Ads Slider ── */}
        <AdSlider />

        {/* ── Upcoming Appointments ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base" style={{ color: '#0d2b6e' }}>
              {mm ? 'လာမည့် ချိန်းဆိုမှုများ' : 'Upcoming Appointments'}
            </h2>
            <Link href="/patient/appointments" className="text-xs font-semibold flex items-center gap-0.5" style={{ color: '#4facfe' }}>
              {mm ? 'အားလုံး' : 'See all'} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 flex items-center gap-3 px-4 py-4">
              <Lottie
                animationData={emptyLottie}
                loop
                autoplay
                style={{ width: 72, height: 72, flexShrink: 0 }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-500">
                  {mm ? 'ချိန်းဆိုမှု မရှိသေးပါ' : 'No upcoming appointments'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {mm ? 'ဆရာဝန်နှင့် ချိန်းဆိုရန် နှိပ်ပါ' : 'Tap below to book a doctor'}
                </p>
              </div>
              <Link
                href="/patient/appointments"
                className="text-xs font-bold px-4 py-2 rounded-full text-white shrink-0"
                style={{ backgroundColor: '#0d2b6e' }}
              >
                {mm ? 'ချိန်းဆို' : 'Book'}
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {upcomingAppointments.map((a, i) => (
                <div key={i} className="bg-white rounded-xl px-3 py-3 border border-gray-100 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-gray-100">
                    <Image src={a.img} alt={a.doctor_en} width={44} height={44} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: '#0d2b6e' }}>
                      {mm ? a.doctor_mm : a.doctor_en}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">{a.date} · {a.time}</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0" style={{ backgroundColor: '#eff6ff', color: '#0d2b6e' }}>
                    {mm ? 'အတည်ပြု' : 'Confirmed'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Top Doctors ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base" style={{ color: '#0d2b6e' }}>
              {mm ? 'အကြံပြုသော ဆရာဝန်များ' : 'Top Doctors'}
            </h2>
            <Link href="/patient/doctors" className="text-xs font-semibold flex items-center gap-0.5" style={{ color: '#4facfe' }}>
              {mm ? 'အားလုံး' : 'See all'} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {doctors.map((d, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-100 bg-white">
                {/* Photo */}
                <div className="relative shrink-0">
                  <div
                    className="w-11 h-11 rounded-full overflow-hidden"
                    style={{ boxShadow: '0 0 0 2px #e8eeff, 0 0 0 3px #fff' }}
                  >
                    <Image src={d.img} alt={d.name_en} width={44} height={44} className="w-full h-full object-cover" />
                  </div>
                  <span
                    className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white"
                    style={{ backgroundColor: '#22c55e' }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs truncate" style={{ color: '#0d2b6e', lineHeight: '1.8' }}>
                    {mm ? d.name_mm : d.name_en}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="inline-block text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: '#eff6ff', color: '#1a6bcc', lineHeight: '1.8' }}
                    >
                      {mm ? d.spec_mm : d.spec_en}
                    </span>
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    <span className="text-[10px] font-bold" style={{ color: '#b45309' }}>{d.rating}</span>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: '#0d2b6e', lineHeight: '1.8' }}>
                    {d.price.toLocaleString()} {mm ? 'ကျပ်' : 'MMK'}
                  </span>
                </div>

                {/* Book button */}
                <Link
                  href="/patient/appointments"
                  className="text-xs font-bold px-3 py-1.5 rounded-full shrink-0 text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #0d2b6e 0%, #1a6bcc 100%)' }}
                >
                  {mm ? 'ချိန်းဆို' : 'Book'}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* ── Health Blog Categories ── */}
        <HealthBlogSlider />

        {/* ── Partner Clinics ── */}
        <PartnerClinicsSlider />

      </div>

      {/* ── Special Offers ── */}
      <SpecialOffersBanner />

    </div>
  );
}
