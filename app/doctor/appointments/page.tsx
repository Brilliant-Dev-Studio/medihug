'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, ChevronLeft, ChevronRight, Calendar, Clock,
  Hourglass, CheckCircle2, XCircle, ChevronDown,
} from 'lucide-react';

const PRIMARY = '#2ab5ad';

interface Appt {
  id: string; date: string; time: string | null; reason: string | null; fee: number | null;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  user: { name: string; phone: string };
}

// Doctors only ever see/act on admin-approved appointments — Pending (awaiting admin
// review) and Cancelled are admin-only concerns and never shown here.
const STATUS_OPTIONS: Appt['status'][] = ['CONFIRMED', 'COMPLETED'];
const STATUS_STYLE: Record<Appt['status'], { bg: string; color: string; icon: React.ElementType; label: string }> = {
  PENDING:   { bg: '#fffbeb', color: '#d97706', icon: Hourglass,    label: 'Pending' },
  CONFIRMED: { bg: '#eff6ff', color: '#3b82f6', icon: CheckCircle2, label: 'Confirmed' },
  COMPLETED: { bg: '#ecfdf5', color: '#10b981', icon: CheckCircle2, label: 'Completed' },
  CANCELLED: { bg: '#fef2f2', color: '#ef4444', icon: XCircle,      label: 'Cancelled' },
};

function StatusDropdown({ status, onChange }: { status: Appt['status']; onChange: (s: Appt['status']) => void }) {
  const [open, setOpen] = useState(false);
  const s = STATUS_STYLE[status];
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors"
        style={{ backgroundColor: s.bg, color: s.color }}>
        <s.icon size={11} /> {s.label} <ChevronDown size={11} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 right-0 bg-white rounded-xl border border-gray-100 shadow-lg py-1 min-w-32">
            {STATUS_OPTIONS.map(opt => {
              const os = STATUS_STYLE[opt];
              return (
                <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-left hover:bg-gray-50 transition-colors"
                  style={{ color: os.color }}>
                  <os.icon size={12} /> {os.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const [appts, setAppts]     = useState<Appt[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('');
  const [page, setPage]       = useState(1);
  const pageSize = 12;

  const load = useCallback(async () => {
    setLoading(true);
    const q = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) q.set('search', search);
    if (status) q.set('status', status);
    const res  = await fetch(`/api/doctor/appointments?${q}`);
    const data = await res.json();
    setAppts(data.appointments ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, search, status]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const updateStatus = async (id: string, next: Appt['status']) => {
    setAppts(a => a.map(x => x.id === id ? { ...x, status: next } : x));
    await fetch(`/api/doctor/appointments/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Appointments</h1>
        <p className="text-sm text-gray-500 mt-0.5">{total} total appointments</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-55">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ab5ad]/40 focus:border-[#2ab5ad]"
            placeholder="Search patient..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ab5ad]/40 focus:border-[#2ab5ad]"
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_STYLE[s].label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)] overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3.5">
                <div className="flex flex-col gap-1.5 w-32">
                  <div className="bg-gray-100 rounded-md animate-pulse h-3 w-24" />
                  <div className="bg-gray-100 rounded-md animate-pulse h-2.5 w-20" />
                </div>
                <div className="bg-gray-100 rounded-md animate-pulse h-2.5 flex-1" />
                <div className="bg-gray-100 rounded-md animate-pulse h-2.5 w-24 shrink-0" />
                <div className="bg-gray-100 rounded-md animate-pulse h-2.5 w-16 shrink-0" />
                <div className="bg-gray-100 rounded-full animate-pulse h-6 w-20 shrink-0" />
              </div>
            ))}
          </div>
        ) : appts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Calendar size={40} strokeWidth={1.2} />
            <p className="mt-3 text-sm">No appointments found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Patient</th>
                <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Reason</th>
                <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Date</th>
                <th className="text-right px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Fee</th>
                <th className="text-center px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {appts.map(a => (
                <tr key={a.id} onClick={() => router.push(`/doctor/appointments/${a.id}`)} className="hover:bg-gray-50/60 transition-colors cursor-pointer">
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-gray-800">{a.user.name}</p>
                    <p className="text-xs text-gray-400">{a.user.phone}</p>
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 max-w-65">
                    <p className="truncate">{a.reason || '—'}</p>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                    <span className="flex items-center gap-1"><Clock size={11} /> {fmtDate(a.date)}{a.time ? ` · ${a.time}` : ''}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold text-gray-800 whitespace-nowrap">
                    {a.fee ? `${a.fee.toLocaleString()} Ks` : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-center" onClick={e => e.stopPropagation()}>
                    <StatusDropdown status={a.status} onChange={s => updateStatus(a.id, s)} />
                  </td>
                </tr>
              ))}
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
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={15} />
              </button>
              <span className="text-xs text-gray-500 font-semibold px-2">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
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
