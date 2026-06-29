'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Phone, Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [phone, setPhone]     = useState('');
  const [pin, setPin]         = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const res  = await fetch('/api/admin/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone: phone.replace(/\s/g, ''), password: pin }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Login မအောင်မြင်ပါ။');
        setLoading(false);
        return;
      }

      router.replace('/admin/dashboard');
    } catch {
      setError('Server ချိတ်ဆက်မှု မအောင်မြင်ပါ။');
      setLoading(false);
    }
  };

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    return digits;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: '#2ab5ad' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: '#1a9990' }} />
      </div>

      <div className="relative w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Image src="/medihug-logo.png" alt="MediHug" width={56} height={56} className="object-contain h-14 w-auto" />
            <div className="flex flex-col leading-snug">
              <span className="text-2xl font-bold text-white tracking-tight">MediHug</span>
              <span className="text-xs text-teal-400 font-semibold tracking-widest uppercase">Admin Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full bg-white/8 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-xs text-slate-400 font-medium">Super Admin Access</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl">

          {/* Phone */}
          <div className="flex flex-col gap-1.5 mb-4">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">ဖုန်းနံပါတ်</label>
            <div className="flex items-center gap-3 bg-white/8 border border-white/10 rounded-2xl px-4 py-3.5 focus-within:border-teal-500 transition-colors">
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

          {/* PIN */}
          <div className="flex flex-col gap-1.5 mb-5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Password</label>
            <div className="relative flex items-center bg-white/8 border border-white/10 rounded-2xl focus-within:border-teal-500 transition-colors">
              <Lock className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={e => setPin(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="••••"
                className="w-full bg-transparent text-white text-sm outline-none placeholder:text-slate-500 tracking-widest pl-11 pr-11 py-3.5"
              />
              <button onClick={() => setShowPin(s => !s)} className="absolute right-3 w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-500/15 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}

          {/* Login button */}
          <button
            onClick={handleLogin}
            disabled={loading || !phone || !pin}
            className="w-full py-3.5 rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #2ab5ad 0%, #1a9990 100%)' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                လော့ဂ်အင် ဝင်နေသည်...
              </span>
            ) : 'Admin Portal ဝင်ရောက်ရန်'}
          </button>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          MediHug © {new Date().getFullYear()} — Authorized Access Only
        </p>
      </div>
    </div>
  );
}
