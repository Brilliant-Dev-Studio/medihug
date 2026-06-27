'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { CheckCircle2, ChevronRight, Upload, X, FileText } from 'lucide-react';

const P  = 'var(--color-primary)';
const PD = 'var(--color-primary-dark)';

/* ─── static data ─── */
const MED_CONDITIONS = [
  { id: 'htn',    label: 'သွေးတိုးရောဂါ' },
  { id: 'dm',     label: 'ဆီးချိုရောဂါ' },
  { id: 'heart',  label: 'နှလုံးရောဂါ' },
  { id: 'kidney', label: 'ကျောက်ကပ်ရောဂါ' },
  { id: 'asthma', label: 'ပန်းနာရင်ကျပ် / အဆုတ်ရောဂါ' },
  { id: 'liver',  label: 'အသည်းရောဂါ / အစာအိမ်ရောဂါ' },
  { id: 'stroke', label: 'လေဖြတ်ဖူးခြင်း / အာရုံကြောရောဂါ' },
  { id: 'cancer', label: 'ကင်ဆာရောဂါ' },
  { id: 'thyroid',label: 'သိုင်းရွိုက် ရောဂါ' },
  { id: 'none',   label: 'မည်သည့်အခံရောဂါမှ မရှိပါ' },
];

const CURRENT_MEDS = [
  { id: 'none',     label: 'ဘာဆေးမှ မသောက်ပါ' },
  { id: 'chronic',  label: 'အခံရောဂါအတွက် နေ့စဉ်ဆေးများ' },
  { id: 'vitamins', label: 'အားဆေး / ဗီတာမင်' },
  { id: 'painkill', label: 'အကိုက်အခဲပျောက်ဆေး' },
  { id: 'herbal',   label: 'မြန်မာတိုင်းရင်းဆေး' },
  { id: 'other',    label: 'အခြားဆေးများ' },
];

const CATEGORIES = [
  { id: 'respiratory', icon: '🫁', label: 'ချောင်းဆိုး / အသက်ရှုကြပ်' },
  { id: 'neuro',       icon: '🧠', label: 'လေဖြတ် / မျက်နှာရွဲ့' },
  { id: 'cardiac',     icon: '🫀', label: 'ရင်တုန် / သွေးတိုး' },
  { id: 'diabetes',    icon: '💉', label: 'ဆီးချို / ဟော်မုန်း' },
  { id: 'musculo',     icon: '🦴', label: 'ခါးနာ / ဒူးနာ / အဆစ်နာ' },
  { id: 'mental',      icon: '🧘', label: 'စိတ်ကျန်းမာရေး' },
];

/* ─── helpers ─── */
function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-lg">{icon}</span>
      <p className="text-sm font-bold text-gray-700">{title}</p>
    </div>
  );
}

