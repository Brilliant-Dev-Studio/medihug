'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Loader2, Calendar, Clock, CreditCard, Phone,
  User, FileText, Stethoscope, AlertTriangle, ZoomIn,
} from 'lucide-react';
import {
  PRIMARY, AVATAR_COLORS, MED_LABELS, MED_MEDS, CATEGORIES, DYN_SINGLE, DYN_MULTI, t,
  ViewSection, StatusChanger, LangDropdown, STATUS_STYLE, type Appointment,
} from '../shared';
import { useLang } from '../../../lib/LanguageContext';
import ImageLightbox from '@/components/admin/ImageLightbox';

export default function AdminAppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { lang } = useLang();
  const mm = lang === 'mm';
  const [appt, setAppt] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  const fetchAppt = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/appointments/${id}`);
    const data = await res.json();
    setAppt(data.appointment ?? null);
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchAppt(); }, [fetchAppt]);

  async function updateStatus(next: Appointment['status']) {
    setAppt(a => a ? { ...a, status: next } : a);
    await fetch(`/api/admin/appointments/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: PRIMARY }} />
    </div>
  );

  if (!appt) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Calendar className="w-12 h-12 text-gray-200" />
      <p className="text-gray-400">{t(mm, { mm: 'ချိန်းဆိုမှု ရှာမတွေ့ပါ', en: 'Appointment not found.' })}</p>
      <button onClick={() => router.back()} className="text-sm font-semibold" style={{ color: PRIMARY }}>← {t(mm, { mm: 'နောက်သို့', en: 'Back' })}</button>
    </div>
  );

  const d = appt.intake;
  const doctorName = appt.doctor.nameEn ?? appt.doctor.name;
  const specialty  = appt.doctor.specialtyEn ?? appt.doctor.specialty;

  const dynRows = d ? Object.entries(d.dynSingle ?? {})
    .filter(([, v]) => v)
    .map(([k, v]) => {
      const cfg = DYN_SINGLE[k];
      return { label: cfg ? t(mm, cfg.label) : k, value: cfg?.values?.[v] ? t(mm, cfg.values[v]) : v };
    }) : [];
  const multiRows = d ? Object.entries(d.dynMulti ?? {})
    .filter(([, v]) => v && v.length > 0)
    .map(([k, v]) => ({ label: DYN_MULTI[k] ? t(mm, DYN_MULTI[k]) : k, value: v.join(', ') })) : [];

  const s = STATUS_STYLE[appt.status];

  return (
    <div className="flex flex-col gap-5">

      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" /> {t(mm, { mm: 'ချိန်းဆိုမှုများသို့ ပြန်သွားရန်', en: 'Back to Appointments' })}
        </button>
        <LangDropdown />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

        {/* ── Left sidebar ── */}
        <div className="flex flex-col gap-5 lg:sticky lg:top-6">

          {/* Hero card */}
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #1a9990 100%)` }} />
            <div className="relative p-6 flex flex-col items-center text-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full self-center" style={{ backgroundColor: 'rgba(255,255,255,0.18)', color: '#fff' }}>
                <s.icon className="w-3.5 h-3.5" /> {t(mm, s.label)}
              </span>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0 bg-white/15 text-white border-2 border-white/30 overflow-hidden">
                {appt.user.profileImage
                  ? <img src={appt.user.profileImage} alt={appt.user.name} className="w-full h-full object-cover" />
                  : appt.user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{appt.user.name}</h1>
                <div className="flex items-center justify-center gap-1.5 text-sm text-white/80 mt-1">
                  <Phone className="w-3.5 h-3.5" /> {appt.user.phone}
                </div>
              </div>
            </div>
          </div>

          {/* Doctor + meta */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t(mm, { mm: 'ဆရာဝန်', en: 'Doctor' })}</p>
            <div className="flex items-center gap-3">
              {appt.doctor.imageUrl ? (
                <img src={appt.doctor.imageUrl} alt={doctorName} className="w-12 h-12 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ backgroundColor: AVATAR_COLORS[1] }}>
                  {doctorName.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{doctorName}</p>
                <p className="text-xs text-gray-400 truncate">{specialty}</p>
              </div>
            </div>
            <div className="h-px bg-gray-50" />
            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50">
                <Calendar className="w-4 h-4 shrink-0" style={{ color: PRIMARY }} />
                <span className="text-xs font-semibold text-gray-600">{new Date(appt.date).toLocaleDateString()}</span>
              </div>
              {appt.time && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50">
                  <Clock className="w-4 h-4 shrink-0" style={{ color: PRIMARY }} />
                  <span className="text-xs font-semibold text-gray-600">{appt.time}</span>
                </div>
              )}
              {appt.fee != null && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50">
                  <span className="text-xs font-semibold text-gray-600">{appt.fee.toLocaleString()} MMK</span>
                </div>
              )}
              {appt.paymentMethod && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 capitalize">
                  <CreditCard className="w-4 h-4 shrink-0" style={{ color: PRIMARY }} />
                  <span className="text-xs font-semibold text-gray-600">{appt.paymentMethod}</span>
                </div>
              )}
            </div>
            <div className="h-px bg-gray-50" />
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t(mm, { mm: 'ငွေလွှဲပြေစာ', en: 'Payment Receipt' })}</p>
              {appt.receiptUrl ? (
                <button type="button" onClick={() => setLightbox({ src: appt.receiptUrl!, alt: 'Payment receipt' })}
                  className="group block relative w-full rounded-xl overflow-hidden border border-gray-100 bg-gray-50" style={{ aspectRatio: '4 / 3' }}>
                  <img src={appt.receiptUrl} alt="Payment receipt" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-colors">
                    <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center" style={{ aspectRatio: '4 / 3' }}>
                  <p className="text-xs text-gray-400">{t(mm, { mm: 'မတင်ရသေးပါ', en: 'Not uploaded' })}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status changer */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{t(mm, { mm: 'ချိန်းဆိုမှု အခြေအနေ', en: 'Booking Status' })}</p>
            <StatusChanger status={appt.status} onChanged={updateStatus} />
          </div>
        </div>

        {/* ── Right / main column ── */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {(appt.reason || appt.note) && (
            <ViewSection icon={FileText} title={t(mm, { mm: 'အကြောင်းအရာ / မှတ်ချက်', en: 'Reason / Note' })} rows={[
              ...(appt.reason ? [{ label: t(mm, { mm: 'အကြောင်းအရာ', en: 'Reason' }), value: appt.reason }] : []),
              ...(appt.note   ? [{ label: t(mm, { mm: 'မှတ်ချက်', en: 'Note' }),      value: appt.note }]   : []),
            ]} />
          )}

          {!d ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <FileText className="w-8 h-8 mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">{t(mm, { mm: 'ကြိုတင် ဆေးဘက်ဆိုင်ရာ မှတ်တမ်း မဖြည့်ရသေးပါ', en: 'No pre-consultation form submitted.' })}</p>
            </div>
          ) : (
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

              <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t(mm, { mm: 'ဆေးမှတ်တမ်း / Film ဓာတ်ပုံ', en: 'Medical Records / Films' })}</p>
                {(d.medicalFiles ?? []).length === 0 ? (
                  <p className="text-sm text-gray-400">{t(mm, { mm: 'မတင်ရသေးပါ', en: 'Not uploaded' })}</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {d.medicalFiles.map((f, i) => (
                      <button key={i} type="button" onClick={() => setLightbox({ src: f.url, alt: f.name })}
                        className="group relative rounded-xl overflow-hidden border border-gray-100 bg-gray-50" style={{ aspectRatio: '1' }}>
                        <img src={f.url} alt={f.name} className="w-full h-full object-cover" />
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
            </>
          )}
        </div>
      </div>

      {lightbox && <ImageLightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />}
    </div>
  );
}
