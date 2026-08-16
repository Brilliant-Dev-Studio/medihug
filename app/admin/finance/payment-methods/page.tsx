'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Check, X, Loader2, CreditCard, Trash2, Ban, Save } from 'lucide-react';
import { useAdminRole, requestDeletion } from '@/lib/useAdminRole';
import { PAYMENT_METHOD_KEYS } from '@/lib/paymentMethods';

const PRIMARY = '#2ab5ad';
const inp = 'flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-teal-400 transition-colors';

interface Method {
  id: string; key: string; label: string; feePercent: number; feeFixed: number; active: boolean;
}

export default function PaymentMethodsPage() {
  const { role } = useAdminRole();
  const [methods, setMethods] = useState<Method[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, { feePercent: string; feeFixed: string }>>({});

  const [creating, setCreating] = useState(false);
  const [key, setKey] = useState('');
  const [label, setLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const configuredKeys = new Set(methods.map(m => m.key));
  const availableKeys = PAYMENT_METHOD_KEYS.filter(m => !configuredKeys.has(m.id));

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

  const handleCreate = async () => {
    if (!key.trim() || !label.trim()) { setError('key and label required.'); return; }
    setSaving(true); setError('');
    const res = await fetch('/api/admin/finance/payment-methods', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: key.trim(), label: label.trim() }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? 'Server error'); return; }
    setCreating(false); setKey(''); setLabel(''); load();
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
    await fetch(`/api/admin/finance/payment-methods/${m.id}`, { method: 'DELETE' });
    setBusyId(null); load();
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Payment Methods</h1>
          <p className="text-sm text-gray-400 mt-0.5">Gateway fee % / fixed fee per payment method, used for P&amp;L cost calculation.</p>
        </div>
        {!creating && availableKeys.length > 0 && (
          <button onClick={() => { setCreating(true); setError(''); setKey(availableKeys[0].id); setLabel(availableKeys[0].label); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: PRIMARY }}>
            <Plus className="w-4 h-4" /> New Method
          </button>
        )}
        {!creating && availableKeys.length === 0 && (
          <span className="text-xs text-gray-400">Payment method အားလုံး ဖွင့်ထားပြီးပါပြီ</span>
        )}
      </div>

      {creating && (
        <div className="bg-white rounded-2xl border-2 p-4 flex flex-col gap-3" style={{ borderColor: PRIMARY }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: PRIMARY }}>New Payment Method</p>
          <p className="text-xs text-gray-400 -mt-1">Patient booking form ထဲက payment method တွေနဲ့ တူညီအောင် dropdown ကနေသာ ရွေးပါ — key/label ကို လွတ်လပ်စွာ ရိုက်လို့ မရပါ။</p>
          <div className="flex gap-2">
            <select value={key} onChange={e => {
              const opt = PAYMENT_METHOD_KEYS.find(m => m.id === e.target.value);
              setKey(e.target.value);
              if (opt) setLabel(opt.label);
            }} className={inp}>
              {availableKeys.map(m => <option key={m.id} value={m.id}>{m.label} ({m.id})</option>)}
            </select>
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
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Key</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Label</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fee %</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fixed Fee</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" /></td></tr>
              ) : methods.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center">
                  <CreditCard className="w-8 h-8 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No payment methods configured.</p>
                </td></tr>
              ) : methods.map(m => (
                <tr key={m.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5 text-sm text-gray-500">{m.key}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-gray-700">{m.label}</td>
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
                      <button onClick={() => handleDelete(m)} disabled={busyId === m.id}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-400 disabled:opacity-30">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
