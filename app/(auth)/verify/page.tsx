'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLang } from '../../lib/LanguageContext';

const DEFAULT_OTP = '123456';

export default function VerifyPage() {
  const { lang } = useLang();
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verified, setVerified] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otp];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleResend = () => {
    setCountdown(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    inputs.current[0]?.focus();
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otp.join('');
    if (entered.length < 6) return;
    if (entered !== DEFAULT_OTP) {
      toast.error(lang === 'mm' ? 'OTP ကုဒ် မှားနေသည်' : 'Incorrect OTP code');
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
      return;
    }
    toast.success(lang === 'mm' ? 'အတည်ပြုပြီးပါပြီ!' : 'Verified successfully!');
    setVerified(true);
    const role = sessionStorage.getItem('medihug_login_role');
    const destination = role === 'DOCTOR' ? '/doctor/dashboard' : '/patient/dashboard';
    setTimeout(() => router.push(destination), 1500);
  };

  const filled = otp.join('').length === 6;

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
            <ShieldCheck className="w-8 h-8" style={{ color: '#4facfe' }} />
          </div>
          <p className="text-white text-3xl font-bold leading-tight mb-4">
            {lang === 'mm' ? 'ဖုန်းနံပါတ်\nအတည်ပြုခြင်း' : 'Phone\nVerification'}
          </p>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            {lang === 'mm'
              ? 'သင့်ဖုန်းနံပါတ်သို့ ပေးပို့သော OTP ကုဒ်ကို ထည့်သွင်းပြီး အတည်ပြုပါ'
              : 'Enter the OTP code sent to your phone number to verify your account'}
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center px-5 sm:px-10 lg:overflow-y-auto" style={{ backgroundColor: '#f8faff' }}>
        <div className="w-full max-w-md py-8">

          {verified ? (
            <div className="text-center flex flex-col items-center gap-5 py-10 bg-white rounded-2xl shadow-sm border border-gray-100 px-8">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#eff6ff' }}>
                <ShieldCheck className="w-9 h-9" style={{ color: '#0d2b6e' }} />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2" style={{ color: '#0d2b6e' }}>
                  {lang === 'mm' ? 'အတည်ပြုပြီးပါပြီ!' : 'Verified!'}
                </h2>
                <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                  {lang === 'mm'
                    ? 'သင့်ဖုန်းနံပါတ် အတည်ပြုပြီးပါပြီ။ ယခု ဝင်ရောက်နိုင်ပါပြီ။'
                    : 'Your phone number has been verified. You can now sign in.'}
                </p>
              </div>
              <Link
                href="/signin"
                className="px-8 py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#0d2b6e' }}
              >
                {lang === 'mm' ? 'ဝင်ရောက်ရန်' : 'Sign In'}
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#4facfe' }}>
                  {lang === 'mm' ? 'အတည်ပြုရန်' : 'Verification'}
                </p>
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#0d2b6e' }}>
                  {lang === 'mm' ? 'OTP ကုဒ် ထည့်ပါ' : 'Enter OTP Code'}
                </h1>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {lang === 'mm'
                    ? 'သင့်ဖုန်းနံပါတ်သို့ ၆ လုံး OTP ကုဒ် ပေးပို့ထားပါသည်'
                    : 'A 6-digit OTP code has been sent to your phone number'}
                </p>
              </div>

              <form onSubmit={handleVerify} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col gap-6">

                {/* OTP inputs */}
                <div className="flex gap-2 sm:gap-3 justify-center" onPaste={handlePaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { inputs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleChange(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      className="w-11 h-14 sm:w-13 sm:h-16 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all"
                      style={{
                        borderColor: digit ? '#0d2b6e' : '#e5e7eb',
                        color: '#0d2b6e',
                        backgroundColor: digit ? '#eff6ff' : '#f9fafb',
                      }}
                    />
                  ))}
                </div>

                {/* Countdown / Resend */}
                <div className="text-center">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="flex items-center gap-1.5 mx-auto text-sm font-semibold transition-colors"
                      style={{ color: '#0d2b6e' }}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {lang === 'mm' ? 'ပြန်ပို့ရန်' : 'Resend OTP'}
                    </button>
                  ) : (
                    <p className="text-xs text-gray-400">
                      {lang === 'mm' ? 'ပြန်ပို့နိုင်မည့်အချိန် ' : 'Resend in '}
                      <span className="font-semibold" style={{ color: '#0d2b6e' }}>
                        0:{countdown.toString().padStart(2, '0')}
                      </span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!filled}
                  className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-opacity"
                  style={{ backgroundColor: '#0d2b6e', opacity: filled ? 1 : 0.4 }}
                >
                  {lang === 'mm' ? 'အတည်ပြုရန်' : 'Verify'}
                </button>

              </form>

              <p className="text-center text-sm text-gray-400 mt-6">
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
