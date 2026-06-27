'use client';
import { theme } from '../../lib/theme';

import Link from 'next/link';
import {
  Heart, Baby, Brain, Eye, Bone, Droplets, Stethoscope,
  Activity, Wind, Microscope, Syringe, Thermometer, ChevronLeft,
} from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';
import { ALL_DOCTORS, SPEC_ICON_MAP } from '../../lib/doctors';

const PRIMARY   = 'var(--color-primary)';
const SECONDARY = 'var(--color-primary-dark)';

const ICON_FALLBACK_MAP: Record<string, React.ElementType> = {
  'Pediatric Specialist': Baby,
  'Cardiologist':         Heart,
  'Pediatrician':         Baby,
  'Dermatologist':        Syringe,
  'Ophthalmologist':      Eye,
};

const ICON_DEFAULTS = [Brain, Bone, Droplets, Stethoscope, Activity, Wind, Microscope, Thermometer];

function getIcon(spec: string, idx: number): React.ElementType {
  return ICON_FALLBACK_MAP[spec] ?? ICON_DEFAULTS[idx % ICON_DEFAULTS.length];
}

function getStyle(spec: string): { color: string; bg: string } {
  return SPEC_ICON_MAP[spec] ?? { color: PRIMARY, bg: '#eff6ff' };
}

const uniqueSpecs: { spec_en: string; spec_mm: string }[] = [];
const seen = new Set<string>();
for (const doc of ALL_DOCTORS) {
  if (!seen.has(doc.spec_en)) {
    seen.add(doc.spec_en);
    uniqueSpecs.push({ spec_en: doc.spec_en, spec_mm: doc.spec_mm });
  }
}

export default function SpecialistsPage() {
  const { lang } = useLang();
  const mm = lang === 'mm';

  return (
    <div className="min-h-full bg-gray-50 lg:bg-gray-100">

      {/* ══ DESKTOP ══ */}
      <div className="hidden lg:flex gap-5 h-screen overflow-hidden px-6 py-6">
        <div className="flex-1 overflow-y-auto rounded-2xl bg-gray-50 flex flex-col">

          <div
            className="px-8 pt-8 pb-6 rounded-t-2xl shrink-0"
            style={{ background: `linear-gradient(180deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}
          >
            <div className="flex items-center gap-3 mb-1">
              <Link
                href="/patient/dashboard"
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </Link>
              <h1 className="text-2xl font-bold text-white">
                {mm ? 'အထူးကုဆရာဝန်များ' : 'Specialist Doctors'}
              </h1>
            </div>
            <p className="text-white/60 text-sm ml-11">
              {mm ? 'အထူးကု တစ်ခုကို ရွေးချယ်ပါ' : 'Choose a specialty to find doctors'}
            </p>
          </div>

          <div className="p-6 flex-1">
            <div className="grid grid-cols-3 gap-3">
              {uniqueSpecs.map(({ spec_en, spec_mm }, idx) => {
                const Icon = getIcon(spec_en, idx);
                const { color, bg } = getStyle(spec_en);
                return (
                  <Link
                    key={spec_en}
                    href={`/patient/doctors?spec=${encodeURIComponent(spec_en)}`}
                    className="flex items-center justify-between gap-4 bg-white rounded-2xl border border-gray-100 px-5 py-4 active:scale-[0.98] transition-all hover:border-gray-200 hover:shadow-sm"
                  >
                    <span className="text-sm font-semibold text-gray-700 leading-snug">
                      {mm ? spec_mm : spec_en}
                    </span>
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: bg, border: `1.5px solid ${color}30` }}
                    >
                      <Icon style={{ width: 28, height: 28, color }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* ══ MOBILE ══ */}
      <div className="lg:hidden">

        <div
          className="-mt-18 pt-21 pb-6 px-4 w-full"
          style={{
            background: `linear-gradient(180deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
          }}
        >
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/patient/dashboard"
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </Link>
            <h1 className="text-xl font-bold text-white">
              {mm ? 'အထူးကုဆရာဝန်များ' : 'Specialist Doctors'}
            </h1>
          </div>
          <p className="text-white/60 text-sm ml-11">
            {mm ? 'အထူးကု တစ်ခုကို ရွေးချယ်ပါ' : 'Choose a specialty to find doctors'}
          </p>
        </div>

        <div className="px-4 pt-4 pb-24 grid grid-cols-2 gap-2">
          {uniqueSpecs.map(({ spec_en, spec_mm }, idx) => {
            const Icon = getIcon(spec_en, idx);
            const { color, bg } = getStyle(spec_en);
            return (
              <Link
                key={spec_en}
                href={`/patient/doctors?spec=${encodeURIComponent(spec_en)}`}
                className="flex items-center justify-between gap-2 bg-white rounded-2xl border border-gray-100 px-3 py-3.5 active:scale-[0.98] transition-all"
              >
                <span className="text-xs font-semibold text-gray-700 leading-snug flex-1">
                  {mm ? spec_mm : spec_en}
                </span>
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: bg, border: `1.5px solid ${color}30` }}
                >
                  <Icon style={{ width: 22, height: 22, color }} />
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}
