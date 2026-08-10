'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, ChevronLeft, ChevronRight, X,
  Package, ShoppingBag, Receipt,
} from 'lucide-react';

const PRIMARY = '#3b5bdb';

interface OrderItem {
  id: string; quantity: number; price: number;
  product: { name: string; nameEn: string | null; imageUrl: string | null };
}
interface Order {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  paymentMethod: string | null;
  createdAt: string;
  user: { name: string; phone: string };
  items: OrderItem[];
  subtotal: number;
}

const STATUS_STYLE: Record<Order['status'], { bg: string; color: string }> = {
  PENDING:   { bg: '#fffbeb', color: '#d97706' },
  CONFIRMED: { bg: '#eff6ff', color: '#3b82f6' },
  COMPLETED: { bg: '#ecfdf5', color: '#10b981' },
  CANCELLED: { bg: '#fef2f2', color: '#ef4444' },
};
const STATUS_OPTIONS: Order['status'][] = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

function Skel({ className }: { className: string }) {
  return <div className={`bg-gray-100 rounded-md animate-pulse ${className}`} />;
}

export default function PartnerOrdersPage() {
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
    const res  = await fetch(`/api/partner/orders?${p}`);
    const data = await res.json();
    setOrders(data.orders ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [search, status, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-5">
      <div>
        <h1 className="text-lg font-bold text-gray-800">Orders</h1>
        <p className="text-xs text-gray-400 mt-0.5">Orders containing your clinic&apos;s products</p>
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
          <table className="w-full min-w-[680px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['#','Patient','Your Items','Subtotal','Payment','Status'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2.5"><Skel className="h-3 w-4" /></td>
                    <td className="px-3 py-2.5"><Skel className="h-3.5 w-24 mb-1.5" /><Skel className="h-2.5 w-16" /></td>
                    <td className="px-3 py-2.5"><div className="flex items-center gap-1.5"><Skel className="w-7 h-7 rounded-lg shrink-0" /><Skel className="h-3 w-28" /></div></td>
                    <td className="px-3 py-2.5"><Skel className="h-3.5 w-16" /></td>
                    <td className="px-3 py-2.5"><Skel className="h-3 w-12" /></td>
                    <td className="px-3 py-2.5"><Skel className="h-5 w-20 rounded-full" /></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center">
                  <ShoppingBag className="w-8 h-8 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No orders yet.</p>
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
                  <td className="px-3 py-2.5 text-sm font-bold text-gray-700 whitespace-nowrap">{o.subtotal.toLocaleString()} Ks</td>
                  <td className="px-3 py-2.5 text-xs text-gray-500 uppercase">{o.paymentMethod ?? '—'}</td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: STATUS_STYLE[o.status].bg, color: STATUS_STYLE[o.status].color }}>
                      <Receipt className="w-3 h-3" />{o.status}
                    </span>
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
