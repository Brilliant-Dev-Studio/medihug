'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Check, X, Loader2, Image as ImageIcon, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import ImageDropzone from '@/components/admin/ImageDropzone';

const PRIMARY = '#2ab5ad';
const inp = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-teal-400 transition-colors';

interface Ad { id: string; imageUrl: string; alt: string | null; link: string | null; order: number; isActive: boolean; createdAt: string; }

const EMPTY = { imageUrl: '', alt: '', link: '' };

export default function AdminAdsPage() {
  const [ads,      setAds]      = useState<Ad[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [creating, setCreating] = useState(false);
  const [form,      setForm]      = useState(EMPTY);
  const [createError, setCreateError] = useState('');
  const [saving,    setSaving]    = useState(false);
  const [busyId,    setBusyId]    = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res  = await fetch('/api/admin/ads');
    const data = await res.json();
    setAds(data.ads ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    if (!form.imageUrl) { setCreateError('Image လိုအပ်သည်'); return; }
    setSaving(true); setCreateError('');
    const res  = await fetch('/api/admin/ads', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, order: ads.length }),
    });
    const data = await res.json();
    if (!res.ok) { setCreateError(data.error); setSaving(false); return; }
    setForm(EMPTY); setCreating(false); setSaving(false);
    load();
  };

  const toggleActive = async (ad: Ad) => {
    setBusyId(ad.id);
    await fetch(`/api/admin/ads/${ad.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !ad.isActive }),
    });
    setBusyId(null); load();
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    await fetch(`/api/admin/ads/${id}`, { method: 'DELETE' });
    setBusyId(null); load();
  };

  const move = async (ad: Ad, dir: -1 | 1) => {
    const sorted = [...ads].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex(a => a.id === ad.id);
    const swapWith = sorted[idx + dir];
    if (!swapWith) return;
    setBusyId(ad.id);
    await Promise.all([
      fetch(`/api/admin/ads/${ad.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: swapWith.order }) }),
      fetch(`/api/admin/ads/${swapWith.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: ad.order }) }),
    ]);
    setBusyId(null); load();
  };

  const sortedAds = [...ads].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Ads</h1>
          <p className="text-sm text-gray-400 mt-0.5">Landing page ad banners ({ads.length})</p>
        </div>
        {!creating && (
          <button onClick={() => { setCreating(true); setForm(EMPTY); setCreateError(''); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ backgroundColor: PRIMARY }}>
            <Plus className="w-4 h-4" /> New Ad
          </button>
        )}
      </div>

      {/* Create form */}
      {creating && (
        <div className="bg-white rounded-2xl border-2 p-4 flex flex-col gap-3" style={{ borderColor: PRIMARY }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: PRIMARY }}>New Ad</p>
          <ImageDropzone label="Ad Image *" value={form.imageUrl} onChange={v => set('imageUrl', v)} aspect="wide" />
          <input value={form.alt} onChange={e => set('alt', e.target.value)} placeholder="Alt text (optional)" className={inp} />
          <input value={form.link} onChange={e => set('link', e.target.value)} placeholder="Link URL (optional — e.g. /patient/doctors)" className={inp} />
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
      ) : sortedAds.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
          <ImageIcon className="w-8 h-8 mx-auto text-gray-200 mb-2" />
          <p className="text-sm text-gray-400">No ads yet. Create one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedAds.map((ad, i) => (
            <div key={ad.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
              <div className="relative aspect-[16/6] bg-gray-50">
                <img src={ad.imageUrl} alt={ad.alt ?? ''} className="w-full h-full object-cover" />
                <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${ad.isActive ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                  {ad.isActive ? 'Active' : 'Hidden'}
                </span>
              </div>
              <div className="p-3.5 flex flex-col gap-2">
                {ad.link && <p className="text-xs text-gray-500 truncate">🔗 {ad.link}</p>}
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1">
                    <button onClick={() => move(ad, -1)} disabled={i === 0 || busyId === ad.id}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30">
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => move(ad, 1)} disabled={i === sortedAds.length - 1 || busyId === ad.id}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => toggleActive(ad)} disabled={busyId === ad.id}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40">
                      {ad.isActive ? 'Hide' : 'Show'}
                    </button>
                    <button onClick={() => handleDelete(ad.id)} disabled={busyId === ad.id}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-400 disabled:opacity-40">
                      {busyId === ad.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
