'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import {
  ChevronDown, ChevronRight, CheckCircle2, XCircle, Hourglass, Loader2, AlertTriangle,
} from 'lucide-react';
import type { IntakeData } from '../../patient/booking/IntakeForm';
import { useLang } from '../../lib/LanguageContext';

export const PRIMARY = '#2ab5ad';

export type T = { mm: string; en: string };
export const t = (mm: boolean, x: T) => (mm ? x.mm : x.en);

export interface Appointment {
  id: string;
  date: string;
  time: string | null;
  reason: string | null;
  note: string | null;
  paymentMethod: string | null;
  fee: number | null;
  receiptUrl: string | null;
  intake: IntakeData | null;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  user:   { name: string; phone: string; profileImage?: string | null };
  doctor: { name: string; nameEn: string | null; specialty: string; specialtyEn: string | null; imageUrl: string | null };
}

export const AVATAR_COLORS = ['#2ab5ad', '#8b5cf6', '#f59e0b', '#3b82f6', '#10b981', '#ef4444'];

export const STATUS_STYLE: Record<Appointment['status'], { bg: string; color: string; icon: React.ElementType; label: T }> = {
  PENDING:   { bg: '#fffbeb', color: '#d97706', icon: Hourglass,    label: { mm: 'စောင့်ဆိုင်းဆဲ', en: 'Pending' } },
  CONFIRMED: { bg: '#eff6ff', color: '#3b82f6', icon: CheckCircle2, label: { mm: 'အတည်ပြုပြီး',   en: 'Confirmed' } },
  COMPLETED: { bg: '#ecfdf5', color: '#10b981', icon: CheckCircle2, label: { mm: 'ပြီးဆုံး',       en: 'Completed' } },
  CANCELLED: { bg: '#fef2f2', color: '#ef4444', icon: XCircle,      label: { mm: 'ပယ်ဖျက်',        en: 'Cancelled' } },
};

export const STATUS_OPTIONS: Appointment['status'][] = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

