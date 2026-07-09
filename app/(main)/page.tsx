'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Star, CheckCircle2 } from 'lucide-react';
import BlurText from '../components/BlurText';
import AdSlider from '../components/AdSlider';
import HealthCategories from '../components/HealthCategories';
import TopSellingProducts from '../components/TopSellingProducts';
import Testimonials from '../components/Testimonials';
import OurDoctors from '../components/OurDoctors';
import PartnerClinics from '../components/PartnerClinics';
import BlogArticles from '../components/BlogArticles';
import SpecialOffersBanner from '../components/SpecialOffersBanner';
import { useLang } from '../lib/LanguageContext';

const PRIMARY = '#0d2b6e';

export default function Home() {
  const { tr, lang } = useLang();
  const mm = lang === 'mm';

  const stats = [
    { value: '100%', label: mm ? 'အတည်ပြုပြီးသား ဆရာဝန်များ' : 'Verified Doctors' },
    { value: '24/7', label: mm ? 'အမြဲတမ်း ဝန်ဆောင်မှု' : 'Always Available' },
    { value: mm ? 'အခမဲ့' : 'Free', label: mm ? 'စာရင်းသွင်းရန်' : 'To Join' },
  ];
  const specialties = mm
    ? ['အထွေထွေ', 'နှလုံးရောဂါကု', 'ကလေးရောဂါကု']
    : ['General', 'Cardiology', 'Pediatrics'];

  return (
    <>
    <section className="w-full bg-white py-12 sm:py-20 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

        {/* Left: copy */}
        <div>
          <motion.span
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full pl-1.5 pr-3.5 py-1.5 mb-6"
          >
            <span className="w-5 h-5 rounded-md border flex items-center justify-center shrink-0" style={{ borderColor: PRIMARY }}>
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            </span>
            <span className="text-xs sm:text-sm font-semibold text-gray-700">{tr.heroBadge}</span>
          </motion.span>

          <BlurText
            text={tr.heroTitle}
            delay={80}
            animateBy="words"
            direction="top"
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-[1.08] mb-6 justify-start"
          />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-gray-500 text-sm sm:text-lg max-w-md mb-8 leading-relaxed"
          >
            {tr.heroDesc}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.42 }}
            className="flex items-center gap-5 mb-12"
          >
            <Link href="/register" className="text-white font-semibold px-7 py-3.5 rounded-full text-sm sm:text-base hover:opacity-90 transition-opacity" style={{ backgroundColor: PRIMARY }}>
              {tr.getCareNow}
            </Link>
            <Link href="/patient/booking" className="font-semibold text-sm sm:text-base hover:underline underline-offset-4" style={{ color: PRIMARY }}>
              {tr.noInsurance}
            </Link>
          </motion.div>

          <div className="flex items-center gap-8 sm:gap-10">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.54 + i * 0.08 }}
              >
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">{s.value}</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1 leading-snug">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: image + floating cards */}
        <div className="relative mx-auto w-full max-w-sm sm:max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative w-full aspect-[4/5] rounded-[2rem] overflow-hidden bg-gray-100"
          >
            <Image
              src="/doctors.jpg"
              alt="Doctor"
              fill
              quality={100}
              unoptimized
              sizes="(min-width: 640px) 448px, 384px"
              className="object-cover"
              style={{ objectPosition: '50% 20%' }}
              priority
            />
          </motion.div>

          {/* Floating pills */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="absolute top-5 right-2 sm:-right-4 flex items-center gap-1.5 bg-white shadow-lg rounded-full pl-2 pr-3.5 py-2"
          >
            <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: PRIMARY }}>
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            </span>
            <span className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">{mm ? 'ဗီဒီယိုကုသမှု' : 'Video Consultation'}</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.62 }}
            className="absolute top-20 sm:top-24 right-0 sm:-right-8 flex items-center gap-1.5 bg-white shadow-lg rounded-full pl-2 pr-3.5 py-2"
          >
            <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: PRIMARY }}>
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            </span>
            <span className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">{mm ? 'တိုက်ရိုက်တွေ့ဆုံမှု' : 'In-Person Visit'}</span>
          </motion.div>

          {/* Stat chip top-left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.74 }}
            className="absolute top-1/3 -translate-y-1/2 -left-4 sm:-left-10 text-white rounded-2xl px-4 py-3.5 shadow-lg max-w-32.5"
            style={{ backgroundColor: PRIMARY }}
          >
            <p className="text-lg font-extrabold leading-tight">{mm ? 'အတည်ပြုပြီး' : 'Verified'}</p>
            <p className="text-xs text-white/70 mt-0.5 leading-snug">{mm ? 'ကျွမ်းကျင်ဆရာဝန်များ' : 'Certified Doctors'}</p>
          </motion.div>

          {/* Specialty pills card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.86 }}
            className="absolute bottom-24 -left-4 sm:-left-10 bg-white shadow-xl rounded-2xl px-4 py-3.5 max-w-60"
          >
            <p className="text-sm font-bold text-gray-800 mb-2">{mm ? 'ဆေးကုဌာနများ' : 'Popular Specialties'}</p>
            <div className="flex flex-wrap gap-1.5">
              {specialties.map(s => (
                <span key={s} className="text-[11px] font-semibold px-2.5 py-1 rounded-full border" style={{ color: PRIMARY, borderColor: `${PRIMARY}40` }}>
                  + {s}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Stat chip bottom-right */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.98 }}
            className="absolute -bottom-4 -right-3 sm:-right-8 text-white rounded-2xl px-4 py-3.5 shadow-lg max-w-35"
            style={{ backgroundColor: PRIMARY }}
          >
            <p className="text-lg font-extrabold leading-tight">{mm ? 'လုံခြုံစိတ်ချရ' : 'Secure'}</p>
            <p className="text-xs text-white/70 mt-0.5 leading-snug">{mm ? 'ကိုယ်ရေးလုံခြုံမှု' : 'Private & Confidential'}</p>
          </motion.div>
        </div>
      </div>
    </section>

    <AdSlider />
    <OurDoctors />
    <HealthCategories />
    <TopSellingProducts />
    <Testimonials />
    <SpecialOffersBanner />
    <PartnerClinics />
    <BlogArticles />
    </>
  );
}
