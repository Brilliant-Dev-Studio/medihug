'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search, Filter, ChevronLeft, ChevronRight, X, ChevronDown,
  Loader2, Package, Eye, ShoppingBag,
} from 'lucide-react';

const PRIMARY = '#2ab5ad';

interface OrderItem {
  id: string; quantity: number; price: number;
  product: { name: string; nameEn: string | null; imageUrl: string | null };
}
interface Order {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number; paymentMethod: string | null;
  createdAt: string;
  user: { name: string; phone: string };
  items: OrderItem[];
}

const STATUS_STYLE: Record<Order['status'], { bg: string; color: string }> = {
  PENDING:   { bg: '#fffbeb', color: '#d97706' },
  CONFIRMED: { bg: '#eff6ff', color: '#3b82f6' },
  COMPLETED: { bg: '#ecfdf5', color: '#10b981' },
  CANCELLED: { bg: '#fef2f2', color: '#ef4444' },
};
const STATUS_OPTIONS: Order['status'][] = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

export default function AdminOrdersPage() {
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [status,  setStatus]  = useState('');
  const [page,    setPage]    = useState(1);
  const [showFilter, setShowFilter] = useState(false);
  const PAGE_SIZE = 10;

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasFilter = !!status;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({ search, status, page: String(page), pageSize: String(PAGE_SIZE) });
    const res  = await fetch(`/api/admin/orders?${p}`);
    const data = await res.json();
    setOrders(data.orders ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [search, status, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  async function updateStatus(id: string, next: Order['status']) {
    setOrders(o => o.map(x => x.id === id ? { ...x, status: next } : x));
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Top row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Total', value: total, color: PRIMARY, bg: '#e6f7f7' },
            { label: 'Pending', value: orders.filter(o => o.status === 'PENDING').length, color: '#d97706', bg: '#fffbeb' },
            { label: 'Confirmed', value: orders.filter(o => o.status === 'CONFIRMED').length, color: '#3b82f6', bg: '#eff6ff' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-2xl px-4 py-2.5">
              <span className="text-lg font-bold" style={{ color: s.color }}>{s.value}</span>
              <span className="text-xs text-gray-400 font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2.5 bg-gray-50 rounded-xl px-3.5 py-2.5">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by patient name or phone..."
            className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400" />
          {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-gray-300 hover:text-gray-500" /></button>}
        </div>
        <button onClick={() => setShowFilter(f => !f)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all"
          style={{ backgroundColor: showFilter ? PRIMARY : 'transparent', borderColor: showFilter ? PRIMARY : '#e5e7eb', color: showFilter ? '#fff' : '#6b7280' }}>
          <Filter className="w-4 h-4" /> Filters
          {hasFilter && <span className="w-4 h-4 rounded-full bg-white text-[10px] font-bold flex items-center justify-center" style={{ color: PRIMARY }}>1</span>}
        </button>
      </div>

      {showFilter && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</label>
            <div className="flex gap-1.5 flex-wrap">
              {(['', ...STATUS_OPTIONS] as string[]).map(v => (
                <button key={v} onClick={() => { setStatus(v); setPage(1); }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
                  style={{ backgroundColor: status===v ? `${PRIMARY}15`:'transparent', borderColor: status===v ? PRIMARY:'#e5e7eb', color: status===v ? PRIMARY:'#9ca3af' }}>
                  {v || 'All'}
                </button>
              ))}
            </div>
          </div>
          {hasFilter && (
            <button onClick={() => { setStatus(''); setPage(1); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 border border-red-100 hover:bg-red-50 transition-colors">
              <X className="w-3 h-3" /> Reset
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-xs text-gray-400">
            Showing <span className="font-bold text-gray-600">{orders.length}</span> of <span className="font-bold text-gray-600">{total}</span> orders
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['#','Patient','Items','Total','Payment','Status','Action'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" /></td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center">
                  <ShoppingBag className="w-8 h-8 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No orders found.</p>
                </td></tr>
              ) : orders.map((o, i) => (
                <tr key={o.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-3 py-2.5 text-xs text-gray-400">{(page-1)*PAGE_SIZE + i + 1}</td>
                  <td className="px-3 py-2.5">
                    <p className="text-sm font-semibold text-gray-700">{o.user.name}</p>
                    <p className="text-[10px] text-gray-400">{o.user.phone}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      {o.items[0]?.product.imageUrl ? (
                        <img src={o.items[0].product.imageUrl} alt="" className="w-7 h-7 rounded-lg object-cover shrink-0 border border-gray-100" />
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                          <Package className="w-3.5 h-3.5 text-gray-300" />
                        </div>
                      )}
                      <span className="text-xs text-gray-500 truncate max-w-40">
                        {o.items[0]?.product.name}{o.items.length > 1 ? ` +${o.items.length - 1}` : ''}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-sm font-bold text-gray-700 whitespace-nowrap">{o.totalAmount.toLocaleString()} Ks</td>
                  <td className="px-3 py-2.5 text-xs text-gray-500 uppercase">{o.paymentMethod ?? '—'}</td>
                  <td className="px-3 py-2.5">
                    <div className="relative inline-block">
                      <select
                        value={o.status}
                        onChange={e => updateStatus(o.id, e.target.value as Order['status'])}
                        className="appearance-none text-xs font-semibold pl-2.5 pr-6 py-1.5 rounded-full outline-none cursor-pointer"
                        style={{ backgroundColor: STATUS_STYLE[o.status].bg, color: STATUS_STYLE[o.status].color }}>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: STATUS_STYLE[o.status].color }} />
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <Link href={`/admin/orders/${o.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1.5 rounded-xl border transition-all hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50"
                      style={{ borderColor: '#e5e7eb', color: '#6b7280' }}>
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-all">
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i+1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  className="w-8 h-8 rounded-xl text-xs font-bold transition-all"
                  style={{ backgroundColor: page===n ? PRIMARY:'transparent', color: page===n ? '#fff':'#9ca3af' }}>
                  {n}
                </button>
              ))}
            </div>
            <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-all">
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
