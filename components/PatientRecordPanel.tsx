'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, User, FileText, Stethoscope, AlertTriangle, Image as ImageIcon, ZoomIn } from 'lucide-react';
import {
  MED_LABELS, MED_MEDS, CATEGORIES, DYN_SINGLE, DYN_MULTI, t,
  ViewSection, type Appointment,
} from '@/app/admin/appointments/shared';
import { useLang } from '@/app/lib/LanguageContext';
import ImageLightbox from '@/components/admin/ImageLightbox';

const PRIMARY = '#2ab5ad';

interface Props {
  appointment: Appointment | null;
  open: boolean;
  onClose: () => void;
}

export default function PatientRecordPanel({ appointment, open, onClose }: Props) {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  if (!open) return null;

  const d = appointment?.intake ?? null;

  const dynRows = d ? Object.entries(d.dynSingle ?? {})
    .filter(([, v]) => v)
    .map(([k, v]) => {
      const cfg = DYN_SINGLE[k];
      return { label: cfg ? t(mm, cfg.label) : k, value: cfg?.values?.[v] ? t(mm, cfg.values[v]) : v };
    }) : [];
  const multiRows = d ? Object.entries(d.dynMulti ?? {})
    .filter(([, v]) => v && v.length > 0)
    .map(([k, v]) => ({ label: DYN_MULTI[k] ? t(mm, DYN_MULTI[k]) : k, value: v.join(', ') })) : [];

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:w-[420px] h-dvh bg-gray-50 overflow-y-auto flex flex-col">
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
          <p className="text-sm font-bold text-gray-800">{t(mm, { mm: 'လူနာ ဆေးမှတ်တမ်း', en: 'Patient Medical Record' })}</p>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4">
          {!appointment ? (
            <p className="text-sm text-gray-400 text-center py-10">{t(mm, { mm: 'ဆေးမှတ်တမ်း ရှာမတွေ့ပါ', en: 'Record not available.' })}</p>
          ) : (appointment.reason || appointment.note) && (
            <ViewSection icon={FileText} title={t(mm, { mm: 'အကြောင်းအရာ / မှတ်ချက်', en: 'Reason / Note' })} rows={[
              ...(appointment.reason ? [{ label: t(mm, { mm: 'အကြောင်းအရာ', en: 'Reason' }), value: appointment.reason }] : []),
              ...(appointment.note   ? [{ label: t(mm, { mm: 'မှတ်ချက်', en: 'Note' }),      value: appointment.note }]   : []),
            ]} />
          )}

          {appointment && !d ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <FileText className="w-8 h-8 mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">{t(mm, { mm: 'ကြိုတင် ဆေးဘက်ဆိုင်ရာ မှတ်တမ်း မဖြည့်ရသေးပါ', en: 'No pre-consultation form submitted.' })}</p>
            </div>
          ) : d && (
            <>
              <ViewSection icon={User} title={t(mm, { mm: 'လူနာ အချက်အလက်', en: 'Patient Information' })} rows={[
                { label: t(mm, { mm: 'နာမည်', en: 'Name' }),       value: d.name },
                { label: t(mm, { mm: 'ဖုန်းနံပါတ်', en: 'Phone' }), value: d.phone },
                { label: t(mm, { mm: 'အသက်', en: 'Age' }),       value: d.age ? `${d.age} ${t(mm, { mm: 'နှစ်', en: 'yrs' })}` : '' },
                { label: t(mm, { mm: 'ကျား/မ', en: 'Gender' }),  value: d.gender === 'male' ? t(mm, { mm: 'ကျား', en: 'Male' }) : d.gender === 'female' ? t(mm, { mm: 'မ', en: 'Female' }) : d.gender ? t(mm, { mm: 'အခြား', en: 'Other' }) : '' },
              ]} />

              <ViewSection icon={FileText} title={t(mm, { mm: 'ဆေးဝါးဆိုင်ရာ အကြောင်းအရာ', en: 'Consultation Reason' })} rows={[
                { label: t(mm, { mm: 'အဓိက ပြဿနာ', en: 'Main complaint' }), value: d.mainComplaint },
                { label: t(mm, { mm: 'အသေးစိတ်', en: 'Details' }),         value: d.symptomDetail },
              ]} />

              {d.category && (dynRows.length > 0 || multiRows.length > 0) && (
                <ViewSection icon={Stethoscope} title={t(mm, { mm: 'ရောဂါ အမျိုးအစား', en: 'Medical Category' })} rows={[
                  { label: t(mm, { mm: 'အမျိုးအစား', en: 'Category' }), value: CATEGORIES[d.category] ? t(mm, CATEGORIES[d.category]) : d.category },
                  ...dynRows,
                  ...multiRows,
                ]} />
              )}

              {d.pregnancy && (
                <ViewSection icon={AlertTriangle} title={t(mm, { mm: 'အမျိုးသမီးလူနာများအတွက်', en: 'Female Patient Info' })} rows={[
                  { label: t(mm, { mm: 'အခြေအနေ', en: 'Status' }), value: t(mm, { no: { mm: 'မဟုတ်ပါ', en: 'None' }, pregnant: { mm: 'ကိုယ်ဝန်ရှိသည်', en: 'Pregnant' }, breastfeed: { mm: 'နို့တိုက်မိခင်', en: 'Breastfeeding' } }[d.pregnancy] ?? { mm: d.pregnancy, en: d.pregnancy }) },
                ]} />
              )}

              <ViewSection icon={Stethoscope} title={t(mm, { mm: 'ယခင် ရောဂါရာဇဝင်', en: 'Past Medical History' })} rows={[
                { label: t(mm, { mm: 'အခံရောဂါ', en: 'Chronic conditions' }), value: (d.medHistory ?? []).map(k => MED_LABELS[k] ? t(mm, MED_LABELS[k]) : k).join(', ') || t(mm, { mm: 'မရှိပါ', en: 'None' }) },
                { label: t(mm, { mm: 'ခွဲစိတ်ဖူး', en: 'Past surgery' }),   value: d.hadSurgery === 'yes' ? (d.surgeryDetail || t(mm, { mm: 'ဖူးပါသည်', en: 'Yes' })) : t(mm, { mm: 'မဖူးပါ', en: 'No' }) },
              ]} />

              <ViewSection icon={AlertTriangle} title={t(mm, { mm: 'ဆေးနှင့် ဓာတ်မတည့်မှု', en: 'Allergies & Medications' })} rows={[
                { label: t(mm, { mm: 'ဆေးမတည့်ခြင်း', en: 'Drug allergy' }),        value: d.drugAllergy === 'yes' ? (d.allergyDetail || t(mm, { mm: 'ရှိပါသည်', en: 'Yes' })) : t(mm, { mm: 'မရှိပါ', en: 'None' }) },
                { label: t(mm, { mm: 'လက်ရှိ ဆေးဝါးများ', en: 'Current medications' }), value: (d.currentMeds ?? []).map(k => MED_MEDS[k] ? t(mm, MED_MEDS[k]) : k).join(', ') || '—' },
              ]} />

              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-50">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${PRIMARY}12` }}>
                    <ImageIcon className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
                  </div>
                  <p className="text-sm font-bold" style={{ color: PRIMARY }}>{t(mm, { mm: 'ဓာတ်ပုံ / မှတ်တမ်းဖိုင်များ', en: 'Medical Files' })}</p>
                </div>
                <div className="p-4">
                  {(d.medicalFiles ?? []).length === 0 ? (
                    <p className="text-sm text-gray-400">{t(mm, { mm: 'မတင်ရသေးပါ', en: 'Not uploaded' })}</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2.5">
                      {d.medicalFiles.map((f, i) => (
                        <button key={i} type="button" onClick={() => setLightbox({ src: f.url, alt: f.name })}
                          className="group relative rounded-xl overflow-hidden border border-gray-100 bg-gray-50" style={{ aspectRatio: '1' }}>
                          <Image src={f.url} alt={f.name} fill sizes="120px" className="object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-colors">
                            <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <span className="absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: f.type === 'record' ? PRIMARY : '#f59e0b' }}>
                            {f.type === 'record' ? t(mm, { mm: 'မှတ်တမ်း', en: 'Record' }) : 'Film'}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {lightbox && <ImageLightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />}
    </div>
  );
}
