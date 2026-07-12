'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import {
  CheckCircle2, ChevronRight, Upload, X, FileText,
  ClipboardList, User, PenLine, Stethoscope, Baby, History,
  Scissors, AlertTriangle, Pill, FolderOpen,
  Wind, Brain, HeartPulse, Syringe, Bone, Smile,
  Mars, Venus, Loader2,
  type LucideIcon,
} from 'lucide-react';
import { compressAndUpload } from '@/components/admin/uploadImage';

const P  = 'var(--color-primary)';
const PD = 'var(--color-primary-dark)';

type T = { mm: string; en: string };
const t = (mm: boolean, x: T) => (mm ? x.mm : x.en);

/* ─── static data ─── */
const MED_CONDITIONS: { id: string; mm: string; en: string }[] = [
  { id: 'htn',     mm: 'သွေးတိုးရောဂါ',                    en: 'Hypertension' },
  { id: 'dm',      mm: 'ဆီးချိုရောဂါ',                     en: 'Diabetes' },
  { id: 'heart',   mm: 'နှလုံးရောဂါ',                       en: 'Heart disease' },
  { id: 'kidney',  mm: 'ကျောက်ကပ်ရောဂါ',                   en: 'Kidney disease' },
  { id: 'asthma',  mm: 'ပန်းနာရင်ကျပ် / အဆုတ်ရောဂါ',       en: 'Asthma / lung disease' },
  { id: 'liver',   mm: 'အသည်းရောဂါ / အစာအိမ်ရောဂါ',        en: 'Liver / stomach disease' },
  { id: 'stroke',  mm: 'လေဖြတ်ဖူးခြင်း / အာရုံကြောရောဂါ',   en: 'Past stroke / neurological disease' },
  { id: 'cancer',  mm: 'ကင်ဆာရောဂါ',                       en: 'Cancer' },
  { id: 'thyroid', mm: 'သိုင်းရွိုက် ရောဂါ',                  en: 'Thyroid disease' },
  { id: 'none',    mm: 'မည်သည့်အခံရောဂါမှ မရှိပါ',           en: 'No chronic conditions' },
];

const CURRENT_MEDS: { id: string; mm: string; en: string }[] = [
  { id: 'none',     mm: 'ဘာဆေးမှ မသောက်ပါ',              en: 'Not taking any medication' },
  { id: 'chronic',  mm: 'အခံရောဂါအတွက် နေ့စဉ်ဆေးများ',    en: 'Daily meds for chronic condition' },
  { id: 'vitamins', mm: 'အားဆေး / ဗီတာမင်',                en: 'Supplements / vitamins' },
  { id: 'painkill', mm: 'အကိုက်အခဲပျောက်ဆေး',             en: 'Painkillers' },
  { id: 'herbal',   mm: 'မြန်မာတိုင်းရင်းဆေး',             en: 'Traditional herbal medicine' },
  { id: 'other',    mm: 'အခြားဆေးများ',                    en: 'Other medication' },
];

const CATEGORIES: { id: string; icon: LucideIcon; mm: string; en: string }[] = [
  { id: 'respiratory', icon: Wind,       mm: 'ချောင်းဆိုး / အသက်ရှုကြပ်', en: 'Cough / Breathing' },
  { id: 'neuro',       icon: Brain,      mm: 'လေဖြတ် / မျက်နှာရွဲ့',     en: 'Stroke / Facial droop' },
  { id: 'cardiac',     icon: HeartPulse, mm: 'ရင်တုန် / သွေးတိုး',       en: 'Palpitation / BP' },
  { id: 'diabetes',    icon: Syringe,    mm: 'ဆီးချို / ဟော်မုန်း',      en: 'Diabetes / Hormone' },
  { id: 'musculo',     icon: Bone,       mm: 'ခါးနာ / ဒူးနာ / အဆစ်နာ',  en: 'Back / Knee / Joint pain' },
  { id: 'mental',      icon: Smile,      mm: 'စိတ်ကျန်းမာရေး',          en: 'Mental health' },
];

