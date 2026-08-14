'use client';

import { useState, useEffect, useCallback } from 'react';
import { Target, Loader2, Save, Check } from 'lucide-react';

const PRIMARY = '#2ab5ad';
const TYPE_LABEL: Record<string, string> = { FIXED: 'Fixed', VARIABLE: 'Variable', ONE_TIME: 'One-time' };

interface Row {
  categoryId: string; name: string; type: string; budget: number; actual: number; variance: number; variancePercent: number;
}

export default function BudgetPage() {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/finance/budgets?month=${month}`);
    const data = await res.json();
    const list: Row[] = data.rows ?? [];
    setRows(list);
    setEdits(Object.fromEntries(list.map(r => [r.categoryId, String(r.budget)])));
    setLoading(false);
  }, [month]);

  useEffect(() => { load(); }, [load]);

  const save = async (categoryId: string) => {
    const amount = Number(edits[categoryId] ?? 0);
    setBusy(categoryId);
    await fetch('/api/admin/finance/budgets', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId, month, amount }),
    });
    setBusy(null);
    setSavedFlash(categoryId);
    setTimeout(() => setSavedFlash(null), 1500);
    load();
  };

  const totalBudget = rows.reduce((s, r) => s + r.budget, 0);
  const totalActual = rows.reduce((s, r) => s + r.actual, 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#e6f7f7' }}>
            <Target className="w-4.5 h-4.5" style={{ color: PRIMARY }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Budget vs Actual</h1>
            <p className="text-sm text-gray-500 mt-0.5">Monthly budget per expense category vs. real spend</p>
          </div>
        </div>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-teal-400" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Budget</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actual</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Variance</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" /></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="py-16 text-center">
                  <Target className="w-8 h-8 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No expense categories yet.</p>
                </td></tr>
              ) : rows.map(r => {
                const editedBudget = Number(edits[r.categoryId] ?? 0);
                const variance = editedBudget - r.actual;
                return (
                  <tr key={r.categoryId} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-gray-700">{r.name}</p>
                      <p className="text-[10px] text-gray-400">{TYPE_LABEL[r.type] ?? r.type}</p>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <input type="number" min={0} value={edits[r.categoryId] ?? ''}
                        onChange={e => setEdits(prev => ({ ...prev, [r.categoryId]: e.target.value }))}
                        className="w-32 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-700 text-right outline-none focus:border-teal-400" />
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600 text-right">{r.actual.toLocaleString()} MMK</td>
                    <td className="px-5 py-3.5 text-sm font-bold text-right" style={{ color: variance >= 0 ? '#16a34a' : '#dc2626' }}>
                      {variance >= 0 ? '' : '−'}{Math.abs(variance).toLocaleString()} MMK
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => save(r.categoryId)} disabled={busy === r.categoryId}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-50" style={{ backgroundColor: PRIMARY }}>
                        {busy === r.categoryId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : savedFlash === r.categoryId ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                        Save
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {rows.length > 0 && (
              <tfoot>
                <tr className="border-t border-gray-100 bg-gray-50/60">
                  <td className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Total</td>
                  <td className="px-5 py-3 text-sm font-bold text-gray-800 text-right">{totalBudget.toLocaleString()} MMK</td>
                  <td className="px-5 py-3 text-sm font-bold text-gray-800 text-right">{totalActual.toLocaleString()} MMK</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
