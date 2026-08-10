import { generateText } from 'ai';
import { chatModel, chatModelMm } from './model';
import type { IntakeData } from '@/app/patient/booking/IntakeForm';

const MED_LABELS: Record<string, string> = {
  htn: 'Hypertension', dm: 'Diabetes', heart: 'Heart disease', kidney: 'Kidney disease',
  asthma: 'Asthma', liver: 'Liver disease', stroke: 'Past stroke', cancer: 'Cancer',
  thyroid: 'Thyroid disease', none: 'None',
};
const MED_MEDS: Record<string, string> = {
  none: 'None', chronic: 'Chronic condition meds', vitamins: 'Vitamins/supplements',
  painkill: 'Painkillers', herbal: 'Herbal/traditional', other: 'Other',
};
const CATEGORIES: Record<string, string> = {
  respiratory: 'Respiratory', neuro: 'Neurological', cardiac: 'Cardiac',
  diabetes: 'Diabetes', musculo: 'Musculoskeletal', mental: 'Mental health',
};

export function formatIntakeForPrompt(d: IntakeData, reason?: string | null, note?: string | null): string {
  const lines: string[] = [];
  lines.push(`Patient: ${d.name || '—'}, ${d.age || '—'} yrs, ${d.gender || '—'}`);
  lines.push(`Main complaint: ${d.mainComplaint || '—'}`);
  if (d.symptomDetail) lines.push(`Symptom details: ${d.symptomDetail}`);
  if (d.category) lines.push(`Category: ${CATEGORIES[d.category] ?? d.category}`);

  const dyn = Object.entries(d.dynSingle ?? {}).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`);
  if (dyn.length) lines.push(`Category-specific answers: ${dyn.join('; ')}`);

  const multi = Object.entries(d.dynMulti ?? {}).filter(([, v]) => v?.length).map(([k, v]) => `${k}: ${v.join(', ')}`);
  if (multi.length) lines.push(`Additional symptoms: ${multi.join('; ')}`);

  if (d.pregnancy) lines.push(`Pregnancy/breastfeeding status: ${d.pregnancy}`);

  const hist = (d.medHistory ?? []).map(k => MED_LABELS[k] ?? k).filter(v => v !== 'None');
  lines.push(`Chronic conditions: ${hist.length ? hist.join(', ') : 'None reported'}`);

  if (d.hadSurgery === 'yes') lines.push(`Past surgery: ${d.surgeryDetail || 'Yes (no detail given)'}`);
  if (d.drugAllergy === 'yes') lines.push(`Drug allergy: ${d.allergyDetail || 'Yes (no detail given)'}`);

  const meds = (d.currentMeds ?? []).map(k => MED_MEDS[k] ?? k).filter(v => v !== 'None');
  if (meds.length) lines.push(`Current medications: ${meds.join(', ')}`);

  if (reason) lines.push(`Booking reason: ${reason}`);
  if (note) lines.push(`Patient note: ${note}`);

  return lines.join('\n');
}

const SYSTEM_PROMPT = `You summarize a patient's pre-consultation intake form for a doctor on the MediHug platform, right before their appointment.

Rules:
- This is patient-reported information, not verified or diagnosed. Never state a diagnosis or suggest treatment — you are prepping the doctor to read faster, not practicing medicine.
- Lead with anything that needs immediate attention: drug allergies, chronic conditions, pregnancy/breastfeeding status. If none, say so briefly.
- Then summarize the main complaint and relevant details in 3-6 short sentences or lines.
- Formatting: plain text only, no markdown. Never use **bold**, #headers, or markdown bullet/numbered lists. For lists, put each item on its own line starting with "- ".
- Be concise — the doctor has limited time before the call. No filler, no repeating the raw form verbatim.`;

export async function summarizeIntake(d: IntakeData, reason?: string | null, note?: string | null, lang: 'mm' | 'en' = 'en'): Promise<string> {
  const langInstruction = lang === 'mm'
    ? '\n- Write the summary in Myanmar (Burmese) script only.\n- Never mix in Chinese, Korean, Japanese, Cyrillic, Thai, or any other non-Myanmar, non-Latin script — if unsure how to say something in Myanmar, use plain English words instead.'
    : '\n- Write the summary in English.';
  const { text } = await generateText({
    model: lang === 'mm' ? chatModelMm : chatModel,
    system: SYSTEM_PROMPT + langInstruction,
    prompt: formatIntakeForPrompt(d, reason, note),
  });
  return text.trim();
}
