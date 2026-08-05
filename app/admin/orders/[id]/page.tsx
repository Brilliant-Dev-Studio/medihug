'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, Phone, User, Loader2, ChevronDown, Image as ImageIcon } from 'lucide-react';

const PRIMARY = '#2ab5ad';

interface OrderItem {
  id: string; quantity: number; price: number;
  product: { id: string; name: string; nameEn: string | null; imageUrl: string | null; packSize: string | null };
}
interface Order {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number; paymentMethod: string | null; receiptUrl: string | null; note: string | null;
  createdAt: string;
  user: { id: string; name: string; phone: string };
  items: OrderItem[];
}

const STATUS_STYLE: Record<Order['status'], { bg: string; color: string }> = {
  PENDING:   { bg: '#fffbeb', color: '#d97706' },
  CONFIRMED: { bg: '#eff6ff', color: '#3b82f6' },
  COMPLETED: { bg: '#ecfdf5', color: '#10b981' },
  CANCELLED: { bg: '#fef2f2', color: '#ef4444' },
};
const STATUS_OPTIONS: Order['status'][] = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order,   setOrder]   = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/orders/${id}`);
    const data = await res.json();
    setOrder(data.order ?? null);
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  async function updateStatus(next: Order['status']) {
    if (!order) return;
    setUpdating(true);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    const data = await res.json();
    if (res.ok) setOrder(data.order);
    setUpdating(false);
  }

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>;
  }
  if (!order) {
    return <div className="p-6 text-sm text-gray-500">Order not found.</div>;
  }

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </button>
        <div className="relative">
          <select
            value={order.status}
            onChange={e => updateStatus(e.target.value as Order['status'])}
            disabled={updating}
            className="appearance-none text-sm font-bold pl-4 pr-9 py-2.5 rounded-xl outline-none cursor-pointer disabled:opacity-60"
            style={{ backgroundColor: STATUS_STYLE[order.status].bg, color: STATUS_STYLE[order.status].color }}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: STATUS_STYLE[order.status].color }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: patient + items */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Patient</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#e6f7f7' }}>
                <User className="w-4.5 h-4.5" style={{ color: PRIMARY }} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-700">{order.user.name}</p>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Phone className="w-3 h-3" /> {order.user.phone}
                </div>
              </div>
            </div>
            {order.note && (
              <div className="mt-4 pt-4 border-t border-gray-50">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Note</p>
                <p className="text-sm text-gray-600">{order.note}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Items ({order.items.length})</p>
            </div>
            <div className="divide-y divide-gray-50">
              {order.items.map(item => {
                const name = item.product.nameEn ?? item.product.name;
                return (
                  <div key={item.id} className="flex items-center gap-3 px-5 py-3.5">
                    {item.product.imageUrl ? (
                      <img src={item.product.imageUrl} alt={name} className="w-11 h-11 rounded-xl object-cover border border-gray-100 shrink-0" />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                        <Package className="w-4.5 h-4.5 text-gray-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
                      {item.product.packSize && <p className="text-[11px] text-gray-400">{item.product.packSize}</p>}
                      <p className="text-xs text-gray-400 mt-0.5">x{item.quantity} · {item.price.toLocaleString()} Ks each</p>
                    </div>
                    <p className="text-sm font-bold text-gray-700 shrink-0">{(item.price * item.quantity).toLocaleString()} Ks</p>
                  </div>
                );
              })}
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm font-bold text-gray-700">Total</p>
              <p className="text-lg font-bold" style={{ color: PRIMARY }}>{order.totalAmount.toLocaleString()} Ks</p>
            </div>
          </div>
        </div>

        {/* Right: payment */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Payment</p>
            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50 mb-3">
              <p className="text-xs font-semibold text-gray-500">Method</p>
              <p className="text-xs font-bold text-gray-700 uppercase">{order.paymentMethod ?? '—'}</p>
            </div>
            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50 mb-3">
              <p className="text-xs font-semibold text-gray-500">Placed</p>
              <p className="text-xs font-bold text-gray-700">{new Date(order.createdAt).toLocaleString()}</p>
            </div>

            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 mt-4">Receipt</p>
            {order.receiptUrl ? (
              <a href={order.receiptUrl} target="_blank" rel="noopener noreferrer" className="block relative rounded-xl overflow-hidden border border-gray-100" style={{ height: 200 }}>
                <img src={order.receiptUrl} alt="receipt" className="w-full h-full object-contain bg-gray-50" />
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-gray-300 border border-dashed border-gray-200 rounded-xl">
                <ImageIcon className="w-6 h-6 mb-1.5" />
                <p className="text-xs">No receipt uploaded</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
