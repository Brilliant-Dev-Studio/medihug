'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  LayoutDashboard, Calendar, Stethoscope, ShoppingBag, LogOut,
  PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { useLang } from '../lib/LanguageContext';
import NotificationDropdown from '../components/NotificationDropdown';

const navItems = [
  { href: '/patient/dashboard',    icon: LayoutDashboard, mm: 'ပင်မ',              en: 'Dashboard' },
  { href: '/patient/doctors',      icon: Stethoscope,     mm: 'ဆရာဝန်များ',        en: 'Doctors' },
  { href: '/patient/records',      icon: ShoppingBag,     mm: 'Products များ',      en: 'Products' },
  { href: '/patient/appointments', icon: Calendar,        mm: 'ချိန်းဆိုမှု',      en: 'Appointments' },
];

const PRIMARY = '#0d2b6e';
const ACCENT  = '#4facfe';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { lang, setLang } = useLang();
  const mm = lang === 'mm';
  const [scrolled, setScrolled]       = useState(false);
  const [collapsed, setCollapsed]     = useState(false);
  const [langOpen, setLangOpen]       = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setScrolled(false);
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 50);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [pathname]);

  const sidebarW = collapsed ? 'lg:w-20' : 'lg:w-64';
  const mainML   = collapsed ? 'lg:ml-20' : 'lg:ml-64';

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Sidebar (desktop lg+) ── */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-white border-r border-gray-100 z-50 transition-all duration-300 ${sidebarW}`}
      >
        {/* Logo + Toggle */}
        <div className="px-4 py-5 border-b border-gray-100 flex items-center justify-between gap-2 min-h-18">
          {!collapsed && (
            <Link href="/" className="text-xl font-bold truncate">
              <span style={{ color: PRIMARY }}>Medi</span>
              <span style={{ color: ACCENT }}>Hug</span>
            </Link>
          )}
          {collapsed && (
            <Link href="/" className="mx-auto text-xl font-bold">
              <span style={{ color: PRIMARY }}>M</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(prev => !prev)}
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed
              ? <PanelLeftOpen  className="w-4 h-4" />
              : <PanelLeftClose className="w-4 h-4" />
            }
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 flex flex-col gap-1 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, mm: labelMm, en: labelEn }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? (mm ? labelMm : labelEn) : undefined}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${collapsed ? 'justify-center' : ''}`}
                style={{
                  backgroundColor: active ? PRIMARY : 'transparent',
                  color: active ? '#fff' : '#6b7280',
                }}
              >
                <Icon style={{ width: 20, height: 20, flexShrink: 0 }} />
                {!collapsed && <span className="truncate">{mm ? labelMm : labelEn}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User + Sign Out */}
        <div className="px-2 py-4 border-t border-gray-100 flex flex-col gap-1">
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ backgroundColor: PRIMARY }}
              >
                P
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: PRIMARY }}>Patient User</p>
                <p className="text-xs text-gray-400">PATIENT</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center py-1">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: PRIMARY }}
              >
                P
              </div>
            </div>
          )}
          <Link
            href="/signin"
            title={collapsed ? (mm ? 'ထွက်ရန်' : 'Sign Out') : undefined}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut style={{ width: 18, height: 18, flexShrink: 0 }} />
            {!collapsed && <span>{mm ? 'ထွက်ရန်' : 'Sign Out'}</span>}
          </Link>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className={`flex-1 ${mainML} flex flex-col transition-all duration-300`}>

        {/* Mobile scroll container */}
        <div
          ref={scrollRef}
          className="lg:hidden h-screen overflow-y-auto pb-16 flex flex-col w-screen max-w-full"
        >
          {/* Sticky mobile header */}
          <div
            className="sticky top-0 z-40 px-4 py-4 flex items-center justify-between transition-all duration-300"
            style={{
              background: scrolled ? '#ffffff' : 'transparent',
              boxShadow: scrolled ? '0 1px 12px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <Link href="/" className="text-xl font-bold">
              <span style={{ color: scrolled ? PRIMARY : '#ffffff' }}>Medi</span>
              <span style={{ color: scrolled ? ACCENT  : 'rgba(255,255,255,0.8)' }}>Hug</span>
            </Link>
            <div className="flex items-center gap-2">
              <NotificationDropdown />
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all duration-300"
                style={{ backgroundColor: scrolled ? PRIMARY : 'rgba(255,255,255,0.2)' }}
              >
                P
              </div>
            </div>
          </div>

          <main className="flex-1">{children}</main>
        </div>

        {/* Desktop top bar */}
        <div className="hidden lg:flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100 shrink-0">
          <p className="text-sm text-gray-400">
            {new Date().toLocaleDateString(mm ? 'my-MM' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <div className="flex items-center gap-3">

            {/* Language dropdown */}
            {(() => {
              const LANGS = [
                { code: 'mm' as const, label: 'မြန်မာ',  flag: '🇲🇲', sub: 'Myanmar'  },
                { code: 'en' as const, label: 'English', flag: '🇬🇧', sub: 'English'   },
              ];
              const current = LANGS.find(l => l.code === lang)!;
              return (
                <div className="relative">
                  <button
                    onClick={() => setLangOpen(o => !o)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-lg leading-none">{current.flag}</span>
                    <span className="text-sm font-semibold" style={{ color: PRIMARY }}>{current.label}</span>
                    <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>

                  {langOpen && (
                    <>
                      {/* backdrop */}
                      <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                      {/* dropdown */}
                      <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden w-44"
                        style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.10)' }}>
                        <div className="px-3 py-2 border-b border-gray-50">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Language</p>
                        </div>
                        {LANGS.map(l => (
                          <button
                            key={l.code}
                            onClick={() => { setLang(l.code); setLangOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors"
                          >
                            <span className="text-2xl leading-none">{l.flag}</span>
                            <div className="flex-1 text-left">
                              <p className="text-sm font-semibold text-gray-700">{l.label}</p>
                              <p className="text-[10px] text-gray-400">{l.sub}</p>
                            </div>
                            {lang === l.code && (
                              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PRIMARY }} />
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })()}

            <NotificationDropdown />
            <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: PRIMARY }}
              >
                P
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight" style={{ color: PRIMARY }}>Patient User</p>
                <p className="text-[10px] text-gray-400 leading-tight">PATIENT</p>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop */}
        <main className="hidden lg:block flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* ── Bottom Nav (mobile only) ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100">
        <div className="grid grid-cols-4 h-16">
          {navItems.map(({ href, icon: Icon, mm: labelMm, en: labelEn }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className="relative flex flex-col items-center justify-center gap-1 transition-colors"
                style={{ color: active ? PRIMARY : '#9ca3af' }}
              >
                {active && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                    style={{ backgroundColor: PRIMARY }}
                  />
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
