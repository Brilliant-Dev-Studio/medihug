'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { LayoutDashboard, Calendar, Stethoscope, FileText, LogOut } from 'lucide-react';
import { useLang } from '../lib/LanguageContext';
import NotificationDropdown from '../components/NotificationDropdown';

const navItems = [
  { href: '/patient/dashboard',    icon: LayoutDashboard, mm: 'ပင်မ',              en: 'Dashboard' },
  { href: '/patient/doctors',      icon: Stethoscope,     mm: 'ဆရာဝန်များ',        en: 'Doctors' },
  { href: '/patient/appointments', icon: Calendar,        mm: 'ချိန်းဆိုမှု',      en: 'Appointments' },
  { href: '/patient/records',      icon: FileText,        mm: 'ကျန်းမာရေးမှတ်တမ်း', en: 'Records' },
];

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { lang } = useLang();
  const mm = lang === 'mm';
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setScrolled(false);
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 50);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Sidebar (desktop lg+) ── */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 z-50">

        {/* Logo */}
        <div className="px-6 py-6 border-b border-gray-100">
          <Link href="/" className="text-xl font-bold">
            <span style={{ color: '#0d2b6e' }}>Medi</span>
            <span style={{ color: '#4facfe' }}>Hug</span>
          </Link>
          <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest">
            {mm ? 'လူနာ Panel' : 'Patient Panel'}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 flex flex-col gap-1 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, mm: labelMm, en: labelEn }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  backgroundColor: active ? '#0d2b6e' : 'transparent',
                  color: active ? '#fff' : '#6b7280',
                }}
              >
                <Icon style={{ width: 18, height: 18, flexShrink: 0 }} />
                {mm ? labelMm : labelEn}
              </Link>
            );
          })}
        </nav>

        {/* User + Sign Out */}
        <div className="px-3 py-4 border-t border-gray-100 flex flex-col gap-1">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: '#0d2b6e' }}>
              P
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: '#0d2b6e' }}>Patient User</p>
              <p className="text-xs text-gray-400">PATIENT</p>
            </div>
          </div>
          <Link
            href="/signin"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <LogOut style={{ width: 18, height: 18 }} />
            {mm ? 'ထွက်ရန်' : 'Sign Out'}
          </Link>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 lg:ml-64 flex flex-col">

        {/* Mobile: scroll container — header is sticky inside it */}
        <div
          ref={scrollRef}
          className="lg:hidden h-screen overflow-y-auto pb-16 flex flex-col"
        >
          {/* Sticky header inside scroll container */}
          <div
            className="sticky top-0 z-40 px-4 py-4 flex items-center justify-between transition-all duration-300"
            style={{
              background: scrolled ? '#ffffff' : 'transparent',
              boxShadow: scrolled ? '0 1px 12px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <Link href="/" className="text-xl font-bold">
              <span style={{ color: scrolled ? '#0d2b6e' : '#ffffff' }}>Medi</span>
              <span style={{ color: scrolled ? '#4facfe' : 'rgba(255,255,255,0.8)' }}>Hug</span>
            </Link>
            <div className="flex items-center gap-2">
              <NotificationDropdown />
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all duration-300"
                style={{ backgroundColor: scrolled ? '#0d2b6e' : 'rgba(255,255,255,0.2)' }}
              >
                P
              </div>
            </div>
          </div>

          {/* Page content (mobile) */}
          <main className="flex-1">
            {children}
          </main>
        </div>

        {/* Desktop: normal flow */}
        <main className="hidden lg:block flex-1 pb-0">
          {children}
        </main>
      </div>

      {/* ── Bottom Nav (mobile) ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100">
        <div className="grid grid-cols-4 h-16">
          {navItems.map(({ href, icon: Icon, mm: labelMm, en: labelEn }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="relative flex flex-col items-center justify-center gap-1 transition-colors"
                style={{ color: active ? '#0d2b6e' : '#9ca3af' }}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full" style={{ backgroundColor: '#0d2b6e' }} />
                )}
                <Icon style={{ width: 20, height: 20 }} />
                <span className="text-[10px] font-medium">{mm ? labelMm : labelEn}</span>
              </Link>
            );
          })}
        </div>
      </nav>

    </div>
  );
}