/* ─── helpers ─── */
function SectionHeader({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4" style={{ color: P }} />
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
function RespiratorySection({ d, set, mm }: { d: Record<string, string>; set: (k: string, v: string) => void; mm: boolean }) {
  const yn = [{ value: 'no', label: t(mm, { mm: 'မရှိပါ', en: 'No' }) }, { value: 'yes', label: t(mm, { mm: 'ရှိပါသည်', en: 'Yes' }) }];
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-2">{t(mm, { mm: 'ဖျားနာခြင်း ရှိပါသလား', en: 'Do you have a fever?' })}</p>
        <RadioGroup name="fever" value={d.fever ?? ''} onChange={v => set('fever', v)} options={yn} />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-2">{t(mm, { mm: 'ချောင်းဆိုးခြင်း', en: 'Cough' })}</p>
        <RadioGroup name="cough" value={d.cough ?? ''} onChange={v => set('cough', v)} options={yn} />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-2">{t(mm, { mm: 'သလိပ်ပါခြင်း', en: 'Phlegm / sputum' })}</p>
        <RadioGroup name="sputum" value={d.sputum ?? ''} onChange={v => set('sputum', v)} options={yn} />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-2">{t(mm, { mm: 'မောပန်းလွယ် / အသက်ရှူရခက်ခြင်း', en: 'Easily tired / breathing difficulty' })}</p>
        <RadioGroup name="sob" value={d.sob ?? ''} onChange={v => set('sob', v)}
          options={[
            { value: 'no',       label: t(mm, { mm: 'မရှိပါ', en: 'None' }) },
            { value: 'exertion', label: t(mm, { mm: 'လှုပ်ရှားရင် မောသည်', en: 'On exertion' }) },
            { value: 'rest',     label: t(mm, { mm: 'နားနေရင်းလည်း မောသည်', en: 'Even at rest' }) },
          ]} />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-2">{t(mm, { mm: 'အဆုတ်တီဘီ ဖြစ်ဖူးပါသလား', en: 'History of pulmonary TB?' })}</p>
        <RadioGroup name="tb" value={d.tb ?? ''} onChange={v => set('tb', v)}
          options={[
            { value: 'no',  label: t(mm, { mm: 'မဖြစ်ဖူးပါ', en: 'No' }) },
            { value: 'yes', label: t(mm, { mm: 'ဖြစ်ဖူးပါတယ်', en: 'Yes' }) },
          ]} />
      </div>
    </div>
  );
}

function NeuroSection({ d, setMulti, multi, mm }: {
  d: Record<string, string>; set: (k: string, v: string) => void;
  setMulti: (k: string, v: string[]) => void; multi: Record<string, string[]>; mm: boolean;
}) {
  const SYMPTOMS = [
    { id: 'headache',    mm: 'ခေါင်းကိုက် / ခေါင်းမူး',                en: 'Headache / dizziness' },
    { id: 'facedrop',    mm: 'မျက်နှာရွဲ့ခြင်း',                       en: 'Facial droop' },
    { id: 'vision',      mm: 'ရုတ်တရက် အမြင်ဝေဝါးခြင်း',                en: 'Sudden blurred vision' },
    { id: 'speech',      mm: 'စကားပြောမရခြင်း',                       en: 'Difficulty speaking' },
    { id: 'walk',        mm: 'လမ်းမလျှောက်နိုင်ခြင်း',                 en: 'Unable to walk' },
    { id: 'numbness1',   mm: 'ခြေတစ်ဖက် ထုံကျင် / မသန်ခြင်း',          en: 'Numbness on one side' },
    { id: 'numbness2',   mm: 'ခြေနှစ်ဖက် ထုံကျင် / မသန်ခြင်း',         en: 'Numbness on both sides' },
    { id: 'seizure',     mm: 'အတက်ရောဂါ / သတိလစ်ဖူးခြင်း',            en: 'Seizure / loss of consciousness' },
    { id: 'incontinent', mm: 'ဆီး / ဝမ်း မထိန်းနိုင်ခြင်း',             en: 'Loss of bladder / bowel control' },
    { id: 'none',        mm: 'ဘာလက္ခဏာမှ မရှိပါ',                     en: 'No symptoms' },
  ].map(s => ({ id: s.id, label: t(mm, s) }));
  return (
    <div>
      <p className="text-sm font-semibold text-gray-600 mb-3">{t(mm, { mm: 'ခံစားနေရသော လက္ခဏာများ (တစ်ခုထက်မက ရွေးနိုင်သည်)', en: 'Symptoms you are experiencing (multiple choice)' })}</p>
      <CheckboxGroup options={SYMPTOMS} values={multi.neuroSymptoms ?? []}
        onChange={v => setMulti('neuroSymptoms', v)} />
    </div>
  );
}

function CardiacSection({ d, set, mm }: { d: Record<string, string>; set: (k: string, v: string) => void; mm: boolean }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-2">{t(mm, { mm: 'ရင်ဘတ်အောင့် / ရင်တုန်ခြင်း', en: 'Chest pain / palpitations' })}</p>
        <RadioGroup name="chest" value={d.chest ?? ''} onChange={v => set('chest', v)}
          options={[
            { value: 'no',   label: t(mm, { mm: 'မရှိပါ', en: 'None' }) },
            { value: 'pain', label: t(mm, { mm: 'ရင်ဘတ်အောင့် / မွမ်းကြပ်နေသည်', en: 'Chest pain / tightness' }) },
            { value: 'palp', label: t(mm, { mm: 'ရင်တုန် / နှလုံးခုန်မြန်နေသည်', en: 'Palpitations / fast heartbeat' }) },
          ]} />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-2">{t(mm, { mm: 'သွေးတိုးရောဂါ အခံရှိပါသလား', en: 'History of hypertension?' })}</p>
        <RadioGroup name="htn" value={d.htn ?? ''} onChange={v => set('htn', v)}
          options={[
            { value: 'no',           label: t(mm, { mm: 'မရှိပါ', en: 'None' }) },
            { value: 'controlled',   label: t(mm, { mm: 'ရှိသည် (ဆေးမှန်မှန်သောက်နေဆဲ)', en: 'Yes (taking medication regularly)' }) },
            { value: 'uncontrolled', label: t(mm, { mm: 'ရှိသည် (ဆေးပုံမှန်မသောက်ဖြစ်ပါ)', en: 'Yes (not taking medication regularly)' }) },
          ]} />
      </div>
    </div>
  );
}

