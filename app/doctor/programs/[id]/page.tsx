'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Loader2, User, FileText, Stethoscope, AlertTriangle, ZoomIn } from 'lucide-react';
import {
  PRIMARY, MED_LABELS, MED_MEDS, CATEGORIES, DYN_SINGLE, DYN_MULTI,
  ViewSection, t,
} from '../../../admin/appointments/shared';
import type { IntakeData } from '../../../patient/booking/IntakeForm';
import ImageLightbox from '@/components/admin/ImageLightbox';

interface Enrollment {
  id: string;
  intake: IntakeData | null;
  createdAt: string;
  user: { name: string; phone: string; profileImage: string | null };
  program: { id: string; titleMm: string; titleEn: string | null; imageUrl: string };
}

export default function DoctorProgramPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    fetch(`/api/doctor/programs/${id}`)
      .then(r => r.json())
      .then(d => setEnrollment(d.enrollment ?? null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin" style={{ color: PRIMARY }} /></div>;
  if (!enrollment) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-gray-400">Not found.</p>
      <button onClick={() => router.back()} className="text-sm font-semibold" style={{ color: PRIMARY }}>← Back</button>
    </div>
  );

  const d = enrollment.intake;
  const dynRows = d ? Object.entries(d.dynSingle ?? {})
    .filter(([, v]) => v)
    .map(([k, v]) => {
      const cfg = DYN_SINGLE[k];
      return { label: cfg ? t(true, cfg.label) : k, value: cfg?.values?.[v] ? t(true, cfg.values[v]) : v };
    }) : [];
  const multiRows = d ? Object.entries(d.dynMulti ?? {})
    .filter(([, v]) => v && v.length > 0)
    .map(([k, v]) => ({ label: DYN_MULTI[k] ? t(true, DYN_MULTI[k]) : k, value: v.join('၊ ') })) : [];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">{enrollment.user.name}</h1>
          <p className="text-xs text-gray-400">{enrollment.user.phone} · {enrollment.program.titleEn ?? enrollment.program.titleMm}</p>
        </div>
      </div>

      {!d ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
          <p className="text-sm text-gray-400">No medical record submitted.</p>
        </div>
      ) : (
        <>
          <ViewSection icon={User} title="Patient Information" rows={[
            { label: 'Name', value: d.name },
            { label: 'Phone', value: d.phone },
            { label: 'Age', value: d.age ? `${d.age} yrs` : '' },
            { label: 'Gender', value: d.gender },
          ]} />
          <ViewSection icon={FileText} title="Reason for consultation" rows={[
            { label: 'Main complaint', value: d.mainComplaint },
            { label: 'Details', value: d.symptomDetail },
          ]} />
          {d.category && (dynRows.length > 0 || multiRows.length > 0) && (
            <ViewSection icon={Stethoscope} title="Medical Category" rows={[
              { label: 'Category', value: CATEGORIES[d.category] ? t(true, CATEGORIES[d.category]) : d.category },
              ...dynRows, ...multiRows,
            ]} />
          )}
          <ViewSection icon={Stethoscope} title="Past Medical History" rows={[
            { label: 'Chronic conditions', value: (d.medHistory ?? []).map(k => MED_LABELS[k] ? t(true, MED_LABELS[k]) : k).join('၊ ') || 'None' },
            { label: 'Past surgery', value: d.hadSurgery === 'yes' ? (d.surgeryDetail || 'Yes') : 'No' },
          ]} />
          <ViewSection icon={AlertTriangle} title="Allergies & Medications" rows={[
            { label: 'Drug allergy', value: d.drugAllergy === 'yes' ? (d.allergyDetail || 'Yes') : 'None' },
            { label: 'Current medications', value: (d.currentMeds ?? []).map(k => MED_MEDS[k] ? t(true, MED_MEDS[k]) : k).join('၊ ') || '—' },
          ]} />
          {(d.medicalFiles ?? []).length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Medical Records / Films</p>
              <div className="grid grid-cols-4 gap-2">
                {d.medicalFiles.map((f, i) => (
                  <button key={i} onClick={() => setLightbox({ src: f.url, alt: f.name })}
                    className="relative rounded-xl overflow-hidden border border-gray-100 bg-gray-50" style={{ aspectRatio: '1' }}>
                    <Image src={f.url} alt={f.name} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {lightbox && <ImageLightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />}
    </div>
  );
}
