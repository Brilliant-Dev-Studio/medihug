'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Heart, Baby, Brain, Eye, Bone, Droplets, Stethoscope,
  Activity, Wind, Microscope, Syringe, Thermometer,
  ChevronRight, FlaskConical, Ribbon, ShieldPlus, Dumbbell,
  Pill, Zap, Sun, Leaf,
} from 'lucide-react';
import { ElementType } from 'react';
import { useLang } from '../lib/LanguageContext';

const PRIMARY = 'var(--color-primary)';
const ACCENT  = 'var(--color-accent)';

const ICON_PALETTE: { icon: ElementType; color: string; bg: string }[] = [
  { icon: Heart,        color: '#ef4444', bg: '#fef2f2' },
  { icon: Baby,         color: '#f97316', bg: '#fff7ed' },
  { icon: Brain,        color: '#8b5cf6', bg: '#f5f3ff' },
  { icon: Eye,          color: '#06b6d4', bg: '#ecfeff' },
  { icon: Bone,         color: '#78716c', bg: '#f5f5f4' },
  { icon: Droplets,     color: '#0ea5e9', bg: '#f0f9ff' },
  { icon: Stethoscope,  color: '#10b981', bg: '#f0fdf4' },
  { icon: Activity,     color: '#ec4899', bg: '#fdf2f8' },
  { icon: Wind,         color: '#14b8a6', bg: '#f0fdfa' },
  { icon: Microscope,   color: '#dc2626', bg: '#fef2f2' },
  { icon: Syringe,      color: '#d97706', bg: '#fffbeb' },
  { icon: Thermometer,  color: '#16a34a', bg: '#f0fdf4' },
  { icon: FlaskConical, color: '#7c3aed', bg: '#ede9fe' },
  { icon: Ribbon,       color: '#db2777', bg: '#fce7f3' },
  { icon: ShieldPlus,   color: '#2563eb', bg: '#eff6ff' },
  { icon: Dumbbell,     color: '#65a30d', bg: '#f7fee7' },
  { icon: Pill,         color: '#0891b2', bg: '#ecfeff' },
  { icon: Zap,          color: '#ca8a04', bg: '#fefce8' },
  { icon: Sun,          color: '#ea580c', bg: '#fff7ed' },
  { icon: Leaf,         color: '#15803d', bg: '#f0fdf4' },
];

interface Specialty { id: string; name: string; nameEn: string | null; }

function SkeletonTile({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 bg-white rounded-2xl border border-gray-100 ${mobile ? 'px-3 py-3' : 'px-4 py-3.5'}`}>
      <div className="h-4 bg-gray-200 rounded animate-pulse flex-1" />
      <div className={`${mobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-xl bg-gray-100 animate-pulse shrink-0`} />
    </div>
  );
}

export default function SpecialistDoctorsSection() {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const [specs,   setSpecs]   = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/specialties')
      .then(r => r.json())
      .then(d => { setSpecs(d.specialties ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (!loading && specs.length === 0) return null;

  const shown = specs.slice(0, 8);

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-xl" style={{ color: PRIMARY }}>
            {mm ? 'အထူးကုဆရာဝန်များ' : 'Specialist Doctors'}
          </h2>
          <Link href="/patient/doctors" className="text-sm font-semibold flex items-center gap-0.5" style={{ color: ACCENT }}>
            {mm ? 'အားလုံး' : 'See all'} <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonTile key={i} />)
            : shown.map((s, i) => {
                const { icon: Icon, color, bg } = ICON_PALETTE[i % ICON_PALETTE.length];
                const label = mm ? s.name : (s.nameEn ?? s.name);
                return (
                  <Link key={s.id}
                    href={`/patient/doctors?specialty=${encodeURIComponent(s.name)}`}
                    className="flex items-center justify-between gap-3 bg-white rounded-2xl border border-gray-100 px-4 py-3.5 active:scale-[0.98] transition-all hover:border-gray-200 hover:shadow-sm">
                    <span className="text-sm font-semibold text-gray-700 leading-snug">{label}</span>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: bg, border: `1.5px solid ${color}30` }}>
                      <Icon style={{ width: 24, height: 24, color }} />
                    </div>
                  </Link>
                );
              })
          }
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-base" style={{ color: PRIMARY }}>
            {mm ? 'အထူးကုဆရာဝန်များ' : 'Specialist Doctors'}
          </h2>
          <Link href="/patient/doctors" className="text-xs font-semibold flex items-center gap-0.5" style={{ color: ACCENT }}>
            {mm ? 'အားလုံး' : 'See all'} <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonTile key={i} mobile />)
            : shown.map((s, i) => {
                const { icon: Icon, color, bg } = ICON_PALETTE[i % ICON_PALETTE.length];
                const label = mm ? s.name : (s.nameEn ?? s.name);
                return (
                  <Link key={s.id}
                    href={`/patient/doctors?specialty=${encodeURIComponent(s.name)}`}
                    className="flex items-center justify-between gap-2 bg-white rounded-2xl border border-gray-100 px-3 py-3 active:scale-[0.98] transition-all">
                    <span className="text-xs font-semibold text-gray-700 leading-snug flex-1">{label}</span>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: bg, border: `1.5px solid ${color}30` }}>
                      <Icon style={{ width: 20, height: 20, color }} />
                    </div>
                  </Link>
                );
              })
          }
        </div>
      </div>
    </>
  );
}
