'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronLeft, ChevronRight, ClipboardCheck, Loader2, Hourglass, CheckCircle2, XCircle } from 'lucide-react';

const PRIMARY = '#2ab5ad';

interface Enrollment {
  id: string;
  amount: number;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  user: { name: string; phone: string };
  program: { titleMm: string; titleEn: string | null; imageUrl: string };
}

const STATUS_STYLE = {
  PENDING_REVIEW: { bg: '#fffbeb', color: '#d97706', icon: Hourglass, label: 'Pending Review' },
  APPROVED:       { bg: '#ecfdf5', color: '#10b981', icon: CheckCircle2, label: 'Approved' },
  REJECTED:       { bg: '#fef2f2', color: '#ef4444', icon: XCircle, label: 'Rejected' },
} as const;

export default function ProgramEnrollmentsPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('');
  const [page, setPage]       = useState(1);
  const pageSize = 15;

  const load = useCallback(async () => {
    setLoading(true);
    const q = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) q.set('search', search);
    if (status) q.set('status', status);
    const res  = await fetch(`/api/admin/program-enrollments?${q}`);
    const data = await res.json();
    setEnrollments(data.enrollments ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, search, status]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#e6f7f7' }}>
          <ClipboardCheck className="w-4.5 h-4.5" style={{ color: PRIMARY }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Program Enrollments</h1>
          <p className="text-sm text-gray-500 mt-0.5">Review medical records submitted with program purchases · {total} enrollments</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-55">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ab5ad]/40 focus:border-[#2ab5ad]"
            placeholder="Search patient or program..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ab5ad]/40 focus:border-[#2ab5ad]"
          value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="PENDING_REVIEW">Pending Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-[#2ab5ad]" /></div>
        ) : enrollments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <ClipboardCheck size={40} strokeWidth={1.2} />
            <p className="mt-3 text-sm">No enrollments found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Patient</th>
                <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Program</th>
                <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider whitespace-nowrap">Date</th>
                <th className="text-right px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Amount</th>
                <th className="text-center px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {enrollments.map(e => {
                const s = STATUS_STYLE[e.status];
                return (
                  <tr key={e.id} onClick={() => router.push(`/admin/program-enrollments/${e.id}`)} className="hover:bg-gray-50/60 transition-colors cursor-pointer">
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="font-semibold text-gray-800">{e.user.name}</p>
                      <p className="text-xs text-gray-400">{e.user.phone}</p>
                    </td>
                    <td className="px-4 py-3.5 text-gray-700">{e.program.titleEn ?? e.program.titleMm}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap">{fmtDate(e.createdAt)}</td>
                    <td className="px-4 py-3.5 text-right font-semibold text-gray-800 whitespace-nowrap">{e.amount.toLocaleString()} Ks</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ backgroundColor: s.bg, color: s.color }}>
                        <s.icon size={11} className="shrink-0" /> {s.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {!loading && total > 0 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
            <p className="text-xs text-gray-400">Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}</p>
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
