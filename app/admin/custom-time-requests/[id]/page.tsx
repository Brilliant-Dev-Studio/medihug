'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Loader2, Calendar, Clock, Phone, FileText,
  Hourglass, CheckCircle2, XCircle,
} from 'lucide-react';
import { useLang } from '../../../lib/LanguageContext';

const PRIMARY = '#2ab5ad';
const AVATAR_COLORS = ['#2ab5ad', '#8b5cf6', '#f59e0b', '#3b82f6', '#10b981', '#ef4444'];

type T = { mm: string; en: string };
const t = (mm: boolean, x: T) => (mm ? x.mm : x.en);

type Status = 'PENDING' | 'APPROVED' | 'REJECTED';

interface CustomTimeRequest {
  id: string;
  requestedDate: string;
  requestedTime: string;
  note: string | null;
  status: Status;
  createdAt: string;
  user:   { name: string; phone: string };
  doctor: { name: string; nameEn: string | null; specialty: string; specialtyEn: string | null; imageUrl: string | null };
}

const STATUS_STYLE: Record<Status, { bg: string; color: string; icon: React.ElementType; label: T }> = {
  PENDING:  { bg: '#fffbeb', color: '#d97706', icon: Hourglass,    label: { mm: 'စောင့်ဆိုင်းဆဲ', en: 'Pending' } },
  APPROVED: { bg: '#ecfdf5', color: '#10b981', icon: CheckCircle2, label: { mm: 'အတည်ပြုပြီး',    en: 'Approved' } },
  REJECTED: { bg: '#fef2f2', color: '#ef4444', icon: XCircle,      label: { mm: 'ပယ်ချ',          en: 'Rejected' } },
};

export default function CustomTimeRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { lang } = useLang();
  const mm = lang === 'mm';
  const [req, setReq] = useState<CustomTimeRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchReq = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/custom-time-requests/${id}`);
    const data = await res.json();
    setReq(data.request ?? null);
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchReq(); }, [fetchReq]);

  async function updateStatus(next: Status) {
    setSaving(true);
    setReq(r => r ? { ...r, status: next } : r);
    await fetch(`/api/admin/custom-time-requests/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    setSaving(false);
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: PRIMARY }} />
    </div>
  );

  if (!req) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Calendar className="w-12 h-12 text-gray-200" />
      <p className="text-gray-400">{t(mm, { mm: 'တောင်းဆိုမှု ရှာမတွေ့ပါ', en: 'Request not found.' })}</p>
      <button onClick={() => router.back()} className="text-sm font-semibold" style={{ color: PRIMARY }}>← {t(mm, { mm: 'နောက်သို့', en: 'Back' })}</button>
    </div>
  );

  const doctorName = req.doctor.nameEn ?? req.doctor.name;
  const specialty  = req.doctor.specialtyEn ?? req.doctor.specialty;
  const s = STATUS_STYLE[req.status];

  return (
    <div className="flex flex-col gap-5">

      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> {t(mm, { mm: 'တောင်းဆိုမှုများသို့ ပြန်သွားရန်', en: 'Back to Custom Time Requests' })}
      </button>

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
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0 bg-white/15 text-white border-2 border-white/30">
                {req.user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{req.user.name}</h1>
                <div className="flex items-center justify-center gap-1.5 text-sm text-white/80 mt-1">
                  <Phone className="w-3.5 h-3.5" /> {req.user.phone}
                </div>
              </div>
            </div>
          </div>

          {/* Doctor + meta */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t(mm, { mm: 'ဆရာဝန်', en: 'Doctor' })}</p>
            <div className="flex items-center gap-3">
              {req.doctor.imageUrl ? (
                <img src={req.doctor.imageUrl} alt={doctorName} className="w-12 h-12 rounded-xl object-cover shrink-0" />
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
                <span className="text-xs font-semibold text-gray-600">{new Date(req.requestedDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50">
                <Clock className="w-4 h-4 shrink-0" style={{ color: PRIMARY }} />
                <span className="text-xs font-semibold text-gray-600">{req.requestedTime}</span>
              </div>
            </div>
            <div className="h-px bg-gray-50" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t(mm, { mm: 'တောင်းဆိုချိန်', en: 'Requested At' })}</p>
            <p className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleString()}</p>
          </div>

          {/* Status changer */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{t(mm, { mm: 'အခြေအနေ', en: 'Status' })}</p>
            <div className="rounded-2xl p-3.5 flex items-center gap-3 mb-4" style={{ backgroundColor: s.bg }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white shadow-sm">
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <p className="text-sm font-extrabold" style={{ color: s.color }}>{t(mm, s.label)}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => updateStatus('APPROVED')} disabled={saving || req.status === 'APPROVED'}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40 transition-opacity"
                style={{ backgroundColor: '#10b981' }}>
                <CheckCircle2 className="w-4 h-4" /> {t(mm, { mm: 'အတည်ပြု', en: 'Approve' })}
              </button>
              <button onClick={() => updateStatus('REJECTED')} disabled={saving || req.status === 'REJECTED'}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40 transition-opacity"
                style={{ backgroundColor: '#ef4444' }}>
                <XCircle className="w-4 h-4" /> {t(mm, { mm: 'ပယ်ချ', en: 'Reject' })}
              </button>
            </div>
            {req.status === 'APPROVED' && (
              <p className="text-[11px] text-gray-400 mt-3">
                {t(mm, { mm: 'ချိန်းဆိုမှုများ စာရင်းတွင် အတည်ပြု appointment တစ်ခု ဖန်တီးပြီးပါပြီ', en: 'A confirmed appointment was created in the Appointments list.' })}
              </p>
            )}
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-50">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${PRIMARY}12` }}>
                <FileText className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
              </div>
              <p className="text-sm font-bold" style={{ color: PRIMARY }}>{t(mm, { mm: 'မှတ်ချက်', en: 'Note' })}</p>
            </div>
            <div className="px-4 py-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{req.note || t(mm, { mm: 'မှတ်ချက် မထည့်ထားပါ', en: 'No note provided.' })}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
