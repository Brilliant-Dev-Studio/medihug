'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Check, X, Loader2, MessageSquareQuote, Trash2, ArrowUp, ArrowDown, Star } from 'lucide-react';
import ImageDropzone from '@/components/admin/ImageDropzone';

const PRIMARY = '#2ab5ad';
const inp = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-teal-400 transition-colors';

interface Testimonial {
  id: string; name: string; roleMm: string; roleEn: string | null;
  reviewMm: string; reviewEn: string | null; rating: number;
  imageUrl: string | null; order: number; isActive: boolean; createdAt: string;
}

const EMPTY = { name: '', roleMm: '', roleEn: '', reviewMm: '', reviewEn: '', rating: 5, imageUrl: '' };

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)} className="p-0.5">
          <Star className="w-5 h-5" fill={n <= value ? '#fbbf24' : 'none'} stroke={n <= value ? '#fbbf24' : '#d1d5db'} />
        </button>
      ))}
    </div>
  );
}

export default function AdminTestimonialsPage() {
  const [items,    setItems]    = useState<Testimonial[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [creating, setCreating] = useState(false);
  const [form,      setForm]      = useState(EMPTY);
  const [createError, setCreateError] = useState('');
  const [saving,    setSaving]    = useState(false);
  const [busyId,    setBusyId]    = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res  = await fetch('/api/admin/testimonials');
    const data = await res.json();
    setItems(data.testimonials ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    if (!form.name.trim() || !form.roleMm.trim() || !form.reviewMm.trim()) {
      setCreateError('Name, Role (Myanmar), Review (Myanmar) လိုအပ်သည်'); return;
    }
    setSaving(true); setCreateError('');
    const res  = await fetch('/api/admin/testimonials', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, order: items.length }),
    });
    const data = await res.json();
    if (!res.ok) { setCreateError(data.error); setSaving(false); return; }
    setForm(EMPTY); setCreating(false); setSaving(false);
    load();
  };

  const toggleActive = async (t: Testimonial) => {
    setBusyId(t.id);
    await fetch(`/api/admin/testimonials/${t.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !t.isActive }),
    });
    setBusyId(null); load();
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
    setBusyId(null); load();
  };

  const move = async (t: Testimonial, dir: -1 | 1) => {
    const sorted = [...items].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex(x => x.id === t.id);
    const swapWith = sorted[idx + dir];
    if (!swapWith) return;
    setBusyId(t.id);
    await Promise.all([
      fetch(`/api/admin/testimonials/${t.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: swapWith.order }) }),
      fetch(`/api/admin/testimonials/${swapWith.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: t.order }) }),
    ]);
    setBusyId(null); load();
  };

  const sorted = [...items].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Testimonials</h1>
          <p className="text-sm text-gray-400 mt-0.5">Landing page customer reviews ({items.length})</p>
        </div>
        {!creating && (
          <button onClick={() => { setCreating(true); setForm(EMPTY); setCreateError(''); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ backgroundColor: PRIMARY }}>
            <Plus className="w-4 h-4" /> New Testimonial
          </button>
        )}
      </div>

      {/* Create form */}
      {creating && (
        <div className="bg-white rounded-2xl border-2 p-4 flex flex-col gap-3" style={{ borderColor: PRIMARY }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: PRIMARY }}>New Testimonial</p>

          <ImageDropzone label="Avatar (optional)" value={form.imageUrl} onChange={v => set('imageUrl', v)} aspect="square" />

          <div className="grid grid-cols-2 gap-3">
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Name *" className={inp} />
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Rating</p>
              <StarPicker value={form.rating} onChange={v => set('rating', v)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input value={form.roleMm} onChange={e => set('roleMm', e.target.value)} placeholder="Role (Myanmar) * — e.g. လူနာ" className={inp} />
            <input value={form.roleEn} onChange={e => set('roleEn', e.target.value)} placeholder="Role (English) — e.g. Patient" className={inp} />
          </div>

          <textarea rows={3} value={form.reviewMm} onChange={e => set('reviewMm', e.target.value)} placeholder="Review (Myanmar) *" className={inp + ' resize-none'} />
          <textarea rows={3} value={form.reviewEn} onChange={e => set('reviewEn', e.target.value)} placeholder="Review (English)" className={inp + ' resize-none'} />

          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={saving}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center gap-1.5"
              style={{ backgroundColor: PRIMARY }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save
            </button>
            <button onClick={() => setCreating(false)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          {createError && <p className="text-xs text-red-500">{createError}</p>}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" /></div>
      ) : sorted.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
          <MessageSquareQuote className="w-8 h-8 mx-auto text-gray-200 mb-2" />
          <p className="text-sm text-gray-400">No testimonials yet. Create one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((t, i) => (
            <div key={t.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
              <div className="p-4 flex flex-col gap-3 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {t.imageUrl ? (
                      <img src={t.imageUrl} alt={t.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: PRIMARY }}>
                        {t.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{t.name}</p>
                      <p className="text-xs text-gray-400 truncate">{t.roleMm}{t.roleEn ? ` · ${t.roleEn}` : ''}</p>
                    </div>
                  </div>
                  <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${t.isActive ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                    {t.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>

                <div className="flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star key={si} className="w-3 h-3" fill={si < t.rating ? '#fbbf24' : 'none'} stroke={si < t.rating ? '#fbbf24' : '#d1d5db'} />
                  ))}
                </div>

                <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{t.reviewMm}</p>
              </div>

              <div className="px-3.5 pb-3.5 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button onClick={() => move(t, -1)} disabled={i === 0 || busyId === t.id}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30">
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => move(t, 1)} disabled={i === sorted.length - 1 || busyId === t.id}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => toggleActive(t)} disabled={busyId === t.id}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40">
                    {t.isActive ? 'Hide' : 'Show'}
                  </button>
                  <button onClick={() => handleDelete(t.id)} disabled={busyId === t.id}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-400 disabled:opacity-40">
                    {busyId === t.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
