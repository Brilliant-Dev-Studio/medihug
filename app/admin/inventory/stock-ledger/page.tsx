'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, History, ChevronLeft, ChevronRight } from 'lucide-react';

interface Movement {
  id: string; type: string; quantity: number; balanceAfter: number;
  reference: string | null; note: string | null; createdByName: string | null; createdAt: string;
  product: { id: string; name: string; nameEn: string | null };
  store: { id: string; name: string; code: string };
}
interface Store { id: string; name: string; code: string; }

const TYPE_LABEL: Record<string, string> = {
  PURCHASE_RECEIVE: 'Purchase Receive',
  ADJUSTMENT: 'Adjustment',
  SALE: 'Sale',
  RETURN_TO_STOCK: 'Return to Stock',
};

function StockLedgerContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId') ?? '';

  const [movements, setMovements] = useState<Movement[]>([]);
  const [stores, setStores]       = useState<Store[]>([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [storeId, setStoreId]     = useState('');
  const [type, setType]           = useState('');
  const [page, setPage]           = useState(1);
  const pageSize = 30;

  useEffect(() => { fetch('/api/admin/stores').then(r => r.json()).then(d => setStores(d.stores ?? [])); }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const q = new URLSearchParams({
      page: String(page), pageSize: String(pageSize),
      ...(productId ? { productId } : {}),
      ...(storeId ? { storeId } : {}),
      ...(type ? { type } : {}),
    });
    const res = await fetch(`/api/admin/stock-movements?${q}`);
    const d = await res.json();
    setMovements(d.movements ?? []);
    setTotal(d.total ?? 0);
    setLoading(false);
  }, [page, productId, storeId, type]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Stock Ledger</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {productId ? `Movements for this product` : `Every stock movement across all locations`} · {total} entries
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={storeId} onChange={e => { setStoreId(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm min-w-[140px]">
          <option value="">All Stores</option>
          {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={type} onChange={e => { setType(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm min-w-[160px]">
          <option value="">All Types</option>
          {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Store</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Qty</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Balance</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" /></td></tr>
              ) : movements.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center">
                  <History className="w-8 h-8 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No stock movements found.</p>
                </td></tr>
              ) : movements.map(m => (
                <tr key={m.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(m.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-700">{m.product.nameEn ?? m.product.name}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-500">{m.store.name}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-500">{TYPE_LABEL[m.type] ?? m.type}</td>
                  <td className={`px-5 py-3.5 text-sm font-semibold text-right ${m.quantity >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {m.quantity >= 0 ? '+' : ''}{m.quantity}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-700 text-right">{m.balanceAfter}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-400">{m.createdByName ?? '—'}</td>
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

export default function StockLedgerPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-[60vh]"><Loader2 size={28} className="animate-spin text-[#2ab5ad]" /></div>}>
      <StockLedgerContent />
    </Suspense>
  );
}
