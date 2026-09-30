'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Send, Building2, ChevronRight } from 'lucide-react';

const PRIMARY = '#3b5bdb';

const STATUSES = ['NEW', 'SENT', 'RESPONDED', 'QUOTATION', 'ACCEPTED', 'APPOINTMENT', 'COMPLETED', 'CANCELLED'] as const;
type Status = typeof STATUSES[number];

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
  id: string; patientName: string; patientPhone: string; specialty: string | null;
  status: Status; createdAt: string;
  hospitalClinic: { id: string; name: string; nameEn: string | null };
}

export default function MedicalRequestsListPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<MedicalRequest[]>([]);
  const [loading, setLoading]   = useState(true);
  const [status, setStatus]     = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const q = new URLSearchParams(status ? { status } : {});
    const res  = await fetch(`/api/partner/medical-requests?${q}`);
    const data = await res.json();
    setRequests(data.requests ?? []);
    setLoading(false);
  }, [status]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/partner/international-partner')} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-800">Medical Requests</h1>
          <p className="text-xs text-gray-400">Patients asking about treatment at your Hospitals</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setStatus('')}
          className="px-3 py-1.5 rounded-full text-xs font-bold border transition-colors"
          style={status === '' ? { backgroundColor: PRIMARY, color: '#fff', borderColor: PRIMARY } : { color: '#6b7280', borderColor: '#e5e7eb' }}>
          All
        </button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className="px-3 py-1.5 rounded-full text-xs font-bold border transition-colors"
            style={status === s ? { backgroundColor: STATUS_STYLE[s].fg, color: '#fff', borderColor: STATUS_STYLE[s].fg } : { color: '#6b7280', borderColor: '#e5e7eb' }}>
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>
        ) : requests.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-2">
            <Send className="w-8 h-8 text-gray-200" />
            <p className="text-sm text-gray-400">No medical requests yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {requests.map(r => (
              <Link key={r.id} href={`/partner/international-partner/requests/${r.id}`}
                className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50/60 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-gray-800">{r.patientName}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: STATUS_STYLE[r.status].bg, color: STATUS_STYLE[r.status].fg }}>
                      {r.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Building2 className="w-3 h-3 text-gray-300" />
                    <p className="text-xs text-gray-400">{r.hospitalClinic.nameEn ?? r.hospitalClinic.name}</p>
                    {r.specialty && <><span className="text-gray-200">·</span><p className="text-xs text-gray-400">{r.specialty}</p></>}
                  </div>
                </div>
                <p className="text-xs text-gray-400 shrink-0">{new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