function RadioGroup({ name, options, value, onChange }: {
  name: string; options: { value: string; label: string }[];
  value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map(o => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left w-full transition-all"
            style={{
              backgroundColor: active ? `${P}12` : '#fafafa',
              borderColor:     active ? P : '#e5e7eb',
            }}
          >
            <div
              className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
              style={{ borderColor: active ? P : '#d1d5db' }}
            >
              {active && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: P }} />}
            </div>
            <span className="text-sm font-medium" style={{ color: active ? P : '#374151' }}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function CheckboxGroup({ options, values, onChange }: {
  options: { id: string; label: string }[];
  values: string[]; onChange: (vals: string[]) => void;
}) {
  const toggle = (id: string) => {
    if (id === 'none') { onChange(['none']); return; }
    const next = values.filter(v => v !== 'none');
    onChange(next.includes(id) ? next.filter(v => v !== id) : [...next, id]);
  };
  return (
    <div className="flex flex-col gap-2">
      {options.map(o => {
        const checked = values.includes(o.id);
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => toggle(o.id)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left w-full transition-all"
            style={{
              backgroundColor: checked ? `${P}12` : '#fafafa',
              borderColor:     checked ? P : '#e5e7eb',
            }}
          >
            <div
              className="w-4 h-4 rounded flex items-center justify-center shrink-0 border-2 transition-all"
              style={{ borderColor: checked ? P : '#d1d5db', backgroundColor: checked ? P : 'transparent' }}
            >
              {checked && <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />}
            </div>
            <span className="text-sm font-medium" style={{ color: checked ? P : '#374151' }}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ─── dynamic sections ─── */
function RespiratorySection({ d, set }: { d: Record<string, string>; set: (k: string, v: string) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-2">ဖျားနာခြင်း ရှိပါသလား</p>
        <RadioGroup name="fever" value={d.fever ?? ''} onChange={v => set('fever', v)}
          options={[{ value: 'no', label: 'မရှိပါ' }, { value: 'yes', label: 'ဖျားနေသည်' }]} />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-2">ချောင်းဆိုးခြင်း</p>
        <RadioGroup name="cough" value={d.cough ?? ''} onChange={v => set('cough', v)}
          options={[{ value: 'no', label: 'မရှိပါ' }, { value: 'yes', label: 'ရှိပါသည်' }]} />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-2">သလိပ်ပါခြင်း</p>
        <RadioGroup name="sputum" value={d.sputum ?? ''} onChange={v => set('sputum', v)}
          options={[{ value: 'no', label: 'မရှိပါ' }, { value: 'yes', label: 'ရှိပါသည်' }]} />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-2">မောပန်းလွယ် / အသက်ရှူရခက်ခြင်း</p>
        <RadioGroup name="sob" value={d.sob ?? ''} onChange={v => set('sob', v)}
          options={[
            { value: 'no',       label: 'မရှိပါ' },
            { value: 'exertion', label: 'လှုပ်ရှားရင် မောသည်' },
            { value: 'rest',     label: 'နားနေရင်းလည်း မောသည်' },
          ]} />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-2">အဆုတ်တီဘီ ဖြစ်ဖူးပါသလား</p>
        <RadioGroup name="tb" value={d.tb ?? ''} onChange={v => set('tb', v)}
          options={[{ value: 'no', label: 'မဖြစ်ဖူးပါ' }, { value: 'yes', label: 'ဖြစ်ဖူးပါတယ်' }]} />
      </div>
    </div>
  );
}

function NeuroSection({ d, set, setMulti, multi }: {
  d: Record<string, string>; set: (k: string, v: string) => void;
  setMulti: (k: string, v: string[]) => void; multi: Record<string, string[]>;
}) {
  const SYMPTOMS = [
    { id: 'headache',   label: 'ခေါင်းကိုက် / ခေါင်းမူး' },
    { id: 'facedrop',   label: 'မျက်နှာရွဲ့ခြင်း' },
    { id: 'vision',     label: 'ရုတ်တရက် အမြင်ဝေဝါးခြင်း' },
    { id: 'speech',     label: 'စကားပြောမရခြင်း' },
    { id: 'walk',       label: 'လမ်းမလျှောက်နိုင်ခြင်း' },
    { id: 'numbness1',  label: 'ခြေတစ်ဖက် ထုံကျင် / မသန်ခြင်း' },
    { id: 'numbness2',  label: 'ခြေနှစ်ဖက် ထုံကျင် / မသန်ခြင်း' },
    { id: 'seizure',    label: 'အတက်ရောဂါ / သတိလစ်ဖူးခြင်း' },
    { id: 'incontinent',label: 'ဆီး / ဝမ်း မထိန်းနိုင်ခြင်း' },
    { id: 'none',       label: 'ဘာလက္ခဏာမှ မရှိပါ' },
  ];
  return (
    <div>
      <p className="text-sm font-semibold text-gray-600 mb-3">ခံစားနေရသော လက္ခဏာများ (တစ်ခုထက်မက ရွေးနိုင်သည်)</p>
      <CheckboxGroup options={SYMPTOMS} values={multi.neuroSymptoms ?? []}
        onChange={v => setMulti('neuroSymptoms', v)} />
    </div>
  );
}

function CardiacSection({ d, set }: { d: Record<string, string>; set: (k: string, v: string) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-2">ရင်ဘတ်အောင့် / ရင်တုန်ခြင်း</p>
        <RadioGroup name="chest" value={d.chest ?? ''} onChange={v => set('chest', v)}
          options={[
            { value: 'no',   label: 'မရှိပါ' },
            { value: 'pain', label: 'ရင်ဘတ်အောင့် / မွမ်းကြပ်နေသည်' },
            { value: 'palp', label: 'ရင်တုန် / နှလုံးခုန်မြန်နေသည်' },
          ]} />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-2">သွေးတိုးရောဂါ အခံရှိပါသလား</p>
        <RadioGroup name="htn" value={d.htn ?? ''} onChange={v => set('htn', v)}
          options={[
            { value: 'no',         label: 'မရှိပါ' },
            { value: 'controlled', label: 'ရှိသည် (ဆေးမှန်မှန်သောက်နေဆဲ)' },
            { value: 'uncontrolled', label: 'ရှိသည် (ဆေးပုံမှန်မသောက်ဖြစ်ပါ)' },
          ]} />
      </div>
    </div>
  );
}

function DiabetesSection({ d, set, setMulti, multi }: {
  d: Record<string, string>; set: (k: string, v: string) => void;
  setMulti: (k: string, v: string[]) => void; multi: Record<string, string[]>;
}) {
  const URINARY = [
    { id: 'none',    label: 'ဘာပြဿနာမှ မရှိပါ' },
    { id: 'urgency', label: 'ဆီးအောင့် / ဆီးကျင် / ဆီးခဏခဏသွားသည်' },
    { id: 'edema',   label: 'ခြေထောက် / မျက်နှာ ဖောရောင်နေသည်' },
    { id: 'kidney',  label: 'ကျောက်ကပ်ရောဂါ အခံရှိသည်' },
  ];
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-2">ဆီးချိုရောဂါ အခံရှိပါသလား</p>
        <RadioGroup name="dm" value={d.dm ?? ''} onChange={v => set('dm', v)}
          options={[
            { value: 'no',     label: 'မရှိပါ' },
            { value: 'meds',   label: 'ရှိသည် (ဆေးသောက် / အင်ဆူလင်ထိုးနေဆဲ)' },
            { value: 'unstable', label: 'ရှိသည် (သွေးချို ခဏခဏ တက်/ကျ တတ်သည်)' },
          ]} />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-2">ဆီးသွားခြင်းနှင့် ပတ်သက်ပြီး ပြဿနာ</p>
        <CheckboxGroup options={URINARY} values={multi.urinary ?? []}
          onChange={v => setMulti('urinary', v)} />
      </div>
    </div>
  );
}

function MusculoSection({ d, set, setMulti, multi }: {
  d: Record<string, string>; set: (k: string, v: string) => void;
  setMulti: (k: string, v: string[]) => void; multi: Record<string, string[]>;
}) {
  const LOCATIONS = [
    { id: 'neck',   label: 'လည်ပင်းနာ / တောင့်တင်းခြင်း' },
    { id: 'back',   label: 'ခါးနာ / ခါးကိုက်ခြင်း' },
    { id: 'knee',   label: 'ဒူးနာ / ခြေဆစ်လက်ဆစ်နာခြင်း' },
    { id: 'general',label: 'တစ်ကိုယ်လုံး ကြွက်သား / အရိုးအဆစ် နာကျင်ခြင်း' },
  ];
  const pain = Number(d.painScale ?? 0);
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-3">ဘယ်နေရာမှာ နာကျင်မှု ခံစားနေရပါသလဲ</p>
        <CheckboxGroup options={LOCATIONS} values={multi.painLocation ?? []}
          onChange={v => setMulti('painLocation', v)} />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-600">နာကျင်မှု အဆင့်</p>
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: pain >= 7 ? '#ef4444' : pain >= 4 ? '#f59e0b' : P }}
          >
            {pain}
          </span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 11 }, (_, i) => {
            const active = i === pain;
            const color  = i >= 7 ? '#ef4444' : i >= 4 ? '#f59e0b' : P;
            return (
              <button
                key={i}
                type="button"
                onClick={() => set('painScale', String(i))}
                className="flex-1 h-9 rounded-lg text-xs font-bold transition-all"
                style={{
                  backgroundColor: active ? color : `${color}18`,
                  color:           active ? '#fff' : color,
                  border:          `1.5px solid ${active ? color : `${color}30`}`,
                }}
              >
                {i}
              </button>
            );
          })}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-gray-400">မနာ</span>
          <span className="text-[10px] text-gray-400">အလွန်နာ</span>
        </div>
      </div>
    </div>
  );
}