function DiabetesSection({ d, set, setMulti, multi, mm }: {
  d: Record<string, string>; set: (k: string, v: string) => void;
  setMulti: (k: string, v: string[]) => void; multi: Record<string, string[]>; mm: boolean;
}) {
  const URINARY = [
    { id: 'none',    mm: 'ဘာပြဿနာမှ မရှိပါ',                          en: 'No issues' },
    { id: 'urgency', mm: 'ဆီးအောင့် / ဆီးကျင် / ဆီးခဏခဏသွားသည်',        en: 'Urgency / burning / frequent urination' },
    { id: 'edema',   mm: 'ခြေထောက် / မျက်နှာ ဖောရောင်နေသည်',           en: 'Leg / facial swelling' },
    { id: 'kidney',  mm: 'ကျောက်ကပ်ရောဂါ အခံရှိသည်',                   en: 'History of kidney disease' },
  ].map(s => ({ id: s.id, label: t(mm, s) }));
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-2">{t(mm, { mm: 'ဆီးချိုရောဂါ အခံရှိပါသလား', en: 'History of diabetes?' })}</p>
        <RadioGroup name="dm" value={d.dm ?? ''} onChange={v => set('dm', v)}
          options={[
            { value: 'no',       label: t(mm, { mm: 'မရှိပါ', en: 'None' }) },
            { value: 'meds',     label: t(mm, { mm: 'ရှိသည် (ဆေးသောက် / အင်ဆူလင်ထိုးနေဆဲ)', en: 'Yes (on meds / insulin)' }) },
            { value: 'unstable', label: t(mm, { mm: 'ရှိသည် (သွေးချို ခဏခဏ တက်/ကျ တတ်သည်)', en: 'Yes (unstable blood sugar)' }) },
          ]} />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-2">{t(mm, { mm: 'ဆီးသွားခြင်းနှင့် ပတ်သက်ပြီး ပြဿနာ', en: 'Urinary issues' })}</p>
        <CheckboxGroup options={URINARY} values={multi.urinary ?? []}
          onChange={v => setMulti('urinary', v)} />
      </div>
    </div>
  );
}