/* ── intake label maps (bilingual) ── */
export const MED_LABELS: Record<string, T> = {
  htn: { mm: 'သွေးတိုးရောဂါ', en: 'Hypertension' },
  dm: { mm: 'ဆီးချိုရောဂါ', en: 'Diabetes' },
  heart: { mm: 'နှလုံးရောဂါ', en: 'Heart disease' },
  kidney: { mm: 'ကျောက်ကပ်ရောဂါ', en: 'Kidney disease' },
  asthma: { mm: 'ပန်းနာရင်ကျပ်', en: 'Asthma' },
  liver: { mm: 'အသည်းရောဂါ', en: 'Liver disease' },
  stroke: { mm: 'လေဖြတ်ဖူးခြင်း', en: 'Past stroke' },
  cancer: { mm: 'ကင်ဆာ', en: 'Cancer' },
  thyroid: { mm: 'သိုင်းရွိုက်', en: 'Thyroid disease' },
  none: { mm: 'မရှိပါ', en: 'None' },
};
export const MED_MEDS: Record<string, T> = {
  none: { mm: 'မသောက်ပါ', en: 'None' },
  chronic: { mm: 'အခံရောဂါဆေး', en: 'Chronic condition meds' },
  vitamins: { mm: 'ဗီတာမင်', en: 'Vitamins' },
  painkill: { mm: 'အကိုက်အခဲပျောက်ဆေး', en: 'Painkillers' },
  herbal: { mm: 'တိုင်းရင်းဆေး', en: 'Herbal medicine' },
  other: { mm: 'အခြား', en: 'Other' },
};
export const CATEGORIES: Record<string, T> = {
  respiratory: { mm: 'ချောင်းဆိုး / အသက်ရှုကြပ်', en: 'Cough / Breathing' },
  neuro: { mm: 'လေဖြတ် / မျက်နှာရွဲ့', en: 'Stroke / Facial droop' },
  cardiac: { mm: 'ရင်တုန် / သွေးတိုး', en: 'Palpitation / BP' },
  diabetes: { mm: 'ဆီးချို / ဟော်မုန်း', en: 'Diabetes / Hormone' },
  musculo: { mm: 'ခါးနာ / ဒူးနာ', en: 'Back / Knee pain' },
  mental: { mm: 'စိတ်ကျန်းမာရေး', en: 'Mental health' },
};
export const DYN_SINGLE: Record<string, { label: T; values?: Record<string, T> }> = {
  fever:  { label: { mm: 'ဖျားနာခြင်း', en: 'Fever' },        values: { no: { mm: 'မရှိပါ', en: 'No' }, yes: { mm: 'ဖျားနေသည်', en: 'Yes' } } },
  cough:  { label: { mm: 'ချောင်းဆိုးခြင်း', en: 'Cough' },    values: { no: { mm: 'မရှိပါ', en: 'No' }, yes: { mm: 'ရှိပါသည်', en: 'Yes' } } },
  sputum: { label: { mm: 'သလိပ်ပါခြင်း', en: 'Phlegm' },       values: { no: { mm: 'မရှိပါ', en: 'No' }, yes: { mm: 'ရှိပါသည်', en: 'Yes' } } },
  sob:    { label: { mm: 'မောပန်း / အသက်ရှူခက်', en: 'Breathlessness' }, values: { no: { mm: 'မရှိပါ', en: 'None' }, exertion: { mm: 'လှုပ်ရှားရင် မောသည်', en: 'On exertion' }, rest: { mm: 'နားနေရင်းလည်း မောသည်', en: 'Even at rest' } } },
  tb:     { label: { mm: 'အဆုတ်တီဘီ', en: 'Pulmonary TB' },    values: { no: { mm: 'မဖြစ်ဖူးပါ', en: 'No' }, yes: { mm: 'ဖြစ်ဖူးပါတယ်', en: 'Yes' } } },
  chest:  { label: { mm: 'ရင်ဘတ် / ရင်တုန်', en: 'Chest / Palpitation' }, values: { no: { mm: 'မရှိပါ', en: 'None' }, pain: { mm: 'ရင်ဘတ်အောင့်', en: 'Chest pain' }, palp: { mm: 'ရင်တုန်', en: 'Palpitation' } } },
  htn:    { label: { mm: 'သွေးတိုး အခံ', en: 'Hypertension history' }, values: { no: { mm: 'မရှိပါ', en: 'None' }, controlled: { mm: 'ရှိ (ဆေးသောက်နေဆဲ)', en: 'Yes (on meds)' }, uncontrolled: { mm: 'ရှိ (ဆေးမှန်မသောက်)', en: 'Yes (irregular meds)' } } },
  dm:     { label: { mm: 'ဆီးချို အခံ', en: 'Diabetes history' }, values: { no: { mm: 'မရှိပါ', en: 'None' }, meds: { mm: 'ရှိ (ဆေး/အင်ဆူလင်)', en: 'Yes (meds/insulin)' }, unstable: { mm: 'ရှိ (မတည်ငြိမ်)', en: 'Yes (unstable)' } } },
  painScale: { label: { mm: 'နာကျင်မှု အဆင့်', en: 'Pain level' } },
  mood:   { label: { mm: 'စိတ်ခံစားချက်', en: 'Emotional state' }, values: { normal: { mm: 'ပုံမှန်', en: 'Normal' }, depressed: { mm: 'စိတ်ညစ်', en: 'Depressed' }, anxious: { mm: 'စိုးရိမ်', en: 'Anxious' }, stressed: { mm: 'ဖိစီးမှုများ', en: 'Stressed' } } },
};
export const DYN_MULTI: Record<string, T> = {
  neuroSymptoms: { mm: 'လက္ခဏာများ', en: 'Symptoms' },
  urinary: { mm: 'ဆီးဆိုင်ရာ ပြဿနာ', en: 'Urinary issues' },
  painLocation: { mm: 'နာကျင်မှု နေရာ', en: 'Pain location' },
};

