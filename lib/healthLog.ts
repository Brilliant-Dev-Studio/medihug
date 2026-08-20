/** Manual self-tracking log types a patient can record from their profile, and the shape of
 * the type-specific `data` JSON each one stores. Shared by the patient entry form, and the
 * admin/doctor read-only views, so the field list and labels never drift apart. */

export type HealthLogType =
  | 'WEIGHT' | 'WAIST' | 'BLOOD_PRESSURE' | 'BLOOD_SUGAR' | 'MEAL'
  | 'EXERCISE' | 'WATER' | 'SLEEP' | 'STEPS' | 'MEDICATION';

export interface HealthLogFieldDef {
  key: string;
  label: { mm: string; en: string };
  type: 'number' | 'text' | 'select' | 'checkbox';
  unit?: string;
  options?: { value: string; label: { mm: string; en: string } }[];
  required?: boolean;
}

export interface HealthLogTypeDef {
  type: HealthLogType;
  label: { mm: string; en: string };
  fields: HealthLogFieldDef[];
  /** Renders a one-line summary of `data` for list views. */
  summarize: (data: Record<string, unknown>) => string;
}

export const HEALTH_LOG_TYPES: HealthLogTypeDef[] = [
  {
    type: 'WEIGHT',
    label: { mm: 'ကိုယ်အလေးချိန်', en: 'Weight Tracker' },
    fields: [{ key: 'weightKg', label: { mm: 'အလေးချိန် (kg)', en: 'Weight (kg)' }, type: 'number', required: true }],
    summarize: d => `${d.weightKg} kg`,
  },
  {
    type: 'WAIST',
    label: { mm: 'ခါးပတ်', en: 'Waist Tracker' },
    fields: [{ key: 'waistCm', label: { mm: 'ခါးပတ် (cm)', en: 'Waist (cm)' }, type: 'number', required: true }],
    summarize: d => `${d.waistCm} cm`,
  },
  {
    type: 'BLOOD_PRESSURE',
    label: { mm: 'သွေးပေါင်ချိန်', en: 'Blood Pressure Log' },
    fields: [
      { key: 'systolic',  label: { mm: 'Systolic',  en: 'Systolic' },  type: 'number', required: true },
      { key: 'diastolic', label: { mm: 'Diastolic', en: 'Diastolic' }, type: 'number', required: true },
      { key: 'pulse',     label: { mm: 'နှလုံးခုန်နှုန်း', en: 'Pulse' }, type: 'number' },
    ],
    summarize: d => `${d.systolic}/${d.diastolic} mmHg${d.pulse ? ` · ${d.pulse} bpm` : ''}`,
  },
  {
    type: 'BLOOD_SUGAR',
    label: { mm: 'သွေးတွင်းသကြားဓာတ်', en: 'Blood Sugar Log' },
    fields: [
      { key: 'value', label: { mm: 'တန်ဖိုး (mg/dL)', en: 'Value (mg/dL)' }, type: 'number', required: true },
      { key: 'context', label: { mm: 'အချိန်အခြေအနေ', en: 'Context' }, type: 'select', options: [
        { value: 'fasting', label: { mm: 'အစာရှောင်ချိန်', en: 'Fasting' } },
        { value: 'postmeal', label: { mm: 'အစာစားပြီး', en: 'Post-meal' } },
        { value: 'random', label: { mm: 'ပုံမှန်', en: 'Random' } },
      ] },
    ],
    summarize: d => `${d.value} mg/dL${d.context ? ` (${d.context})` : ''}`,
  },
  {
    type: 'MEAL',
    label: { mm: 'အစားအသောက် မှတ်တမ်း', en: 'Meal Diary' },
    fields: [
      { key: 'mealType', label: { mm: 'အစားအစာအမျိုးအစား', en: 'Meal Type' }, type: 'select', options: [
        { value: 'breakfast', label: { mm: 'မနက်စာ', en: 'Breakfast' } },
        { value: 'lunch', label: { mm: 'နေ့လယ်စာ', en: 'Lunch' } },
        { value: 'dinner', label: { mm: 'ညစာ', en: 'Dinner' } },
        { value: 'snack', label: { mm: 'အစာအနည်းငယ်', en: 'Snack' } },
      ] },
      { key: 'description', label: { mm: 'အသေးစိတ်', en: 'Description' }, type: 'text', required: true },
    ],
    summarize: d => `${d.mealType ?? ''}: ${d.description ?? ''}`,
  },
  {
    type: 'EXERCISE',
    label: { mm: 'ကိုယ်လက်လှုပ်ရှား မှတ်တမ်း', en: 'Exercise Diary' },
    fields: [
      { key: 'activity', label: { mm: 'လှုပ်ရှားမှု', en: 'Activity' }, type: 'text', required: true },
      { key: 'durationMin', label: { mm: 'ကြာချိန် (မိနစ်)', en: 'Duration (min)' }, type: 'number', required: true },
    ],
    summarize: d => `${d.activity} · ${d.durationMin} min`,
  },
  {
    type: 'WATER',
    label: { mm: 'ရေသောက်ပမာဏ', en: 'Water Intake' },
    fields: [{ key: 'ml', label: { mm: 'ပမာဏ (ml)', en: 'Amount (ml)' }, type: 'number', required: true }],
    summarize: d => `${d.ml} ml`,
  },
  {
    type: 'SLEEP',
    label: { mm: 'အိပ်စက်မှု', en: 'Sleep Tracker' },
    fields: [
      { key: 'hours', label: { mm: 'အိပ်ချိန် (နာရီ)', en: 'Hours' }, type: 'number', required: true },
      { key: 'quality', label: { mm: 'အရည်အသွေး', en: 'Quality' }, type: 'select', options: [
        { value: 'poor', label: { mm: 'မကောင်း', en: 'Poor' } },
        { value: 'fair', label: { mm: 'ပုံမှန်', en: 'Fair' } },
        { value: 'good', label: { mm: 'ကောင်း', en: 'Good' } },
      ] },
    ],
    summarize: d => `${d.hours} hrs${d.quality ? ` (${d.quality})` : ''}`,
  },
  {
    type: 'STEPS',
    label: { mm: 'ခြေလှမ်း စိန်ခေါ်မှု', en: 'Step Challenge' },
    fields: [{ key: 'steps', label: { mm: 'ခြေလှမ်းအရေအတွက်', en: 'Steps' }, type: 'number', required: true }],
    summarize: d => `${d.steps} steps`,
  },
  {
    type: 'MEDICATION',
    label: { mm: 'ဆေးသောက်ခြင်း သတိပေးချက်', en: 'Medication Reminder' },
    fields: [
      { key: 'medicineName', label: { mm: 'ဆေးအမည်', en: 'Medicine Name' }, type: 'text', required: true },
      { key: 'dosage', label: { mm: 'ပမာဏ', en: 'Dosage' }, type: 'text' },
      { key: 'taken', label: { mm: 'သောက်ပြီးပါပြီ', en: 'Taken' }, type: 'checkbox' },
    ],
    summarize: d => `${d.medicineName}${d.dosage ? ` (${d.dosage})` : ''} — ${d.taken ? 'taken' : 'not taken'}`,
  },
];

export const HEALTH_LOG_TYPE_MAP: Record<HealthLogType, HealthLogTypeDef> =
  Object.fromEntries(HEALTH_LOG_TYPES.map(d => [d.type, d])) as Record<HealthLogType, HealthLogTypeDef>;
