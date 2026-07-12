'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, ChevronLeft, ChevronRight, FileText, Loader2, Calendar, ChevronDown,
} from 'lucide-react';
import { PRIMARY, STATUS_STYLE, STATUS_OPTIONS, t, type Appointment } from '../appointments/shared';
import { useLang } from '../../lib/LanguageContext';

export default function AdminRecordsPage() {
  const router = useRouter();
  const { lang } = useLang();
  const mm = lang === 'mm';

  const [records, setRecords] = useState<Appointment[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('');
  const [from, setFrom]       = useState('');
  const [to, setTo]           = useState('');
  const [page, setPage]       = useState(1);
  const pageSize = 15;

  const load = useCallback(async () => {
    setLoading(true);
    const q = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) q.set('search', search);
    if (status) q.set('status', status);
    if (from)   q.set('from', from);
    if (to)     q.set('to', to);
    const res  = await fetch(`/api/admin/appointments?${q}`);
    const data = await res.json();
    setRecords(data.appointments ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, search, status, from, to]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#e6f7f7' }}>
          <FileText className="w-4.5 h-4.5" style={{ color: PRIMARY }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Records</h1>
          <p className="text-sm text-gray-500 mt-0.5">Consultation log across all patients &amp; doctors · {total} records</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-55">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ab5ad]/40 focus:border-[#2ab5ad]"
            placeholder="Search patient or doctor..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="relative">
          <select
            className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ab5ad]/40 focus:border-[#2ab5ad]"
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{t(mm, STATUS_STYLE[s].label)}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50">
          <Calendar size={14} className="text-gray-400 shrink-0" />
          <input type="date" value={from} onChange={e => { setFrom(e.target.value); setPage(1); }}
            className="bg-transparent text-sm text-gray-600 outline-none w-32" />
          <span className="text-gray-300 text-xs">–</span>
          <input type="date" value={to} onChange={e => { setTo(e.target.value); setPage(1); }}
            className="bg-transparent text-sm text-gray-600 outline-none w-32" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-[#2ab5ad]" />
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <FileText size={40} strokeWidth={1.2} />
            <p className="mt-3 text-sm">No records found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Patient</th>
                <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Doctor</th>
                <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Reason</th>
                <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Date</th>
                <th className="text-right px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Fee</th>
                <th className="text-center px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {records.map(r => {
                const s = STATUS_STYLE[r.status];
                return (
                  <tr key={r.id} onClick={() => router.push(`/admin/appointments/${r.id}`)} className="hover:bg-gray-50/60 transition-colors cursor-pointer">
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-gray-800">{r.user.name}</p>
                      <p className="text-xs text-gray-400">{r.user.phone}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-gray-700">{mm ? r.doctor.name : (r.doctor.nameEn ?? r.doctor.name)}</p>
                      <p className="text-xs text-gray-400">{mm ? r.doctor.specialty : (r.doctor.specialtyEn ?? r.doctor.specialty)}</p>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 max-w-55">
                      <p className="truncate">{r.reason || '—'}</p>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                      {fmtDate(r.date)}{r.time ? ` · ${r.time}` : ''}
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-gray-800 whitespace-nowrap">
                      {r.fee ? `${r.fee.toLocaleString()} Ks` : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>
                        <s.icon size={11} /> {t(mm, s.label)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {!loading && total > 0 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={15} />
              </button>
              <span className="text-xs text-gray-500 font-semibold px-2">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
