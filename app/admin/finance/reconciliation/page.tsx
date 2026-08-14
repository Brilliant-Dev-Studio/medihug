'use client';

import { useState, useEffect, useCallback } from 'react';
import { Scale, Loader2, Save, Check } from 'lucide-react';

const PRIMARY = '#2ab5ad';

interface Row {
  paymentMethod: string; systemAmount: number; bankAmount: number; difference: number; note: string | null; saved: boolean;
}

export default function ReconciliationPage() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/finance/reconciliation?date=${date}`);
    const data = await res.json();
    const list: Row[] = data.rows ?? [];
    setRows(list);
    setEdits(Object.fromEntries(list.map(r => [r.paymentMethod, String(r.bankAmount)])));
    setLoading(false);
  }, [date]);

  useEffect(() => { load(); }, [load]);

  const save = async (method: string) => {
    const bankAmount = Number(edits[method] ?? 0);
    setBusy(method);
    await fetch('/api/admin/finance/reconciliation', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, paymentMethod: method, bankAmount }),
    });
    setBusy(null);
    setSavedFlash(method);
    setTimeout(() => setSavedFlash(null), 1500);
    load();
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#e6f7f7' }}>
            <Scale className="w-4.5 h-4.5" style={{ color: PRIMARY }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Bank / Cash Reconciliation</h1>
            <p className="text-sm text-gray-500 mt-0.5">System sales vs. actual bank-received amount, per payment method per day</p>
          </div>
        </div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-teal-400" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment Method</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">System Sales</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bank Received</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Difference</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" /></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="py-16 text-center">
                  <Scale className="w-8 h-8 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No transactions with a payment method on this date.</p>
                </td></tr>
              ) : rows.map(r => {
                const diff = Number(edits[r.paymentMethod] ?? 0) === r.bankAmount ? r.difference : r.systemAmount - Number(edits[r.paymentMethod] ?? 0);
                return (
                  <tr key={r.paymentMethod} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-700 uppercase">{r.paymentMethod}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600 text-right">{r.systemAmount.toLocaleString()} MMK</td>
                    <td className="px-5 py-3.5 text-right">
                      <input type="number" min={0} value={edits[r.paymentMethod] ?? ''}
                        onChange={e => setEdits(prev => ({ ...prev, [r.paymentMethod]: e.target.value }))}
                        className="w-32 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-700 text-right outline-none focus:border-teal-400" />
                    </td>
                    <td className="px-5 py-3.5 text-sm font-bold text-right" style={{ color: diff === 0 ? '#16a34a' : '#dc2626' }}>
                      {diff.toLocaleString()} MMK
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => save(r.paymentMethod)} disabled={busy === r.paymentMethod}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-50" style={{ backgroundColor: PRIMARY }}>
                        {busy === r.paymentMethod ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : savedFlash === r.paymentMethod ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                        Save
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
