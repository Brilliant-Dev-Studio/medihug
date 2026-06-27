'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Pencil, CheckCircle2, User, FileText,
  Stethoscope, AlertTriangle, Image as ImageIcon, X,
} from 'lucide-react';
import IntakeForm from '../../../booking/IntakeForm';

const P = 'var(--color-primary)';

/* ── mock data ── replace with real fetch by id later ── */
const MOCK = {
  doctorName: 'Dr. Khin Maung',
  specialty: 'နှလုံးရောဂါ အထူးကု',
  date: 'မနက်ဖြန် နံနက် ၁၀:၀၀',
  name: 'Ko Aung Kyaw',
  age: '34',
  gender: 'male',
  mainComplaint: 'လွန်ခဲ့တဲ့ ၃ ရက်ကတည်းက ရင်ဘတ်နာပြီး မောသည်',
  symptomDetail: 'နှလုံးခုန်မြန်ကာ ညဘက် အိပ်ရလျင် ရင်ဘတ် ကျပ်သောကြောင့် နိုးတတ်ပါသည်။ ဘယ်ဘက် လက်မောင်းတွင်လည်း ထုံကျင်ခြင်း ရှိပါသည်။',
  category: 'cardiac',
  medHistory: ['htn'],
  hadSurgery: 'no',
  drugAllergy: 'no',
  currentMeds: ['chronic'],
  dynamic: { chest: 'pain', htn: 'controlled' },
  files: 0,
};

const MED_LABELS: Record<string, string> = {
  htn: 'သွေးတိုးရောဂါ', dm: 'ဆီးချိုရောဂါ', heart: 'နှလုံးရောဂါ',
  kidney: 'ကျောက်ကပ်ရောဂါ', asthma: 'ပန်းနာရင်ကျပ်', liver: 'အသည်းရောဂါ',
  stroke: 'လေဖြတ်ဖူးခြင်း', cancer: 'ကင်ဆာ', thyroid: 'သိုင်းရွိုက်', none: 'မရှိပါ',
};
const MED_MEDS: Record<string, string> = {
  none: 'မသောက်ပါ', chronic: 'အခံရောဂါဆေး', vitamins: 'ဗီတာမင်',
  painkill: 'အကိုက်အခဲပျောက်ဆေး', herbal: 'တိုင်းရင်းဆေး', other: 'အခြား',
};
const CATEGORIES: Record<string, string> = {
  respiratory: 'ချောင်းဆိုး / အသက်ရှုကြပ်', neuro: 'လေဖြတ် / မျက်နှာရွဲ့',
  cardiac: 'ရင်တုန် / သွေးတိုး', diabetes: 'ဆီးချို / ဟော်မုန်း',
  musculo: 'ခါးနာ / ဒူးနာ', mental: 'စိတ်ကျန်းမာရေး',
};

