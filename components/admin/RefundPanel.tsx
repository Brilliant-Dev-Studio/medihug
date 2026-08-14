'use client';

import { useState, useEffect, useCallback } from 'react';
import { Undo2, Plus, Check, X, Loader2 } from 'lucide-react';

const PRIMARY = '#2ab5ad';
const inp = 'flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-teal-400 transition-colors';

interface Refund {
  id: string; amount: number; reason: string | null; createdBy: string | null; createdAt: string;
}

/** Shared refund history + "Issue Refund" form, used on both appointment and order admin detail pages. */
export default function RefundPanel({ targetType, targetId }: { targetType: 'APPOINTMENT' | 'ORDER'; targetId: string }) {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const idParam = targetType === 'APPOINTMENT' ? `appointmentId=${targetId}` : `orderId=${targetId}`;

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/refunds?${idParam}`);
    const data = await res.json();
    setRefunds(data.refunds ?? []);
    setLoading(false);
  }, [idParam]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    const amt = Number(amount);
    if (Number.isNaN(amt) || amt <= 0) { setError('Enter a positive amount.'); return; }
    setSaving(true); setError('');
    const res = await fetch('/api/admin/refunds', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetType,
        appointmentId: targetType === 'APPOINTMENT' ? targetId : undefined,
        orderId: targetType === 'ORDER' ? targetId : undefined,
        amount: amt, reason: reason || null,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? 'Server error'); return; }
    setCreating(false); setAmount(''); setReason(''); load();
  };

  const total = refunds.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
          <Undo2 className="w-3.5 h-3.5" /> Refunds {total > 0 && `(${total.toLocaleString()} MMK total)`}
        </p>
        {!creating && (
          <button onClick={() => { setCreating(true); setError(''); }} className="text-xs font-bold flex items-center gap-1" style={{ color: PRIMARY }}>
            <Plus className="w-3.5 h-3.5" /> Issue Refund
          </button>
        )}
      </div>

      {creating && (
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-gray-50">
          <div className="flex gap-2">
            <input type="number" min={0} value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount (MMK)" className={inp} />
          </div>
          <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason (optional)" className={inp} />
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={saving}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-50 flex items-center gap-1.5" style={{ backgroundColor: PRIMARY }}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
            </button>
            <button onClick={() => setCreating(false)} className="px-3 py-2 rounded-xl border border-gray-200 text-gray-400 hover:bg-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )}

      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin mx-auto text-gray-300" />
      ) : refunds.length === 0 ? (
        <p className="text-xs text-gray-400">No refunds issued.</p>
      ) : (
        <div className="flex flex-col divide-y divide-gray-50">
          {refunds.map(r => (
            <div key={r.id} className="py-2 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-gray-600">{r.reason ?? 'No reason given'}</p>
                <p className="text-[10px] text-gray-400">{new Date(r.createdAt).toLocaleDateString()} · {r.createdBy ?? '—'}</p>
              </div>
              <p className="text-xs font-bold shrink-0" style={{ color: PRIMARY }}>{r.amount.toLocaleString()} MMK</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