function MentalSection({ d, set }: { d: Record<string, string>; set: (k: string, v: string) => void }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-600 mb-2">လက်ရှိ စိတ်ပိုင်းဆိုင်ရာ ခံစားချက်</p>
      <RadioGroup name="mood" value={d.mood ?? ''} onChange={v => set('mood', v)}
        options={[
          { value: 'normal',   label: 'ပုံမှန်ပါပဲ' },
          { value: 'depressed', label: 'စိတ်ညစ် / စိတ်ဓာတ်ကျ / ဝမ်းနည်းလွယ်နေသည်' },
          { value: 'anxious',  label: 'စိုးရိမ်ပူပန်မှုများပြီး ရင်တုန် / အိပ်မပျော်ဖြစ်နေသည်' },
          { value: 'stressed', label: 'စိတ်ဖိစီးမှု အလွန်များနေသည်' },
        ]} />
    </div>
  );
}

/* ─── main component ─── */
export default function IntakeForm({ mm, onDone }: { mm: boolean; onDone: () => void }) {
  /* basic fields */
  const [name,         setName]         = useState('');
  const [age,          setAge]          = useState('');
  const [gender,       setGender]       = useState('');
  const [mainComplaint,setMainComplaint]= useState('');
  const [symptomDetail,setSymptomDetail]= useState('');
  const [pregnancy,    setPregnancy]    = useState('');
  const [medHistory,   setMedHistory]   = useState<string[]>([]);
  const [hadSurgery,   setHadSurgery]   = useState('');
  const [surgeryDetail,setSurgeryDetail]= useState('');
  const [drugAllergy,  setDrugAllergy]  = useState('');
  const [allergyDetail,setAllergyDetail]= useState('');
  const [currentMeds,  setCurrentMeds]  = useState<string[]>([]);
  const [category,     setCategory]     = useState('');
  const [medFiles,     setMedFiles]     = useState<{ file: File; url: string; type: 'record' | 'film' }[]>([]);
  const recordRef = useRef<HTMLInputElement>(null);
  const filmRef   = useRef<HTMLInputElement>(null);

  /* dynamic fields - single value */
  const [dynSingle, setDynSingle] = useState<Record<string, string>>({});
  /* dynamic fields - multi value */
  const [dynMulti,  setDynMulti]  = useState<Record<string, string[]>>({});

  const setSingle = (k: string, v: string) => setDynSingle(p => ({ ...p, [k]: v }));
  const setMulti  = (k: string, v: string[]) => setDynMulti(p => ({ ...p, [k]: v }));

  const card = 'bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4';
  const inputCls = 'w-full text-sm text-gray-700 placeholder-gray-300 rounded-xl border border-gray-100 px-3 py-2.5 outline-none focus:border-opacity-60 transition-colors';

  return (
    <div className="flex flex-col gap-4 pb-8">

      {/* Header */}
      <div className="px-5 pt-5 pb-4 rounded-2xl text-white" style={{ background: `linear-gradient(135deg, ${P} 0%, ${PD} 100%)` }}>
        <p className="text-lg font-bold">📋 ကြိုတင်ဆေးဘက်ဆိုင်ရာ မှတ်တမ်း</p>
        <p className="text-sm text-white/70 mt-1">ဆရာဝန်နှင့် တိုင်ပင်ရာတွင် ပိုမိုတိကျစေရန် အောက်ပါ အချက်များ ဖြည့်ပေးပါ</p>
      </div>

      {/* ── Section 1: Basic Info ── */}
      <div className={card}>
        <SectionHeader icon="👤" title="လူနာ အချက်အလက်" />
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">နာမည်</label>
            <input className={inputCls} placeholder="နာမည်ထည့်ပါ" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">အသက်</label>
              <input className={inputCls} type="number" placeholder="အသက်" value={age} onChange={e => setAge(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">ကျား / မ</label>
              <div className="flex gap-2">
                {[{ v: 'male', l: '♂ ကျား' }, { v: 'female', l: '♀ မ' }, { v: 'other', l: 'အခြား' }].map(g => (
                  <button key={g.v} onClick={() => setGender(g.v)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold border transition-all"
                    style={{
                      backgroundColor: gender === g.v ? P : 'transparent',
                      color: gender === g.v ? '#fff' : '#6b7280',
                      borderColor: gender === g.v ? P : '#e5e7eb',
                    }}>
                    {g.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2: Main Complaint ── */}
      <div className={card}>
        <SectionHeader icon="✍️" title="ဆရာဝန်ကို ပြောချင်သော အဓိကအကြောင်းအရင်း" />
        <textarea className={inputCls} rows={2}
          placeholder="ဥပမာ - လွန်ခဲ့တဲ့ ၃ ရက်ကတည်းက ခေါင်းကိုက်ပြီး မကြာခဏ အန်နေသည်..."
          value={mainComplaint} onChange={e => setMainComplaint(e.target.value)} />
        <div>
          <label className="text-xs text-gray-400 mb-1 block">ရောဂါလက္ခဏာ အသေးစိတ်</label>
          <textarea className={inputCls} rows={4}
            placeholder="ခံစားနေရသော ရောဂါလက္ခဏာများအကြောင်း နားလည်သလို အသေးစိတ်ရေးပြပေးပါ..."
            value={symptomDetail} onChange={e => setSymptomDetail(e.target.value)} />
        </div>
      </div>

      {/* ── Section 3: Dynamic Category ── */}
      <div className={card}>
        <SectionHeader icon="🔍" title="အဓိကတင်ပြလိုသော ဆေးဘက်ဆိုင်ရာ အမျိုးအစား" />
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCategory(category === c.id ? '' : c.id)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-xs font-semibold transition-all"
              style={{
                backgroundColor: category === c.id ? P : '#fafafa',
                color: category === c.id ? '#fff' : '#374151',
                borderColor: category === c.id ? P : '#e5e7eb',
              }}>
              <span className="text-base">{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>

        {category && (
          <div className="mt-2 pt-4 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">
              {CATEGORIES.find(c => c.id === category)?.icon} {CATEGORIES.find(c => c.id === category)?.label} — မေးခွန်းများ
            </p>
            {category === 'respiratory' && <RespiratorySection d={dynSingle} set={setSingle} />}
            {category === 'neuro'       && <NeuroSection d={dynSingle} set={setSingle} setMulti={setMulti} multi={dynMulti} />}
            {category === 'cardiac'     && <CardiacSection d={dynSingle} set={setSingle} />}
            {category === 'diabetes'    && <DiabetesSection d={dynSingle} set={setSingle} setMulti={setMulti} multi={dynMulti} />}
            {category === 'musculo'     && <MusculoSection d={dynSingle} set={setSingle} setMulti={setMulti} multi={dynMulti} />}
            {category === 'mental'      && <MentalSection d={dynSingle} set={setSingle} />}
          </div>
        )}
      </div>

      {/* ── Section 4: Female-specific ── */}
      {gender === 'female' && (
        <div className={card}>
          <SectionHeader icon="🤱" title="အမျိုးသမီးလူနာများအတွက်" />
          <RadioGroup name="preg" value={pregnancy} onChange={setPregnancy}
            options={[
              { value: 'no',           label: 'မဟုတ်ပါ' },
              { value: 'pregnant',     label: 'ကိုယ်ဝန်ရှိနေပါသည်' },
              { value: 'breastfeed',   label: 'နို့တိုက်မိခင် ဖြစ်ပါသည်' },
            ]} />
        </div>
      )}

      {/* ── Section 5: Past Medical History ── */}
      <div className={card}>
        <SectionHeader icon="🏥" title="ယခင် ရောဂါရာဇဝင်" />
        <p className="text-xs text-gray-400 -mt-2">တစ်ခုထက်မက ရွေးချယ်နိုင်ပါသည်</p>
        <CheckboxGroup options={MED_CONDITIONS} values={medHistory} onChange={setMedHistory} />
      </div>

      {/* ── Section 6: Surgical History ── */}
      <div className={card}>
        <SectionHeader icon="🔪" title="ယခင် ခွဲစိတ်ကုသမှု ရာဇဝင်" />
        <RadioGroup name="surgery" value={hadSurgery} onChange={setHadSurgery}
          options={[
            { value: 'no',  label: 'မရှိပါ — တစ်ခါမှ မခွဲစိတ်ဖူးပါ' },
            { value: 'yes', label: 'ရှိပါသည်' },
          ]} />
        {hadSurgery === 'yes' && (
          <div className="mt-1">
            <input className={inputCls} placeholder="ဘယ်လို ခွဲစိတ်မှုလဲ ရေးပေးပါ..."
              value={surgeryDetail} onChange={e => setSurgeryDetail(e.target.value)} />
          </div>
        )}
      </div>

      {/* ── Section 7: Drug Allergy ── */}
      <div className={card}>
        <SectionHeader icon="⚠️" title="ဆေးမတည့်ခြင်း (Drug Allergy)" />
        <RadioGroup name="allergy" value={drugAllergy} onChange={setDrugAllergy}
          options={[
            { value: 'no',  label: 'မရှိပါ' },
            { value: 'yes', label: 'ရှိပါသည်' },
          ]} />
        {drugAllergy === 'yes' && (
          <input className={inputCls} placeholder="မတည့်သော ဆေးအမည် ရေးပေးပါ..."
            value={allergyDetail} onChange={e => setAllergyDetail(e.target.value)} />
        )}
      </div>

      {/* ── Section 8: Current Medications ── */}
      <div className={card}>
        <SectionHeader icon="💊" title="လက်ရှိ သောက်သုံးနေသော ဆေးဝါးများ" />
        <p className="text-xs text-gray-400 -mt-2">တစ်ခုထက်မက ရွေးချယ်နိုင်ပါသည်</p>
        <CheckboxGroup options={CURRENT_MEDS} values={currentMeds} onChange={setCurrentMeds} />
      </div>

      {/* ── Section 9: Medical Files Upload ── */}
      <div className={card}>
        <SectionHeader icon="🗂️" title="ဆေးမှတ်တမ်း / Flim ရိုက်ထားသည့် ဓာတ်ပုံများ" />
        <p className="text-xs text-gray-400 -mt-2">ဆေးဘက်ဆိုင်ရာ မှတ်တမ်းများ သို့မဟုတ် X-Ray / Scan ရလဒ်များ ရှိပါက တင်ပေးပါ</p>

        {/* Upload buttons */}
        <div className="grid grid-cols-2 gap-3">
          {/* Medical Record */}
          <button
            type="button"
            onClick={() => recordRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed transition-all"
            style={{ borderColor: `${P}40`, backgroundColor: `${P}06` }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${P}15` }}>
              <FileText className="w-5 h-5" style={{ color: P }} />
            </div>
            <p className="text-xs font-semibold text-center" style={{ color: P }}>ဆေးမှတ်တမ်း<br/>တင်ရန်</p>
          </button>

          {/* Film / Scan */}
          <button
            type="button"
            onClick={() => filmRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed transition-all"
            style={{ borderColor: '#f59e0b40', backgroundColor: '#f59e0b06' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f59e0b15' }}>
              <Upload className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-xs font-semibold text-center text-amber-600">X-Ray / Scan<br/>တင်ရန်</p>
          </button>
        </div>

        {/* Hidden inputs */}
        <input ref={recordRef} type="file" accept="image/*,application/pdf" multiple className="hidden"
          onChange={e => {
            const files = Array.from(e.target.files ?? []);
            setMedFiles(p => [...p, ...files.map(f => ({ file: f, url: URL.createObjectURL(f), type: 'record' as const }))]);
            e.target.value = '';
          }} />
        <input ref={filmRef} type="file" accept="image/*" multiple className="hidden"
          onChange={e => {
            const files = Array.from(e.target.files ?? []);
            setMedFiles(p => [...p, ...files.map(f => ({ file: f, url: URL.createObjectURL(f), type: 'film' as const }))]);
            e.target.value = '';
          }} />

        {/* Preview grid */}
        {medFiles.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-1">
            {medFiles.map((f, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden border border-gray-100 bg-gray-50" style={{ aspectRatio: '1' }}>
                {f.file.type.startsWith('image/') ? (
                  <Image src={f.url} alt={f.file.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 px-2">
                    <FileText className="w-6 h-6 text-gray-400" />
                    <p className="text-[9px] text-gray-400 text-center truncate w-full">{f.file.name}</p>
                  </div>
                )}
                {/* type badge */}
                <span
                  className="absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: f.type === 'record' ? P : '#f59e0b' }}
                >
                  {f.type === 'record' ? 'မှတ်တမ်း' : 'Film'}
                </span>
                {/* remove */}
                <button
                  type="button"
                  onClick={() => setMedFiles(p => p.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {medFiles.length > 0 && (
          <p className="text-xs text-gray-400 text-center">{medFiles.length} ဖိုင် တင်ပြီးပါပြီ</p>
        )}
      </div>

      {/* ── Submit ── */}
      <button
        onClick={onDone}
        className="w-full py-4 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
        style={{ background: `linear-gradient(135deg, ${P} 0%, ${PD} 100%)` }}
      >
        မှတ်တမ်းတင်ပြမည်
        <ChevronRight className="w-4 h-4" />
      </button>
      <button onClick={onDone} className="text-center text-xs text-gray-400 py-1">
        ကျော်ပြီး ချိန်းဆိုမှုများ ကြည့်မည်
      </button>
    </div>
  );
}
