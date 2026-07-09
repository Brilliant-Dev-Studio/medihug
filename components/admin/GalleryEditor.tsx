'use client';

import { useState } from 'react';
import { X, Plus, Images } from 'lucide-react';
import ImageDropzone from './ImageDropzone';

export interface GalleryItem { imageUrl: string; captionMm: string; captionEn: string }

const PRIMARY = '#2ab5ad';
const inp = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-teal-400 transition-colors';

export default function GalleryEditor({ items, onChange }: {
  items: GalleryItem[]; onChange: (items: GalleryItem[]) => void;
}) {
  const [draft, setDraft] = useState<GalleryItem>({ imageUrl: '', captionMm: '', captionEn: '' });

  const addItem = () => {
    if (!draft.imageUrl.trim()) return;
    onChange([...items, draft]);
    setDraft({ imageUrl: '', captionMm: '', captionEn: '' });
  };
  const removeItem = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col gap-4">
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((g, i) => (
            <div key={i} className="relative rounded-xl overflow-hidden border border-gray-100 aspect-video group">
              <img src={g.imageUrl} alt={g.captionEn || g.captionMm || `photo ${i + 1}`} className="w-full h-full object-cover" />
              {(g.captionMm || g.captionEn) && (
                <div className="absolute bottom-0 inset-x-0 bg-black/50 px-2 py-1">
                  <p className="text-[10px] text-white truncate">{g.captionEn || g.captionMm}</p>
                </div>
              )}
              <button type="button" onClick={() => removeItem(i)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="border border-dashed border-gray-200 rounded-2xl p-4 flex flex-col gap-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Add Photo</p>
        <ImageDropzone label="Photo" value={draft.imageUrl} onChange={v => setDraft(d => ({ ...d, imageUrl: v }))} aspect="wide" />
        <div className="grid grid-cols-2 gap-3">
          <input className={inp} placeholder="Caption (Myanmar)" value={draft.captionMm}
            onChange={e => setDraft(d => ({ ...d, captionMm: e.target.value }))} />
          <input className={inp} placeholder="Caption (English)" value={draft.captionEn}
            onChange={e => setDraft(d => ({ ...d, captionEn: e.target.value }))} />
        </div>
        <button type="button" onClick={addItem} disabled={!draft.imageUrl.trim()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40"
          style={{ backgroundColor: PRIMARY }}>
          <Plus className="w-4 h-4" /> Add to Gallery
        </button>
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-300">
          <Images className="w-7 h-7 mx-auto mb-2" />
          <p className="text-sm">No gallery photos yet.</p>
        </div>
      )}
    </div>
  );
}
