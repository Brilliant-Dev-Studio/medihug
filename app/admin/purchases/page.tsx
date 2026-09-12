'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, PackagePlus, ChevronLeft, ChevronRight } from 'lucide-react';

const PRIMARY = '#2ab5ad';

interface Supplier { id: string; name: string; }
interface Store { id: string; name: string; code: string; }
interface Purchase {
  id: string; status: 'ORDERED' | 'PARTIAL' | 'RECEIVED' | 'CANCELLED';
  totalAmount: number; purchaseDate: string; createdByName: string;
  supplier: { name: string }; store: { name: string; code: string };
  items: { orderedQty: number; receivedQty: number }[];
}

const STATUS_STYLE: Record<Purchase['status'], string> = {
  ORDERED: 'bg-blue-50 text-blue-600',
  PARTIAL: 'bg-amber-50 text-amber-600',
  RECEIVED: 'bg-green-50 text-green-600',
  CANCELLED: 'bg-gray-100 text-gray-400',
};

export default function PurchasesPage() {
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stores, setStores]       = useState<Store[]>([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [supplierId, setSupplierId] = useState('');
  const [storeId, setStoreId]       = useState('');
  const [status, setStatus]         = useState('');
  const [page, setPage]             = useState(1);
  const pageSize = 15;

  useEffect(() => {
    fetch('/api/admin/suppliers?pageSize=200').then(r => r.json()).then(d => setSuppliers(d.suppliers ?? []));
    fetch('/api/admin/stores').then(r => r.json()).then(d => setStores(d.stores ?? []));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const q = new URLSearchParams({
      page: String(page), pageSize: String(pageSize),
      ...(supplierId ? { supplierId } : {}),
      ...(storeId ? { storeId } : {}),
      ...(status ? { status } : {}),
    });
    const res = await fetch(`/api/admin/purchases?${q}`);
    const data = await res.json();
    setPurchases(data.purchases ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, supplierId, storeId, status]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Purchases</h1>
          <p className="text-sm text-gray-500 mt-0.5">Total {total} purchase orders</p>
        </div>
        <button
          onClick={() => router.push('/admin/purchases/new')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-[0_4px_14px_-4px_rgba(42,181,173,0.5)] hover:-translate-y-px transition-all"
          style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #1a9990 100%)` }}
        >
          <Plus size={16} /> New Purchase
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={supplierId} onChange={e => { setSupplierId(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm min-w-[160px]">
          <option value="">All Suppliers</option>
          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={storeId} onChange={e => { setStoreId(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm min-w-[140px]">
          <option value="">All Stores</option>
          {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm min-w-[140px]">
          <option value="">All Statuses</option>
          <option value="ORDERED">Ordered</option>
          <option value="PARTIAL">Partial</option>
          <option value="RECEIVED">Received</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">PO #</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Supplier</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Store</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" /></td></tr>
              ) : purchases.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center">
                  <PackagePlus className="w-8 h-8 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No purchases found.</p>
                </td></tr>
              ) : purchases.map(p => (
                <tr key={p.id} onClick={() => router.push(`/admin/purchases/${p.id}`)} className="hover:bg-gray-50/60 transition-colors cursor-pointer">
                  <td className="px-5 py-3.5 text-sm font-mono text-gray-500">PO-{p.id.slice(-8).toUpperCase()}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-gray-700">{p.supplier.name}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{p.store.name}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(p.purchaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[p.status]}`}>{p.status}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-gray-700 text-right">{p.totalAmount.toLocaleString()} MMK</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
            <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
