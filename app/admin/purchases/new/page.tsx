'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';

const PRIMARY = '#2ab5ad';
const inp = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ab5ad]/40 focus:border-[#2ab5ad] transition-colors';
const lbl = 'block text-xs font-semibold text-gray-600 mb-1.5';

interface Supplier { id: string; name: string; }
interface Store { id: string; name: string; code: string; isDefault: boolean; }
interface Product { id: string; name: string; nameEn: string | null; }
interface Line { productId: string; orderedQty: number; unitCost: number; }

export default function NewPurchasePage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stores, setStores]       = useState<Store[]>([]);
  const [products, setProducts]   = useState<Product[]>([]);

  const [supplierId, setSupplierId] = useState('');
  const [storeId, setStoreId]       = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [note, setNote] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [lines, setLines] = useState<Line[]>([{ productId: '', orderedQty: 1, unitCost: 0 }]);

  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    fetch('/api/admin/suppliers?pageSize=200').then(r => r.json()).then(d => setSuppliers(d.suppliers ?? []));
    fetch('/api/admin/stores').then(r => r.json()).then(d => {
      const s: Store[] = d.stores ?? [];
      setStores(s);
      const def = s.find(x => x.isDefault);
      if (def) setStoreId(def.id);
    });
    fetch('/api/admin/products?pageSize=500').then(r => r.json()).then(d => setProducts(d.products ?? []));
  }, []);

  const setLine = (i: number, patch: Partial<Line>) => setLines(ls => ls.map((l, idx) => idx === i ? { ...l, ...patch } : l));
  const addLine = () => setLines(ls => [...ls, { productId: '', orderedQty: 1, unitCost: 0 }]);
  const removeLine = (i: number) => setLines(ls => ls.filter((_, idx) => idx !== i));

  const subtotal = lines.reduce((s, l) => s + (Number(l.orderedQty) || 0) * (Number(l.unitCost) || 0), 0);
  const totalAmount = subtotal - discountAmount + taxAmount + shippingCost;

  const handleSubmit = async () => {
    setError('');
    if (!supplierId || !storeId) { setError('Supplier and store are required.'); return; }
    const validLines = lines.filter(l => l.productId && l.orderedQty > 0);
    if (validLines.length === 0) { setError('At least one valid product line is required.'); return; }

    setSaving(true);
    const res = await fetch('/api/admin/purchases', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supplierId, storeId,
        expectedDate: expectedDate || null,
        note: note || null,
        discountAmount, taxAmount, shippingCost,
        items: validLines,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? 'Server error'); return; }
    router.push(`/admin/purchases/${data.purchase.id}`);
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/admin/purchases')} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><ArrowLeft size={18} /></button>
        <h1 className="text-xl font-bold text-gray-800">New Purchase</h1>
      </div>

      {error && <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={lbl}>Supplier *</label>
            <select className={inp} value={supplierId} onChange={e => setSupplierId(e.target.value)}>
              <option value="">Select supplier</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Store *</label>
            <select className={inp} value={storeId} onChange={e => setStoreId(e.target.value)}>
              <option value="">Select store</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Expected Date</label>
            <input type="date" className={inp} value={expectedDate} onChange={e => setExpectedDate(e.target.value)} />
          </div>
        </div>
        <div>
          <label className={lbl}>Note</label>
          <input className={inp} value={note} onChange={e => setNote(e.target.value)} placeholder="optional" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
        <h2 className="font-semibold text-gray-700 text-sm">Line Items</h2>
        <div className="flex flex-col gap-2">
          {lines.map((l, i) => {
            const lineTotal = (Number(l.orderedQty) || 0) * (Number(l.unitCost) || 0);
            return (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <select className={inp + ' col-span-5'} value={l.productId} onChange={e => setLine(i, { productId: e.target.value })}>
                  <option value="">Select product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.nameEn ?? p.name}</option>)}
                </select>
                <input type="number" min={1} className={inp + ' col-span-2'} placeholder="Qty" value={l.orderedQty}
                  onChange={e => setLine(i, { orderedQty: Number(e.target.value) })} />
                <input type="number" min={0} className={inp + ' col-span-2'} placeholder="Unit cost" value={l.unitCost}
                  onChange={e => setLine(i, { unitCost: Number(e.target.value) })} />
                <div className="col-span-2 text-sm text-gray-600 text-right pr-1">{lineTotal.toLocaleString()} Ks</div>
                <button onClick={() => removeLine(i)} disabled={lines.length === 1}
                  className="col-span-1 w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-400 disabled:opacity-20">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
        <button onClick={addLine} className="text-xs font-semibold flex items-center gap-1" style={{ color: PRIMARY }}>
          <Plus className="w-3.5 h-3.5" /> Add line
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={lbl}>Discount (Ks)</label>
            <input type="number" min={0} className={inp} value={discountAmount} onChange={e => setDiscountAmount(Number(e.target.value))} />
          </div>
          <div>
            <label className={lbl}>Tax (Ks)</label>
            <input type="number" min={0} className={inp} value={taxAmount} onChange={e => setTaxAmount(Number(e.target.value))} />
          </div>
          <div>
            <label className={lbl}>Shipping (Ks)</label>
            <input type="number" min={0} className={inp} value={shippingCost} onChange={e => setShippingCost(Number(e.target.value))} />
          </div>
        </div>
        <div className="flex justify-end gap-8 pt-2 border-t border-gray-100 text-sm">
          <span className="text-gray-400">Subtotal: <span className="font-semibold text-gray-700">{subtotal.toLocaleString()} Ks</span></span>
          <span className="text-gray-400">Total: <span className="font-bold text-gray-800">{totalAmount.toLocaleString()} Ks</span></span>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSubmit} disabled={saving}
          className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60 hover:opacity-90"
          style={{ backgroundColor: PRIMARY }}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : null}
          {saving ? 'Creating...' : 'Create Purchase'}
        </button>
      </div>
    </div>
  );
}
