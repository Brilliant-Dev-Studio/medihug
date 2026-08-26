'use client';

import { useState, useEffect, useCallback } from 'react';
import { Wallet, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const PRIMARY = '#3b5bdb';

interface EarningEntry {
  id: string;
  sourceType: 'CONSULTATION' | 'PROGRAM' | 'PRODUCT' | 'HOME_SERVICE' | 'PARTNER_SERVICE';
  patientPaid: number;
  role: 'owner' | 'referrer';
  yourEarning: number;
  settlementStatus: 'PENDING' | 'SETTLED' | 'HELD';
  createdAt: string;
}

const SETTLEMENT_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  PENDING: { label: 'Pending', bg: '#fffbeb', color: '#d97706' },
  SETTLED: { label: 'Settled', bg: '#f0fdf4', color: '#16a34a' },
  HELD:    { label: 'Held',    bg: '#f9fafb', color: '#6b7280' },
};

export default function PartnerEarningsPage() {
  const [entries, setEntries] = useState<EarningEntry[]>([]);
  const [totals, setTotals]   = useState({ totalEarning: 0, settled: 0, pending: 0, held: 0 });
  const [loading, setLoading] = useState(true);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sourceType, setSourceType] = useState('');
  const [settlementStatus, setSettlementStatus] = useState('');

  const load = useCallback(async (p = page) => {
    setLoading(true);
    const q = new URLSearchParams({ page: String(p) });
    if (sourceType) q.set('sourceType', sourceType);
    if (settlementStatus) q.set('settlementStatus', settlementStatus);
    const res = await fetch(`/api/partner/earnings?${q}`);
    const d = await res.json();
    setEntries(d.entries ?? []);
    setTotal(d.total ?? 0);
    setPage(d.page ?? 1);
    setTotalPages(d.totalPages ?? 1);
    setTotals(d.totals ?? { totalEarning: 0, settled: 0, pending: 0, held: 0 });
    setLoading(false);
  }, [page, sourceType, settlementStatus]);

  useEffect(() => { load(1); }, [sourceType, settlementStatus]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(page); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectCls = 'bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400';

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#e8ecfd' }}>
          <Wallet className="w-4.5 h-4.5" style={{ color: PRIMARY }} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Earnings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your share of revenue and referral fees, transaction by transaction</p>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border-2 p-4" style={{ borderColor: `${PRIMARY}30` }}>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: PRIMARY }}>Total Earning</p>
          <p className="text-lg font-bold mt-1" style={{ color: PRIMARY }}>{totals.totalEarning.toLocaleString()} Ks</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Settled</p>
          <p className="text-lg font-bold text-gray-800 mt-1">{totals.settled.toLocaleString()} Ks</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pending</p>
          <p className="text-lg font-bold text-gray-800 mt-1">{totals.pending.toLocaleString()} Ks</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Held</p>
          <p className="text-lg font-bold text-gray-800 mt-1">{totals.held.toLocaleString()} Ks</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select className={selectCls} value={sourceType} onChange={e => setSourceType(e.target.value)}>
          <option value="">All Sources</option>
          <option value="CONSULTATION">Consultation</option>
          <option value="PROGRAM">Program</option>
          <option value="PRODUCT">Product</option>
        </select>
        <select className={selectCls} value={settlementStatus} onChange={e => setSettlementStatus(e.target.value)}>
          <option value="">All Settlement</option>
          <option value="PENDING">Pending</option>
          <option value="SETTLED">Settled</option>
          <option value="HELD">Held</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-150">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Source</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Patient Paid</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your Earning</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" /></td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={5} className="py-16 text-center">
                  <Wallet className="w-8 h-8 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No earnings yet.</p>
                </td></tr>
              ) : entries.map(e => (
                <tr key={e.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3.5">
                    <p className="text-xs font-semibold text-gray-700">{e.sourceType}</p>
                    <p className="text-[10px] text-gray-400">{new Date(e.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-500 capitalize">{e.role}</td>
                  <td className="px-4 py-3.5 text-right text-sm text-gray-600">{e.patientPaid.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-right text-sm font-bold" style={{ color: PRIMARY }}>{e.yourEarning.toLocaleString()}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ backgroundColor: SETTLEMENT_STYLE[e.settlementStatus].bg, color: SETTLEMENT_STYLE[e.settlementStatus].color }}>
                      {SETTLEMENT_STYLE[e.settlementStatus].label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
            <p className="text-xs text-gray-400">{total} entries</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-500 px-2">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
