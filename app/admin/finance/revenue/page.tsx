'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Check, X, Loader2, Megaphone, Search } from 'lucide-react';

const PRIMARY = '#2ab5ad';
const inp = 'flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-teal-400 transition-colors';

interface Entry {
  id: string; serviceType: 'PROGRAM' | 'ADS'; amount: number; description: string | null;
  clinicId: string | null; platformAmount: number | null; partnerAmount: number | null;
  date: string; createdBy: string | null;
  clinic: { id: string; name: string } | null;
}
interface ClinicHit { id: string; name: string }

export default function RevenuePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'' | 'PROGRAM' | 'ADS'>('');

  const [creating, setCreating] = useState(false);
  const [serviceType, setServiceType] = useState<'PROGRAM' | 'ADS'>('PROGRAM');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [clinicQuery, setClinicQuery] = useState('');
  const [clinicHits, setClinicHits] = useState<ClinicHit[]>([]);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [clinicName, setClinicName] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (type?: string) => {
    setLoading(true);
    const qs = type ? `?serviceType=${type}` : '';
    const res = await fetch(`/api/admin/finance/revenue${qs}`);
    const data = await res.json();
    setEntries(data.entries ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(filterType || undefined); }, [load, filterType]);

  useEffect(() => {
    if (!clinicQuery.trim()) { setClinicHits([]); return; }
    const timer = setTimeout(() => {
      fetch(`/api/clinics?search=${encodeURIComponent(clinicQuery)}`)
        .then(r => r.json())
        .then(d => setClinicHits((d.clinics ?? []).slice(0, 6)));
    }, 300);
    return () => clearTimeout(timer);
  }, [clinicQuery]);

  const resetForm = () => {
    setServiceType('PROGRAM'); setAmount(''); setDescription('');
    setClinicQuery(''); setClinicHits([]); setClinicId(null); setClinicName('');
    setDate(new Date().toISOString().slice(0, 10)); setError('');
  };

  const handleCreate = async () => {
    const amt = Number(amount);
    if (Number.isNaN(amt) || amt <= 0) { setError('Enter a positive amount.'); return; }
    setSaving(true); setError('');
    const res = await fetch('/api/admin/finance/revenue', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceType, amount: amt, description: description || null, clinicId, date }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? 'Server error'); return; }
    setCreating(false); resetForm(); load(filterType || undefined);
  };

  const total = entries.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Program / Ads Revenue</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manual income log for healthcare programs and advertisement revenue — no checkout flow exists for these, so entries are admin-recorded.</p>
        </div>
        {!creating && (
          <button onClick={() => { setCreating(true); resetForm(); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shrink-0" style={{ backgroundColor: PRIMARY }}>
            <Plus className="w-4 h-4" /> New Entry
          </button>
        )}
      </div>

      {creating && (
        <div className="bg-white rounded-2xl border-2 p-4 flex flex-col gap-3" style={{ borderColor: PRIMARY }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: PRIMARY }}>New Revenue Entry</p>
          <div className="flex gap-2">
            <select value={serviceType} onChange={e => setServiceType(e.target.value as 'PROGRAM' | 'ADS')} className={inp}>
              <option value="PROGRAM">Healthcare Program</option>
              <option value="ADS">Advertisement</option>
            </select>
            <input type="number" min={0} value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount (MMK)" className={inp} />
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inp} />
          </div>

          {clinicId ? (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border" style={{ borderColor: `${PRIMARY}30`, backgroundColor: `${PRIMARY}08` }}>
              <span className="text-sm text-gray-700 flex-1">{clinicName}</span>
              <button onClick={() => { setClinicId(null); setClinicName(''); }} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50">
                <Search className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                <input value={clinicQuery} onChange={e => setClinicQuery(e.target.value)}
                  placeholder="Search partner clinic (blank = 100% platform revenue)"
                  className="flex-1 min-w-0 bg-transparent text-sm text-gray-700 outline-none" />
              </div>
              {clinicHits.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-20 bg-white rounded-xl border border-gray-100 shadow-lg overflow-y-auto max-h-56 py-1">
                  {clinicHits.map(h => (
                    <button key={h.id} onMouseDown={() => { setClinicId(h.id); setClinicName(h.name); setClinicQuery(''); setClinicHits([]); }}
                      className="w-full text-left px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50">{h.name}</button>
                  ))}
                </div>
              )}
            </div>
          )}

          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" className={inp} />

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

      <div className="flex gap-1.5">
        {(['', 'PROGRAM', 'ADS'] as const).map(t => (
          <button key={t} onClick={() => setFilterType(t)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ backgroundColor: filterType === t ? PRIMARY : '#f3f4f6', color: filterType === t ? '#fff' : '#6b7280' }}>
            {t === '' ? 'All' : t === 'PROGRAM' ? 'Program' : 'Ads'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Clinic</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Platform Share</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" /></td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center">
                  <Megaphone className="w-8 h-8 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No program/ads revenue recorded.</p>
                </td></tr>
              ) : entries.map(e => (
                <tr key={e.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(e.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-gray-700">{e.serviceType === 'PROGRAM' ? 'Program' : 'Ads'}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{e.clinic?.name ?? '—'}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{e.description ?? '—'}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 text-right">{e.platformAmount != null ? `${e.platformAmount.toLocaleString()} MMK` : '100%'}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-gray-700 text-right">{e.amount.toLocaleString()} MMK</td>
                </tr>
              ))}
            </tbody>
            {entries.length > 0 && (
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
