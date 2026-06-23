'use client';

import Image from 'next/image';
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

export default function Home() {
  const { tr } = useLang();

  return (
    <>
    <section className="relative flex flex-col justify-end overflow-hidden" style={{ height: '80svh' }}>
      <Image
        src="/doctor.jpg"
        alt="Doctor"
        fill
        className="object-cover"
        style={{ objectPosition: '50% 30%' }}
        priority
      />
      <div className="absolute inset-0 bg-linear-to-r from-[#0d2b6e]/70 via-[#0d2b6e]/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-linear-to-t from-black/70 to-transparent" />

      <div className="relative z-10 w-full text-center pb-10 sm:pb-16 px-5 sm:px-8">
        <BlurText
          text={tr.heroTitle}
          delay={100}
          animateBy="words"
          direction="top"
          className="text-3xl sm:text-5xl md:text-6xl font-bold text-white leading-tight justify-center mb-4 sm:mb-6"
        />
        <p className="text-white/90 text-sm sm:text-lg max-w-2xl mx-auto mb-7 sm:mb-10 leading-relaxed">
          {tr.heroDesc}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="/care" className="w-full sm:w-auto bg-white text-[#0d2b6e] font-semibold px-8 py-3.5 rounded-full text-sm text-center">
            {tr.getCareNow}
          </a>
          <a href="/info" className="w-full sm:w-auto border-2 border-white text-white font-semibold px-8 py-3.5 rounded-full text-sm text-center">
            {tr.noInsurance}
          </a>
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
