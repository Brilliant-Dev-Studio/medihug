'use client';

import Link from 'next/link';
import Lottie from 'lottie-react';
import lottie404 from '../../public/lottie-404.json';
import { useLang } from '../lib/LanguageContext';

export default function NotFound() {
  const { lang } = useLang();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">

      {/* Lottie Animation */}
      <div className="w-64 sm:w-80">
        <Lottie animationData={lottie404} loop />
      </div>

      {/* Text */}
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-3 mt-2" style={{ color: '#0d2b6e' }}>
        {lang === 'mm' ? 'စာမျက်နှာ ရှာမတွေ့ပါ' : 'Page Not Found'}
      </h1>
      <p className="text-sm text-gray-400 text-center max-w-sm leading-relaxed mb-8">
        {lang === 'mm'
          ? 'သင်ရှာနေသော စာမျက်နှာသည် ရွှေ့ပြောင်းသွားခြင်း၊ ဖျက်လိုက်ခြင်း သို့မဟုတ် ကနဦးမှ မရှိနိုင်ပါ။'
          : 'The page you are looking for may have been moved, deleted, or never existed.'}
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/"
          className="px-7 py-3 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#0d2b6e' }}
        >
          {lang === 'mm' ? 'ပင်မစာမျက်နှာသို့ ပြန်သွားရန်' : 'Back to Home'}
        </Link>
        <Link
          href="/contact"
          className="px-7 py-3 rounded-full text-sm font-semibold border-2 hover:opacity-80 transition-opacity"
          style={{ color: '#0d2b6e', borderColor: '#0d2b6e' }}
        >
          {lang === 'mm' ? 'ဆက်သွယ်ရန်' : 'Contact Us'}
        </Link>
      </div>

      <p className="mt-10 text-xs text-gray-300">
        {lang === 'mm' ? 'အမှားကုဒ် 404 — ရှာမတွေ့သော အရင်းအမြစ်' : 'Error code 404 — Resource not found'}
      </p>

    </main>
  );
}
