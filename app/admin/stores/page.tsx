'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Check, X, Loader2, Store as StoreIcon, Trash2, Pencil, Star } from 'lucide-react';
import { useAdminRole, requestDeletion } from '@/lib/useAdminRole';
import DangerDeleteModal from '@/components/admin/DangerDeleteModal';

const PRIMARY = '#2ab5ad';
const inp = 'flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-teal-400 transition-colors';

interface Store {
  id: string; name: string; nameEn: string | null; code: string;
  address: string | null; phone: string | null; isActive: boolean; isDefault: boolean; createdAt: string;
}

const emptyForm = { name: '', nameEn: '', code: '', address: '', phone: '' };

export default function StoresPage() {
  const { role } = useAdminRole();
  const [stores, setStores]   = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);
  const [form, setForm]         = useState(emptyForm);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const [editId, setEditId]     = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);

  const [busyId, setBusyId]             = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Store | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/stores');
    const d = await res.json();
    setStores(d.stores ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.code.trim()) { setError('Store name and code are required.'); return; }
    setSaving(true); setError('');
    const res = await fetch('/api/admin/stores', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? 'Server error'); return; }
    setForm(emptyForm); setCreating(false); load();
  };

  const startEdit = (s: Store) => {
    setEditId(s.id);
    setEditForm({ name: s.name, nameEn: s.nameEn ?? '', code: s.code, address: s.address ?? '', phone: s.phone ?? '' });
  };

  const handleEdit = async (id: string) => {
    if (!editForm.name.trim() || !editForm.code.trim()) return;
    const res = await fetch(`/api/admin/stores/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    if (res.ok) { setEditId(null); load(); }
    else { const d = await res.json(); alert(d.error ?? 'Failed to update.'); }
  };

  const doDelete = async (s: Store) => {
    setBusyId(s.id);
    if (role === 'POS_ADMIN') {
      const ok = await requestDeletion('Store', s.id, s.name);
      setBusyId(null); setDeleteTarget(null);
      alert(ok ? 'Deletion request submitted — waiting for Super Admin approval.' : 'Failed to submit deletion request.');
      return;
    }
    const res = await fetch(`/api/admin/stores/${s.id}`, { method: 'DELETE' });
    setBusyId(null); setDeleteTarget(null);
    if (!res.ok) { const d = await res.json(); alert(d.error ?? 'Failed to delete.'); return; }
    load();
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Stores</h1>
          <p className="text-sm text-gray-400 mt-0.5">{stores.length} locations</p>
        </div>
        {!creating && (
          <button onClick={() => { setCreating(true); setForm(emptyForm); setError(''); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: PRIMARY }}>
            <Plus className="w-4 h-4" /> New Store
          </button>
        )}
      </div>

      {creating && (
        <div className="bg-white rounded-2xl border-2 p-4 flex flex-col gap-3" style={{ borderColor: PRIMARY }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: PRIMARY }}>New Store</p>
          <div className="flex gap-2">
            <input autoFocus value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Store name *" className={inp} />
            <input value={form.nameEn} onChange={e => setForm(f => ({ ...f, nameEn: e.target.value }))} placeholder="English name" className={inp} />
            <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="Code (e.g. MAIN) *" className={inp} maxLength={10} />
          </div>
          <div className="flex gap-2">
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone" className={inp} />
            <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Address" className={inp} />
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={saving}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center gap-1.5" style={{ backgroundColor: PRIMARY }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save
            </button>
            <button onClick={() => setCreating(false)} className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50"><X className="w-4 h-4" /></button>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Code</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" /></td></tr>
              ) : stores.length === 0 ? (
                <tr><td colSpan={4} className="py-16 text-center">
                  <StoreIcon className="w-8 h-8 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No stores found.</p>
                </td></tr>
              ) : stores.map(s => (
                <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                  {editId === s.id ? (
                    <td className="px-5 py-3.5" colSpan={4}>
                      <div className="flex gap-2">
                        <input autoFocus value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} placeholder="Store name *" className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-teal-400" />
                        <input value={editForm.code} onChange={e => setEditForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="Code *" className="w-28 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-teal-400" />
                        <input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone" className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-teal-400" />
                        <button onClick={() => handleEdit(s.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: PRIMARY }}><Check className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setEditId(null)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 shrink-0"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  ) : (
                    <>
                      <td className="px-5 py-3.5 text-sm font-semibold text-gray-700">
                        <span className="flex items-center gap-1.5">
                          {s.isDefault && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                          {s.name}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs font-mono text-gray-500">{s.code}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-400">{[s.phone, s.address].filter(Boolean).join(' · ') || '—'}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button onClick={() => startEdit(s)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteTarget(s)} disabled={busyId === s.id || s.isDefault} title={s.isDefault ? 'The default store cannot be deleted' : undefined}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-400 disabled:opacity-20">
                            {busyId === s.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DangerDeleteModal
        open={!!deleteTarget}
        title="Delete store?"
        message="This store will be permanently deleted."
        itemName={deleteTarget?.name ?? ''}
        loading={!!busyId}
        onConfirm={() => deleteTarget && doDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
