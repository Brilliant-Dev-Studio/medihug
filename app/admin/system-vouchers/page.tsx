'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Check, Ticket, Copy, Pencil, X } from 'lucide-react';
import { SYSTEM_VOUCHERS } from '@/lib/systemVouchers';
import ConfirmModal from '@/components/admin/ConfirmModal';

const PRIMARY = '#2ab5ad';

interface Voucher {
  id: string; code: string; discountType: 'PERCENT' | 'FIXED'; discountValue: number;
  active: boolean; expiresAt: string | null;
}

function toDateInputValue(iso: string | null) {
  return iso ? iso.slice(0, 10) : '';
}

function VoucherCard({ voucher, onSaved }: { voucher: Voucher; onSaved: (v: Voucher) => void }) {
  const def = SYSTEM_VOUCHERS.find(d => d.code === voucher.code)!;
  const [expiresAt, setExpiresAt] = useState(toDateInputValue(voucher.expiresAt));
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmingDeactivate, setConfirmingDeactivate] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingValue, setEditingValue] = useState(false);
  const [discountValue, setDiscountValue] = useState(String(voucher.discountValue));
  const [savingValue, setSavingValue] = useState(false);
  const [valueError, setValueError] = useState('');

  const isExpired = voucher.expiresAt ? new Date(voucher.expiresAt) < new Date() : false;

  const setActive = async (active: boolean) => {
    setBusy(true);
    const res = await fetch(`/api/admin/vouchers/${voucher.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    });
    const data = await res.json();
    setBusy(false);
    setConfirmingDeactivate(false);
    if (res.ok) onSaved(data.voucher);
  };

  const toggleActive = () => {
    if (voucher.active) setConfirmingDeactivate(true);
    else setActive(true);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(voucher.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const startEditValue = () => { setDiscountValue(String(voucher.discountValue)); setValueError(''); setEditingValue(true); };
  const cancelEditValue = () => { setEditingValue(false); setValueError(''); };

  const saveDiscountValue = async () => {
    const n = Number(discountValue);
    if (Number.isNaN(n) || n <= 0) { setValueError('Must be a positive number.'); return; }
    setSavingValue(true);
    const res = await fetch(`/api/admin/vouchers/${voucher.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discountValue: n }),
    });
    const data = await res.json();
    setSavingValue(false);
    if (!res.ok) { setValueError(data.error ?? 'Server error'); return; }
    onSaved(data.voucher);
    setEditingValue(false);
  };

  const saveExpiry = async () => {
    setSaving(true);
    const res = await fetch(`/api/admin/vouchers/${voucher.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expiresAt: expiresAt || null }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) onSaved(data.voucher);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${PRIMARY}12` }}>
            <Ticket className="w-5 h-5" style={{ color: PRIMARY }} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">{def.mmLabel}</p>
            <p className="text-[11px] text-gray-400">{def.enLabel}</p>
          </div>
        </div>
        {editingValue ? (
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="flex items-center gap-1.5">
              <input type="number" min={0} value={discountValue} onChange={e => setDiscountValue(e.target.value)} autoFocus
                className="w-16 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-700 outline-none focus:border-teal-400" />
              <span className="text-sm font-bold text-gray-400">%</span>
              <button onClick={saveDiscountValue} disabled={savingValue} title="Save"
                className="w-6 h-6 rounded-md flex items-center justify-center text-white disabled:opacity-50" style={{ backgroundColor: PRIMARY }}>
                {savingValue ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              </button>
              <button onClick={cancelEditValue} disabled={savingValue}
                className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-50">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {valueError && <p className="text-[10px] text-red-500">{valueError}</p>}
          </div>
        ) : (
          <button onClick={startEditValue} className="flex items-center gap-1.5 shrink-0 group">
            <span className="text-sm font-bold" style={{ color: PRIMARY }}>{voucher.discountValue}% Off</span>
            <Pencil className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gray-50">
        <span className="text-xs text-gray-400 uppercase tracking-widest">Code</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-700 font-mono">{voucher.code}</span>
          <button onClick={copyCode} title="Copy code"
            className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${copied ? 'text-green-500' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}>
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${voucher.active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-400'}`}>
            {voucher.active ? 'Active' : 'Disabled'}
          </span>
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${isExpired ? 'bg-red-50 text-red-400' : 'bg-gray-50 text-gray-400'}`}>
            {isExpired ? 'Expired' : 'Valid'}
          </span>
        </div>
        <button onClick={toggleActive} disabled={busy}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (voucher.active ? 'Deactivate' : 'Activate')}
        </button>
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
        <label className="text-xs text-gray-400 shrink-0 mt-2">Valid until</label>
        <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-teal-400 mt-2" />
        <button onClick={saveExpiry} disabled={saving}
          className="mt-2 shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-50" style={{ backgroundColor: PRIMARY }}>
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
        </button>
      </div>

      <ConfirmModal
        open={confirmingDeactivate}
        title={`Deactivate ${voucher.code}?`}
        message={`${def.mmLabel} (${def.enLabel}) ကုဒ်ကို ပိတ်လိုက်ပါက ဤကုဒ်နှင့် ဝယ်ယူသူများ ထပ်မံ လျှော့စျေး ရရှိတော့မည် မဟုတ်ပါ။`}
        confirmLabel="Deactivate"
        variant="danger"
        loading={busy}
        onConfirm={() => setActive(false)}
        onCancel={() => setConfirmingDeactivate(false)}
      />
    </div>
  );
}

export default function SystemVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/system-vouchers');
    const data = await res.json();
    setVouchers(data.vouchers ?? []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const updateOne = (v: Voucher) => setVouchers(prev => prev.map(x => x.id === v.id ? v : x));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Discount Codes</h1>
        <p className="text-sm text-gray-400 mt-0.5">Platform-wide fixed discount codes for online Doctor appointments. Coupons can't be used on Products or Programs, and can't be combined with Points.</p>
      </div>

      {loading ? (
        <div className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vouchers.map(v => <VoucherCard key={v.id} voucher={v} onSaved={updateOne} />)}
        </div>
      )}
    </div>
  );
}
