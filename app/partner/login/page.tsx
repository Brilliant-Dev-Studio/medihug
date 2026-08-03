'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Phone, Lock, Eye, EyeOff, Building2, AlertCircle, ShieldCheck } from 'lucide-react';

const PRIMARY = '#3b5bdb';

export default function PartnerLoginPage() {
  const router = useRouter();
  const [phone, setPhone]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res  = await fetch('/api/partner/login', {
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

      router.replace('/partner/dashboard');
    } catch {
      setError('Server ချိတ်ဆက်မှု မအောင်မြင်ပါ။');
      setLoading(false);
    }
  };

  const formatPhone = (val: string) => val.replace(/\D/g, '').slice(0, 11);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0a1020' }}>

      {/* ── Left — photo panel ── */}
      <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden flex-col justify-between p-14">
        <div
          className="absolute inset-0"
          style={{ backgroundImage: 'url(/doctors.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(115deg, rgba(10,16,32,0.9) 0%, rgba(10,16,32,0.6) 38%, rgba(10,16,32,0.22) 60%, rgba(10,16,32,0.05) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg, rgba(10,16,32,0.92) 0%, rgba(10,16,32,0.1) 45%, transparent 70%)' }} />

        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10 flex items-center gap-3">
          <Image src="/medihug-logo.png" alt="MediHug" width={40} height={40} className="object-contain h-10 w-auto" priority />
          <div className="flex flex-col leading-snug">
            <span className="text-lg font-bold text-white tracking-tight">MediHug</span>
            <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#7b93f8' }}>Partner Portal</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="relative z-10">
          <div className="flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full w-fit" style={{ backgroundColor: `${PRIMARY}22`, border: `1px solid ${PRIMARY}44` }}>
            <Building2 className="w-3.5 h-3.5" style={{ color: '#7b93f8' }} />
            <span className="text-xs font-semibold" style={{ color: '#a8b8fb' }}>Clinic Partners အတွက်</span>
          </div>
          <p className="text-white text-3xl font-bold leading-tight mb-4 whitespace-pre-line">
            {'သင့် Clinic ကို\nMediHug ပေါ်မှာ\nစီမံခန့်ခွဲလိုက်ပါ'}
          </p>
          <p className="text-white/40 text-sm leading-relaxed max-w-xs">
            ချိန်းဆိုမှုများ၊ ဆရာဝန်များ၊ ကုန်ပစ္စည်းများနှင့် Clinic ပရိုဖိုင်ကို တစ်နေရာတည်းမှာ ကြည့်ရှုနိုင်ပါပြီ။
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }} className="relative z-10 flex items-center gap-2 text-white/25 text-xs">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Encrypted &amp; access-controlled partner session</span>
        </motion.div>
      </div>

      {/* ── Right — form ── */}
      <div className="relative w-full lg:w-[54%] flex items-center justify-center px-6 overflow-hidden">
        <div
          className="lg:hidden absolute inset-0 opacity-[0.10]"
          style={{ backgroundImage: 'url(/doctors.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ backgroundColor: PRIMARY }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ backgroundColor: '#22308f' }} />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative w-full max-w-sm py-10"
        >
          <div className="flex lg:hidden flex-col items-center mb-8">
            <div className="flex items-center gap-3 mb-3">
              <Image src="/medihug-logo.png" alt="MediHug" width={56} height={56} className="object-contain h-14 w-auto" />
              <div className="flex flex-col leading-snug">
                <span className="text-2xl font-bold text-white tracking-tight">MediHug</span>
                <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#7b93f8' }}>Partner Portal</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:block mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#7b93f8' }}>ကြိုဆိုပါသည်</p>
            <h1 className="text-3xl font-bold text-white mb-2">Partner ဝင်ရောက်ရန်</h1>
            <p className="text-sm text-white/35">သင့် Clinic Partner အကောင့်ထဲ ပြန်ဝင်ပါ</p>
          </div>

          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl">

            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">ဖုန်းနံပါတ်</label>
              <div className="flex items-center gap-3 bg-white/[0.06] border border-white/10 rounded-2xl px-4 py-3.5 focus-within:border-indigo-400/60 focus-within:bg-white/[0.08] transition-all">
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

            <div className="flex flex-col gap-1.5 mb-5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">စကားဝှက်</label>
              <div className="relative flex items-center bg-white/[0.06] border border-white/10 rounded-2xl focus-within:border-indigo-400/60 focus-within:bg-white/[0.08] transition-all">
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

            {error && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-red-500/15 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-xs text-red-300">{error}</p>
              </motion.div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading || !phone || !password}
              suppressHydrationWarning
              className="group relative w-full py-3.5 rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #4c63d2 0%, #2f3f9e 100%)', boxShadow: `0 8px 24px -8px ${PRIMARY}80` }}
            >
              <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
              {loading ? (
                <span className="relative flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  လော့ဂ်အင် ဝင်နေသည်...
                </span>
              ) : <span className="relative">Partner Portal ဝင်ရောက်ရန်</span>}
            </button>
          </div>

          <p className="text-center text-xs text-slate-600 mt-6 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            MediHug © {new Date().getFullYear()} — Partner Access Only
          </p>
        </motion.div>
      </div>
    </div>
  );
}