/* ── view section ── */
function ViewSection({ icon: Icon, title, rows }: {
  icon: React.ElementType; title: string; rows: { label: string; value: string }[]
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50" style={{ backgroundColor: `${P}08` }}>
        <Icon className="w-4 h-4" style={{ color: P }} />
        <p className="text-sm font-bold" style={{ color: P }}>{title}</p>
      </div>
      <div className="divide-y divide-gray-50">
        {rows.map((r, i) => (
          <div key={i} className="flex items-start justify-between px-4 py-3 gap-4">
            <p className="text-xs text-gray-400 shrink-0 w-32">{r.label}</p>
            <p className="text-sm text-gray-700 font-medium text-right flex-1">{r.value || '—'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── page ── */
export default function FormViewPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const d = MOCK;

  if (mode === 'edit') {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col">
        {/* header */}
        <div className="bg-white border-b border-gray-100 flex items-center gap-3 px-4 py-3 shrink-0">
          <button
            onClick={() => setMode('view')}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 active:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <p className="text-base font-bold text-gray-800">ဆေးမှတ်တမ်း ပြင်ဆင်ရန်</p>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <IntakeForm mm={true} onDone={() => setMode('view')} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col">

      {/* header */}
      <div className="bg-white border-b border-gray-100 shrink-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 active:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <p className="text-sm font-bold text-gray-800 leading-tight">ကြိုတင် ဆေးမှတ်တမ်း</p>
              <p className="text-xs text-gray-400">{d.doctorName} · {d.date}</p>
            </div>
          </div>
          <button
            onClick={() => setMode('edit')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white active:opacity-70"
            style={{ backgroundColor: P }}
          >
            <Pencil className="w-3.5 h-3.5" /> ပြင်ဆင်မည်
          </button>
        </div>
      </div>

      {/* scrollable content */}
      <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-5 flex flex-col gap-3 pb-24">

        {/* banner */}
        <div
          className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: `linear-gradient(135deg, ${P}18, ${P}06)`, border: `1px solid ${P}25` }}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: P }}>
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">ဆေးမှတ်တမ်း တင်ပြပြီးပါပြီ</p>
            <p className="text-xs text-gray-500 mt-0.5">{d.doctorName} ({d.specialty}) — ဖြည့်ပြီးပြီ</p>
          </div>
        </div>

        {/* basic info */}
        <ViewSection icon={User} title="လူနာ အချက်အလက်" rows={[
          { label: 'နာမည်',   value: d.name },
          { label: 'အသက်',   value: `${d.age} နှစ်` },
          { label: 'ကျား/မ', value: d.gender === 'male' ? '♂ ကျား' : d.gender === 'female' ? '♀ မ' : 'အခြား' },
        ]} />

        {/* complaint */}
        <ViewSection icon={FileText} title="ဆရာဝန်ကို ပြောချင်သော အကြောင်းအရင်း" rows={[
          { label: 'အဓိက ပြဿနာ', value: d.mainComplaint },
          { label: 'အသေးစိတ်',    value: d.symptomDetail },
        ]} />

        {/* category / dynamic */}
        {d.category && (
          <ViewSection icon={Stethoscope} title="ရောဂါ အမျိုးအစား" rows={[
            { label: 'Category',           value: CATEGORIES[d.category] ?? d.category },
            ...(d.dynamic.chest ? [{ label: 'ရင်ဘတ်/ရင်တုန်', value: { no: 'မရှိပါ', pain: 'ရင်ဘတ်အောင့်', palp: 'ရင်တုန်' }[d.dynamic.chest] ?? '' }] : []),
            ...(d.dynamic.htn   ? [{ label: 'သွေးတိုး အခံ',  value: { no: 'မရှိပါ', controlled: 'ရှိ (ဆေးသောက်နေဆဲ)', uncontrolled: 'ရှိ (ဆေးပုံမှန်မသောက်)' }[d.dynamic.htn] ?? '' }] : []),
          ]} />
        )}

        {/* history */}
        <ViewSection icon={Stethoscope} title="ယခင် ရောဂါရာဇဝင်" rows={[
          { label: 'အခံရောဂါ',  value: d.medHistory.map(k => MED_LABELS[k] ?? k).join('၊ ') || 'မရှိပါ' },
          { label: 'ခွဲစိတ်ဖူး', value: d.hadSurgery === 'yes' ? 'ဖူးပါသည်' : 'မဖူးပါ' },
        ]} />

        {/* allergy + meds */}
        <ViewSection icon={AlertTriangle} title="ဆေးနှင့် ဓာတ်မတည့်မှု" rows={[
          { label: 'ဆေးမတည့်ခြင်း',    value: d.drugAllergy === 'yes' ? 'ရှိပါသည်' : 'မရှိပါ' },
          { label: 'လက်ရှိ ဆေးဝါးများ', value: d.currentMeds.map(k => MED_MEDS[k] ?? k).join('၊ ') || '—' },
        ]} />

        {/* files */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${P}12` }}>
            <ImageIcon className="w-4 h-4" style={{ color: P }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-700">ဆေးမှတ်တမ်း / Film ဓာတ်ပုံ</p>
            <p className="text-xs text-gray-400 mt-0.5">{d.files > 0 ? `${d.files} ဖိုင် တင်ထားပြီး` : 'မတင်ရသေးပါ'}</p>
          </div>
        </div>

        {/* edit CTA at bottom */}
        <button
          onClick={() => setMode('edit')}
          className="w-full py-3.5 rounded-2xl text-sm font-bold text-white mt-2 active:opacity-80"
          style={{ background: `linear-gradient(135deg, ${P} 0%, var(--color-primary-dark) 100%)` }}
        >
          <Pencil className="w-4 h-4 inline mr-2 -mt-0.5" />
          ဆေးမှတ်တမ်း ပြင်ဆင်မည်
        </button>
      </div>
      </div>
    </div>
  );
}