function MusculoSection({ d, set, setMulti, multi, mm }: {
  d: Record<string, string>; set: (k: string, v: string) => void;
  setMulti: (k: string, v: string[]) => void; multi: Record<string, string[]>; mm: boolean;
}) {
  const LOCATIONS = [
    { id: 'neck',    mm: 'လည်ပင်းနာ / တောင့်တင်းခြင်း',                    en: 'Neck pain / stiffness' },
    { id: 'back',    mm: 'ခါးနာ / ခါးကိုက်ခြင်း',                          en: 'Lower back pain' },
    { id: 'knee',    mm: 'ဒူးနာ / ခြေဆစ်လက်ဆစ်နာခြင်း',                    en: 'Knee / joint pain' },
    { id: 'general', mm: 'တစ်ကိုယ်လုံး ကြွက်သား / အရိုးအဆစ် နာကျင်ခြင်း',   en: 'Generalized muscle / joint pain' },
  ].map(s => ({ id: s.id, label: t(mm, s) }));
  const painScale = Number(d.painScale ?? 0);
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-3">{t(mm, { mm: 'ဘယ်နေရာမှာ နာကျင်မှု ခံစားနေရပါသလဲ', en: 'Where do you feel the pain?' })}</p>
        <CheckboxGroup options={LOCATIONS} values={multi.painLocation ?? []}
          onChange={v => setMulti('painLocation', v)} />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-600">{t(mm, { mm: 'နာကျင်မှု အဆင့်', en: 'Pain level' })}</p>
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: painScale >= 7 ? '#ef4444' : painScale >= 4 ? '#f59e0b' : P }}
          >
            {painScale}
          </span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 11 }, (_, i) => {
            const active = i === painScale;
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
          <span className="text-[10px] text-gray-400">{t(mm, { mm: 'မနာ', en: 'No pain' })}</span>
          <span className="text-[10px] text-gray-400">{t(mm, { mm: 'အလွန်နာ', en: 'Worst pain' })}</span>
        </div>
      </div>
    </div>
  );
}

function MentalSection({ d, set, mm }: { d: Record<string, string>; set: (k: string, v: string) => void; mm: boolean }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-600 mb-2">{t(mm, { mm: 'လက်ရှိ စိတ်ပိုင်းဆိုင်ရာ ခံစားချက်', en: 'Current emotional state' })}</p>
      <RadioGroup name="mood" value={d.mood ?? ''} onChange={v => set('mood', v)}
        options={[
          { value: 'normal',    label: t(mm, { mm: 'ပုံမှန်ပါပဲ', en: 'Normal' }) },
          { value: 'depressed', label: t(mm, { mm: 'စိတ်ညစ် / စိတ်ဓာတ်ကျ / ဝမ်းနည်းလွယ်နေသည်', en: 'Low mood / depressed / easily sad' }) },
          { value: 'anxious',   label: t(mm, { mm: 'စိုးရိမ်ပူပန်မှုများပြီး ရင်တုန် / အိပ်မပျော်ဖြစ်နေသည်', en: 'Anxious, palpitations / trouble sleeping' }) },
          { value: 'stressed',  label: t(mm, { mm: 'စိတ်ဖိစီးမှု အလွန်များနေသည်', en: 'High stress level' }) },
        ]} />
    </div>
  );
}

