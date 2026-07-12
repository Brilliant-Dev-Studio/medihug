'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { LayoutDashboard, Calendar, LogOut, Menu, X, Stethoscope, User, FileText, Bell } from 'lucide-react';
import { NotificationBellProvider, NotificationBellButton } from '@/components/NotificationBell';

const PRIMARY = '#2ab5ad';

interface DoctorInfo { id: string; name: string; nameEn: string | null; specialty: string; imageUrl: string | null; userId?: string; }

const navItems = [
  { href: '/doctor/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/doctor/appointments',  icon: Calendar,        label: 'My Appointments' },
  { href: '/doctor/notifications', icon: Bell,            label: 'Notifications' },
  { href: '/doctor/profile',       icon: User,            label: 'My Profile' },
  { href: '/doctor/blogs',         icon: FileText,        label: 'My Blogs' },
];

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [open, setOpen]     = useState(false);
  const [doctor, setDoctor] = useState<DoctorInfo | null>(null);

  useEffect(() => {
    fetch('/api/doctor/me').then(r => r.json()).then(d => setDoctor(d.doctor ?? null));
  }, [pathname]);

  const pageTitle = navItems.find(i => pathname === i.href || pathname.startsWith(i.href + '/'))?.label ?? 'Doctor Portal';

  const handleLogout = async () => {
    await fetch('/api/doctor/logout', { method: 'POST' });
    router.replace('/signin');
  };

  const SidebarContent = ({ layoutIdPrefix }: { layoutIdPrefix: string }) => (
    <div className="relative flex flex-col h-full overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(42,181,173,0.25) 0%, transparent 70%)' }} />
      <div className="absolute bottom-24 -left-16 w-40 h-40 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(42,181,173,0.15) 0%, transparent 70%)' }} />

      {/* Logo */}
      <div className="relative px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 flex items-center justify-center">
            <Image src="/medihug-logo.png" alt="MediHug" width={36} height={36} className="object-contain w-9 h-9" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight tracking-wide">MediHug</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Stethoscope className="w-2.5 h-2.5 text-teal-400" />
              <p className="text-[10px] text-teal-400 leading-tight font-semibold">Doctor Portal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="relative flex-1 px-2.5 py-4 overflow-y-auto flex flex-col gap-1">
        <p className="px-3 mb-1.5 text-[10px] font-bold text-white/25 uppercase tracking-widest">Menu</p>
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{ color: active ? '#fff' : 'rgba(255,255,255,0.55)' }}
            >
              {active && (
                <motion.div
                  layoutId={`${layoutIdPrefix}-active-nav`}
                  className="absolute inset-0 rounded-xl"
                  style={{ background: `linear-gradient(135deg, ${PRIMARY}33 0%, ${PRIMARY}14 100%)`, border: `1px solid ${PRIMARY}4d` }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                style={{ backgroundColor: active ? PRIMARY : 'rgba(255,255,255,0.06)' }}>
                <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: active ? '#fff' : 'rgba(255,255,255,0.6)' }} />
              </span>
              <span className="relative truncate">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="relative px-2.5 py-3.5 border-t border-white/10">
        {doctor && (
          <div className="flex items-center gap-2.5 px-2.5 py-2 mb-1.5 rounded-xl bg-white/5 border border-white/5">
            <div className="shrink-0">
              {doctor.imageUrl ? (
                <img src={doctor.imageUrl} alt={doctor.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10" />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/10" style={{ backgroundColor: PRIMARY }}>
                  {doctor.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{doctor.nameEn ?? doctor.name}</p>
              <p className="text-[10px] text-white/40 truncate">{doctor.specialty}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-white/50 hover:bg-red-500/10 hover:text-red-300 transition-all w-full"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );

  const body = (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-56 shrink-0 h-screen sticky top-0"
        style={{ background: `linear-gradient(180deg, #1e2d3d 0%, #162030 100%)` }}
      >
        <SidebarContent layoutIdPrefix="desktop" />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Image src="/medihug-logo.png" alt="MediHug" width={28} height={28} className="object-contain" />
          <p className="text-sm font-bold text-gray-800">Doctor Portal</p>
        </div>
        <div className="flex items-center gap-2">
          {doctor?.userId && <NotificationBellButton />}
          {doctor && (
            doctor.imageUrl ? (
              <img src={doctor.imageUrl} alt={doctor.name} className="w-7 h-7 rounded-full object-cover shrink-0 border border-gray-100" />
            ) : (
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold" style={{ backgroundColor: PRIMARY }}>
                {doctor.name.charAt(0)}
              </div>
            )
          )}
          <button onClick={() => setOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-56 h-full" style={{ background: `linear-gradient(180deg, #1e2d3d 0%, #162030 100%)` }}>
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-white/70 hover:text-white z-10">
              <X className="w-5 h-5" />
            </button>
            <SidebarContent layoutIdPrefix="mobile" />
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col pt-14 lg:pt-0">
        {/* Desktop header */}
        <header className="hidden lg:flex sticky top-0 z-30 bg-white border-b border-gray-100 px-6 py-3.5 items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-800">{pageTitle}</p>
            <p className="text-[11px] text-gray-400 leading-none mt-0.5">MediHug Doctor Portal</p>
          </div>
          <div className="flex items-center gap-3">
            {doctor?.userId && <NotificationBellButton />}
            {doctor && (
              doctor.imageUrl ? (
                <img src={doctor.imageUrl} alt={doctor.name} className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-100" />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold" style={{ backgroundColor: PRIMARY }}>
                  {doctor.name.charAt(0)}
                </div>
              )
            )}
          </div>
        </header>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );

  // Single shared feed connection + sound listener for both bell buttons above.
  return doctor?.userId
    ? <NotificationBellProvider userId={doctor.userId}>{body}</NotificationBellProvider>
    : body;
}
