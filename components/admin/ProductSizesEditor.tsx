'use client';

import { Plus, Trash2 } from 'lucide-react';

const PRIMARY = '#2ab5ad';
const inp = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ab5ad]/40 focus:border-[#2ab5ad] transition-colors';

export interface SizeRow {
  label: string;
  priceOverride: string; // '' = use base price
  stock: string;
}

export const EMPTY_SIZE_ROW: SizeRow = { label: '', priceOverride: '', stock: '0' };

/** Optional purchasable variants (S/M/L, "500ml"/"1L", ...). Leaving this empty keeps the
 * product exactly as before — one price, one stock number, no size picker on the storefront.
 * Adding even one row means patients must pick a size to buy. */
export default function ProductSizesEditor({ rows, onChange }: { rows: SizeRow[]; onChange: (rows: SizeRow[]) => void }) {
  const update = (i: number, patch: Partial<SizeRow>) => onChange(rows.map((r, j) => j === i ? { ...r, ...patch } : r));
  const remove = (i: number) => onChange(rows.filter((_, j) => j !== i));
  const add = () => onChange([...rows, { ...EMPTY_SIZE_ROW }]);

  return (
    <div className="flex flex-col gap-2.5">
      {rows.length > 0 && (
        <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_auto] gap-2 px-0.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <span>Label</span>
          <span>Price override (Ks)</span>
          <span>Stock</span>
          <span />
        </div>
      )}
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
          <input className={inp} value={r.label} onChange={e => update(i, { label: e.target.value })} placeholder="e.g. M, 500ml" />
          <input className={inp} type="number" min={0} value={r.priceOverride} onChange={e => update(i, { priceOverride: e.target.value })} placeholder="Same as base price" />
          <input className={inp} type="number" min={0} value={r.stock} onChange={e => update(i, { stock: e.target.value })} placeholder="0" />
          <button type="button" onClick={() => remove(i)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-400 transition-colors justify-self-end sm:justify-self-auto">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button type="button" onClick={add}
        className="self-start flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
        style={{ color: PRIMARY, backgroundColor: `${PRIMARY}12` }}>
        <Plus size={13} /> Add Size
      </button>
    </div>
  );
}
