'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X, Loader2, Coins, ChevronLeft, ChevronRight } from 'lucide-react';

const PRIMARY = '#2ab5ad';

interface PatientBalance {
  id: string; name: string; phone: string; isActive: boolean; balance: number;
}

export default function PointsReportPage() {
  const [patients, setPatients] = useState<PatientBalance[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({ search, page: String(page), pageSize: String(pageSize) });
    const res = await fetch(`/api/admin/points-report?${p}`);
    const data = await res.json();
    setPatients(data.patients ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / pageSize);
  const totalPoints = patients.reduce((s, p) => s + p.balance, 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2.5">
        <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#fef3c7' }}>
          <Coins className="w-4.5 h-4.5" style={{ color: '#d97706' }} />
        </span>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Points Report</h1>
          <p className="text-sm text-gray-400 mt-0.5">Patient တစ်ဦးချင်းစီ ရရှိထားသော Points</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-2xl px-4 py-2.5">
          <span className="text-lg font-bold" style={{ color: PRIMARY }}>{total}</span>
          <span className="text-xs text-gray-400 font-medium">Patients</span>
        </div>
        <div className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-2xl px-4 py-2.5">
          <span className="text-lg font-bold text-amber-600">{totalPoints.toLocaleString()}</span>
          <span className="text-xs text-gray-400 font-medium">Points (this page)</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-2.5">
        <div className="flex-1 flex items-center gap-2.5 bg-gray-50 rounded-xl px-3.5 py-2.5">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or phone..."
            className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-gray-300 hover:text-gray-500">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest w-8">#</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Patient</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" /></td></tr>
              ) : patients.length === 0 ? (
                <tr><td colSpan={5} className="py-16 text-center">
                  <Coins className="w-8 h-8 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No patients found.</p>
                </td></tr>
              ) : patients.map((p, i) => (
                <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5 text-xs text-gray-400">{(page - 1) * pageSize + i + 1}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-gray-700">{p.name}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{p.phone}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full ${p.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-400'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-sm font-bold text-amber-600">{p.balance.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <span className="text-xs text-gray-500">Page {page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
