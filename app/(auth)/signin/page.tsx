'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Phone, Lock } from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';

export default function SignInPage() {
  const { lang } = useLang();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ phone: '', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <main className="flex h-svh overflow-hidden">

      {/* Left — decorative panel */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-14 relative overflow-hidden"
        style={{ backgroundColor: '#0d2b6e' }}
      >
        {/* Background image */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=900&q=80&fit=crop)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Gradient overlay bottom */}
        <div className="absolute inset-0 bg-linear-to-t from-[#0d2b6e]/90 via-transparent to-transparent" />

        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(79,172,254,0.15) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(79,172,254,0.12) 0%, transparent 70%)' }} />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="text-2xl font-bold">
            <span className="text-white">Medi</span>
            <span style={{ color: '#4facfe' }}>Hug</span>
          </Link>
        </div>

        {/* Quote */}
        <div className="relative z-10">
          <div className="w-10 h-0.5 mb-6" style={{ backgroundColor: '#4facfe' }} />
          <p className="text-white text-3xl font-bold leading-tight mb-5">
            {lang === 'mm'
              ? 'ကျန်းမာရေး\nစောင့်ရှောက်မှု\nသင့်လက်တစ်ကမ်းမှာ'
              : 'Healthcare\nat your\nfingertips'}
          </p>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            {lang === 'mm'
              ? 'MediHug ဖြင့် အချိန်မရွေး အထူးကုဆရာဝန်များနှင့် ချိတ်ဆက်ပါ'
              : 'Connect with certified specialists anytime, anywhere via MediHug'}
          </p>

          {/* Stats */}
          <div className="flex gap-8 mt-8">
            {[
              { num: '500+', label_mm: 'ဆရာဝန်', label_en: 'Doctors' },
              { num: '50K+', label_mm: 'လူနာ', label_en: 'Patients' },
              { num: '4.9★', label_mm: 'အဆင့်သတ်မှတ်', label_en: 'Rating' },
            ].map(s => (
              <div key={s.num}>
                <p className="text-white text-xl font-bold">{s.num}</p>
                <p className="text-white/40 text-xs mt-0.5">{lang === 'mm' ? s.label_mm : s.label_en}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center px-5 sm:px-10 overflow-y-auto" style={{ backgroundColor: '#f8faff' }}>

        {/* Mobile logo */}
        <div className="lg:hidden mb-6 mt-4">
          <Link href="/" className="text-2xl font-bold">
            <span style={{ color: '#0d2b6e' }}>Medi</span>
            <span style={{ color: '#4facfe' }}>Hug</span>
          </Link>
        </div>

        <div className="w-full max-w-md">

          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#4facfe' }}>
              {lang === 'mm' ? 'ကြိုဆိုပါသည်' : 'Welcome back'}
            </p>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#0d2b6e' }}>
              {lang === 'mm' ? 'ဝင်ရောက်ရန်' : 'Sign In'}
            </h1>
            <p className="text-sm text-gray-400">
              {lang === 'mm' ? 'သင့်အကောင့်ထဲ ပြန်ဝင်ပါ' : 'Access your MediHug account'}
            </p>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8 flex flex-col gap-4 sm:gap-5">

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: '#0d2b6e' }}>
                {lang === 'mm' ? 'ဖုန်းနံပါတ်' : 'Phone Number'}
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="09 xxx xxx xxx"
                  className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none focus:border-[#0d2b6e] focus:ring-2 focus:ring-[#0d2b6e]/10 transition-all bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold" style={{ color: '#0d2b6e' }}>
                  {lang === 'mm' ? 'စကားဝှက်' : 'Password'}
                </label>
                <a href="#" className="text-xs font-semibold" style={{ color: '#4facfe' }}>
                  {lang === 'mm' ? 'မေ့နေသလား?' : 'Forgot password?'}
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  required
                  type={show ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl pl-11 pr-11 py-3.5 text-sm outline-none focus:border-[#0d2b6e] focus:ring-2 focus:ring-[#0d2b6e]/10 transition-all bg-gray-50 focus:bg-white"
                />
                <button type="button" onClick={() => setShow(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#0d2b6e' }}
            >
              {lang === 'mm' ? 'ဝင်ရောက်ရန်' : 'Sign In'}
            </button>

          </div>

          <p className="text-center text-sm text-gray-400 mt-6">
            {lang === 'mm' ? 'အကောင့် မရှိသေးဘူးလား? ' : "Don't have an account? "}
            <Link href="/register" className="font-semibold" style={{ color: '#0d2b6e' }}>
              {lang === 'mm' ? 'စာရင်းသွင်းရန်' : 'Register now'}
            </Link>
          </p>

        </div>
      </div>
    </main>
  );
}
