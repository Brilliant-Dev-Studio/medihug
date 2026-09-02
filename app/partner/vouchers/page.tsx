'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Check, X, Loader2, Ticket, Trash2, Ban, Search } from 'lucide-react';

const PRIMARY = '#3b5bdb';
const inp = 'flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400 transition-colors';

type ServiceType = 'CONSULTATION' | 'PROGRAM' | 'PRODUCT';
type DiscountType = 'PERCENT' | 'FIXED';

interface Voucher {
  id: string; code: string; label: string | null;
  serviceType: ServiceType; discountType: DiscountType; discountValue: number;
  maxDiscountKs: number | null; minPurchaseKs: number;
  maxUses: number | null; usedCount: number; active: boolean;
  doctor: { id: string; name: string } | null;
  product: { id: string; name: string } | null;
  program: { id: string; titleMm: string } | null;
}
interface Hit { id: string; name: string; }

const SERVICE_LABEL: Record<ServiceType, string> = { CONSULTATION: 'Consultation', PROGRAM: 'Program', PRODUCT: 'Product' };

function ScopePicker({ placeholder, all, selectedName, onSelect, onClear }: {
  placeholder: string; all: Hit[];
  selectedName: string | null; onSelect: (h: Hit) => void; onClear: () => void;
}) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!focused) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setFocused(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [focused]);

  const hits = query.trim() ? all.filter(h => h.name.toLowerCase().includes(query.toLowerCase())).slice(0, 15) : all.slice(0, 15);

  if (selectedName) {
    return (
      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border" style={{ borderColor: `${PRIMARY}30`, backgroundColor: `${PRIMARY}08` }}>
        <span className="text-sm text-gray-700 flex-1">{selectedName}</span>
        <button onClick={onClear} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
      </div>
    );
  }
  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50">
        <Search className="w-3.5 h-3.5 text-gray-300 shrink-0" />
        <input value={query} onChange={e => setQuery(e.target.value)} onFocus={() => setFocused(true)}
          placeholder={placeholder} className="flex-1 min-w-0 bg-transparent text-sm text-gray-700 outline-none" />
      </div>
      {focused && hits.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-20 bg-white rounded-xl border border-gray-100 shadow-lg overflow-y-auto max-h-56 py-1">
          {hits.map(h => (
            <button key={h.id} onMouseDown={() => { onSelect(h); setFocused(false); }}
              className="w-full flex items-center text-left px-3.5 py-2 hover:bg-gray-50 text-sm text-gray-700 truncate">
              {h.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PartnerVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('CONSULTATION');
  const [discountType, setDiscountType] = useState<DiscountType>('PERCENT');
  const [discountValue, setDiscountValue] = useState('10');
  const [maxDiscountKs, setMaxDiscountKs] = useState('');
  const [minPurchaseKs, setMinPurchaseKs] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const [myDoctors, setMyDoctors] = useState<Hit[]>([]);
  const [myProducts, setMyProducts] = useState<Hit[]>([]);
  const [myPrograms, setMyPrograms] = useState<Hit[]>([]);
  const [doctorId, setDoctorId] = useState<string | null>(null); const [doctorName, setDoctorName] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null); const [productName, setProductName] = useState<string | null>(null);
  const [programId, setProgramId] = useState<string | null>(null); const [programName, setProgramName] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/partner/vouchers');
    const data = await res.json();
    setVouchers(data.vouchers ?? []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetch('/api/partner/doctors').then(r => r.json()).then(d => setMyDoctors((d.doctors ?? []).map((x: { id: string; name: string }) => ({ id: x.id, name: x.name })))).catch(() => {});
    fetch('/api/partner/products').then(r => r.json()).then(d => setMyProducts((d.products ?? []).map((x: { id: string; name: string }) => ({ id: x.id, name: x.name })))).catch(() => {});
    fetch('/api/partner/programs').then(r => r.json()).then(d => setMyPrograms((d.programs ?? []).map((x: { id: string; titleMm: string }) => ({ id: x.id, name: x.titleMm })))).catch(() => {});
  }, []);

  const resetForm = () => {
    setCode(''); setLabel(''); setServiceType('CONSULTATION'); setDiscountType('PERCENT'); setDiscountValue('10');
    setMaxDiscountKs(''); setMinPurchaseKs(''); setMaxUses(''); setExpiresAt('');
    setDoctorId(null); setDoctorName(null);
    setProductId(null); setProductName(null);
    setProgramId(null); setProgramName(null);
    setError('');
  };

  const handleCreate = async () => {
    const v = Number(discountValue);
    if (!code.trim()) { setError('Code is required.'); return; }
    if (Number.isNaN(v) || v <= 0) { setError('Discount value must be a positive number.'); return; }
    if (serviceType === 'CONSULTATION' && !doctorId) { setError('Select one of your doctors.'); return; }
    if (serviceType === 'PRODUCT' && !productId) { setError('Select one of your products.'); return; }
    if (serviceType === 'PROGRAM' && !programId) { setError('Select one of your programs.'); return; }
    setSaving(true); setError('');
    const res = await fetch('/api/partner/vouchers', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code, label: label || null, serviceType, discountType, discountValue: v,
        maxDiscountKs: maxDiscountKs ? Number(maxDiscountKs) : null,
        minPurchaseKs: minPurchaseKs ? Number(minPurchaseKs) : 0,
        doctorId: serviceType === 'CONSULTATION' ? doctorId : null,
        productId: serviceType === 'PRODUCT' ? productId : null,
        programId: serviceType === 'PROGRAM' ? programId : null,
        maxUses: maxUses ? Number(maxUses) : null,
        expiresAt: expiresAt || null,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? 'Server error'); return; }
    setCreating(false); resetForm(); load();
  };

  const toggleActive = async (v: Voucher) => {
    setBusyId(v.id);
    await fetch(`/api/partner/vouchers/${v.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !v.active }),
    });
    setBusyId(null); load();
  };

  const handleDelete = async (v: Voucher) => {
    if (!confirm(`Delete voucher "${v.code}"?`)) return;
    setBusyId(v.id);
    await fetch(`/api/partner/vouchers/${v.id}`, { method: 'DELETE' });
    setBusyId(null); load();
  };

  const scopeLabel = (v: Voucher) => v.doctor?.name ?? v.product?.name ?? v.program?.titleMm ?? 'All';

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Vouchers</h1>
          <p className="text-sm text-gray-400 mt-0.5">Discount codes for your own doctors, products, and programs.</p>
        </div>
        {!creating && (
          <button onClick={() => { setCreating(true); resetForm(); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: PRIMARY }}>
            <Plus className="w-4 h-4" /> New Voucher
          </button>
        )}
      </div>

      {creating && (
        <div className="bg-white rounded-2xl border-2 p-4 flex flex-col gap-3" style={{ borderColor: PRIMARY }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: PRIMARY }}>New Voucher</p>

          <div className="flex gap-2">
            <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="CODE (e.g. SAVE20)" className={inp + ' uppercase'} />
            <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Label (optional, internal note)" className={inp} />
          </div>

          <select value={serviceType} onChange={e => { setServiceType(e.target.value as ServiceType); setDoctorId(null); setDoctorName(null); setProductId(null); setProductName(null); setProgramId(null); setProgramName(null); }} className={inp}>
            <option value="CONSULTATION">Consultation (Doctor Appointments)</option>
            <option value="PROGRAM">Program (Enrollments)</option>
            <option value="PRODUCT">Product (Orders)</option>
          </select>

          {serviceType === 'CONSULTATION' && (
            <ScopePicker placeholder="Search your doctors..." all={myDoctors}
              selectedName={doctorName} onSelect={h => { setDoctorId(h.id); setDoctorName(h.name); }} onClear={() => { setDoctorId(null); setDoctorName(null); }} />
          )}
          {serviceType === 'PRODUCT' && (
            <ScopePicker placeholder="Search your products..." all={myProducts}
              selectedName={productName} onSelect={h => { setProductId(h.id); setProductName(h.name); }} onClear={() => { setProductId(null); setProductName(null); }} />
          )}
          {serviceType === 'PROGRAM' && (
            <ScopePicker placeholder="Search your programs..." all={myPrograms}
              selectedName={programName} onSelect={h => { setProgramId(h.id); setProgramName(h.name); }} onClear={() => { setProgramId(null); setProgramName(null); }} />
          )}

          <div className="flex gap-2">
            <select value={discountType} onChange={e => setDiscountType(e.target.value as DiscountType)} className={inp}>
              <option value="PERCENT">Percent off</option>
              <option value="FIXED">Fixed Ks off</option>
            </select>
            <div className="flex items-center flex-1 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
              <input type="number" min={0} value={discountValue} onChange={e => setDiscountValue(e.target.value)}
                className="min-w-0 flex-1 bg-transparent px-3.5 py-2.5 text-sm text-gray-700 outline-none" />
              <span className="pr-3.5 text-sm text-gray-400 shrink-0">{discountType === 'PERCENT' ? '%' : 'Ks'}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <input type="number" min={0} value={maxDiscountKs} onChange={e => setMaxDiscountKs(e.target.value)} placeholder="Max discount cap (Ks, optional)" className={inp} />
            <input type="number" min={0} value={minPurchaseKs} onChange={e => setMinPurchaseKs(e.target.value)} placeholder="Min purchase (Ks, optional)" className={inp} />
          </div>
          <div className="flex gap-2">
            <input type="number" min={1} value={maxUses} onChange={e => setMaxUses(e.target.value)} placeholder="Max uses (blank = unlimited)" className={inp} />
            <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} className={inp} />
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
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Code</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Service</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Scope</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Discount</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Uses</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" /></td></tr>
              ) : vouchers.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center">
                  <Ticket className="w-8 h-8 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No vouchers yet.</p>
                </td></tr>
              ) : vouchers.map(v => (
                <tr key={v.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-bold text-gray-800">{v.code}</p>
                    {v.label && <p className="text-[11px] text-gray-400">{v.label}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-700">{SERVICE_LABEL[v.serviceType]}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{scopeLabel(v)}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-gray-700">
                    {v.discountType === 'PERCENT' ? `${v.discountValue}%` : `${v.discountValue.toLocaleString()} Ks`}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{v.usedCount} / {v.maxUses ?? '∞'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${v.active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-400'}`}>
                      {v.active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 justify-end">
                      <button onClick={() => toggleActive(v)} disabled={busyId === v.id} title={v.active ? 'Disable' : 'Enable'}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30">
                        {busyId === v.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => handleDelete(v)} disabled={busyId === v.id}
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
