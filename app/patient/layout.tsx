'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  LayoutDashboard, Calendar, Stethoscope, ShoppingBag, LogOut,
  PanelLeftClose, PanelLeftOpen, UserCircle, Newspaper, ShoppingCart, ChevronUp, HeartPulse, Coins,
} from 'lucide-react';
import { useLang } from '../lib/LanguageContext';
import { ThemeProvider } from '../lib/ThemeContext';
import { RealtimeProvider } from '@/components/RealtimeProvider';
import { NotificationBellButton } from '@/components/NotificationBell';
import PatientAvatar from '@/components/PatientAvatar';
import IncomingCallRing from '@/components/IncomingCallRing';
import SupportChatWidget from '@/components/SupportChatWidget';
import DebugLogPanel from '@/components/DebugLogPanel';
import PatientAIChatWidget from '@/components/PatientAIChatWidget';
import { useCart } from '../lib/useCart';

const navItems = [
  { href: '/patient/dashboard',    icon: LayoutDashboard, mm: 'ပင်မ',              en: 'Dashboard' },
  { href: '/patient/doctors',      icon: Stethoscope,     mm: 'ဆရာဝန်များ',        en: 'Doctors' },
  { href: '/patient/records',      icon: ShoppingBag,     mm: 'ကုန်ပစ္စည်းနှင့် ဝန်ဆောင်မှုများ', en: 'Product and Services' },
  { href: '/patient/appointments', icon: Calendar,        mm: 'ချိန်းဆိုမှု',      en: 'Appointments' },
  { href: '/patient/settings',     icon: UserCircle,      mm: 'ပရိုဖိုင်',           en: 'Profile' },
];

// Shown only in the desktop sidebar, not the mobile bottom nav
const desktopOnlyNavItems = [
  { href: '/patient/programs', icon: HeartPulse, mm: 'ကျန်းမာရေး အစီအစဉ်', en: 'Programs' },
  { href: '/patient/blog', icon: Newspaper, mm: 'ဆောင်းပါးများ', en: 'Blog' },
  { href: '/patient/points', icon: Coins, mm: 'ပွိုင့်များ', en: 'Points' },
];

