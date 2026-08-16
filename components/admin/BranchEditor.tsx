'use client';

import { useState } from 'react';
import { X, Plus, MapPin } from 'lucide-react';

export interface BranchItem { title: string; titleEn: string; address: string; addressEn: string; mapUrl: string }

const EMPTY_DRAFT: BranchItem = { title: '', titleEn: '', address: '', addressEn: '', mapUrl: '' };

const PRIMARY = '#2ab5ad';
const inp = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-teal-400 transition-colors';

export default function BranchEditor({ items, onChange }: {
  items: BranchItem[]; onChange: (items: BranchItem[]) => void;
}) {
  const [draft, setDraft] = useState<BranchItem>(EMPTY_DRAFT);

  const addItem = () => {
    if (!draft.title.trim() || !draft.address.trim()) return;
    onChange([...items, draft]);
    setDraft(EMPTY_DRAFT);
  };
  const removeItem = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col gap-4">
      {items.length > 0 && (
        <div className="flex flex-col gap-2">
          {items.map((b, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${PRIMARY}14` }}>
                <MapPin className="w-4 h-4" style={{ color: PRIMARY }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800 truncate">{b.title}{b.titleEn ? ` (${b.titleEn})` : ''}</p>
                <p className="text-xs text-gray-500 mt-0.5">{b.address}</p>
                {b.addressEn && <p className="text-xs text-gray-400">{b.addressEn}</p>}
              </div>
              <button type="button" onClick={() => removeItem(i)}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="border border-dashed border-gray-200 rounded-2xl p-4 flex flex-col gap-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Add Branch</p>
        <div className="grid grid-cols-2 gap-3">
          <input className={inp} placeholder="Branch title (Myanmar) *" value={draft.title}
            onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} />
          <input className={inp} placeholder="Branch title (English)" value={draft.titleEn}
            onChange={e => setDraft(d => ({ ...d, titleEn: e.target.value }))} />
        </div>
        <textarea className={`${inp} resize-none`} rows={2} placeholder="Address (Myanmar) *" value={draft.address}
          onChange={e => setDraft(d => ({ ...d, address: e.target.value }))} />
        <textarea className={`${inp} resize-none`} rows={2} placeholder="Address (English)" value={draft.addressEn}
          onChange={e => setDraft(d => ({ ...d, addressEn: e.target.value }))} />
        <input className={inp} placeholder="Google Map Link (optional)" value={draft.mapUrl}
          onChange={e => setDraft(d => ({ ...d, mapUrl: e.target.value }))} />
        <button type="button" onClick={addItem} disabled={!draft.title.trim() || !draft.address.trim()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40"
          style={{ backgroundColor: PRIMARY }}>
          <Plus className="w-4 h-4" /> Add Branch
        </button>
      </div>

      {items.length === 0 && (
        <div className="text-center py-6 text-gray-300">
          <MapPin className="w-7 h-7 mx-auto mb-2" />
          <p className="text-sm">No branches yet.</p>
        </div>
      )}
    </div>
  );
}
