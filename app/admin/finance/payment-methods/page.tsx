'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Check, X, Loader2, CreditCard, Trash2, Ban, Save, Landmark, Wallet, ArrowUp, ArrowDown } from 'lucide-react';
import { useAdminRole, requestDeletion } from '@/lib/useAdminRole';

const PRIMARY = '#2ab5ad';
const inp = 'flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-teal-400 transition-colors';

const PROTECTED_KEYS = ['mmqr', 'cb'];

interface Method {
  id: string; key: string; label: string; kind: 'WALLET' | 'BANK_TRANSFER';
  accountNumber: string | null; accountName: string | null;
  feePercent: number; feeFixed: number; order: number; active: boolean;
}

const EMPTY_NEW = { label: '', kind: 'WALLET' as 'WALLET' | 'BANK_TRANSFER', accountNumber: '', accountName: '', feePercent: '0', feeFixed: '0' };

export default function PaymentMethodsPage() {
  const { role } = useAdminRole();
  const [methods, setMethods] = useState<Method[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, { feePercent: string; feeFixed: string }>>({});

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_NEW);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/finance/payment-methods');
    const data = await res.json();
    const list: Method[] = data.methods ?? [];
    setMethods(list);
    setEdits(Object.fromEntries(list.map(m => [m.id, { feePercent: String(m.feePercent), feeFixed: String(m.feeFixed) }])));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (k: keyof typeof EMPTY_NEW, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    if (!form.label.trim()) { setError('Label is required.'); return; }
    if (form.kind === 'BANK_TRANSFER' && (!form.accountNumber.trim() || !form.accountName.trim())) {
      setError('Account number and account name are required for a bank transfer method.'); return;
    }
    setSaving(true); setError('');
    const res = await fetch('/api/admin/finance/payment-methods', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        label: form.label.trim(), kind: form.kind,
        accountNumber: form.accountNumber.trim(), accountName: form.accountName.trim(),
        feePercent: Number(form.feePercent) || 0, feeFixed: Number(form.feeFixed) || 0,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? 'Server error'); return; }
    setCreating(false); setForm(EMPTY_NEW); load();
  };

  const saveFees = async (m: Method) => {
    const e = edits[m.id];
    if (!e) return;
    setBusyId(m.id);
    await fetch(`/api/admin/finance/payment-methods/${m.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feePercent: Number(e.feePercent) || 0, feeFixed: Number(e.feeFixed) || 0 }),
    });
    setBusyId(null); load();
  };

  const toggleActive = async (m: Method) => {
    setBusyId(m.id);
    await fetch(`/api/admin/finance/payment-methods/${m.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !m.active }),
    });
    setBusyId(null); load();
  };

  const handleDelete = async (m: Method) => {
    setBusyId(m.id);
    if (role === 'POS_ADMIN') {
      const ok = await requestDeletion('PaymentMethodConfig', m.id, `${m.label} (${m.key})`);
      setBusyId(null);
      alert(ok ? 'Deletion request submitted — waiting for Super Admin approval.' : 'Failed to submit deletion request.');
      return;
    }
    const res = await fetch(`/api/admin/finance/payment-methods/${m.id}`, { method: 'DELETE' });
    if (!res.ok) { const d = await res.json().catch(() => null); alert(d?.error ?? 'Failed to delete.'); }
    setBusyId(null); load();
  };

  const move = async (m: Method, dir: -1 | 1) => {
    const idx = methods.findIndex(x => x.id === m.id);
    const swapWith = methods[idx + dir];
    if (!swapWith) return;
    setBusyId(m.id);
    await Promise.all([
      fetch(`/api/admin/finance/payment-methods/${m.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: swapWith.order }) }),
      fetch(`/api/admin/finance/payment-methods/${swapWith.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: m.order }) }),
    ]);
    setBusyId(null); load();
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Payment Methods</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Wallets and bank accounts patients can pay with — shown as a dropdown at checkout. Fee % / fixed fee here drives P&amp;L and Revenue Ledger gateway-fee cost.
          </p>
        </div>
        {!creating && (
          <button onClick={() => { setCreating(true); setForm(EMPTY_NEW); setError(''); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shrink-0" style={{ backgroundColor: PRIMARY }}>
            <Plus className="w-4 h-4" /> New Method
          </button>
        )}
      </div>

      {creating && (
        <div className="bg-white rounded-2xl border-2 p-4 flex flex-col gap-3" style={{ borderColor: PRIMARY }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: PRIMARY }}>New Payment Method</p>

          <div className="flex gap-2">
            <button type="button" onClick={() => set('kind', 'WALLET')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors"
              style={{ borderColor: form.kind === 'WALLET' ? PRIMARY : '#e5e7eb', color: form.kind === 'WALLET' ? PRIMARY : '#6b7280', backgroundColor: form.kind === 'WALLET' ? `${PRIMARY}0d` : '#fff' }}>
              <Wallet className="w-4 h-4" /> Wallet (KPay, AYA Pay...)
            </button>
            <button type="button" onClick={() => set('kind', 'BANK_TRANSFER')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors"
              style={{ borderColor: form.kind === 'BANK_TRANSFER' ? PRIMARY : '#e5e7eb', color: form.kind === 'BANK_TRANSFER' ? PRIMARY : '#6b7280', backgroundColor: form.kind === 'BANK_TRANSFER' ? `${PRIMARY}0d` : '#fff' }}>
              <Landmark className="w-4 h-4" /> Bank Transfer
            </button>
          </div>

          <input value={form.label} onChange={e => set('label', e.target.value)} placeholder="Label — e.g. UAB Pay" className={inp} />

          {form.kind === 'BANK_TRANSFER' && (
            <div className="flex gap-2">
              <input value={form.accountNumber} onChange={e => set('accountNumber', e.target.value)} placeholder="Account number *" className={inp} />
              <input value={form.accountName} onChange={e => set('accountName', e.target.value)} placeholder="Account name *" className={inp} />
            </div>
          )}

          <div className="flex gap-2">
            <input type="number" min={0} value={form.feePercent} onChange={e => set('feePercent', e.target.value)} placeholder="Fee %" className={inp} />
            <input type="number" min={0} value={form.feeFixed} onChange={e => set('feeFixed', e.target.value)} placeholder="Fixed fee (Ks)" className={inp} />
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
                <th className="px-3 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest w-14">Order</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Method</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fee %</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fixed Fee</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" /></td></tr>
              ) : methods.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center">
                  <CreditCard className="w-8 h-8 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No payment methods configured.</p>
                </td></tr>
              ) : methods.map((m, i) => {
                const protectedKey = PROTECTED_KEYS.includes(m.key);
                return (
                  <tr key={m.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-0.5">
                        <button onClick={() => move(m, -1)} disabled={i === 0 || busyId !== null}
                          className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-20">
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button onClick={() => move(m, 1)} disabled={i === methods.length - 1 || busyId !== null}
                          className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-20">
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${PRIMARY}14` }}>
                          {m.kind === 'BANK_TRANSFER' ? <Landmark className="w-3.5 h-3.5" style={{ color: PRIMARY }} /> : <Wallet className="w-3.5 h-3.5" style={{ color: PRIMARY }} />}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">{m.label}</p>
                          <p className="text-[11px] text-gray-400">{m.key}{protectedKey && ' · reserved'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      {m.kind === 'BANK_TRANSFER' ? <>{m.accountNumber}<br /><span className="text-gray-400">{m.accountName}</span></> : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <input type="number" min={0} value={edits[m.id]?.feePercent ?? '0'}
                        onChange={e => setEdits(prev => ({ ...prev, [m.id]: { ...prev[m.id], feePercent: e.target.value } }))}
                        className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-700 outline-none focus:border-teal-400" />
                    </td>
                    <td className="px-5 py-3.5">
                      <input type="number" min={0} value={edits[m.id]?.feeFixed ?? '0'}
                        onChange={e => setEdits(prev => ({ ...prev, [m.id]: { ...prev[m.id], feeFixed: e.target.value } }))}
                        className="w-24 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-700 outline-none focus:border-teal-400" />
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${m.active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-400'}`}>
                        {m.active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 justify-end">
                        <button onClick={() => saveFees(m)} disabled={busyId === m.id} title="Save fees"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-teal-500 disabled:opacity-30">
                          {busyId === m.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => toggleActive(m)} disabled={busyId === m.id} title={m.active ? 'Disable' : 'Enable'}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30">
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(m)} disabled={busyId === m.id || protectedKey}
                          title={protectedKey ? 'Reserved — disable instead of delete' : 'Delete'}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-400 disabled:opacity-30">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
