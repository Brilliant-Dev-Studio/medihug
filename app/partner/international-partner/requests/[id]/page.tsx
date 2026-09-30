'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Phone, Mail, Building2, ArrowRight, XCircle, Save, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const PRIMARY = '#3b5bdb';
const ACCENT  = '#2ab5ad';

const PIPELINE = ['NEW', 'SENT', 'RESPONDED', 'QUOTATION', 'ACCEPTED', 'APPOINTMENT', 'COMPLETED'] as const;
type Status = typeof PIPELINE[number] | 'CANCELLED';

const STATUS_STYLE: Record<Status, { bg: string; fg: string }> = {
  NEW:         { bg: '#eef2ff', fg: '#4338ca' },
  SENT:        { bg: '#e0f2fe', fg: '#0369a1' },
  RESPONDED:   { bg: '#f0fdf4', fg: '#15803d' },
  QUOTATION:   { bg: '#fef9c3', fg: '#854d0e' },
  ACCEPTED:    { bg: '#dcfce7', fg: '#166534' },
  APPOINTMENT: { bg: '#ede9fe', fg: '#6d28d9' },
  COMPLETED:   { bg: '#f3f4f6', fg: '#374151' },
  CANCELLED:   { bg: '#fef2f2', fg: '#b91c1c' },
};

interface MedicalRequest {
  id: string; patientName: string; patientPhone: string; patientEmail: string | null;
  specialty: string | null; reason: string | null;
  status: Status;
  quotationAmount: number | null; quotationCurrency: string | null; quotationNote: string | null;
  appointmentDate: string | null; cancelReason: string | null;
  createdAt: string;
  hospitalClinic: { id: string; name: string; nameEn: string | null; country: string | null; countryEn: string | null };
}

