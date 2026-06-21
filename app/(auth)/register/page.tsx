'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Phone, Lock, User } from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';

export default function RegisterPage() {
  const { lang } = useLang();
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ username: '', phone: '', password: '', confirm: '' });
  const [done, setDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) return;
    setDone(true);
  };

  const steps = [
    { n: '01', mm: 'အကောင့် ဖွင့်ပါ', en: 'Create your account', dmm: 'ဖုန်းနံပါတ်နှင့် Username ဖြင့် မှတ်ပုံတင်ပါ', den: 'Register with your phone & username' },
    { n: '02', mm: 'ဆရာဝန် ရွေးချယ်ပါ', en: 'Choose a doctor', dmm: 'အထူးကု ဆရာဝန်များထဲမှ လိုချင်သူကို ရွေးပါ', den: 'Browse our certified specialists' },
    { n: '03', mm: 'တိုင်ပင်ဆွေးနွေးပါ', en: 'Start consulting', dmm: 'Video call ဖြင့် တိုက်ရိုက် တိုင်ပင်ဆွေးနွေးပါ', den: 'Consult via live video call' },
  ];

  return (
    <main className="flex min-h-svh lg:h-svh lg:overflow-hidden pt-8 lg:pt-0">

      {/* Left — decorative panel */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-14 relative overflow-hidden"
        style={{ backgroundColor: '#0d2b6e' }}
      >
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=900&q=80&fit=crop)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#0d2b6e]/90 via-transparent to-transparent" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(79,172,254,0.15) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(79,172,254,0.12) 0%, transparent 70%)' }} />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="text-2xl font-bold">
            <span className="text-white">Medi</span>
            <span style={{ color: '#4facfe' }}>Hug</span>
          </Link>
        </div>

        {/* Steps */}
        <div className="relative z-10">
          <div className="w-10 h-0.5 mb-6" style={{ backgroundColor: '#4facfe' }} />
          <p className="text-white/50 text-xs uppercase tracking-widest mb-6">
            {lang === 'mm' ? 'မည်သို့ စတင်ရမည်နည်း' : 'How it works'}
          </p>
          <div className="flex flex-col gap-6">
            {steps.map((step, i) => (
              <div key={step.n} className="flex gap-4 items-start">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: 'rgba(79,172,254,0.2)', color: '#4facfe' }}>
                    {step.n}
                  </div>
                  {i < steps.length - 1 && <div className="w-px h-6 bg-white/10" />}
                </div>
                <div className="pt-1">
                  <p className="text-white text-sm font-semibold">{lang === 'mm' ? step.mm : step.en}</p>
                  <p className="text-white/40 text-xs mt-0.5 leading-relaxed">{lang === 'mm' ? step.dmm : step.den}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center px-5 sm:px-10 lg:overflow-y-auto" style={{ backgroundColor: '#f8faff' }}>

<div className="w-full max-w-md py-4 sm:py-8">
          {done ? (
            <div className="text-center flex flex-col items-center gap-5 py-10 bg-white rounded-2xl shadow-sm border border-gray-100 px-8">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#eff6ff' }}>
                <svg className="w-9 h-9" fill="none" stroke="#0d2b6e" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2" style={{ color: '#0d2b6e' }}>
                  {lang === 'mm' ? 'မှတ်ပုံတင်ပြီးပါပြီ!' : 'Registration Complete!'}
                </h2>
                <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                  {lang === 'mm'
                    ? 'သင့်အကောင့် အောင်မြင်စွာ ဖွင့်ပြီးပါပြီ။'
                    : 'Your account has been created. You can now sign in.'}
                </p>
              </div>
              <Link href="/signin" className="px-8 py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity" style={{ backgroundColor: '#0d2b6e' }}>
                {lang === 'mm' ? 'ဝင်ရောက်ရန်' : 'Sign In'}
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#4facfe' }}>
                  {lang === 'mm' ? 'အကောင့် အသစ်' : 'New account'}
                </p>
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#0d2b6e' }}>
                  {lang === 'mm' ? 'စာရင်းသွင်းရန်' : 'Create Account'}
                </h1>
                <p className="text-sm text-gray-400">
                  {lang === 'mm' ? 'MediHug မိသားစုထဲ ကြိုဆိုပါသည်' : 'Join the MediHug community today'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8 flex flex-col gap-4">

                {/* Username */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold" style={{ color: '#0d2b6e' }}>
                    {lang === 'mm' ? 'အသုံးပြုသူ နာမည်' : 'Username'} <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      required
                      value={form.username}
                      onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                      placeholder={lang === 'mm' ? 'သင့် username' : 'your_username'}
                      className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none focus:border-[#0d2b6e] focus:ring-2 focus:ring-[#0d2b6e]/10 transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold" style={{ color: '#0d2b6e' }}>
                    {lang === 'mm' ? 'ဖုန်းနံပါတ်' : 'Phone Number'} <span className="text-red-400">*</span>
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

                {/* Password row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold" style={{ color: '#0d2b6e' }}>
                      {lang === 'mm' ? 'စကားဝှက်' : 'Password'} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        required
                        type={show ? 'text' : 'password'}
                        value={form.password}
                        onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                        placeholder="••••••••"
                        className="w-full border border-gray-200 rounded-xl pl-9 pr-9 py-3.5 text-sm outline-none focus:border-[#0d2b6e] focus:ring-2 focus:ring-[#0d2b6e]/10 transition-all bg-gray-50 focus:bg-white"
                      />
                      <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold" style={{ color: '#0d2b6e' }}>
                      {lang === 'mm' ? 'အတည်ပြုရန်' : 'Confirm'} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        required
                        type={showConfirm ? 'text' : 'password'}
                        value={form.confirm}
                        onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                        placeholder="••••••••"
                        className={`w-full border rounded-xl pl-9 pr-9 py-3.5 text-sm outline-none focus:ring-2 transition-all bg-gray-50 focus:bg-white ${
                          form.confirm && form.password !== form.confirm
                            ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                            : 'border-gray-200 focus:border-[#0d2b6e] focus:ring-[#0d2b6e]/10'
                        }`}
                      />
                      <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {form.confirm && form.password !== form.confirm && (
                      <p className="text-xs text-red-400">{lang === 'mm' ? 'မတူညီပါ' : 'Not matching'}</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity mt-1"
                  style={{ backgroundColor: '#0d2b6e' }}
                >
                  {lang === 'mm' ? 'အကောင့် ဖွင့်ရန်' : 'Create Account'}
                </button>

              </form>

              <p className="text-center text-sm text-gray-400 mt-5">
                {lang === 'mm' ? 'အကောင့် ရှိပြီးသားလား? ' : 'Already have an account? '}
                <Link href="/signin" className="font-semibold" style={{ color: '#0d2b6e' }}>
                  {lang === 'mm' ? 'ဝင်ရောက်ရန်' : 'Sign In'}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