const PRIMARY = 'var(--color-primary)';
const ACCENT  = 'var(--color-accent)';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang } = useLang();
  const mm = lang === 'mm';
  const { count: cartCount } = useCart();
  const [scrolled, setScrolled]       = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [collapsed, setCollapsed]     = useState(false);
  const [langOpen, setLangOpen]       = useState(false);
  const [todayStr, setTodayStr]       = useState('');
  const [avatarUrl, setAvatarUrl]     = useState('');
  const [avatarLoading, setAvatarLoading] = useState(true);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [pointsBalance, setPointsBalance] = useState(0);
  const [authChecked, setAuthChecked] = useState(false);
  const [portalBlocked, setPortalBlocked] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTodayStr(new Date().toLocaleDateString(mm ? 'my-MM' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  }, [mm]);

  useEffect(() => {
    const raw = localStorage.getItem('medihug_patient');
    if (!raw) { setAvatarLoading(false); setAuthChecked(true); return; }
    const { phone, name } = JSON.parse(raw) as { phone: string; name?: string };
    setPatientPhone(phone);
    if (name) setPatientName(name);
    setAuthChecked(true);
    fetch(`/api/patient/points?phone=${encodeURIComponent(phone)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setPointsBalance(d.balance ?? 0); })
      .catch(() => {});
    fetch(`/api/patient/profile?phone=${encodeURIComponent(phone)}`)
      .then(r => r.json())
      .then(d => {
        // Non-patient accounts (admins etc.) must never land in the patient portal, even if
        // they went through the patient sign-in/OTP flow — kick them to their real portal.
        if (d.user?.role && d.user.role !== 'PATIENT') {
          localStorage.removeItem('medihug_patient');
          setPortalBlocked(true);
          const ADMIN_ROLES = ['SUPER_ADMIN', 'CO_ADMIN', 'PARTNER_MANAGER', 'POS_ADMIN', 'SUPPORT_ADMIN', 'MODERATOR'];
          router.replace(ADMIN_ROLES.includes(d.user.role) ? '/admin/login' : '/signin');
          return;
        }
        if (d.user?.profileImage) setAvatarUrl(d.user.profileImage);
        if (d.user?.name) setPatientName(d.user.name);
      })
      .catch(() => {})
      .finally(() => setAvatarLoading(false));

    const onAvatarUpdate = (e: Event) => setAvatarUrl((e as CustomEvent<string>).detail);
    const onNameUpdate = (e: Event) => setPatientName((e as CustomEvent<string>).detail);
    window.addEventListener('medihug-avatar-updated', onAvatarUpdate);
    window.addEventListener('medihug-name-updated', onNameUpdate);
    return () => {
      window.removeEventListener('medihug-avatar-updated', onAvatarUpdate);
      window.removeEventListener('medihug-name-updated', onNameUpdate);
    };
  }, []);

  useEffect(() => {
    setScrolled(false);
    setShowScrollTop(false);
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      setScrolled(el.scrollTop > 50);
      setShowScrollTop(el.scrollTop > 400);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
    // authChecked gates when the scrollable div actually mounts (portal renders null until
    // then) — without it, this effect can run once against a null ref and never re-attach.
  }, [pathname, authChecked]);

  const scrollToTop = () => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

  // No session → whole portal blocked, no exceptions.
  useEffect(() => {
    if (!authChecked || patientPhone) return;
    router.replace('/signin');
  }, [authChecked, patientPhone, router]);

  // Video call room renders full-screen — skip the portal chrome entirely, but the in-call
  // chat panel still needs RealtimeProvider — losing this wrapper here throws
  // "useRealtime must be used within a RealtimeProvider" as soon as the chat panel mounts.
  if (pathname.endsWith('/call')) return (
    <RealtimeProvider role="patient" phone={patientPhone || undefined}>
      <IncomingCallRing />{children}
    </RealtimeProvider>
  );

  // No session → don't render portal at all (redirect handled above).
  if (!authChecked || !patientPhone || portalBlocked) return null;

  const sidebarW = collapsed ? 'lg:w-20' : 'lg:w-64';
  const mainML   = collapsed ? 'lg:ml-20' : 'lg:ml-64';

  // Main nav pages get transparent→white header; everything else gets primary gradient always
  const MAIN_PAGES = ['/patient/dashboard', '/patient/doctors', '/patient/records', '/patient/appointments', '/patient/settings'];
  const isDetailPage = !MAIN_PAGES.includes(pathname);
  const headerBg = isDetailPage
    ? `linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)`
    : scrolled
      ? '#ffffff'
      : 'transparent';

  return (
    <RealtimeProvider role="patient" phone={patientPhone || undefined}>
    <ThemeProvider>
    <IncomingCallRing />
    {/* Both floating widgets sit bottom-left/bottom-right — the booking page and doctor detail
        page (schedule/booking tab) already have their own sticky bottom price bar pinned
        there, so the widgets would overlap it. Hide on those pages only. */}
    {pathname !== '/patient/booking' && !pathname.startsWith('/patient/doctors/') && (
      <>
        <SupportChatWidget />
        <PatientAIChatWidget stacked />
      </>
    )}
    <DebugLogPanel />
    <div className="h-dvh overflow-hidden bg-gray-50 flex">

      {/* ── Sidebar (desktop lg+) ── */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-dvh bg-white border-r border-gray-100 z-50 transition-all duration-300 print:hidden ${sidebarW}`}
      >
        {/* Logo */}
        <div className="px-4 py-5 border-b border-gray-100 flex items-center justify-start min-h-18">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-3">
              <Image src="/medihug-logo.png" alt="MediHug" width={48} height={48} className="object-contain h-12 w-auto" priority />
              <div className="flex flex-col leading-snug">
                <span className="text-[12px] font-semibold tracking-wide" style={{ color: PRIMARY }}>Compassionate</span>
                <span className="text-[12px] font-semibold tracking-wide" style={{ color: ACCENT }}>Healthcare</span>
              </div>
            </Link>
          )}
          {collapsed && (
            <Link href="/" className="mx-auto flex items-center justify-center">
              <Image src="/medihug-logo.png" alt="MediHug" width={56} height={56} className="object-contain" priority />
            </Link>
          )}
        </div>

        {/* Floating toggle button on right edge */}
        <button
          onClick={() => setCollapsed(prev => !prev)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-400 hover:text-gray-600 hover:shadow-lg transition-all z-10"
        >
          {collapsed
            ? <PanelLeftOpen  className="w-3.5 h-3.5" />
            : <PanelLeftClose className="w-3.5 h-3.5" />
          }
        </button>

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

          <div className="my-1 border-t border-gray-100" />

          {desktopOnlyNavItems.map(({ href, icon: Icon, mm: labelMm, en: labelEn }) => {
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
              <PatientAvatar src={avatarUrl} loading={avatarLoading} bg={PRIMARY} className="w-9 h-9 rounded-full text-white text-sm" />
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: PRIMARY }}>{patientName || 'Patient User'}</p>
                <p className="text-xs text-gray-400">PATIENT</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center py-1">
              <PatientAvatar src={avatarUrl} loading={avatarLoading} bg={PRIMARY} className="w-9 h-9 rounded-full text-white text-sm" />
            </div>
          )}
          <button
            onClick={() => { localStorage.removeItem('medihug_patient'); router.replace('/signin'); }}
            title={collapsed ? (mm ? 'ထွက်ရန်' : 'Sign Out') : undefined}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut style={{ width: 18, height: 18, flexShrink: 0 }} />
            {!collapsed && <span>{mm ? 'ထွက်ရန်' : 'Sign Out'}</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className={`flex-1 min-w-0 ${mainML} flex flex-col transition-all duration-300`}>

        {/* Mobile scroll container */}
        <div
          ref={scrollRef}
          className="lg:hidden h-dvh overflow-y-auto overscroll-y-contain pb-16 flex flex-col w-screen max-w-full"
        >
          {/* Sticky mobile header */}
          <div
            className="sticky top-0 z-60 px-4 py-4 flex items-center justify-between transition-all duration-300 print:hidden"
            style={{
              background: headerBg,
              boxShadow: scrolled ? '0 1px 12px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <Link href="/" className="flex items-center">
              <Image
                src="/medihug-logo.png"
                alt="MediHug"
                width={130}
                height={44}
                className="object-contain h-11 w-auto transition-all duration-300"
                priority
              />
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/patient/points" className="relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
                style={{ backgroundColor: (scrolled && !isDetailPage) ? '#f3f4f6' : 'rgba(255,255,255,0.2)', color: (scrolled && !isDetailPage) ? '#d97706' : '#fff' }}>
                <Coins className="w-4.5 h-4.5" />
                {pointsBalance > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: '#d97706' }}>
                    {pointsBalance > 999 ? '999+' : pointsBalance}
                  </span>
                )}
              </Link>
              <Link href="/patient/cart" className="relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
                style={{ backgroundColor: (scrolled && !isDetailPage) ? '#f3f4f6' : 'rgba(255,255,255,0.2)', color: (scrolled && !isDetailPage) ? PRIMARY : '#fff' }}>
                <ShoppingCart className="w-4.5 h-4.5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: '#ef4444' }}>
                    {cartCount}
                  </span>
                )}
              </Link>
              <NotificationBellButton
                iconColor={(scrolled && !isDetailPage) ? PRIMARY : '#fff'}
                hoverBg={(scrolled && !isDetailPage) ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.15)'}
              />
              <PatientAvatar
                src={avatarUrl} loading={avatarLoading}
                bg={(scrolled && !isDetailPage) ? PRIMARY : 'rgba(255,255,255,0.2)'}
                className="w-9 h-9 rounded-full text-white text-sm transition-all duration-300"
              />
            </div>
          </div>

          <main className="flex-1">{children}</main>
        </div>

        {/* Scroll-to-top */}
        {showScrollTop && (
          <button onClick={scrollToTop} aria-label="Scroll to top"
            className="lg:hidden fixed bottom-20 left-4 z-40 w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-white active:scale-90 transition-transform"
            style={{ backgroundColor: PRIMARY }}>
            <ChevronUp className="w-4.5 h-4.5" />
          </button>
        )}

        {/* Desktop top bar */}
        <div className="hidden lg:flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100 shrink-0 print:hidden">
          <p className="text-sm text-gray-400">
            {todayStr}
          </p>
          <div className="flex items-center gap-3">

            {/* Language dropdown */}
            {(() => {
              const LANGS = [
                { code: 'mm' as const, label: 'မြန်မာ',  flag: '/flags/myanmar.png', sub: 'Myanmar'  },
                { code: 'en' as const, label: 'English', flag: '/flags/english.jpg',  sub: 'English'  },
              ];
              const current = LANGS.find(l => l.code === lang)!;
              return (
                <div className="relative">
                  <button
                    onClick={() => setLangOpen(o => !o)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Image src={current.flag} alt={current.label} width={20} height={20} className="rounded-full object-cover w-5 h-5" />
                    <span className="text-sm font-semibold" style={{ color: PRIMARY }}>{current.label}</span>
                    <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>

                  {langOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
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
                            <Image src={l.flag} alt={l.label} width={28} height={28} className="rounded-full object-cover w-7 h-7 shrink-0" />
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

            <Link href="/patient/points" className="relative w-9 h-9 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors" style={{ color: '#d97706' }}>
              <Coins className="w-4 h-4" />
              {pointsBalance > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-4.5 h-4.5 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: '#d97706' }}>
                  {pointsBalance > 999 ? '999+' : pointsBalance}
                </span>
              )}
            </Link>
            <Link href="/patient/cart" className="relative w-9 h-9 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500 transition-colors">
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-4.5 h-4.5 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: '#ef4444' }}>
                  {cartCount}
                </span>
              )}
            </Link>
            <NotificationBellButton />
            <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
              <PatientAvatar src={avatarUrl} loading={avatarLoading} bg={PRIMARY} className="w-8 h-8 rounded-full text-white text-sm" />
              <div>
                <p className="text-sm font-semibold leading-tight" style={{ color: PRIMARY }}>{patientName || 'Patient User'}</p>
                <p className="text-[10px] text-gray-400 leading-tight">PATIENT</p>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop */}
        <main className="hidden lg:block flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>

      {/* ── Bottom Nav (mobile only) ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 print:hidden">
        <div className="grid grid-cols-5 h-16">
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
    </ThemeProvider>
    </RealtimeProvider>
  );
}