const TRUNCATE_AT = 60;

export function ViewRow({ label, value }: { label: string; value: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = value.length > TRUNCATE_AT;

  if (!isLong) {
    return (
      <div className="flex items-start justify-between px-4 py-2.5 gap-4">
        <p className="text-xs text-gray-400 shrink-0 w-32">{label}</p>
        <p className="text-sm text-gray-700 font-medium text-right flex-1">{value || '—'}</p>
      </div>
    );
  }
  return (
    <button type="button" onClick={() => setExpanded(e => !e)}
      className="w-full flex items-start justify-between px-4 py-2.5 gap-4 text-left hover:bg-gray-50/60 transition-colors">
      <p className="text-xs text-gray-400 shrink-0 w-32 pt-0.5">{label}</p>
      <div className="flex-1 flex items-start justify-end gap-1.5">
        <p className={`text-sm text-gray-700 font-medium text-right flex-1 ${expanded ? '' : 'line-clamp-1'}`}>{value}</p>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-300 shrink-0 mt-0.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </div>
    </button>
  );
}

export function ViewSection({ icon: Icon, title, rows }: { icon: React.ElementType; title: string; rows: { label: string; value: string }[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-50">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${PRIMARY}12` }}>
          <Icon className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
        </div>
        <p className="text-sm font-bold" style={{ color: PRIMARY }}>{title}</p>
      </div>
      <div className="divide-y divide-gray-50">
        {rows.map((r, i) => <ViewRow key={i} label={r.label} value={r.value} />)}
      </div>
    </div>
  );
}

/* ── language dropdown ── */
const LANGS = [
  { code: 'mm' as const, label: 'မြန်မာ',  flag: '/flags/myanmar.png' },
  { code: 'en' as const, label: 'English', flag: '/flags/english.jpg' },
];

export function LangDropdown() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const current = LANGS.find(l => l.code === lang)!;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
      >
        <Image src={current.flag} alt={current.label} width={18} height={18} className="rounded-full object-cover w-4.5 h-4.5" />
        <span className="text-xs font-semibold text-gray-600">{current.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-40 bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden w-36">
            {LANGS.map(l => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 transition-colors"
              >
                <Image src={l.flag} alt={l.label} width={20} height={20} className="rounded-full object-cover w-5 h-5 shrink-0" />
                <span className="text-xs font-semibold text-gray-700 flex-1 text-left">{l.label}</span>
                {lang === l.code && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: PRIMARY }} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── status confirm modal: click a status → confirm dialog → PATCH ── */
export function ConfirmStatusModal({ current, target, onConfirm, onCancel, saving, mm }: {
  current: Appointment['status']; target: Appointment['status'];
  onConfirm: () => void; onCancel: () => void; saving: boolean; mm: boolean;
}) {
  const from = STATUS_STYLE[current];
  const to   = STATUS_STYLE[target];
  return createPortal(
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${to.color}15` }}>
              <AlertTriangle className="w-5 h-5" style={{ color: to.color }} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{t(mm, { mm: 'ချိန်းဆိုမှု အခြေအနေ ပြောင်းရန်', en: 'Change Booking Status' })}</p>
              <p className="text-xs text-gray-400">{t(mm, { mm: 'ဤလုပ်ဆောင်ချက်သည် ချိန်းဆိုမှုကို ချက်ချင်းပြောင်းလဲပါမည်', en: 'This action updates the appointment immediately.' })}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 py-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: from.bg, color: from.color }}>
              <from.icon className="w-3.5 h-3.5" /> {t(mm, from.label)}
            </span>
            <span className="text-gray-300">→</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: to.bg, color: to.color }}>
              <to.icon className="w-3.5 h-3.5" /> {t(mm, to.label)}
            </span>
          </div>

          <div className="flex gap-2">
            <button onClick={onCancel} disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50">
              {t(mm, { mm: 'မလုပ်တော့ပါ', en: 'Cancel' })}
            </button>
            <button onClick={onConfirm} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: to.color }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {t(mm, { mm: 'အတည်ပြုမည်', en: 'Confirm' })}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

/* ── segmented status buttons that open the confirm modal ── */
export function StatusChanger({ status, onChanged, mm: mmOverride }: {
  status: Appointment['status']; onChanged: (next: Appointment['status']) => Promise<void>; mm?: boolean;
}) {
  const { lang } = useLang();
  const mm = mmOverride ?? (lang === 'mm');
  const [pending, setPending] = useState<Appointment['status'] | null>(null);
  const [saving,  setSaving]  = useState(false);

  async function confirm() {
    if (!pending) return;
    setSaving(true);
    await onChanged(pending);
    setSaving(false);
    setPending(null);
  }

  const current = STATUS_STYLE[status];
  const others  = STATUS_OPTIONS.filter(opt => opt !== status);

  return (
    <>
      {/* current status — prominent */}
      <div className="rounded-2xl p-3.5 flex items-center gap-3 mb-4" style={{ backgroundColor: current.bg }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white shadow-sm">
          <current.icon className="w-5 h-5" style={{ color: current.color }} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: current.color, opacity: 0.65 }}>
            {t(mm, { mm: 'လက်ရှိအခြေအနေ', en: 'Current Status' })}
          </p>
          <p className="text-sm font-extrabold leading-tight" style={{ color: current.color }}>{t(mm, current.label)}</p>
        </div>
      </div>

      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
        {t(mm, { mm: 'အခြေအနေ ပြောင်းရန်', en: 'Change Status To' })}
      </p>
      <div className="flex flex-col gap-1.5">
        {others.map(opt => {
          const s = STATUS_STYLE[opt];
          return (
            <button
              key={opt}
              onClick={() => setPending(opt)}
              className="group flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-gray-100 bg-white hover:shadow-sm transition-all text-left"
              style={{ borderColor: '#f0f0f0' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${s.color}50`; e.currentTarget.style.backgroundColor = s.bg; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#f0f0f0'; e.currentTarget.style.backgroundColor = '#fff'; }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg }}>
                <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
              </div>
              <span className="text-xs font-bold flex-1" style={{ color: s.color }}>{t(mm, s.label)}</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>
          );
        })}
      </div>
      {pending && (
        <ConfirmStatusModal current={status} target={pending} saving={saving} mm={mm} onConfirm={confirm} onCancel={() => setPending(null)} />
      )}
    </>
  );
}

