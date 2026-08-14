'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Check, X, Loader2, Undo2 } from 'lucide-react';

const PRIMARY = '#2ab5ad';
const inp = 'flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-teal-400 transition-colors';

interface Refund {
  id: string;
  targetType: 'APPOINTMENT' | 'ORDER';
  appointmentId: string | null;
  orderId: string | null;
  amount: number;
  reason: string | null;
  createdBy: string | null;
  createdAt: string;
  appointment: { id: string; user: { name: string; phone: string } } | null;
  order: { id: string; user: { name: string; phone: string } } | null;
}

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);
  const [targetType, setTargetType] = useState<'APPOINTMENT' | 'ORDER'>('APPOINTMENT');
  const [targetId, setTargetId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/refunds');
    const data = await res.json();
    setRefunds(data.refunds ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    const amt = Number(amount);
    if (!targetId.trim() || Number.isNaN(amt) || amt <= 0) { setError('Target ID and a positive amount are required.'); return; }
    setSaving(true); setError('');
    const res = await fetch('/api/admin/refunds', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetType,
        appointmentId: targetType === 'APPOINTMENT' ? targetId.trim() : undefined,
        orderId: targetType === 'ORDER' ? targetId.trim() : undefined,
        amount: amt,
        reason: reason || null,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? 'Server error'); return; }
    setCreating(false); setTargetId(''); setAmount(''); setReason(''); load();
  };

  const total = refunds.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Refunds &amp; Adjustments</h1>
          <p className="text-sm text-gray-400 mt-0.5">Refund/adjustment log against appointments and orders, feeds P&amp;L net-profit calculation.</p>
        </div>
        {!creating && (
          <button onClick={() => { setCreating(true); setError(''); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: PRIMARY }}>
            <Plus className="w-4 h-4" /> New Refund
          </button>
        )}
      </div>

      {creating && (
        <div className="bg-white rounded-2xl border-2 p-4 flex flex-col gap-3" style={{ borderColor: PRIMARY }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: PRIMARY }}>New Refund / Adjustment</p>
          <div className="flex gap-2">
            <select value={targetType} onChange={e => setTargetType(e.target.value as 'APPOINTMENT' | 'ORDER')} className={inp}>
              <option value="APPOINTMENT">Appointment</option>
              <option value="ORDER">Order</option>
            </select>
            <input value={targetId} onChange={e => setTargetId(e.target.value)}
              placeholder={targetType === 'APPOINTMENT' ? 'Appointment ID' : 'Order ID'} className={inp} />
          </div>
          <div className="flex gap-2">
            <input type="number" min={0} value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount (MMK)" className={inp} />
            <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason (optional)" className={inp} />
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={saving}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center gap-1.5" style={{ backgroundColor: PRIMARY }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save
            </button>
            <button onClick={() => setCreating(false)} className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50">
              <X className="w-4 h-4" />
            </button>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reason</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">By</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" /></td></tr>
              ) : refunds.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center">
                  <Undo2 className="w-8 h-8 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No refunds recorded.</p>
                </td></tr>
              ) : refunds.map(r => {
                const customer = r.appointment?.user ?? r.order?.user;
                const targetHref = r.targetType === 'APPOINTMENT' ? `/admin/appointments/${r.appointmentId}` : `/admin/orders/${r.orderId}`;
                return (
                  <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5 text-sm">
                      <Link href={targetHref} className="font-semibold hover:underline" style={{ color: PRIMARY }}>
                        {r.targetType === 'APPOINTMENT' ? 'Appointment' : 'Order'}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{customer?.name ?? '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{r.reason ?? '—'}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-400">{r.createdBy ?? '—'}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-700 text-right">{r.amount.toLocaleString()} MMK</td>
                  </tr>
                );
              })}
            </tbody>
            {refunds.length > 0 && (
              <tfoot>
                <tr className="border-t border-gray-100 bg-gray-50/60">
                  <td colSpan={5} className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Total</td>
                  <td className="px-5 py-3 text-sm font-bold text-gray-800 text-right">{total.toLocaleString()} MMK</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
