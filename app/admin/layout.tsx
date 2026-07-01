'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard, Users, Stethoscope, ShoppingBag,
  Calendar, FileText, BarChart2, Settings, LogOut,
  ShieldCheck, Menu, X, ChevronRight, Bell, Building2, Tags, BookOpen, Layers,
} from 'lucide-react';

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
      { href: '/admin/clinics',       icon: Building2,    mm: 'မိတ်ဖက် ဆေးဆိုင်/ဆေးခန်း', en: 'Clinics & Pharmacies' },
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
      { href: '/admin/reports',          icon: BarChart2,  mm: 'အစီရင်ခံစာ',            en: 'Reports' },
      { href: '/admin/records',          icon: FileText,   mm: 'မှတ်တမ်းများ',           en: 'Records' },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/admin/settings',  icon: Settings,        mm: 'ဆက်တင်',           en: 'Settings' },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [open, setOpen]         = useState(false);
  const [bellOpen, setBellOpen] = useState(false);

  const NOTIFICATIONS = [
    { id: 1, text: 'New appointment booked by Patient #124', time: '2 min ago', unread: true },
    { id: 2, text: 'Dr. Aung Ko cancelled appointment #88',  time: '15 min ago', unread: true },
    { id: 3, text: 'New patient registered: Ma Hnin Wai',     time: '1 hr ago',  unread: false },
    { id: 4, text: 'Product stock low: Paracetamol 500mg',    time: '3 hr ago',  unread: false },
  ];
  const unreadCount = NOTIFICATIONS.filter(n => n.unread).length;

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
            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setBellOpen(o => !o)}
                className="relative w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: '#ef4444' }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {bellOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} />
                  <div className="absolute right-0 top-11 z-50 w-80 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-700">Notifications</p>
                      {unreadCount > 0 && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: PRIMARY }}>
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col divide-y divide-gray-50 max-h-72 overflow-y-auto">
                      {NOTIFICATIONS.map(n => (
                        <div key={n.id} className={`flex gap-3 px-4 py-3 ${n.unread ? 'bg-teal-50/50' : ''}`}>
                          <div className="mt-1 w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: n.unread ? PRIMARY : '#d1d5db' }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-700 leading-relaxed">{n.text}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="w-full py-3 text-xs font-semibold text-center hover:bg-gray-50 transition-colors border-t border-gray-100" style={{ color: PRIMARY }}>
                      View all notifications
                    </button>
                  </div>
                </>
              )}
            </div>
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
