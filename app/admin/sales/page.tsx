'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, ChevronLeft, ChevronRight, Loader2, Search, X } from 'lucide-react';

const PRIMARY = '#2ab5ad';

interface SaleRow {
  id: string;
  sourceType: 'CONSULTATION' | 'PROGRAM' | 'PRODUCT';
  createdAt: string;
  patient: { name: string; phone: string | null } | null;
  service: string;
  amount: number;
  discount: number;
  paymentMethod: string | null;
  partnerOrDoctor: string;
  medihugShareAmount: number;
  partnerShareAmount: number;
  pointsEarned: number;
  pointsRedeemed: number;
}

interface PaymentMethodOption { key: string; label: string }

const SOURCE_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  PRODUCT:      { label: 'Product',      bg: '#e6f7f7', color: PRIMARY },
  CONSULTATION: { label: 'Consultation', bg: '#eff6ff', color: '#3b82f6' },
  PROGRAM:      { label: 'Program',      bg: '#fdf4ff', color: '#a855f7' },
};

function Badge({ style }: { style: { label: string; bg: string; color: string } }) {
  return (
    <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ backgroundColor: style.bg, color: style.color }}>
      {style.label}
    </span>
  );
}

export default function SalesPage() {
  const router = useRouter();
  const [sales, setSales]       = useState<SaleRow[]>([]);
  const [totals, setTotals]     = useState({ amount: 0, medihugShareAmount: 0, partnerShareAmount: 0 });
  const [loading, setLoading]   = useState(true);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch]         = useState('');
  const [sourceType, setSourceType] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [from, setFrom]             = useState('');
  const [to, setTo]                 = useState('');
  const [methods, setMethods]       = useState<PaymentMethodOption[]>([]);

  useEffect(() => {
    fetch('/api/admin/finance/payment-methods').then(r => r.json()).then(d => setMethods(d.methods ?? []));
  }, []);

  const load = useCallback(async (p = page) => {
    setLoading(true);
    const q = new URLSearchParams({ page: String(p) });
    if (search) q.set('search', search);
    if (sourceType) q.set('sourceType', sourceType);
    if (paymentMethod) q.set('paymentMethod', paymentMethod);
    if (from) q.set('from', from);
    if (to) q.set('to', to);
    const res = await fetch(`/api/admin/sales?${q}`);
    const d = await res.json();
    setSales(d.sales ?? []);
    setTotal(d.total ?? 0);
    setPage(d.page ?? 1);
    setTotalPages(d.totalPages ?? 1);
    setTotals(d.totals ?? { amount: 0, medihugShareAmount: 0, partnerShareAmount: 0 });
    setLoading(false);
  }, [page, search, sourceType, paymentMethod, from, to]);

  useEffect(() => { load(1); }, [search, sourceType, paymentMethod, from, to]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(page); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectCls = 'bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ab5ad]/40 focus:border-[#2ab5ad]';

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Sales</h1>
        <p className="text-sm text-gray-400 mt-0.5">Every completed transaction — product, consultation, program — in one place</p>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Amount</p>
          <p className="text-lg font-bold text-gray-800 mt-1">{totals.amount.toLocaleString()} Ks</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Medihug Share</p>
          <p className="text-lg font-bold text-gray-800 mt-1">{totals.medihugShareAmount.toLocaleString()} Ks</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Partner Share</p>
          <p className="text-lg font-bold text-gray-800 mt-1">{totals.partnerShareAmount.toLocaleString()} Ks</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3.5 py-2 flex-1 min-w-50">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by patient name or phone..."
            className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400" />
          {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-gray-300 hover:text-gray-500" /></button>}
        </div>
        <select className={selectCls} value={sourceType} onChange={e => setSourceType(e.target.value)}>
          <option value="">All Sources</option>
          <option value="PRODUCT">Product</option>
          <option value="CONSULTATION">Consultation</option>
          <option value="PROGRAM">Program</option>
        </select>
        <select className={selectCls} value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
          <option value="">All Payment Methods</option>
          {methods.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
        </select>
        <input type="date" value={from} onChange={e => setFrom(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-700 outline-none focus:border-teal-400" />
        <input type="date" value={to} onChange={e => setTo(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-700 outline-none focus:border-teal-400" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-287.5">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date / Source</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Patient</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Service / Product</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Partner / Doctor</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Discount</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Medihug Share</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Partner Share</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={10} className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" /></td></tr>
              ) : sales.length === 0 ? (
                <tr><td colSpan={10} className="py-16 text-center">
                  <ShoppingCart className="w-8 h-8 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No sales yet.</p>
                </td></tr>
              ) : sales.map(s => (
                <tr key={s.id} onClick={() => router.push(`/admin/finance/revenue-ledger/${s.id}`)} className="hover:bg-gray-50/60 transition-colors cursor-pointer">
                  <td className="px-4 py-3.5">
                    <Badge style={SOURCE_STYLE[s.sourceType]} />
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-600">
                    {s.patient?.name ?? '—'}
                    {s.patient?.phone && <p className="text-[10px] text-gray-400">{s.patient.phone}</p>}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-600 max-w-50 truncate">{s.service}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-500">{s.partnerOrDoctor}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-500">{s.paymentMethod ?? '—'}</td>
                  <td className="px-4 py-3.5 text-right text-sm font-semibold text-gray-700">{s.amount.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-right text-xs text-gray-500">{s.discount > 0 ? s.discount.toLocaleString() : '—'}</td>
                  <td className="px-4 py-3.5 text-right text-xs text-gray-500">{s.medihugShareAmount.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-right text-xs text-gray-500">{s.partnerShareAmount > 0 ? s.partnerShareAmount.toLocaleString() : '—'}</td>
                  <td className="px-4 py-3.5 text-[10px]">
                    {s.pointsEarned > 0 && <p className="text-emerald-600 font-semibold">+{s.pointsEarned} earned</p>}
                    {s.pointsRedeemed > 0 && <p className="text-amber-600 font-semibold">-{s.pointsRedeemed} redeemed</p>}
                    {s.pointsEarned === 0 && s.pointsRedeemed === 0 && <span className="text-gray-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
            <p className="text-xs text-gray-400">{total} sales</p>
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
