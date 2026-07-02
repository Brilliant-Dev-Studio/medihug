'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, Pencil, CheckCircle2, User, FileText,
  Stethoscope, AlertTriangle, Image as ImageIcon, CalendarX2, ChevronDown,
  Calendar, Sparkles,
} from 'lucide-react';
import IntakeForm, { type IntakeData } from '../../../booking/IntakeForm';
import { useLang } from '../../../../lib/LanguageContext';

const P  = 'var(--color-primary)';
const PD = 'var(--color-primary-dark)';

type T = { mm: string; en: string };
const t = (mm: boolean, x: T) => (mm ? x.mm : x.en);

interface RawAppointment {
  id: string;
  date: string;
  time: string | null;
  reason: string | null;
  note: string | null;
  intake: IntakeData | null;
  doctor: { name: string; nameEn: string | null; specialty: string; specialtyEn: string | null };
}

const MED_LABELS: Record<string, T> = {
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
const MED_MEDS: Record<string, T> = {
  none: { mm: 'မသောက်ပါ', en: 'None' },
  chronic: { mm: 'အခံရောဂါဆေး', en: 'Chronic condition meds' },
  vitamins: { mm: 'ဗီတာမင်', en: 'Vitamins' },
  painkill: { mm: 'အကိုက်အခဲပျောက်ဆေး', en: 'Painkillers' },
  herbal: { mm: 'တိုင်းရင်းဆေး', en: 'Herbal medicine' },
  other: { mm: 'အခြား', en: 'Other' },
};
const CATEGORIES: Record<string, T> = {
  respiratory: { mm: 'ချောင်းဆိုး / အသက်ရှုကြပ်', en: 'Cough / Breathing' },
  neuro: { mm: 'လေဖြတ် / မျက်နှာရွဲ့', en: 'Stroke / Facial droop' },
  cardiac: { mm: 'ရင်တုန် / သွေးတိုး', en: 'Palpitation / BP' },
  diabetes: { mm: 'ဆီးချို / ဟော်မုန်း', en: 'Diabetes / Hormone' },
  musculo: { mm: 'ခါးနာ / ဒူးနာ', en: 'Back / Knee pain' },
  mental: { mm: 'စိတ်ကျန်းမာရေး', en: 'Mental health' },
};
const DYN_SINGLE: Record<string, { label: T; values?: Record<string, T> }> = {
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
const DYN_MULTI: Record<string, T> = {
  neuroSymptoms: { mm: 'လက္ခဏာများ', en: 'Symptoms' },
  urinary: { mm: 'ဆီးဆိုင်ရာ ပြဿနာ', en: 'Urinary issues' },
  painLocation: { mm: 'နာကျင်မှု နေရာ', en: 'Pain location' },
};

function fmtDateTime(dateIso: string, time: string | null): string {
  const d = new Date(dateIso);
  const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return time ? `${dateStr} • ${time}` : dateStr;
}

/* ── skeleton section ── */
function SkeletonSection({ rows = 2 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="px-4 py-3 border-b border-gray-50">
        <div className="h-3.5 w-32 bg-gray-100 rounded" />
      </div>
      <div className="divide-y divide-gray-50">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3 gap-4">
            <div className="h-3 w-20 bg-gray-100 rounded shrink-0" />
            <div className="h-3 w-40 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

const TRUNCATE_AT = 60;

/* ── view row (truncates long values with a chevron toggle) ── */
function ViewRow({ label, value }: { label: string; value: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = value.length > TRUNCATE_AT;

  if (!isLong) {
    return (
      <div className="flex items-start justify-between px-4 lg:px-5 py-3 lg:py-3.5 gap-4 transition-colors lg:hover:bg-gray-50/60">
        <p className="text-xs text-gray-400 shrink-0 w-32">{label}</p>
        <p className="text-sm text-gray-700 font-medium text-right flex-1">{value || '—'}</p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setExpanded(e => !e)}
      className="w-full flex items-start justify-between px-4 lg:px-5 py-3 lg:py-3.5 gap-4 text-left transition-colors lg:hover:bg-gray-50/60"
    >
      <p className="text-xs text-gray-400 shrink-0 w-32 pt-0.5">{label}</p>
      <div className="flex-1 flex items-start justify-end gap-1.5">
        <p className={`text-sm text-gray-700 font-medium text-right flex-1 ${expanded ? '' : 'line-clamp-1'}`}>{value}</p>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-300 shrink-0 mt-0.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </div>
    </button>
  );
}

/* ── view section ── */
function ViewSection({ icon: Icon, title, rows }: {
  icon: React.ElementType; title: string; rows: { label: string; value: string }[]
}) {
  return (
    <div className="bg-white rounded-2xl lg:rounded-3xl border border-gray-100 overflow-hidden lg:shadow-sm lg:hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2.5 px-4 lg:px-5 py-3 lg:py-4 border-b border-gray-50">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${P}12` }}>
          <Icon className="w-4 h-4" style={{ color: P }} />
        </div>
        <p className="text-sm lg:text-[15px] font-bold" style={{ color: P }}>{title}</p>
      </div>
      <div className="divide-y divide-gray-50">
        {rows.map((r, i) => <ViewRow key={i} label={r.label} value={r.value} />)}
      </div>
    </div>
  );
}

/* ── page ── */
export default function FormViewPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { lang } = useLang();
  const mm = lang === 'mm';
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [loading, setLoading] = useState(true);
  const [appt, setAppt] = useState<RawAppointment | null>(null);

  useEffect(() => {
    fetch(`/api/patient/appointments/${params.id}`)
      .then(r => r.json())
      .then(d => setAppt(d.appointment ?? null))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-full bg-gray-50 flex flex-col">
        {/* header */}
        <div className="bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between px-4 lg:px-8 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gray-100 animate-pulse" />
              <div className="flex flex-col gap-1.5">
                <div className="h-3.5 w-32 bg-gray-100 rounded animate-pulse" />
                <div className="h-2.5 w-40 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
            <div className="w-24 h-8 rounded-xl bg-gray-100 animate-pulse" />
          </div>
        </div>

        {/* content */}
        <div className="max-w-2xl lg:max-w-5xl mx-auto px-4 lg:px-8 py-5 flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:items-start lg:gap-5 pb-24">
          <div className="lg:col-span-2 rounded-2xl h-16 bg-gray-100 animate-pulse" />
          <SkeletonSection rows={3} />
          <SkeletonSection rows={2} />
          <SkeletonSection rows={3} />
          <SkeletonSection rows={2} />
        </div>
      </div>
    );
  }

  if (!appt) {
    return (
      <div className="min-h-full bg-gray-50 flex flex-col items-center justify-center gap-3 text-center px-6 py-24">
        <CalendarX2 className="w-10 h-10 text-gray-300" />
        <p className="text-sm text-gray-500">{t(mm, { mm: 'ဤချိန်းဆိုမှု ရှာမတွေ့ပါ', en: 'This appointment could not be found' })}</p>
        <button onClick={() => router.back()} className="text-sm font-semibold" style={{ color: P }}>
          {t(mm, { mm: 'နောက်သို့', en: 'Go back' })}
        </button>
      </div>
    );
  }

  const doctorName = appt.doctor.name;
  const specialty  = appt.doctor.specialty;
  const dateLabel  = fmtDateTime(appt.date, appt.time);
  const d = appt.intake;

  const dynRows = d ? Object.entries(d.dynSingle ?? {})
    .filter(([, v]) => v)
    .map(([k, v]) => {
      const cfg = DYN_SINGLE[k];
      return { label: cfg ? t(mm, cfg.label) : k, value: cfg?.values?.[v] ? t(mm, cfg.values[v]) : v };
    }) : [];
  const multiRows = d ? Object.entries(d.dynMulti ?? {})
    .filter(([, v]) => v && v.length > 0)
    .map(([k, v]) => ({ label: DYN_MULTI[k] ? t(mm, DYN_MULTI[k]) : k, value: v.join('၊ ') })) : [];

  if (mode === 'edit') {
    return (
      <div className="min-h-full bg-gray-50 flex flex-col">
        {/* header */}
        <div className="bg-white border-b border-gray-100 flex items-center gap-3 px-4 py-3 shrink-0">
          <button
            onClick={() => setMode('view')}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 active:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <p className="text-base font-bold text-gray-800">{t(mm, { mm: 'ဆေးမှတ်တမ်း ပြင်ဆင်ရန်', en: 'Edit Medical Form' })}</p>
        </div>
        <div className="px-4 py-4">
          <IntakeForm mm={mm} onDone={() => setMode('view')} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 flex flex-col">

      {/* header — mobile: plain bar */}
      <div className="lg:hidden bg-white border-b border-gray-100 shrink-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 active:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <p className="text-sm font-bold text-gray-800 leading-tight">{t(mm, { mm: 'ကြိုတင် ဆေးမှတ်တမ်း', en: 'Pre-Consultation Form' })}</p>
              <p className="text-xs text-gray-400">{doctorName} · {dateLabel}</p>
            </div>
          </div>
          <button
            onClick={() => setMode('edit')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white active:opacity-70"
            style={{ backgroundColor: P }}
          >
            <Pencil className="w-3.5 h-3.5" /> {t(mm, { mm: 'ပြင်ဆင်မည်', en: 'Edit' })}
          </button>
        </div>
      </div>

      {/* header — desktop: gradient hero */}
      <div className="hidden lg:block shrink-0 px-8 pt-8 pb-10 rounded-b-4xl"
        style={{ background: `linear-gradient(135deg, ${P} 0%, ${PD} 100%)` }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors hover:bg-white/15"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
              >
                <ArrowLeft className="w-4.5 h-4.5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-white/70" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
                    {t(mm, { mm: 'ကြိုတင် ဆေးမှတ်တမ်း', en: 'Pre-Consultation Form' })}
                  </p>
                </div>
                <h1 className="text-2xl font-bold text-white mt-1">{doctorName}</h1>
                <p className="text-sm text-white/70 mt-0.5">{specialty}</p>
              </div>
            </div>
            <button
              onClick={() => setMode('edit')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-white transition-colors"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)')}
            >
              <Pencil className="w-4 h-4" /> {t(mm, { mm: 'ပြင်ဆင်မည်', en: 'Edit Form' })}
            </button>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
              <Calendar className="w-3.5 h-3.5 text-white/70" />
              <span className="text-xs font-semibold text-white">{dateLabel}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span className="text-xs font-semibold text-white">{t(mm, { mm: 'တင်ပြပြီး', en: 'Submitted' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* content */}
      <div className="max-w-2xl lg:max-w-5xl mx-auto px-4 lg:px-8 py-5 lg:-mt-6 flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:items-start lg:gap-5 pb-24">

        {/* banner — mobile only (desktop hero covers this) */}
        <div
          className="lg:hidden rounded-2xl p-4 flex items-center gap-3"
          style={{ background: `linear-gradient(135deg, ${P}18, ${P}06)`, border: `1px solid ${P}25` }}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: P }}>
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">{t(mm, { mm: 'ဆေးမှတ်တမ်း တင်ပြပြီးပါပြီ', en: 'Medical form submitted' })}</p>
            <p className="text-xs text-gray-500 mt-0.5">{doctorName} ({specialty}) — {t(mm, { mm: 'ဖြည့်ပြီးပြီ', en: 'completed' })}</p>
          </div>
        </div>

        {!d ? (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 text-center">
            <p className="text-sm text-gray-400">{t(mm, { mm: 'ကြိုတင် ဆေးဘက်ဆိုင်ရာ မှတ်တမ်း မဖြည့်ရသေးပါ', en: 'No pre-consultation form submitted yet' })}</p>
          </div>
        ) : (
          <>
            {/* basic info */}
            <ViewSection icon={User} title={t(mm, { mm: 'လူနာ အချက်အလက်', en: 'Patient Information' })} rows={[
              { label: t(mm, { mm: 'နာမည်', en: 'Name' }),       value: d.name },
              { label: t(mm, { mm: 'ဖုန်းနံပါတ်', en: 'Phone' }), value: d.phone },
              { label: t(mm, { mm: 'အသက်', en: 'Age' }),       value: d.age ? `${d.age} ${t(mm, { mm: 'နှစ်', en: 'yrs' })}` : '' },
              { label: t(mm, { mm: 'ကျား/မ', en: 'Gender' }),  value: d.gender === 'male' ? t(mm, { mm: 'ကျား', en: 'Male' }) : d.gender === 'female' ? t(mm, { mm: 'မ', en: 'Female' }) : d.gender ? t(mm, { mm: 'အခြား', en: 'Other' }) : '' },
            ]} />

            {/* complaint */}
            <ViewSection icon={FileText} title={t(mm, { mm: 'ဆရာဝန်ကို ပြောချင်သော အကြောင်းအရင်း', en: 'Reason for consultation' })} rows={[
              { label: t(mm, { mm: 'အဓိက ပြဿနာ', en: 'Main complaint' }), value: d.mainComplaint },
              { label: t(mm, { mm: 'အသေးစိတ်', en: 'Details' }),         value: d.symptomDetail },
            ]} />

            {/* category / dynamic */}
            {d.category && (dynRows.length > 0 || multiRows.length > 0) && (
              <ViewSection icon={Stethoscope} title={t(mm, { mm: 'ရောဂါ အမျိုးအစား', en: 'Medical Category' })} rows={[
                { label: 'Category', value: CATEGORIES[d.category] ? t(mm, CATEGORIES[d.category]) : d.category },
                ...dynRows,
                ...multiRows,
              ]} />
            )}

            {/* pregnancy (female only) */}
            {d.pregnancy && (
              <ViewSection icon={AlertTriangle} title={t(mm, { mm: 'အမျိုးသမီးလူနာများအတွက်', en: 'For Female Patients' })} rows={[
                { label: t(mm, { mm: 'အခြေအနေ', en: 'Status' }), value: t(mm, { no: { mm: 'မဟုတ်ပါ', en: 'None' }, pregnant: { mm: 'ကိုယ်ဝန်ရှိသည်', en: 'Pregnant' }, breastfeed: { mm: 'နို့တိုက်မိခင်', en: 'Breastfeeding' } }[d.pregnancy] ?? { mm: d.pregnancy, en: d.pregnancy }) },
              ]} />
            )}

            {/* history */}
            <ViewSection icon={Stethoscope} title={t(mm, { mm: 'ယခင် ရောဂါရာဇဝင်', en: 'Past Medical History' })} rows={[
              { label: t(mm, { mm: 'အခံရောဂါ', en: 'Chronic conditions' }), value: (d.medHistory ?? []).map(k => MED_LABELS[k] ? t(mm, MED_LABELS[k]) : k).join('၊ ') || t(mm, { mm: 'မရှိပါ', en: 'None' }) },
              { label: t(mm, { mm: 'ခွဲစိတ်ဖူး', en: 'Past surgery' }),   value: d.hadSurgery === 'yes' ? (d.surgeryDetail || t(mm, { mm: 'ဖူးပါသည်', en: 'Yes' })) : t(mm, { mm: 'မဖူးပါ', en: 'No' }) },
            ]} />

            {/* allergy + meds */}
            <ViewSection icon={AlertTriangle} title={t(mm, { mm: 'ဆေးနှင့် ဓာတ်မတည့်မှု', en: 'Allergies & Medications' })} rows={[
              { label: t(mm, { mm: 'ဆေးမတည့်ခြင်း', en: 'Drug allergy' }),     value: d.drugAllergy === 'yes' ? (d.allergyDetail || t(mm, { mm: 'ရှိပါသည်', en: 'Yes' })) : t(mm, { mm: 'မရှိပါ', en: 'None' }) },
              { label: t(mm, { mm: 'လက်ရှိ ဆေးဝါးများ', en: 'Current medications' }), value: (d.currentMeds ?? []).map(k => MED_MEDS[k] ? t(mm, MED_MEDS[k]) : k).join('၊ ') || '—' },
            ]} />
          </>
        )}

        {/* files — not persisted (no upload storage yet) */}
        <div className="lg:col-span-2 bg-white rounded-2xl lg:rounded-3xl border border-gray-100 p-4 lg:p-5 flex items-center gap-3 lg:shadow-sm">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${P}12` }}>
            <ImageIcon className="w-4 h-4" style={{ color: P }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-700">{t(mm, { mm: 'ဆေးမှတ်တမ်း / Film ဓာတ်ပုံ', en: 'Medical Records / Films' })}</p>
            <p className="text-xs text-gray-400 mt-0.5">{t(mm, { mm: 'မတင်ရသေးပါ', en: 'Not uploaded yet' })}</p>
          </div>
        </div>

        {/* edit CTA at bottom — mobile only (desktop has header Edit button) */}
        <button
          onClick={() => setMode('edit')}
          className="lg:hidden w-full py-3.5 rounded-2xl text-sm font-bold text-white mt-2 active:opacity-80"
          style={{ background: `linear-gradient(135deg, ${P} 0%, var(--color-primary-dark) 100%)` }}
        >
          <Pencil className="w-4 h-4 inline mr-2 -mt-0.5" />
          {t(mm, { mm: 'ဆေးမှတ်တမ်း ပြင်ဆင်မည်', en: 'Edit Medical Form' })}
        </button>
      </div>
    </div>
  );
}
