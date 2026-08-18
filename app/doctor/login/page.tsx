'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Phone, Lock, Eye, EyeOff, Stethoscope, AlertCircle, ShieldCheck, Users, Star } from 'lucide-react';

const PRIMARY = '#2ab5ad';

export default function DoctorLoginPage() {
  const [phone, setPhone]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [stats, setStats] = useState({ doctorCount: 0, patientCount: 0, avgRating: 0 });

  useEffect(() => {
    fetch('/api/public-stats')
      .then(r => r.json())
      .then(d => setStats({ doctorCount: d.doctorCount ?? 0, patientCount: d.patientCount ?? 0, avgRating: d.avgRating ?? 0 }))
      .catch(() => {});
  }, []);

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const res  = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone: phone.replace(/\s/g, ''), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Login မအောင်မြင်ပါ။');
        setLoading(false);
        return;
      }

      if (!data.matched || data.role !== 'DOCTOR') {
        setError('ဖုန်းနံပါတ် (သို့) စကားဝှက် မှားနေပါသည်။');
        setLoading(false);
        return;
      }

      // Hard navigation, not router.replace: this tab may have been open across a
      // deploy, so its client-side chunk manifest can be stale. A full page load
      // always fetches the current bundle instead of silently hanging on a 404'd chunk.
      window.location.href = '/doctor/dashboard';
    } catch {
      setError('Server ချိတ်ဆက်မှု မအောင်မြင်ပါ။');
      setLoading(false);
    }
  };

  const formatPhone = (val: string) => val.replace(/\D/g, '').slice(0, 11);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0a1420' }}>

      {/* ── Left — brand / trust panel ── */}
      <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden flex-col justify-between p-14">
        {/* Photo */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/doctor.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 20%',
          }}
        />
        {/* Gradient wash — just enough for text legibility, mostly bottom/left where the copy sits */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(115deg, rgba(10,20,32,0.88) 0%, rgba(10,20,32,0.55) 38%, rgba(10,20,32,0.2) 60%, rgba(10,20,32,0.05) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg, rgba(10,20,32,0.9) 0%, rgba(10,20,32,0.1) 45%, transparent 70%)' }} />

        {/* Glow orbs */}
        <motion.div
          animate={{ opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -right-20 w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${PRIMARY}33 0%, transparent 70%)` }}
        />
        <div className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(79,172,254,0.14) 0%, transparent 70%)' }} />

        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10 flex items-center gap-3">
          <Image src="/medihug-logo.png" alt="MediHug" width={40} height={40} className="object-contain h-10 w-auto" priority />
          <div className="flex flex-col leading-snug">
            <span className="text-lg font-bold text-white tracking-tight">MediHug</span>
            <span className="text-[10px] text-teal-400 font-semibold tracking-widest uppercase">Doctor Portal</span>
          </div>
        </motion.div>

        {/* Quote + stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="relative z-10">
          <div className="flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full w-fit" style={{ backgroundColor: `${PRIMARY}1a`, border: `1px solid ${PRIMARY}33` }}>
            <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-xs text-teal-300 font-semibold">ဆရာဝန်များအတွက် Portal</span>
          </div>
          <p className="text-white text-3xl font-bold leading-tight mb-4 whitespace-pre-line">
            {'လူနာများနှင့်\nအနီးကပ် ချိတ်ဆက်ပြီး\nကုသပေးလိုက်ပါ'}
          </p>
          <p className="text-white/40 text-sm leading-relaxed max-w-xs mb-10">
            ချိန်းဆိုမှုများ စီမံခန့်ခွဲခြင်း၊ ဗီဒီယိုခေါ်ဆိုမှု၊ လူနာမှတ်တမ်းများကို တစ်နေရာတည်းမှာ ကိုင်တွယ်နိုင်ပါပြီ။
          </p>

          <div className="flex gap-8">
            {[
              { icon: Stethoscope, num: stats.doctorCount.toLocaleString(), label: 'ဆရာဝန်' },
              { icon: Users,       num: stats.patientCount.toLocaleString(), label: 'လူနာ' },
              { icon: Star,        num: `${stats.avgRating.toFixed(1)}★`,    label: 'အဆင့်သတ်မှတ်ချက်' },
            ].map(s => (
              <div key={s.label} className="flex flex-col gap-1.5">
                <s.icon className="w-4 h-4 text-teal-400/70" />
                <p className="text-white text-xl font-bold leading-none">{s.num}</p>
                <p className="text-white/30 text-[11px]">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }} className="relative z-10 flex items-center gap-2 text-white/25 text-xs">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Encrypted &amp; access-controlled doctor session</span>
        </motion.div>
      </div>

      {/* ── Right — form ── */}
      <div className="relative w-full lg:w-[54%] flex items-center justify-center px-6 overflow-hidden">
        {/* Mobile-only photo backdrop — the left panel (with the same photo) is hidden below lg */}
        <div
          className="lg:hidden absolute inset-0 opacity-[0.10]"
          style={{ backgroundImage: 'url(/doctor.jpg)', backgroundSize: 'cover', backgroundPosition: 'center 20%' }}
        />
        {/* Ambient glow behind card (also shown on mobile where left panel is hidden) */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ backgroundColor: PRIMARY }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ backgroundColor: '#1a9990' }} />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative w-full max-w-sm py-10"
        >
          {/* Logo — mobile only */}
          <div className="flex lg:hidden flex-col items-center mb-8">
            <div className="flex items-center gap-3 mb-3">
              <Image src="/medihug-logo.png" alt="MediHug" width={56} height={56} className="object-contain h-14 w-auto" />
              <div className="flex flex-col leading-snug">
                <span className="text-2xl font-bold text-white tracking-tight">MediHug</span>
                <span className="text-xs text-teal-400 font-semibold tracking-widest uppercase">Doctor Portal</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:block mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2 text-teal-400">ကြိုဆိုပါသည်</p>
            <h1 className="text-3xl font-bold text-white mb-2">ဆရာဝန် ဝင်ရောက်ရန်</h1>
            <p className="text-sm text-white/35">သင့် Doctor Portal အကောင့်ထဲ ပြန်ဝင်ပါ</p>
          </div>

          {/* Card */}
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl">

            {/* Phone */}
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">ဖုန်းနံပါတ်</label>
              <div className="flex items-center gap-3 bg-white/[0.06] border border-white/10 rounded-2xl px-4 py-3.5 focus-within:border-teal-400/60 focus-within:bg-white/[0.08] transition-all">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(formatPhone(e.target.value))}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="09XXXXXXXXX"
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5 mb-5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">စကားဝှက်</label>
              <div className="relative flex items-center bg-white/[0.06] border border-white/10 rounded-2xl focus-within:border-teal-400/60 focus-within:bg-white/[0.08] transition-all">
                <Lock className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-white text-sm outline-none placeholder:text-slate-500 tracking-widest pl-11 pr-11 py-3.5"
                />
                <button onClick={() => setShowPassword(s => !s)} className="absolute right-3 w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-red-500/15 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-xs text-red-300">{error}</p>
              </motion.div>
            )}

            {/* Login button */}
            <button
              onClick={handleLogin}
              disabled={loading || !phone || !password}
              suppressHydrationWarning
              className="group relative w-full py-3.5 rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #2ab5ad 0%, #1a9990 100%)', boxShadow: `0 8px 24px -8px ${PRIMARY}80` }}
            >
              <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
              {loading ? (
                <span className="relative flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  လော့ဂ်အင် ဝင်နေသည်...
                </span>
              ) : <span className="relative">ဆရာဝန် Portal ဝင်ရောက်ရန်</span>}
            </button>
          </div>

          <p className="text-center text-xs text-slate-600 mt-6 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            MediHug © {new Date().getFullYear()} — Doctor Access Only
          </p>
        </motion.div>
      </div>
    </div>
  );
}
