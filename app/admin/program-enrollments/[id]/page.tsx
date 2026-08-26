'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft, Loader2, User, FileText, Stethoscope, AlertTriangle,
  CheckCircle2, XCircle, Receipt, ZoomIn, CreditCard, Building2,
} from 'lucide-react';
import {
  PRIMARY, MED_LABELS, MED_MEDS, CATEGORIES, DYN_SINGLE, DYN_MULTI,
  ViewSection, t,
} from '../../appointments/shared';
import type { IntakeData } from '../../../patient/booking/IntakeForm';
import ImageLightbox from '@/components/admin/ImageLightbox';

interface Enrollment {
  id: string;
  amount: number;
  paymentMethod: string | null;
  receiptUrl: string | null;
  cbPayStatus: string;
  cbPayTransactionId: string | null;
  intake: IntakeData | null;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  reviewNote: string | null;
  createdAt: string;
  user: { id: string; name: string; phone: string; profileImage: string | null };
  program: {
    id: string; titleMm: string; titleEn: string | null; imageUrl: string; price: number;
    doctors: { doctor: { id: string; name: string; nameEn: string | null; specialty: string; imageUrl: string | null } }[];
  };
  referredClinic: { id: string; name: string; nameEn: string | null } | null;
}

interface ClinicOption { id: string; name: string; nameEn: string | null }

export default function ProgramEnrollmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const [clinics, setClinics] = useState<ClinicOption[]>([]);
  const [savingReferral, setSavingReferral] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/program-enrollments/${id}`);
    const data = await res.json();
    setEnrollment(data.enrollment ?? null);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    fetch('/api/admin/clinics?pageSize=500&isActive=true').then(r => r.json()).then(d => setClinics(d.clinics ?? []));
  }, []);

  async function updateStatus(status: 'APPROVED' | 'REJECTED', reviewNote?: string) {
    setSaving(true);
    await fetch(`/api/admin/program-enrollments/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reviewNote }),
    });
    setSaving(false);
    setShowReject(false);
    load();
  }

  async function updateReferral(referredClinicId: string) {
    setSavingReferral(true);
    await fetch(`/api/admin/program-enrollments/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referredClinicId }),
    });
    setSavingReferral(false);
    load();
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin" style={{ color: PRIMARY }} /></div>;
  if (!enrollment) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-gray-400">Enrollment not found.</p>
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

  const statusBadge = {
    PENDING_REVIEW: { bg: '#fffbeb', color: '#d97706', label: 'Pending Review' },
    APPROVED:       { bg: '#ecfdf5', color: '#10b981', label: 'Approved' },
    REJECTED:       { bg: '#fef2f2', color: '#ef4444', label: 'Rejected' },
  }[enrollment.status];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><ArrowLeft size={18} /></button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{enrollment.user.name}</h1>
            <p className="text-xs text-gray-400">{enrollment.user.phone} · {enrollment.program.titleEn ?? enrollment.program.titleMm}</p>
          </div>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: statusBadge.bg, color: statusBadge.color }}>
          {statusBadge.label}
        </span>
      </div>

      {enrollment.status === 'PENDING_REVIEW' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
          <p className="text-sm font-semibold text-gray-700">Review this medical record</p>
          {!showReject ? (
            <div className="flex gap-3">
              <button onClick={() => updateStatus('APPROVED')} disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ backgroundColor: '#10b981' }}>
                <CheckCircle2 size={16} /> Approve
              </button>
              <button onClick={() => setShowReject(true)} disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ backgroundColor: '#ef4444' }}>
                <XCircle size={16} /> Reject
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <textarea rows={2} value={rejectNote} onChange={e => setRejectNote(e.target.value)}
                placeholder="Reason for rejection (shown to patient)..."
                className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-red-300 resize-none" />
              <div className="flex gap-3">
                <button onClick={() => setShowReject(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">Cancel</button>
                <button onClick={() => updateStatus('REJECTED', rejectNote)} disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60" style={{ backgroundColor: '#ef4444' }}>
                  Confirm Reject
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {enrollment.status === 'REJECTED' && enrollment.reviewNote && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
          <span className="font-bold">Rejection reason: </span>{enrollment.reviewNote}
        </div>
      )}

      {/* Referral — which partner clinic referred this patient in, for revenue ledger commission */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Building2 size={13} /> Referring Partner Clinic
        </p>
        <select
          value={enrollment.referredClinic?.id ?? ''}
          disabled={savingReferral}
          onChange={e => updateReferral(e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-gray-300 disabled:opacity-60"
        >
          <option value="">No referral</option>
          {clinics.map(c => <option key={c.id} value={c.id}>{c.nameEn ?? c.name}</option>)}
        </select>
        <p className="text-[11px] text-gray-400 mt-1.5">Only applies if this clinic didn&apos;t already co-run the program — must be set before Approve to affect the revenue ledger.</p>
      </div>

      {/* Payment */}
      <ViewSection icon={CreditCard} title="Payment" rows={[
        { label: 'Amount', value: `${enrollment.amount.toLocaleString()} MMK` },
        { label: 'Method', value: enrollment.paymentMethod ?? '—' },
        { label: 'CB Pay Status', value: enrollment.cbPayStatus },
        { label: 'CB Pay Transaction', value: enrollment.cbPayTransactionId ?? '—' },
      ]} />

      {enrollment.receiptUrl && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Receipt size={13} /> Payment Receipt</p>
          <button onClick={() => setLightbox({ src: enrollment.receiptUrl!, alt: 'Receipt' })} className="relative w-40 h-40 rounded-xl overflow-hidden border border-gray-100 group">
            <Image src={enrollment.receiptUrl} alt="Receipt" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        </div>
      )}

      {/* Doctors on program */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Program Doctors (notified on approval)</p>
        {enrollment.program.doctors.length === 0 ? (
          <p className="text-sm text-gray-400">No doctors assigned to this program yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {enrollment.program.doctors.map(({ doctor: dr }) => (
              <div key={dr.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50">
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-gray-100 bg-white flex items-center justify-center">
                  {dr.imageUrl ? <Image src={dr.imageUrl} alt={dr.name} width={32} height={32} className="object-cover w-full h-full" /> : <Stethoscope className="w-4 h-4 text-gray-300" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-700 truncate">{dr.nameEn ?? dr.name}</p>
                  <p className="text-xs text-gray-400 truncate">{dr.specialty}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Medical record */}
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
