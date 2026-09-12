'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Check, X, Loader2, HeartHandshake, Trash2, ArrowUp, ArrowDown, Phone, MapPin, User } from 'lucide-react';
import ImageDropzone from '@/components/admin/ImageDropzone';

const PRIMARY = '#2ab5ad';
const inp = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-teal-400 transition-colors';

interface CommunityPartner {
  id: string; name: string; nameEn: string | null;
  descriptionMm: string | null; descriptionEn: string | null;
  contactPerson: string | null; phone: string | null; viber: string | null;
  location: string | null; address: string | null; addressEn: string | null;
  imageUrl: string | null; order: number; isActive: boolean; createdAt: string;
}

const EMPTY = {
  name: '', nameEn: '', descriptionMm: '', descriptionEn: '',
  contactPerson: '', phone: '', viber: '', location: '', address: '', addressEn: '', imageUrl: '',
};

export default function AdminCommunityPartnersPage() {
  const [items,    setItems]    = useState<CommunityPartner[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [creating, setCreating] = useState(false);
  const [form,      setForm]      = useState(EMPTY);
  const [createError, setCreateError] = useState('');
  const [saving,    setSaving]    = useState(false);
  const [busyId,    setBusyId]    = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res  = await fetch('/api/admin/community-partners');
    const data = await res.json();
    setItems(data.partners ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    if (!form.name.trim()) { setCreateError('Name လိုအပ်သည်'); return; }
    setSaving(true); setCreateError('');
    const res  = await fetch('/api/admin/community-partners', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, order: items.length }),
    });
    const data = await res.json();
    if (!res.ok) { setCreateError(data.error); setSaving(false); return; }
    setForm(EMPTY); setCreating(false); setSaving(false);
    load();
  };

  const toggleActive = async (p: CommunityPartner) => {
    setBusyId(p.id);
    await fetch(`/api/admin/community-partners/${p.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    setBusyId(null); load();
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    await fetch(`/api/admin/community-partners/${id}`, { method: 'DELETE' });
    setBusyId(null); load();
  };

  const move = async (p: CommunityPartner, dir: -1 | 1) => {
    const sorted = [...items].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex(x => x.id === p.id);
    const swapWith = sorted[idx + dir];
    if (!swapWith) return;
    setBusyId(p.id);
    await Promise.all([
      fetch(`/api/admin/community-partners/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: swapWith.order }) }),
      fetch(`/api/admin/community-partners/${swapWith.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: p.order }) }),
    ]);
    setBusyId(null); load();
  };

  const sorted = [...items].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Government Hospitals & Charity Associations</h1>
          <p className="text-sm text-gray-400 mt-0.5">Landing page directory ({items.length})</p>
        </div>
        {!creating && (
          <button onClick={() => { setCreating(true); setForm(EMPTY); setCreateError(''); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ backgroundColor: PRIMARY }}>
            <Plus className="w-4 h-4" /> New Entry
          </button>
        )}
      </div>

      {/* Create form */}
      {creating && (
        <div className="bg-white rounded-2xl border-2 p-4 flex flex-col gap-3" style={{ borderColor: PRIMARY }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: PRIMARY }}>New Entry</p>

          <ImageDropzone label="Image (optional)" value={form.imageUrl} onChange={v => set('imageUrl', v)} aspect="wide" />

          <div className="grid grid-cols-2 gap-3">
            <input value={form.name}   onChange={e => set('name', e.target.value)}   placeholder="Name (Myanmar) *" className={inp} />
            <input value={form.nameEn} onChange={e => set('nameEn', e.target.value)} placeholder="Name (English)"   className={inp} />
          </div>

          <textarea rows={3} value={form.descriptionMm} onChange={e => set('descriptionMm', e.target.value)} placeholder="Description (Myanmar)" className={inp + ' resize-none'} />
          <textarea rows={3} value={form.descriptionEn} onChange={e => set('descriptionEn', e.target.value)} placeholder="Description (English)" className={inp + ' resize-none'} />

          <div className="grid grid-cols-2 gap-3">
            <input value={form.contactPerson} onChange={e => set('contactPerson', e.target.value)} placeholder="Contact Person" className={inp} />
            <input value={form.location}      onChange={e => set('location', e.target.value)}      placeholder="Location (e.g. township)" className={inp} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="Phone" className={inp} />
            <input value={form.viber} onChange={e => set('viber', e.target.value)} placeholder="Viber" className={inp} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input value={form.address}   onChange={e => set('address', e.target.value)}   placeholder="Address (Myanmar)" className={inp} />
            <input value={form.addressEn} onChange={e => set('addressEn', e.target.value)} placeholder="Address (English)" className={inp} />
          </div>

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
          <HeartHandshake className="w-8 h-8 mx-auto text-gray-200 mb-2" />
          <p className="text-sm text-gray-400">No entries yet. Create one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((p, i) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
              <div className="p-4 flex flex-col gap-2.5 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: PRIMARY }}>
                        {p.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{p.name}</p>
                      {p.location && (
                        <div className="flex items-center gap-1 min-w-0">
                          <MapPin className="w-3 h-3 text-gray-300 shrink-0" />
                          <p className="text-xs text-gray-400 truncate">{p.location}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${p.isActive ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                    {p.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>

                {p.contactPerson && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <User className="w-3 h-3 text-gray-300 shrink-0" /> {p.contactPerson}
                  </div>
                )}
                {p.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Phone className="w-3 h-3 text-gray-300 shrink-0" /> {p.phone}
                  </div>
                )}
                {p.descriptionMm && <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{p.descriptionMm}</p>}
              </div>

              <div className="px-3.5 pb-3.5 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button onClick={() => move(p, -1)} disabled={i === 0 || busyId === p.id}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30">
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => move(p, 1)} disabled={i === sorted.length - 1 || busyId === p.id}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => toggleActive(p)} disabled={busyId === p.id}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40">
                    {p.isActive ? 'Hide' : 'Show'}
                  </button>
                  <button onClick={() => handleDelete(p.id)} disabled={busyId === p.id}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-400 disabled:opacity-40">
                    {busyId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
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