export function StatusBadgeClickable({ status, onChanged }: {
  status: Appointment['status']; onChanged: (next: Appointment['status']) => Promise<void>;
}) {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<Appointment['status'] | null>(null);
  const [saving,  setSaving]  = useState(false);
  const s = STATUS_STYLE[status];

  async function confirm() {
    if (!pending) return;
    setSaving(true);
    await onChanged(pending);
    setSaving(false);
    setPending(null);
  }

  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full"
        style={{ backgroundColor: s.bg, color: s.color }}
      >
        <s.icon className="w-3 h-3" /> {t(mm, s.label)} <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute z-40 mt-1 bg-white rounded-xl border border-gray-100 shadow-lg py-1 min-w-32">
            {STATUS_OPTIONS.map(opt => {
              const os = STATUS_STYLE[opt];
              return (
                <button
                  key={opt}
                  onClick={() => { setPending(opt); setOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-left hover:bg-gray-50 transition-colors"
                  style={{ color: os.color }}
                >
                  <os.icon className="w-3 h-3" /> {t(mm, os.label)}
                </button>
              );
            })}
          </div>
        </>
      )}
      {pending && (
        <ConfirmStatusModal current={status} target={pending} saving={saving} mm={mm} onConfirm={confirm} onCancel={() => setPending(null)} />
      )}
    </div>
  );
}
