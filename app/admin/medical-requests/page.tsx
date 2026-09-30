'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, Send, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';

const PRIMARY = '#2ab5ad';

const STATUSES = ['NEW', 'SENT', 'RESPONDED', 'QUOTATION', 'ACCEPTED', 'APPOINTMENT', 'COMPLETED', 'CANCELLED'] as const;
type Status = typeof STATUSES[number];

const STATUS_STYLE: Record<Status, { bg: string; fg: string }> = {
  NEW:         { bg: '#eef2ff', fg: '#4338ca' },
  SENT:        { bg: '#e0f2fe', fg: '#0369a1' },
  RESPONDED:   { bg: '#f0fdf4', fg: '#15803d' },
  QUOTATION:   { bg: '#fef9c3', fg: '#854d0e' },
  ACCEPTED:    { bg: '#dcfce7', fg: '#166534' },
  APPOINTMENT: { bg: '#e6f7f7', fg: PRIMARY },
  COMPLETED:   { bg: '#f3f4f6', fg: '#374151' },
  CANCELLED:   { bg: '#fef2f2', fg: '#b91c1c' },
};

interface ClinicRef { id: string; name: string; nameEn: string | null; country?: string | null; countryEn?: string | null; }
interface MedicalRequest {
  id: string; patientName: string; patientPhone: string; specialty: string | null;
  status: Status; quotationAmount: number | null; quotationCurrency: string | null;
  createdAt: string;
  ownerClinic: ClinicRef; hospitalClinic: ClinicRef;
}

export default function AdminMedicalRequestsPage() {
  const [requests, setRequests] = useState<MedicalRequest[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]   = useState(true);
  const [status, setStatus]     = useState('');
  const [search, setSearch]     = useState('');
  const [searchInput, setSearchInput] = useState('');

  const load = useCallback(async (p = page) => {
    setLoading(true);
    const q = new URLSearchParams({ page: String(p) });
    if (status) q.set('status', status);
    if (search) q.set('search', search);
    const res  = await fetch(`/api/admin/medical-requests?${q}`);
    const data = await res.json();
    setRequests(data.requests ?? []);
    setTotal(data.total ?? 0);
    setPage(data.page ?? 1);
    setTotalPages(data.totalPages ?? 1);
    setLoading(false);
  }, [page, status, search]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(1); }, [status, search]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(page); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Medical Requests</h1>
        <p className="text-sm text-gray-400 mt-0.5">{total} requests — International Hospital Representative pipeline, read-only oversight</p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2ab5ad]/40 focus:border-[#2ab5ad]"
            placeholder="Search patient, phone, partner, hospital..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') setSearch(searchInput); }}
          />
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Patient</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hospital</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Partner</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Specialty</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quotation</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" /></td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center">
                  <Send className="w-8 h-8 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No medical requests yet.</p>
                </td></tr>
              ) : requests.map(r => (
                <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-semibold text-gray-700">{r.patientName}</p>
                    <p className="text-xs text-gray-400">{r.patientPhone}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-gray-300" />
                      <span className="text-sm text-gray-600">{r.hospitalClinic.nameEn ?? r.hospitalClinic.name}</span>
                    </div>
                    {(r.hospitalClinic.countryEn || r.hospitalClinic.country) && (
                      <p className="text-xs text-gray-400 ml-5">{r.hospitalClinic.countryEn ?? r.hospitalClinic.country}</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{r.ownerClinic.nameEn ?? r.ownerClinic.name}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{r.specialty || <span className="text-gray-300 text-xs italic">—</span>}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: STATUS_STYLE[r.status].bg, color: STATUS_STYLE[r.status].fg }}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">
                    {r.quotationAmount != null ? `${r.quotationAmount.toLocaleString()} ${r.quotationCurrency ?? 'USD'}` : <span className="text-gray-300 text-xs italic">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
            <p className="text-xs text-gray-400">Page {page} of {totalPages} · {total} total</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
