'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Check, X, Loader2, Percent, Trash2, Ban, Search } from 'lucide-react';

const PRIMARY = '#2ab5ad';
const inp = 'flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-teal-400 transition-colors';

interface Rule {
  id: string;
  serviceType: 'CONSULTATION' | 'PRODUCT';
  doctorId: string | null;
  clinicId: string | null;
  paymentMethod: string | null;
  percent: number;
  fixedFee: number;
  active: boolean;
  effectiveFrom: string;
  effectiveTo: string | null;
  note: string | null;
  doctor: { id: string; name: string } | null;
  clinic: { id: string; name: string } | null;
}

interface Hit { id: string; name: string }

export default function CommissionRulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [serviceType, setServiceType] = useState<'CONSULTATION' | 'PRODUCT'>('CONSULTATION');
  const [doctorQuery, setDoctorQuery] = useState('');
  const [doctorHits, setDoctorHits] = useState<Hit[]>([]);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [doctorName, setDoctorName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [percent, setPercent] = useState('0');
  const [fixedFee, setFixedFee] = useState('0');
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/finance/rules');
    const data = await res.json();
    setRules(data.rules ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!doctorQuery.trim() || serviceType !== 'CONSULTATION') { setDoctorHits([]); return; }
    const timer = setTimeout(() => {
      fetch(`/api/doctors?search=${encodeURIComponent(doctorQuery)}`)
        .then(r => r.json())
        .then(d => setDoctorHits((d.doctors ?? []).slice(0, 6)));
    }, 300);
    return () => clearTimeout(timer);
  }, [doctorQuery, serviceType]);

  const resetForm = () => {
    setServiceType('CONSULTATION'); setDoctorQuery(''); setDoctorHits([]); setDoctorId(null); setDoctorName('');
    setPaymentMethod(''); setPercent('0'); setFixedFee('0'); setNote(''); setError('');
  };

  const handleCreate = async () => {
    const p = Number(percent);
    if (Number.isNaN(p) || p < 0 || p > 100) { setError('% must be 0-100.'); return; }
    setSaving(true); setError('');
    const res = await fetch('/api/admin/finance/rules', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceType,
        doctorId: serviceType === 'CONSULTATION' ? doctorId : null,
        paymentMethod: paymentMethod || null,
        percent: p,
        fixedFee: Number(fixedFee) || 0,
        note: note || null,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? 'Server error'); return; }
    setCreating(false); resetForm(); load();
  };

  const toggleActive = async (rule: Rule) => {
    setBusyId(rule.id);
    await fetch(`/api/admin/finance/rules/${rule.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !rule.active }),
    });
    setBusyId(null); load();
  };

  const handleDelete = async (rule: Rule) => {
    setBusyId(rule.id);
    await fetch(`/api/admin/finance/rules/${rule.id}`, { method: 'DELETE' });
    setBusyId(null); load();
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Commission Rules</h1>
          <p className="text-sm text-gray-400 mt-0.5">Service × doctor × payment-method commission overrides. No matching rule falls back to the doctor&apos;s % / global default.</p>
        </div>
        {!creating && (
          <button onClick={() => { setCreating(true); resetForm(); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: PRIMARY }}>
            <Plus className="w-4 h-4" /> New Rule
          </button>
        )}
      </div>

      {creating && (
        <div className="bg-white rounded-2xl border-2 p-4 flex flex-col gap-3" style={{ borderColor: PRIMARY }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: PRIMARY }}>New Commission Rule</p>

          <div className="flex gap-2">
            <select value={serviceType} onChange={e => { setServiceType(e.target.value as 'CONSULTATION' | 'PRODUCT'); setDoctorId(null); setDoctorName(''); }} className={inp}>
              <option value="CONSULTATION">Consultation</option>
              <option value="PRODUCT">Product</option>
            </select>
            <input value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
              placeholder="Payment method key (blank = any)" className={inp} />
          </div>

          {serviceType === 'CONSULTATION' && (
            doctorId ? (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border" style={{ borderColor: `${PRIMARY}30`, backgroundColor: `${PRIMARY}08` }}>
                <span className="text-sm text-gray-700 flex-1">{doctorName}</span>
                <button onClick={() => { setDoctorId(null); setDoctorName(''); }} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="relative">
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50">
                  <Search className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                  <input value={doctorQuery} onChange={e => setDoctorQuery(e.target.value)}
                    placeholder="Search doctor (blank = applies to all doctors)"
                    className="flex-1 min-w-0 bg-transparent text-sm text-gray-700 outline-none" />
                </div>
                {doctorHits.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-20 bg-white rounded-xl border border-gray-100 shadow-lg overflow-y-auto max-h-56 py-1">
                    {doctorHits.map(h => (
                      <button key={h.id} onMouseDown={() => { setDoctorId(h.id); setDoctorName(h.name); setDoctorQuery(''); setDoctorHits([]); }}
                        className="w-full text-left px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50">{h.name}</button>
                    ))}
                  </div>
                )}
              </div>
            )
          )}

          <div className="flex gap-2">
            <div className="flex items-center flex-1 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
              <input type="number" min={0} max={100} value={percent} onChange={e => setPercent(e.target.value)}
                className="min-w-0 flex-1 bg-transparent px-3.5 py-2.5 text-sm text-gray-700 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
              <span className="pr-3.5 text-sm text-gray-400 shrink-0">%</span>
            </div>
            <input type="number" min={0} value={fixedFee} onChange={e => setFixedFee(e.target.value)}
              placeholder="Fixed fee (MMK)" className={inp} />
          </div>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Note (optional)" className={inp} />

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
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Service</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Scope</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">%</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fixed Fee</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" /></td></tr>
              ) : rules.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center">
                  <Percent className="w-8 h-8 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No rules yet — bookings fall back to the doctor/global default %.</p>
                </td></tr>
              ) : rules.map(r => (
                <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5 text-sm text-gray-700">{r.serviceType === 'CONSULTATION' ? 'Consultation' : 'Product'}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{r.doctor?.name ?? r.clinic?.name ?? 'All'}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{r.paymentMethod ?? 'Any'}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-gray-700">{r.percent}%</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{r.fixedFee.toLocaleString()} MMK</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${r.active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-400'}`}>
                      {r.active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 justify-end">
                      <button onClick={() => toggleActive(r)} disabled={busyId === r.id} title={r.active ? 'Disable' : 'Enable'}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30">
                        {busyId === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => handleDelete(r)} disabled={busyId === r.id}
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
