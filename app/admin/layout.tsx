'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard, Users, Stethoscope, ShoppingBag,
  Calendar, FileText, BarChart2, Settings, LogOut,
  ShieldCheck, Menu, X, ChevronRight, ChevronDown, Building2, Tags, BookOpen, Layers, Megaphone, Image as ImageIcon,
  Bell, CalendarClock, Headset, HeartPulse, Store, ClipboardCheck,
  Percent, CreditCard, Receipt, PieChart, Undo2, Scale, Target, TrendingUp,
  ArrowLeftRight, History, Trash2, ClipboardList, MessageSquareQuote,
} from 'lucide-react';
import { RealtimeProvider } from '@/components/RealtimeProvider';
import { NotificationBellButton } from '@/components/NotificationBell';
import { hasPermission, type Permission } from '@/lib/permissions';

const PRIMARY = '#2ab5ad';
const DARK    = '#1a9990';

const navGroups = [
  {
    label: 'Main',
    items: [
      { href: '/admin/dashboard', icon: LayoutDashboard, mm: 'Dashboard',       en: 'Dashboard', perm: 'dashboard.view' as Permission },
      { href: '/admin/reports',  icon: BarChart2,       mm: 'အစီရင်ခံစာ',       en: 'Reports', perm: 'dashboard.view' as Permission },
      { href: '/admin/pos',      icon: Store,           mm: 'POS',              en: 'POS', perm: 'pos.manage' as Permission,
        children: [
          { href: '/admin/finance/revenue-ledger',  icon: Layers,     mm: 'ဝင်ငွေ Ledger',       en: 'Revenue Ledger' },
          { href: '/admin/finance/pnl',             icon: PieChart,   mm: 'အမြတ်/အရှုံး',        en: 'P&L' },
          { href: '/admin/finance/rules',           icon: Percent,    mm: 'ကော်မရှင်စည်းမျဉ်း',   en: 'Commission Rules' },
          { href: '/admin/finance/payment-methods', icon: CreditCard, mm: 'ငွေပေးချေမှုနည်းလမ်း', en: 'Payment Methods' },
          { href: '/admin/finance/expenses',        icon: Receipt,    mm: 'အသုံးစရိတ်',          en: 'Expenses' },
          { href: '/admin/finance/refunds',         icon: Undo2,      mm: 'ငွေပြန်အမ်း',          en: 'Refunds' },
          { href: '/admin/finance/reconciliation',  icon: Scale,      mm: 'ငွေစာရင်းချိန်ညှိခြင်း', en: 'Reconciliation' },
          { href: '/admin/finance/budget',          icon: Target,     mm: 'ဘတ်ဂျက်',              en: 'Budget vs Actual' },
          { href: '/admin/finance/forecast',        icon: TrendingUp, mm: 'ခန့်မှန်းချက်',         en: 'Forecast' },
          { href: '/admin/finance/revenue',         icon: Megaphone,  mm: 'Program/Ads ဝင်ငွေ',   en: 'Program/Ads Revenue' },
          { href: '/admin/finance/cashflow',        icon: ArrowLeftRight, mm: 'ငွေသားစီးဆင်းမှု',  en: 'Cash Flow' },
          { href: '/admin/finance/audit-log',       icon: History,    mm: 'မှတ်တမ်း Log',         en: 'Audit Log' },
          { href: '/admin/deletion-requests',       icon: Trash2,     mm: 'ဖျက်ရန် တောင်းဆိုမှုများ', en: 'Deletion Requests', perm: 'pos.delete' as Permission },
        ],
      },
      { href: '/admin/notifications', icon: Bell,        mm: 'အသိပေးချက်များ',   en: 'Notifications' },
      { href: '/admin/support',   icon: Headset,         mm: 'Customer Support',  en: 'Customer Support', perm: 'support.manage' as Permission },
      { href: '/admin/users',     icon: Users,           mm: 'လူနာများ',         en: 'Patients', perm: 'dashboard.view' as Permission },
      { href: '/admin/doctors',   icon: Stethoscope,     mm: 'ဆရာဝန်များ',       en: 'Doctors', perm: 'partners.manage' as Permission },
      { href: '/admin/appointments', icon: Calendar,     mm: 'ချိန်းဆိုမှုများ',  en: 'Appointments', perm: 'dashboard.view' as Permission },
      { href: '/admin/program-enrollments', icon: ClipboardCheck, mm: 'အစီအစဉ် ဆေးမှတ်တမ်းများ', en: 'Program Enrollments', perm: 'dashboard.view' as Permission },
      { href: '/admin/medical-records', icon: ClipboardList, mm: 'ဆေးမှတ်တမ်းများ', en: 'Medical Records', perm: 'dashboard.view' as Permission },
      { href: '/admin/orders',       icon: ShoppingBag,  mm: 'အော်ဒါများ',       en: 'Orders', perm: 'pos.manage' as Permission },
      { href: '/admin/custom-time-requests', icon: CalendarClock, mm: 'အထူးအချိန်တောင်းဆိုမှုများ', en: 'Custom Time Requests', perm: 'dashboard.view' as Permission },
      { href: '/admin/clinics',       icon: Building2,    mm: 'မိတ်ဖက်များ', en: 'Partners', perm: 'partners.manage' as Permission },
      { href: '/admin/partner-types', icon: Tags,         mm: 'မိတ်ဖက် အမျိုးအစားများ',    en: 'Partner Types', perm: 'partners.manage' as Permission },
      { href: '/admin/specialties',   icon: Tags,         mm: 'အထူးကုဌာနများ',              en: 'Specialties', perm: 'partners.manage' as Permission },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/products',            icon: ShoppingBag, mm: 'ကုန်ပစ္စည်းနှင့် ဝန်ဆောင်မှုများ', en: 'Product and Services', perm: 'dashboard.view' as Permission },
      { href: '/admin/product-categories', icon: Layers,      mm: 'Category',           en: 'Categories', perm: 'dashboard.view' as Permission },
      { href: '/admin/blogs',              icon: FileText,    mm: 'ဆောင်းပါးများ',      en: 'Blogs', perm: 'dashboard.view' as Permission },
      { href: '/admin/blog-categories',    icon: BookOpen,    mm: 'Blog Categories',    en: 'Blog Categories', perm: 'dashboard.view' as Permission },
      { href: '/admin/healthcare-programs', icon: HeartPulse, mm: 'ကျန်းမာရေး အစီအစဉ်များ', en: 'Healthcare Programs', perm: 'dashboard.view' as Permission },
      { href: '/admin/program-categories', icon: Layers,      mm: 'Program Category',   en: 'Program Categories', perm: 'dashboard.view' as Permission },
      { href: '/admin/special-offers',     icon: Megaphone,   mm: 'အထူးပရိုမိုးရှင်း',  en: 'Special Offers', perm: 'dashboard.view' as Permission },
      { href: '/admin/ads',                icon: ImageIcon,   mm: 'ကြော်ငြာများ',       en: 'Ads', perm: 'dashboard.view' as Permission },
      { href: '/admin/testimonials',       icon: MessageSquareQuote, mm: 'သုံးသပ်ချက်များ', en: 'Testimonials', perm: 'settings.manage' as Permission },
      { href: '/admin/records',          icon: FileText,   mm: 'မှတ်တမ်းများ',           en: 'Records', perm: 'dashboard.view' as Permission },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/admin/settings',  icon: Settings,        mm: 'ဆက်တင်',           en: 'Settings', perm: 'admins.manage' as Permission },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [open, setOpen]     = useState(false);
  const [supportUnread, setSupportUnread] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [role, setRole]     = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    if (pathname === '/admin/login') return;
    fetch('/api/admin/me').then(r => r.json()).then(d => {
      setRole(d.admin?.role ?? null);
      setRoleLoading(false);
    }).catch(() => setRoleLoading(false));
  }, [pathname]);

  useEffect(() => {
    if (pathname === '/admin/login') return;
    if (!role || !hasPermission(role, 'support.manage')) return;
    let cancelled = false;
    async function poll() {
      if (document.hidden) return;
      try {
        const res = await fetch('/api/admin/support/unread');
        const data = await res.json();
        if (!cancelled) setSupportUnread((data.count ?? 0) > 0);
      } catch {}
    }
    poll();
    const interval = setInterval(poll, 10000);
    document.addEventListener('visibilitychange', poll);
    return () => { cancelled = true; clearInterval(interval); document.removeEventListener('visibilitychange', poll); };
  }, [pathname, role]);

  useEffect(() => {
    if (pathname === '/admin/login' || roleLoading) return;
    if (role === 'MODERATOR' && !pathname.startsWith('/admin/moderate')) {
      router.replace('/admin/moderate');
    }
  }, [pathname, role, roleLoading, router]);

  const visibleNavGroups = navGroups
    .map(g => ({
      ...g,
      items: g.items
        .filter(item => !item.perm || !role || hasPermission(role, item.perm))
        .map(item => ('children' in item && item.children)
          ? { ...item, children: item.children.filter(c => !('perm' in c) || !role || hasPermission(role, (c as { perm: Permission }).perm)) }
          : item),
    }))
    .filter(g => g.items.length > 0);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
  };

  if (pathname === '/admin/login') return <>{children}</>;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)' }}>
            <Image src="/medihug-logo.png" alt="MediHug" width={36} height={36} className="object-contain w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">MediHug</p>
            <div className="flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-2.5 h-2.5 text-teal-400" />
              <p className="text-[10px] text-teal-400 leading-tight font-semibold">Super Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto flex flex-col gap-5">
        {visibleNavGroups.map(group => (
          <div key={group.label}>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 mb-1.5">{group.label}</p>
            {group.items.map(item => {
              const { href, icon: Icon, en, children } = item;
              const active = pathname === href || pathname.startsWith(href + '/');
              const childActive = !!children?.some(c => pathname === c.href || pathname.startsWith(c.href + '/'));
              const isOpen = expanded.has(href) || childActive;

              if (!children) {
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5"
                    style={{
                      backgroundColor: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                      color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    <span className="relative shrink-0">
                      <Icon className="w-4 h-4" />
                      {href === '/admin/support' && supportUnread && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                      )}
                    </span>
                    <span>{en}</span>
                    {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
                  </Link>
                );
              }

              return (
                <div key={href} className="mb-0.5">
                  <div
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{
                      backgroundColor: active || childActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                      color: active || childActive ? '#fff' : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    <Link href={href} onClick={() => setOpen(false)} className="flex items-center gap-3 flex-1 min-w-0">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{en}</span>
                    </Link>
                    <button
                      onClick={() => setExpanded(prev => {
                        const next = new Set(prev);
                        if (next.has(href)) next.delete(href); else next.add(href);
                        return next;
                      })}
                      className="shrink-0 p-0.5"
                    >
                      <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                  {isOpen && (
                    <div className="mt-0.5 ml-4 pl-3 border-l border-white/10 flex flex-col gap-0.5">
                      {children.map(c => {
                        const cActive = pathname === c.href || pathname.startsWith(c.href + '/');
                        return (
                          <Link
                            key={c.href}
                            href={c.href}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                            style={{
                              backgroundColor: cActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                              color: cActive ? '#fff' : 'rgba(255,255,255,0.45)',
                            }}
                          >
                            <c.icon className="w-3.5 h-3.5 shrink-0" />
                            <span>{c.en}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ background: 'rgba(255,255,255,0.2)' }}>
            A
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">Super Admin</p>
            <p className="text-[10px] text-white/40 truncate">09265577723</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <RealtimeProvider role="admin">
    <div className="min-h-screen bg-gray-100 flex">

      {/* ── Desktop sidebar ── */}
      <aside
        className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-60 z-50 print:hidden"
        style={{ background: `linear-gradient(180deg, #1e2d3d 0%, #162030 100%)` }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex print:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="relative w-64 h-full z-10 flex flex-col"
            style={{ background: `linear-gradient(180deg, #1e2d3d 0%, #162030 100%)` }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main ── */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen print:ml-0">

        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 lg:px-6 py-3.5 flex items-center gap-4 print:hidden">
          <button onClick={() => setOpen(true)} className="lg:hidden w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500">
            <Menu className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-800">
              {navGroups.flatMap(g => g.items).flatMap(i => [i, ...(i.children ?? [])]).find(i => pathname === i.href || pathname.startsWith(i.href + '/'))?.en ?? 'Admin Portal'}
            </p>
            <p className="text-[11px] text-gray-400 leading-none mt-0.5">MediHug Super Admin</p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBellButton />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
    </RealtimeProvider>
  );
}