export interface IntakeData {
  name: string; phone: string; age: string; gender: string;
  mainComplaint: string; symptomDetail: string; pregnancy: string;
  medHistory: string[]; hadSurgery: string; surgeryDetail: string;
  drugAllergy: string; allergyDetail: string; currentMeds: string[];
  category: string; dynSingle: Record<string, string>; dynMulti: Record<string, string[]>;
  medicalFiles: { url: string; type: 'record' | 'film'; name: string }[];
}

/* ─── main component ─── */
export default function IntakeForm({ mm, onDone }: { mm: boolean; onDone: (data: IntakeData) => void }) {
  /* basic fields */
  const [name,         setName]         = useState('');
  const [phone,        setPhone]        = useState('');
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

  const [submitError, setSubmitError] = useState('');
  const [uploading,   setUploading]   = useState(false);

  async function handleSubmit() {
    if (!name.trim() || !phone.trim()) {
      setSubmitError(t(mm, { mm: 'နာမည်နှင့် ဖုန်းနံပါတ် ဖြည့်ပေးရန် လိုအပ်ပါသည်', en: 'Please fill in name and phone number' }));
      return;
    }
    setSubmitError('');
    setUploading(true);
    try {
      const medicalFiles = await Promise.all(
        medFiles.map(async f => ({
          url: await compressAndUpload(f.file, () => {}, '/api/patient/upload'),
          type: f.type,
          name: f.file.name,
        }))
      );
      onDone({
        name, phone, age, gender, mainComplaint, symptomDetail, pregnancy,
        medHistory, hadSurgery, surgeryDetail, drugAllergy, allergyDetail,
        currentMeds, category, dynSingle, dynMulti, medicalFiles,
      });
    } catch {
      setSubmitError(t(mm, { mm: 'ဖိုင်တင်ရာတွင် အမှားရှိသည်', en: 'Failed to upload files' }));
    } finally {
      setUploading(false);
    }
  }

  const card = 'bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4';
  const inputCls = 'w-full text-sm text-gray-700 placeholder-gray-300 rounded-xl border border-gray-100 px-3 py-2.5 outline-none focus:border-opacity-60 transition-colors';

  const CATEGORY_LABELS = CATEGORIES.map(c => ({ id: c.id, icon: c.icon, label: t(mm, c) }));
  const activeCategory = CATEGORY_LABELS.find(c => c.id === category);

  return (
    <div className="flex flex-col gap-4 pb-8">

      {/* Header */}
      <div className="px-5 pt-5 pb-4 rounded-2xl text-white" style={{ background: `linear-gradient(135deg, ${P} 0%, ${PD} 100%)` }}>
        <p className="text-lg font-bold flex items-center gap-2">
          <ClipboardList className="w-5 h-5" />
          {t(mm, { mm: 'ကြိုတင်ဆေးဘက်ဆိုင်ရာ မှတ်တမ်း', en: 'Pre-Consultation Medical Form' })}
        </p>
        <p className="text-sm text-white/70 mt-1">
          {t(mm, { mm: 'ဆရာဝန်နှင့် တိုင်ပင်ရာတွင် ပိုမိုတိကျစေရန် အောက်ပါ အချက်များ ဖြည့်ပေးပါ', en: 'Fill in the details below so your doctor can consult you more accurately' })}
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-5">

      {/* ── Section 1: Basic Info ── */}
      <div className={card}>
        <SectionHeader icon={User} title={t(mm, { mm: 'လူနာ အချက်အလက်', en: 'Patient Information' })} />
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">{t(mm, { mm: 'နာမည်', en: 'Name' })}</label>
            <input className={inputCls} placeholder={t(mm, { mm: 'နာမည်ထည့်ပါ', en: 'Enter your name' })} value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">{t(mm, { mm: 'ဖုန်းနံပါတ်', en: 'Phone Number' })}</label>
            <input className={inputCls} placeholder="09xxxxxxxxx" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">{t(mm, { mm: 'အသက်', en: 'Age' })}</label>
              <input className={inputCls} type="number" placeholder={t(mm, { mm: 'အသက်', en: 'Age' })} value={age} onChange={e => setAge(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">{t(mm, { mm: 'ကျား / မ', en: 'Gender' })}</label>
              <div className="flex gap-2">
                {[
                  { v: 'male',   l: t(mm, { mm: 'ကျား', en: 'Male' }),   icon: Mars },
                  { v: 'female', l: t(mm, { mm: 'မ', en: 'Female' }),    icon: Venus },
                  { v: 'other',  l: t(mm, { mm: 'အခြား', en: 'Other' }), icon: null },
                ].map(g => (
                  <button key={g.v} onClick={() => setGender(g.v)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1"
                    style={{
                      backgroundColor: gender === g.v ? P : 'transparent',
                      color: gender === g.v ? '#fff' : '#6b7280',
                      borderColor: gender === g.v ? P : '#e5e7eb',
                    }}>
                    {g.icon && <g.icon className="w-3.5 h-3.5" />}
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
        <SectionHeader icon={PenLine} title={t(mm, { mm: 'ဆရာဝန်ကို ပြောချင်သော အဓိကအကြောင်းအရင်း', en: 'Main reason for consultation' })} />
        <textarea className={inputCls} rows={2}
          placeholder={t(mm, { mm: 'ဥပမာ - လွန်ခဲ့တဲ့ ၃ ရက်ကတည်းက ခေါင်းကိုက်ပြီး မကြာခဏ အန်နေသည်...', en: 'e.g. Headache and frequent vomiting for the past 3 days...' })}
          value={mainComplaint} onChange={e => setMainComplaint(e.target.value)} />
        <div>
          <label className="text-xs text-gray-400 mb-1 block">{t(mm, { mm: 'ရောဂါလက္ခဏာ အသေးစိတ်', en: 'Symptom details' })}</label>
          <textarea className={inputCls} rows={4}
            placeholder={t(mm, { mm: 'ခံစားနေရသော ရောဂါလက္ခဏာများအကြောင်း နားလည်သလို အသေးစိတ်ရေးပြပေးပါ...', en: 'Describe the symptoms you are experiencing in as much detail as you can...' })}
            value={symptomDetail} onChange={e => setSymptomDetail(e.target.value)} />
        </div>
      </div>

      {/* ── Section 3: Dynamic Category ── */}
      <div className={`${card} lg:col-span-2`}>
        <SectionHeader icon={Stethoscope} title={t(mm, { mm: 'အဓိကတင်ပြလိုသော ဆေးဘက်ဆိုင်ရာ အမျိုးအစား', en: 'Main medical category to report' })} />
        <div className="grid grid-cols-2 gap-2">
          {CATEGORY_LABELS.map(c => (
            <button key={c.id} onClick={() => setCategory(category === c.id ? '' : c.id)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-xs font-semibold transition-all"
              style={{
                backgroundColor: category === c.id ? P : '#fafafa',
                color: category === c.id ? '#fff' : '#374151',
                borderColor: category === c.id ? P : '#e5e7eb',
              }}>
              <c.icon className="w-4 h-4 shrink-0" />
              {c.label}
            </button>
          ))}
        </div>

        {category && (
          <div className="mt-2 pt-4 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-1.5">
              {activeCategory && <activeCategory.icon className="w-3.5 h-3.5" />}
              {activeCategory?.label} — {t(mm, { mm: 'မေးခွန်းများ', en: 'Questions' })}
            </p>
            {category === 'respiratory' && <RespiratorySection d={dynSingle} set={setSingle} mm={mm} />}
            {category === 'neuro'       && <NeuroSection d={dynSingle} set={setSingle} setMulti={setMulti} multi={dynMulti} mm={mm} />}
            {category === 'cardiac'     && <CardiacSection d={dynSingle} set={setSingle} mm={mm} />}
            {category === 'diabetes'    && <DiabetesSection d={dynSingle} set={setSingle} setMulti={setMulti} multi={dynMulti} mm={mm} />}
            {category === 'musculo'     && <MusculoSection d={dynSingle} set={setSingle} setMulti={setMulti} multi={dynMulti} mm={mm} />}
            {category === 'mental'      && <MentalSection d={dynSingle} set={setSingle} mm={mm} />}
          </div>
        )}
      </div>

      {/* ── Section 4: Female-specific ── */}
      {gender === 'female' && (
        <div className={card}>
          <SectionHeader icon={Baby} title={t(mm, { mm: 'အမျိုးသမီးလူနာများအတွက်', en: 'For Female Patients' })} />
          <RadioGroup name="preg" value={pregnancy} onChange={setPregnancy}
            options={[
              { value: 'no',         label: t(mm, { mm: 'မဟုတ်ပါ', en: 'None of the below' }) },
              { value: 'pregnant',   label: t(mm, { mm: 'ကိုယ်ဝန်ရှိနေပါသည်', en: 'Currently pregnant' }) },
              { value: 'breastfeed', label: t(mm, { mm: 'နို့တိုက်မိခင် ဖြစ်ပါသည်', en: 'Breastfeeding mother' }) },
            ]} />
        </div>
      )}

      {/* ── Section 5: Past Medical History ── */}
      <div className={card}>
        <SectionHeader icon={History} title={t(mm, { mm: 'ယခင် ရောဂါရာဇဝင်', en: 'Past Medical History' })} />
        <p className="text-xs text-gray-400 -mt-2">{t(mm, { mm: 'တစ်ခုထက်မက ရွေးချယ်နိုင်ပါသည်', en: 'You can select more than one' })}</p>
        <CheckboxGroup options={MED_CONDITIONS.map(c => ({ id: c.id, label: t(mm, c) }))} values={medHistory} onChange={setMedHistory} />
      </div>

      {/* ── Section 6: Surgical History ── */}
      <div className={card}>
        <SectionHeader icon={Scissors} title={t(mm, { mm: 'ယခင် ခွဲစိတ်ကုသမှု ရာဇဝင်', en: 'Past Surgical History' })} />
        <RadioGroup name="surgery" value={hadSurgery} onChange={setHadSurgery}
          options={[
            { value: 'no',  label: t(mm, { mm: 'မရှိပါ — တစ်ခါမှ မခွဲစိတ်ဖူးပါ', en: 'None — never had surgery' }) },
            { value: 'yes', label: t(mm, { mm: 'ရှိပါသည်', en: 'Yes' }) },
          ]} />
        {hadSurgery === 'yes' && (
          <div className="mt-1">
            <input className={inputCls} placeholder={t(mm, { mm: 'ဘယ်လို ခွဲစိတ်မှုလဲ ရေးပေးပါ...', en: 'Describe the surgery...' })}
              value={surgeryDetail} onChange={e => setSurgeryDetail(e.target.value)} />
          </div>
        )}
      </div>

      {/* ── Section 7: Drug Allergy ── */}
      <div className={card}>
        <SectionHeader icon={AlertTriangle} title={t(mm, { mm: 'ဆေးမတည့်ခြင်း (Drug Allergy)', en: 'Drug Allergy' })} />
        <RadioGroup name="allergy" value={drugAllergy} onChange={setDrugAllergy}
          options={[
            { value: 'no',  label: t(mm, { mm: 'မရှိပါ', en: 'None' }) },
            { value: 'yes', label: t(mm, { mm: 'ရှိပါသည်', en: 'Yes' }) },
          ]} />
        {drugAllergy === 'yes' && (
          <input className={inputCls} placeholder={t(mm, { mm: 'မတည့်သော ဆေးအမည် ရေးပေးပါ...', en: 'Name the drug you are allergic to...' })}
            value={allergyDetail} onChange={e => setAllergyDetail(e.target.value)} />
        )}
      </div>

      {/* ── Section 8: Current Medications ── */}
      <div className={card}>
        <SectionHeader icon={Pill} title={t(mm, { mm: 'လက်ရှိ သောက်သုံးနေသော ဆေးဝါးများ', en: 'Current Medications' })} />
        <p className="text-xs text-gray-400 -mt-2">{t(mm, { mm: 'တစ်ခုထက်မက ရွေးချယ်နိုင်ပါသည်', en: 'You can select more than one' })}</p>
        <CheckboxGroup options={CURRENT_MEDS.map(c => ({ id: c.id, label: t(mm, c) }))} values={currentMeds} onChange={setCurrentMeds} />
      </div>

      {/* ── Section 9: Medical Files Upload ── */}
      <div className={`${card} lg:col-span-2`}>
        <SectionHeader icon={FolderOpen} title={t(mm, { mm: 'ဆေးမှတ်တမ်း / Flim ရိုက်ထားသည့် ဓာတ်ပုံများ', en: 'Medical Records / Films' })} />
        <p className="text-xs text-gray-400 -mt-2">{t(mm, { mm: 'ဆေးဘက်ဆိုင်ရာ မှတ်တမ်းများ သို့မဟုတ် X-Ray / Scan ရလဒ်များ ရှိပါက တင်ပေးပါ', en: 'Upload medical records or X-Ray / Scan results, if any' })}</p>

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
            <p className="text-xs font-semibold text-center" style={{ color: P }}>
              {t(mm, { mm: 'ဆေးမှတ်တမ်း', en: 'Medical Record' })}<br/>
              {t(mm, { mm: 'တင်ရန်', en: 'Upload' })}
            </p>
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
            <p className="text-xs font-semibold text-center text-amber-600">
              X-Ray / Scan<br/>
              {t(mm, { mm: 'တင်ရန်', en: 'Upload' })}
            </p>
          </button>
        </div>

        {/* Hidden inputs */}
        <input ref={recordRef} type="file" accept="image/*" multiple className="hidden"
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
                  {f.type === 'record' ? t(mm, { mm: 'မှတ်တမ်း', en: 'Record' }) : 'Film'}
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
          <p className="text-xs text-gray-400 text-center">
            {t(mm, { mm: `${medFiles.length} ဖိုင် တင်ပြီးပါပြီ`, en: `${medFiles.length} file(s) uploaded` })}
          </p>
        )}
      </div>

      </div>

      {/* ── Submit ── */}
      {submitError && (
        <p className="text-center text-xs text-red-500 font-semibold">{submitError}</p>
      )}
      <button
        onClick={handleSubmit}
        disabled={uploading}
        className="w-full py-4 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-70"
        style={{ background: `linear-gradient(135deg, ${P} 0%, ${PD} 100%)` }}
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t(mm, { mm: 'ဖိုင်များ တင်နေသည်...', en: 'Uploading files...' })}
          </>
        ) : (
          <>
            {t(mm, { mm: 'မှတ်တမ်းတင်ပြမည်', en: 'Submit Form' })}
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </button>
      <button onClick={handleSubmit} disabled={uploading} className="text-center text-xs text-gray-400 py-1 disabled:opacity-50">
        {t(mm, { mm: 'ကျော်ပြီး ချိန်းဆိုမှုများ ကြည့်မည်', en: 'Skip and view my appointments' })}
      </button>
    </div>
  );
}