const inp = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-[#3b5bdb] transition-colors';
const lbl = 'block text-xs font-semibold text-gray-500 mb-1.5';

export default function MedicalRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [req, setReq]         = useState<MedicalRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancel, setShowCancel] = useState(false);

  const [quotationAmount, setQuotationAmount] = useState('');
  const [quotationCurrency, setQuotationCurrency] = useState('USD');
  const [quotationNote, setQuotationNote] = useState('');
  const [savingQuotation, setSavingQuotation] = useState(false);

  const [appointmentDate, setAppointmentDate] = useState('');
  const [savingAppointment, setSavingAppointment] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/partner/medical-requests/${id}`).then(r => r.json()).then(d => {
      const r: MedicalRequest | undefined = d.request;
      if (!r) { setLoading(false); return; }
      setReq(r);
      setQuotationAmount(r.quotationAmount != null ? String(r.quotationAmount) : '');
      setQuotationCurrency(r.quotationCurrency ?? 'USD');
      setQuotationNote(r.quotationNote ?? '');
      setAppointmentDate(r.appointmentDate ? r.appointmentDate.slice(0, 10) : '');
      setLoading(false);
    });
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const patch = async (body: Record<string, unknown>) => {
    const res = await fetch(`/api/partner/medical-requests/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Save failed');
    return res.json();
  };

  const advance = async () => {
    if (!req || req.status === 'CANCELLED' || req.status === 'COMPLETED') return;
    const idx = PIPELINE.indexOf(req.status as typeof PIPELINE[number]);
    const next = PIPELINE[idx + 1];
    if (!next) return;
    setAdvancing(true);
    try {
      const d = await patch({ status: next });
      setReq(d.request);
      toast.success(`Moved to ${next}`);
    } catch { toast.error('Could not update status'); } finally { setAdvancing(false); }
  };

  const confirmCancel = async () => {
    setCancelling(true);
    try {
      const d = await patch({ status: 'CANCELLED', cancelReason: cancelReason || null });
      setReq(d.request);
      setShowCancel(false);
      toast.success('Request cancelled');
    } catch { toast.error('Could not cancel'); } finally { setCancelling(false); }
  };

  const saveQuotation = async () => {
    setSavingQuotation(true);
    try {
      const d = await patch({
        quotationAmount: quotationAmount.trim() ? Number(quotationAmount) : null,
        quotationCurrency, quotationNote: quotationNote || null,
      });
      setReq(d.request);
      toast.success('Quotation saved');
    } catch { toast.error('Could not save quotation'); } finally { setSavingQuotation(false); }
  };

  const saveAppointment = async () => {
    setSavingAppointment(true);
    try {
      const d = await patch({ appointmentDate: appointmentDate || null });
      setReq(d.request);
      toast.success('Appointment date saved');
    } catch { toast.error('Could not save appointment date'); } finally { setSavingAppointment(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-6 h-6 animate-spin" style={{ color: PRIMARY }} /></div>;
  }
  if (!req) {
    return <div className="flex items-center justify-center h-[60vh] text-sm text-gray-400">Not found</div>;
  }

  const nextStatus = req.status === 'CANCELLED' || req.status === 'COMPLETED'
    ? null
    : PIPELINE[PIPELINE.indexOf(req.status as typeof PIPELINE[number]) + 1];
  const isTerminal = req.status === 'CANCELLED' || req.status === 'COMPLETED';

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/partner/international-partner/requests')} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-800">{req.patientName}</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Building2 className="w-3 h-3 text-gray-300" />
            <p className="text-xs text-gray-400">{req.hospitalClinic.nameEn ?? req.hospitalClinic.name}</p>
          </div>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: STATUS_STYLE[req.status].bg, color: STATUS_STYLE[req.status].fg }}>
          {req.status}
        </span>
      </div>

      {/* Pipeline actions */}
      {!isTerminal && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-wrap items-center gap-3">
          {nextStatus && (
            <button onClick={advance} disabled={advancing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: ACCENT }}>
              {advancing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              Move to {nextStatus}
            </button>
          )}
          <button onClick={() => setShowCancel(v => !v)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50">
            <XCircle className="w-4 h-4" /> Cancel Request
          </button>
        </div>
      )}
      {showCancel && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex flex-col gap-3">
          <label className={lbl}>Reason for cancelling (optional)</label>
          <textarea className={inp + ' resize-none bg-white'} rows={2} value={cancelReason} onChange={e => setCancelReason(e.target.value)} />
          <div className="flex gap-2">
            <button onClick={confirmCancel} disabled={cancelling}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-red-500 disabled:opacity-60 flex items-center gap-1.5">
              {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} Confirm Cancel
            </button>
            <button onClick={() => setShowCancel(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100">Back</button>
          </div>
        </div>
      )}
      {req.status === 'CANCELLED' && req.cancelReason && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-600">Cancelled: {req.cancelReason}</div>
      )}

      {/* Patient */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Patient</p>
        <a href={`tel:${req.patientPhone}`} className="flex items-center gap-2 text-sm text-gray-700"><Phone className="w-4 h-4 text-gray-400" /> {req.patientPhone}</a>
        {req.patientEmail && <a href={`mailto:${req.patientEmail}`} className="flex items-center gap-2 text-sm text-gray-700"><Mail className="w-4 h-4 text-gray-400" /> {req.patientEmail}</a>}
        {req.specialty && <p className="text-sm text-gray-600"><span className="font-semibold">Specialty:</span> {req.specialty}</p>}
        {req.reason && <p className="text-sm text-gray-600 whitespace-pre-wrap"><span className="font-semibold">Reason:</span> {req.reason}</p>}
      </div>

      {/* Quotation — from QUOTATION status onward */}
      {PIPELINE.indexOf(req.status as typeof PIPELINE[number]) >= PIPELINE.indexOf('QUOTATION') || req.status === 'CANCELLED' ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Quotation</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Amount</label>
              <input type="number" min="0" className={inp} value={quotationAmount} onChange={e => setQuotationAmount(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className={lbl}>Currency</label>
              <select className={inp} value={quotationCurrency} onChange={e => setQuotationCurrency(e.target.value)}>
                <option value="USD">USD</option>
                <option value="MMK">MMK</option>
                <option value="THB">THB</option>
                <option value="SGD">SGD</option>
              </select>
            </div>
          </div>
          <div>
            <label className={lbl}>Note</label>
            <textarea className={inp + ' resize-none'} rows={3} value={quotationNote} onChange={e => setQuotationNote(e.target.value)} placeholder="What's included, terms, etc." />
          </div>
          <button onClick={saveQuotation} disabled={savingQuotation}
            className="self-start flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60"
            style={{ backgroundColor: PRIMARY }}>
            {savingQuotation ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save Quotation
          </button>
        </div>
      ) : null}

      {/* Appointment — from APPOINTMENT status onward */}
      {PIPELINE.indexOf(req.status as typeof PIPELINE[number]) >= PIPELINE.indexOf('APPOINTMENT') || req.status === 'CANCELLED' ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Appointment / Admission Date</p>
          <input type="date" className={inp + ' max-w-xs'} value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} />
          <button onClick={saveAppointment} disabled={savingAppointment}
            className="self-start flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60"
            style={{ backgroundColor: PRIMARY }}>
            {savingAppointment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save Date
          </button>
        </div>
      ) : null}

      {req.status === 'COMPLETED' && (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-2 text-sm text-green-700 font-semibold">
          <Check className="w-4 h-4" /> This request has been completed.
        </div>
      )}
    </div>
  );
}
