'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, PackageCheck, Ban } from 'lucide-react';

const PRIMARY = '#2ab5ad';

interface PurchaseItem {
  id: string; productId: string; orderedQty: number; receivedQty: number; unitCost: number; lineTotal: number;
  product: { id: string; name: string; nameEn: string | null };
}
interface Purchase {
  id: string; status: 'ORDERED' | 'PARTIAL' | 'RECEIVED' | 'CANCELLED';
  purchaseDate: string; expectedDate: string | null;
  subtotal: number; discountAmount: number; taxAmount: number; shippingCost: number; totalAmount: number;
  note: string | null; createdByName: string; lastReceivedByName: string | null; lastReceivedAt: string | null;
  supplier: { name: string; phone: string | null };
  store: { id: string; name: string; code: string };
  items: PurchaseItem[];
}

const STATUS_STYLE: Record<Purchase['status'], string> = {
  ORDERED: 'bg-blue-50 text-blue-600',
  PARTIAL: 'bg-amber-50 text-amber-600',
  RECEIVED: 'bg-green-50 text-green-600',
  CANCELLED: 'bg-gray-100 text-gray-400',
};

export default function PurchaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading]   = useState(true);
  const [receiveQtys, setReceiveQtys] = useState<Record<string, number>>({});
  const [receiving, setReceiving]     = useState(false);
  const [cancelling, setCancelling]   = useState(false);
  const [error, setError]             = useState('');

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/purchases/${id}`);
    const d = await res.json();
    setPurchase(d.purchase ?? null);
    const defaults: Record<string, number> = {};
    (d.purchase?.items ?? []).forEach((i: PurchaseItem) => { defaults[i.id] = i.orderedQty - i.receivedQty; });
    setReceiveQtys(defaults);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReceive = async () => {
    if (!purchase) return;
    setError('');
    const lines = purchase.items
      .filter(i => (receiveQtys[i.id] ?? 0) > 0)
      .map(i => ({ purchaseItemId: i.id, receiveQty: receiveQtys[i.id] }));
    if (lines.length === 0) { setError('Enter a quantity to receive on at least one line.'); return; }

    setReceiving(true);
    const res = await fetch(`/api/admin/purchases/${id}/receive`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lines }),
    });
    const data = await res.json();
    setReceiving(false);
    if (!res.ok) { setError(data.error ?? 'Server error'); return; }
    load();
  };

  const handleCancel = async () => {
    if (!confirm('Cancel this purchase order?')) return;
    setCancelling(true);
    const res = await fetch(`/api/admin/purchases/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CANCELLED' }),
    });
    setCancelling(false);
    if (!res.ok) { const d = await res.json(); alert(d.error ?? 'Failed to cancel.'); return; }
    load();
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><Loader2 size={28} className="animate-spin text-[#2ab5ad]" /></div>;
  if (!purchase) return <div className="flex items-center justify-center h-[60vh] text-gray-400">Purchase not found</div>;

  const canReceive = purchase.status === 'ORDERED' || purchase.status === 'PARTIAL';
  const canCancel = purchase.status !== 'RECEIVED' && purchase.status !== 'CANCELLED';

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/admin/purchases')} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><ArrowLeft size={18} /></button>
          <div>
            <h1 className="text-xl font-bold text-gray-800 font-mono">PO-{purchase.id.slice(-8).toUpperCase()}</h1>
            <p className="text-xs text-gray-400">{purchase.supplier.name} · {purchase.store.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[purchase.status]}`}>{purchase.status}</span>
          {canCancel && (
            <button onClick={handleCancel} disabled={cancelling}
              className="px-3 py-2 rounded-xl border border-red-200 text-red-500 text-xs font-semibold flex items-center gap-1.5 hover:bg-red-50 disabled:opacity-50">
              {cancelling ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />} Cancel PO
            </button>
          )}
        </div>
      </div>

      {error && <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-700 text-sm">Line Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <th className="py-2 pr-2">Product</th>
                <th className="py-2 pr-2 text-right">Ordered</th>
                <th className="py-2 pr-2 text-right">Received</th>
                <th className="py-2 pr-2 text-right">Unit Cost</th>
                <th className="py-2 pr-2 text-right">Line Total</th>
                {canReceive && <th className="py-2 pl-2 text-right">Receive Now</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {purchase.items.map(i => {
                const remaining = i.orderedQty - i.receivedQty;
                return (
                  <tr key={i.id}>
                    <td className="py-2.5 pr-2 text-sm text-gray-700">{i.product.nameEn ?? i.product.name}</td>
                    <td className="py-2.5 pr-2 text-sm text-gray-500 text-right">{i.orderedQty}</td>
                    <td className="py-2.5 pr-2 text-sm text-gray-500 text-right">{i.receivedQty}</td>
                    <td className="py-2.5 pr-2 text-sm text-gray-500 text-right">{i.unitCost.toLocaleString()}</td>
                    <td className="py-2.5 pr-2 text-sm font-semibold text-gray-700 text-right">{i.lineTotal.toLocaleString()}</td>
                    {canReceive && (
                      <td className="py-2.5 pl-2 text-right">
                        <input
                          type="number" min={0} max={remaining}
                          disabled={remaining === 0}
                          value={receiveQtys[i.id] ?? 0}
                          onChange={e => setReceiveQtys(q => ({ ...q, [i.id]: Number(e.target.value) }))}
                          className="w-20 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#2ab5ad]/40 disabled:opacity-40"
                        />
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-8 pt-3 border-t border-gray-100 text-sm">
          <span className="text-gray-400">Subtotal: <span className="font-semibold text-gray-700">{purchase.subtotal.toLocaleString()} Ks</span></span>
          {purchase.discountAmount > 0 && <span className="text-gray-400">Discount: <span className="font-semibold text-gray-700">-{purchase.discountAmount.toLocaleString()} Ks</span></span>}
          {purchase.taxAmount > 0 && <span className="text-gray-400">Tax: <span className="font-semibold text-gray-700">{purchase.taxAmount.toLocaleString()} Ks</span></span>}
          {purchase.shippingCost > 0 && <span className="text-gray-400">Shipping: <span className="font-semibold text-gray-700">{purchase.shippingCost.toLocaleString()} Ks</span></span>}
          <span className="text-gray-400">Total: <span className="font-bold text-gray-800">{purchase.totalAmount.toLocaleString()} Ks</span></span>
        </div>

        {canReceive && (
          <div className="flex justify-end pt-2">
            <button onClick={handleReceive} disabled={receiving}
              className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60 hover:opacity-90"
              style={{ backgroundColor: PRIMARY }}>
              {receiving ? <Loader2 size={16} className="animate-spin" /> : <PackageCheck size={16} />}
              {receiving ? 'Receiving...' : 'Receive Stock'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-sm text-gray-500 space-y-1.5">
        <p>Created by <span className="font-semibold text-gray-700">{purchase.createdByName}</span> on {new Date(purchase.purchaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
        {purchase.expectedDate && <p>Expected: {new Date(purchase.expectedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>}
        {purchase.lastReceivedByName && purchase.lastReceivedAt && (
          <p>Last received by <span className="font-semibold text-gray-700">{purchase.lastReceivedByName}</span> on {new Date(purchase.lastReceivedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
        )}
        {purchase.note && <p className="text-gray-400 italic">&ldquo;{purchase.note}&rdquo;</p>}
      </div>
    </div>
  );
}
