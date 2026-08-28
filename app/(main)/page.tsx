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
import HealthcarePrograms from '../components/HealthcarePrograms';
import PartnerClinics from '../components/PartnerClinics';
import BlogArticles from '../components/BlogArticles';
import SpecialOffersBanner from '../components/SpecialOffersBanner';
import { useLang } from '../lib/LanguageContext';

const PRIMARY = '#0d2b6e';

export default function Home() {
  const { tr, lang } = useLang();
  const mm = lang === 'mm';

  const specialties = mm
    ? ['အထွေထွေ', 'နှလုံးရောဂါကု', 'ကလေးရောဂါကု']
    : ['General', 'Cardiology', 'Pediatrics'];

  return (
    <>
    <section className="w-full bg-white py-8 sm:py-20 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

        {/* Left: copy */}
        <div>
          <motion.span
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full pl-1.5 pr-3.5 py-1.5 mb-4 sm:mb-6"
          >
            <motion.span
              animate={{ rotate: [0, -12, 12, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 2.4, ease: 'easeInOut', delay: 0.8 }}
              className="w-5 h-5 rounded-md border flex items-center justify-center shrink-0"
              style={{ borderColor: PRIMARY }}
            >
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            </motion.span>
            <span className="text-xs sm:text-sm font-semibold text-gray-700">{tr.heroBadge}</span>
          </motion.span>

          <BlurText
            text={tr.heroTitle}
            delay={80}
            animateBy="words"
            direction="top"
            className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-3 sm:mb-6 justify-start"
          />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-gray-500 text-sm sm:text-lg max-w-md mb-5 sm:mb-8 leading-relaxed"
          >
            {tr.heroDesc}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.42 }}
            className="flex items-center gap-4 sm:gap-5 mb-6 sm:mb-12"
          >
            <motion.span whileHover={{ scale: 1.045 }} whileTap={{ scale: 0.97 }} className="inline-block">
              <Link href="/register" className="text-white font-semibold px-5 py-2.5 sm:px-7 sm:py-3.5 rounded-full text-sm sm:text-base hover:opacity-90 hover:shadow-lg hover:shadow-blue-900/25 transition-all" style={{ backgroundColor: PRIMARY }}>
                {tr.getCareNow}
              </Link>
            </motion.span>
            <motion.span whileHover={{ scale: 1.045 }} whileTap={{ scale: 0.97 }} className="inline-block">
              <Link href="/patient/booking" className="font-semibold text-sm sm:text-base hover:underline underline-offset-4" style={{ color: PRIMARY }}>
                {tr.noInsurance}
              </Link>
            </motion.span>
          </motion.div>

        </div>

        {/* Right: image + floating cards */}
        <div className="hidden lg:block relative mx-auto w-full max-w-xs sm:max-w-md mt-4 lg:mt-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.015 }}
            className="relative w-full aspect-[4/5] rounded-[2rem] overflow-hidden bg-gray-100 shadow-xl shadow-blue-900/10"
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
            initial={{ opacity: 0, x: 30, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.55 }}
            className="absolute top-3 sm:top-5 right-1 sm:-right-4"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
              whileHover={{ scale: 1.06 }}
              className="flex items-center gap-1 sm:gap-1.5 bg-white shadow-lg rounded-full pl-1.5 pr-2.5 py-1.5 sm:pl-2 sm:pr-3.5 sm:py-2"
            >
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: PRIMARY }}>
                <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
              </span>
              <span className="text-[10px] sm:text-sm font-semibold text-gray-700 whitespace-nowrap">{mm ? 'ဗီဒီယိုကုသမှု' : 'Video Consultation'}</span>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.68 }}
            className="absolute top-12 sm:top-24 right-0 sm:-right-8"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: 1.3 }}
              whileHover={{ scale: 1.06 }}
              className="flex items-center gap-1 sm:gap-1.5 bg-white shadow-lg rounded-full pl-1.5 pr-2.5 py-1.5 sm:pl-2 sm:pr-3.5 sm:py-2"
            >
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: PRIMARY }}>
                <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
              </span>
              <span className="text-[10px] sm:text-sm font-semibold text-gray-700 whitespace-nowrap">{mm ? 'တိုက်ရိုက်တွေ့ဆုံမှု' : 'In-Person Visit'}</span>
            </motion.div>
          </motion.div>

          {/* Stat chip top-left */}
          <motion.div
            initial={{ opacity: 0, x: -30, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.82 }}
            className="absolute top-1/3 -translate-y-1/2 -left-2 sm:-left-10"
          >
            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
              whileHover={{ scale: 1.06 }}
              className="text-white rounded-xl sm:rounded-2xl px-2.5 py-2 sm:px-4 sm:py-3.5 shadow-lg max-w-24 sm:max-w-32.5"
              style={{ backgroundColor: PRIMARY }}
            >
              <p className="text-sm sm:text-lg font-extrabold leading-tight">{mm ? 'အတည်ပြုပြီး' : 'Verified'}</p>
              <p className="text-[10px] sm:text-xs text-white/70 mt-0.5 leading-snug">{mm ? 'ကျွမ်းကျင်ဆရာဝန်များ' : 'Certified Doctors'}</p>
            </motion.div>
          </motion.div>

          {/* Specialty pills card */}
          <motion.div
            initial={{ opacity: 0, x: -30, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.96 }}
            className="absolute bottom-16 sm:bottom-24 -left-2 sm:-left-10"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.1, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
              whileHover={{ scale: 1.04 }}
              className="bg-white shadow-xl rounded-xl sm:rounded-2xl px-2.5 py-2 sm:px-4 sm:py-3.5 max-w-44 sm:max-w-60"
            >
              <p className="text-xs sm:text-sm font-bold text-gray-800 mb-1 sm:mb-2">{mm ? 'ဆေးကုဌာနများ' : 'Popular Specialties'}</p>
              <div className="flex flex-wrap gap-1 sm:gap-1.5">
                {specialties.map(s => (
                  <span key={s} className="text-[9px] sm:text-[11px] font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border" style={{ color: PRIMARY, borderColor: `${PRIMARY}40` }}>
                    + {s}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Stat chip bottom-right */}
          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 1.1 }}
            className="absolute -bottom-2 -right-1 sm:-right-8"
          >
            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 3.3, repeat: Infinity, ease: 'easeInOut', delay: 1.6 }}
              whileHover={{ scale: 1.06 }}
              className="text-white rounded-xl sm:rounded-2xl px-2.5 py-2 sm:px-4 sm:py-3.5 shadow-lg max-w-26 sm:max-w-35"
              style={{ backgroundColor: PRIMARY }}
            >
              <p className="text-sm sm:text-lg font-extrabold leading-tight">{mm ? 'လုံခြုံစိတ်ချရ' : 'Secure'}</p>
              <p className="text-[10px] sm:text-xs text-white/70 mt-0.5 leading-snug">{mm ? 'ကိုယ်ရေးလုံခြုံမှု' : 'Private & Confidential'}</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>

    <div className="flex flex-col-reverse lg:flex-col">
      <AdSlider />
      <HealthCategories />
    </div>
    <HealthcarePrograms />
    <TopSellingProducts />
    <Testimonials />
    <SpecialOffersBanner />
    <PartnerClinics />
    <BlogArticles />
    </>
  );
}
