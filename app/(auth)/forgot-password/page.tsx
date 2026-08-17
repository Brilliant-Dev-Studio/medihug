'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Phone, Lock, KeyRound, ShieldCheck, RotateCcw, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLang } from '../../lib/LanguageContext';

type Step = 'phone' | 'otp' | 'reset' | 'done';

export default function ForgotPasswordPage() {
  const { lang } = useLang();
  const router = useRouter();
  const mm = lang === 'mm';

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  useEffect(() => {
    if (step !== 'otp') return;
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
    setCanResend(true);
  }, [step, countdown]);

  const requestOtp = async () => {
    const res = await fetch('/api/auth/forgot-password/request', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone.trim() }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? (mm ? 'အမှားတစ်ခု ဖြစ်ပွားသည်' : 'Something went wrong'));
      return false;
    }
    return true;
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^(09|\+?959)\d{7,9}$/.test(phone.replace(/\s/g, ''))) {
      toast.error(mm ? 'ဖုန်းနံပါတ် မှားနေသည်' : 'Invalid phone number format');
      return;
    }
    setSubmitting(true);
    try {
      const ok = await requestOtp();
      if (!ok) return;
      toast.success(mm ? 'OTP ကုဒ် ပေးပို့လိုက်ပါပြီ' : 'OTP code sent');
      setStep('otp');
      setCountdown(60);
      setCanResend(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otp];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleResend = async () => {
    setSubmitting(true);
    try {
      const ok = await requestOtp();
      if (!ok) return;
      toast.success(mm ? 'OTP ကုဒ် ပြန်ပို့လိုက်ပါပြီ' : 'OTP resent');
      setOtp(['', '', '', '', '', '']);
      setCountdown(60);
      setCanResend(false);
      inputs.current[0]?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otp.join('');
    if (entered.length < 6) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), code: entered }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? (mm ? 'OTP ကုဒ် မှားနေသည်' : 'Incorrect OTP code'));
        setOtp(['', '', '', '', '', '']);
        inputs.current[0]?.focus();
        return;
      }
      setResetToken(data.resetToken);
      setStep('reset');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error(mm ? 'စကားဝှက် အနည်းဆုံး ၆ လုံး ဖြစ်ရမည်' : 'Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error(mm ? 'စကားဝှက် နှစ်ခု တူညီရမည်' : 'Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? (mm ? 'အမှားတစ်ခု ဖြစ်ပွားသည်' : 'Something went wrong'));
        return;
      }
      setStep('done');
      setTimeout(() => router.push('/signin'), 2000);
    } finally {
      setSubmitting(false);
    }
  };

  const otpFilled = otp.join('').length === 6;

  return (
    <main className="flex min-h-svh lg:h-svh lg:overflow-hidden pt-[90px] lg:pt-0">

      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-14 relative overflow-hidden"
        style={{ backgroundColor: '#0d2b6e' }}
      >
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=900&q=80&fit=crop)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#0d2b6e]/90 via-transparent to-transparent" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(79,172,254,0.15) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(79,172,254,0.12) 0%, transparent 70%)' }} />

        <div className="relative z-10">
          <Link href="/" className="text-2xl font-bold">
            <span className="text-white">Medi</span>
            <span style={{ color: '#4facfe' }}>Hug</span>
          </Link>
        </div>

        <div className="relative z-10">
          <div className="w-10 h-0.5 mb-6" style={{ backgroundColor: '#4facfe' }} />
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(79,172,254,0.15)' }}>
            <KeyRound className="w-8 h-8" style={{ color: '#4facfe' }} />
          </div>
          <p className="text-white text-3xl font-bold leading-tight mb-4">
            {mm ? 'စကားဝှက်\nပြန်လည်သတ်မှတ်ခြင်း' : 'Password\nReset'}
          </p>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            {mm
              ? 'သင့်ဖုန်းနံပါတ်သို့ ပေးပို့သော OTP ကုဒ်ဖြင့် အတည်ပြုပြီး စကားဝှက်အသစ် သတ်မှတ်ပါ'
              : 'Verify with the OTP code sent to your phone and set a new password'}
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center px-5 sm:px-10 lg:overflow-y-auto" style={{ backgroundColor: '#f8faff' }}>
        <div className="w-full max-w-md py-8">

          {/* Step 1: phone */}
          {step === 'phone' && (
            <>
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#4facfe' }}>
                  {mm ? 'စကားဝှက်မေ့သွားပါသလား' : 'Forgot password'}
                </p>
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#0d2b6e' }}>
                  {mm ? 'ဖုန်းနံပါတ် ထည့်ပါ' : 'Enter your phone number'}
                </h1>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {mm
                    ? 'သင့်အကောင့်နှင့် ချိတ်ဆက်ထားသော ဖုန်းနံပါတ်သို့ OTP ကုဒ် ပေးပို့ပေးပါမည်'
                    : "We'll send an OTP code to the phone number linked to your account"}
                </p>
              </div>

              <form onSubmit={handlePhoneSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold" style={{ color: '#0d2b6e' }}>
                    {mm ? 'ဖုန်းနံပါတ်' : 'Phone Number'}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="09 xxx xxx xxx"
                      className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none focus:border-[#0d2b6e] focus:ring-2 focus:ring-[#0d2b6e]/10 transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                  style={{ backgroundColor: '#0d2b6e' }}
                >
                  {submitting
                    ? (mm ? 'ပေးပို့နေသည်...' : 'Sending...')
                    : (mm ? 'OTP ကုဒ် ပေးပို့ရန်' : 'Send OTP Code')}
                </button>
              </form>

              <Link href="/signin" className="flex items-center gap-1.5 justify-center text-sm font-semibold mt-6 transition-colors" style={{ color: '#0d2b6e' }}>
                <ArrowLeft className="w-3.5 h-3.5" />
                {mm ? 'ဝင်ရောက်ရန် ပြန်သွားမည်' : 'Back to Sign In'}
              </Link>
            </>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <>
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#4facfe' }}>
                  {mm ? 'အတည်ပြုရန်' : 'Verification'}
                </p>
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#0d2b6e' }}>
                  {mm ? 'OTP ကုဒ် ထည့်ပါ' : 'Enter OTP Code'}
                </h1>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {mm ? `${phone} သို့ ၆ လုံး OTP ကုဒ် ပေးပို့ထားပါသည်` : `A 6-digit OTP code has been sent to ${phone}`}
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col gap-6">
                <div className="flex gap-2 sm:gap-3 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { inputs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className="w-11 h-14 sm:w-13 sm:h-16 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all"
                      style={{
                        borderColor: digit ? '#0d2b6e' : '#e5e7eb',
                        color: '#0d2b6e',
                        backgroundColor: digit ? '#eff6ff' : '#f9fafb',
                      }}
                    />
                  ))}
                </div>

                <div className="text-center">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={submitting}
                      className="flex items-center gap-1.5 mx-auto text-sm font-semibold transition-colors disabled:opacity-60"
                      style={{ color: '#0d2b6e' }}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {mm ? 'ပြန်ပို့ရန်' : 'Resend OTP'}
                    </button>
                  ) : (
                    <p className="text-xs text-gray-400">
                      {mm ? 'ပြန်ပို့နိုင်မည့်အချိန် ' : 'Resend in '}
                      <span className="font-semibold" style={{ color: '#0d2b6e' }}>0:{countdown.toString().padStart(2, '0')}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!otpFilled || submitting}
                  className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-opacity"
                  style={{ backgroundColor: '#0d2b6e', opacity: (otpFilled && !submitting) ? 1 : 0.4 }}
                >
                  {submitting ? (mm ? 'စစ်ဆေးနေသည်...' : 'Verifying...') : (mm ? 'အတည်ပြုရန်' : 'Verify')}
                </button>
              </form>

              <button
                onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); }}
                className="flex items-center gap-1.5 justify-center text-sm font-semibold mt-6 mx-auto transition-colors"
                style={{ color: '#0d2b6e' }}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {mm ? 'ဖုန်းနံပါတ် ပြင်ရန်' : 'Change phone number'}
              </button>
            </>
          )}

          {/* Step 3: new password */}
          {step === 'reset' && (
            <>
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#4facfe' }}>
                  {mm ? 'အတည်ပြုပြီးပါပြီ' : 'Verified'}
                </p>
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#0d2b6e' }}>
                  {mm ? 'စကားဝှက်အသစ် သတ်မှတ်ပါ' : 'Set a New Password'}
                </h1>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {mm ? 'အောက်တွင် စကားဝှက်အသစ်ကို ထည့်သွင်းပါ' : 'Enter your new password below'}
                </p>
              </div>

              <form onSubmit={handleResetSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col gap-4 sm:gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold" style={{ color: '#0d2b6e' }}>
                    {mm ? 'စကားဝှက်အသစ်' : 'New Password'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      required
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-gray-200 rounded-xl pl-11 pr-11 py-3.5 text-sm outline-none focus:border-[#0d2b6e] focus:ring-2 focus:ring-[#0d2b6e]/10 transition-all bg-gray-50 focus:bg-white"
                    />
                    <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold" style={{ color: '#0d2b6e' }}>
                    {mm ? 'စကားဝှက်အသစ် အတည်ပြုပါ' : 'Confirm New Password'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      required
                      type={showConfirmPw ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-gray-200 rounded-xl pl-11 pr-11 py-3.5 text-sm outline-none focus:border-[#0d2b6e] focus:ring-2 focus:ring-[#0d2b6e]/10 transition-all bg-gray-50 focus:bg-white"
                    />
                    <button type="button" onClick={() => setShowConfirmPw(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                  style={{ backgroundColor: '#0d2b6e' }}
                >
                  {submitting ? (mm ? 'သိမ်းဆည်းနေသည်...' : 'Saving...') : (mm ? 'စကားဝှက် သိမ်းဆည်းရန်' : 'Save New Password')}
                </button>
              </form>
            </>
          )}

          {/* Step 4: done */}
          {step === 'done' && (
            <div className="text-center flex flex-col items-center gap-5 py-10 bg-white rounded-2xl shadow-sm border border-gray-100 px-8">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#eff6ff' }}>
                <ShieldCheck className="w-9 h-9" style={{ color: '#0d2b6e' }} />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2" style={{ color: '#0d2b6e' }}>
                  {mm ? 'စကားဝှက် ပြောင်းလဲပြီးပါပြီ!' : 'Password Changed!'}
                </h2>
                <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                  {mm
                    ? 'သင့်စကားဝှက်အသစ်ဖြင့် ဝင်ရောက်နိုင်ပါပြီ။ Sign In စာမျက်နှာသို့ ပြန်ပို့ပေးနေပါသည်...'
                    : 'You can now sign in with your new password. Redirecting to Sign In...'}
                </p>
              </div>
              <Link
                href="/signin"
                className="px-8 py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#0d2b6e' }}
              >
                {mm ? 'ဝင်ရောက်ရန်' : 'Sign In'}
              </Link>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
