'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard, Users, Stethoscope, ShoppingBag,
  Calendar, FileText, BarChart2, Settings, LogOut,
  ShieldCheck, Menu, X, ChevronRight, Building2, Tags, BookOpen, Layers, Megaphone, Image as ImageIcon,
  Bell,
} from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';

const PRIMARY = '#2ab5ad';
const DARK    = '#1a9990';

const navGroups = [
  {
    label: 'Main',
    items: [
      { href: '/admin/dashboard', icon: LayoutDashboard, mm: 'Dashboard',       en: 'Dashboard' },
      { href: '/admin/users',     icon: Users,           mm: 'လူနာများ',         en: 'Patients' },
      { href: '/admin/doctors',   icon: Stethoscope,     mm: 'ဆရာဝန်များ',       en: 'Doctors' },
      { href: '/admin/appointments', icon: Calendar,     mm: 'ချိန်းဆိုမှုများ',  en: 'Appointments' },
      { href: '/admin/clinics',       icon: Building2,    mm: 'မိတ်ဖက်များ', en: 'Partners' },
      { href: '/admin/partner-types', icon: Tags,         mm: 'မိတ်ဖက် အမျိုးအစားများ',    en: 'Partner Types' },
      { href: '/admin/specialties',   icon: Tags,         mm: 'အထူးကုဌာနများ',              en: 'Specialties' },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/products',            icon: ShoppingBag, mm: 'ကုန်ပစ္စည်းများ',  en: 'Products' },
      { href: '/admin/product-categories', icon: Layers,      mm: 'Category',           en: 'Categories' },
      { href: '/admin/blogs',              icon: FileText,    mm: 'ဆောင်းပါးများ',      en: 'Blogs' },
      { href: '/admin/blog-categories',    icon: BookOpen,    mm: 'Blog Categories',    en: 'Blog Categories' },
      { href: '/admin/special-offers',     icon: Megaphone,   mm: 'အထူးပရိုမိုးရှင်း',  en: 'Special Offers' },
      { href: '/admin/ads',                icon: ImageIcon,   mm: 'ကြော်ငြာများ',       en: 'Ads' },
      { href: '/admin/reports',          icon: BarChart2,  mm: 'အစီရင်ခံစာ',            en: 'Reports' },
      { href: '/admin/records',          icon: FileText,   mm: 'မှတ်တမ်းများ',           en: 'Records' },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/admin/notifications', icon: Bell,        mm: 'အသိပေးချက်များ',   en: 'Notifications' },
      { href: '/admin/settings',  icon: Settings,        mm: 'ဆက်တင်',           en: 'Settings' },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [open, setOpen]     = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);

  useEffect(() => {
    if (pathname === '/admin/login') return;
    let cancelled = false;
    fetch('/api/admin/me').then(r => r.json()).then(d => {
      if (!cancelled) setAdminId(d.admin?.id ?? null);
    });
    return () => { cancelled = true; };
  }, [pathname]);

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
        {navGroups.map(group => (
          <div key={group.label}>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 mb-1.5">{group.label}</p>
            {group.items.map(({ href, icon: Icon, en }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
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
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{en}</span>
                  {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
                </Link>
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
    <div className="min-h-screen bg-gray-100 flex">

      {/* ── Desktop sidebar ── */}
      <aside
        className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-60 z-50"
        style={{ background: `linear-gradient(180deg, #1e2d3d 0%, #162030 100%)` }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="relative w-64 h-full z-10 flex flex-col"
            style={{ background: `linear-gradient(180deg, #1e2d3d 0%, #162030 100%)` }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main ── */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">

        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 lg:px-6 py-3.5 flex items-center gap-4">
          <button onClick={() => setOpen(true)} className="lg:hidden w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500">
            <Menu className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-800">
              {navGroups.flatMap(g => g.items).find(i => pathname === i.href || pathname.startsWith(i.href + '/'))?.en ?? 'Admin Portal'}
            </p>
            <p className="text-[11px] text-gray-400 leading-none mt-0.5">MediHug Super Admin</p>
          </div>
          <div className="flex items-center gap-3">
            {adminId && <NotificationBell userId={adminId} />}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
