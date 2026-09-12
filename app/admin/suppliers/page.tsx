'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Check, X, Loader2, Truck, Trash2, Pencil, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdminRole, requestDeletion } from '@/lib/useAdminRole';
import DangerDeleteModal from '@/components/admin/DangerDeleteModal';

const PRIMARY = '#2ab5ad';
const inp = 'flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-teal-400 transition-colors';

interface Supplier {
  id: string; name: string; contactPerson: string | null; phone: string | null;
  email: string | null; address: string | null; taxId: string | null; note: string | null;
  isActive: boolean; createdAt: string;
}

const emptyForm = { name: '', contactPerson: '', phone: '', email: '', address: '', taxId: '', note: '' };

export default function SuppliersPage() {
  const { role } = useAdminRole();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading]     = useState(true);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch]       = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [creating, setCreating] = useState(false);
  const [form, setForm]         = useState(emptyForm);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const [editId, setEditId]     = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);

  const [busyId, setBusyId]         = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);

  const load = useCallback(async (p = page) => {
    setLoading(true);
    const q = new URLSearchParams({ page: String(p) });
    if (search) q.set('search', search);
    const res = await fetch(`/api/admin/suppliers?${q}`);
    const d = await res.json();
    setSuppliers(d.suppliers ?? []);
    setTotal(d.total ?? 0);
    setPage(d.page ?? 1);
    setTotalPages(d.totalPages ?? 1);
    setLoading(false);
  }, [page, search]);

  useEffect(() => { load(1); }, [search]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(page); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async () => {
    if (!form.name.trim()) { setError('Supplier name is required.'); return; }
    setSaving(true); setError('');
    const res = await fetch('/api/admin/suppliers', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? 'Server error'); return; }
    setForm(emptyForm); setCreating(false); load(1);
  };

  const startEdit = (s: Supplier) => {
    setEditId(s.id);
    setEditForm({
      name: s.name, contactPerson: s.contactPerson ?? '', phone: s.phone ?? '',
      email: s.email ?? '', address: s.address ?? '', taxId: s.taxId ?? '', note: s.note ?? '',
    });
  };

  const handleEdit = async (id: string) => {
    if (!editForm.name.trim()) return;
    const res = await fetch(`/api/admin/suppliers/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    if (res.ok) { setEditId(null); load(page); }
  };

  const doDelete = async (s: Supplier) => {
    setBusyId(s.id);
    if (role === 'POS_ADMIN') {
      const ok = await requestDeletion('Supplier', s.id, s.name);
      setBusyId(null); setDeleteTarget(null);
      alert(ok ? 'Deletion request submitted — waiting for Super Admin approval.' : 'Failed to submit deletion request.');
      return;
    }
    const res = await fetch(`/api/admin/suppliers/${s.id}`, { method: 'DELETE' });
    setBusyId(null); setDeleteTarget(null);
    if (!res.ok) { const d = await res.json(); alert(d.error ?? 'Failed to delete.'); return; }
    load(page);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Suppliers</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total} suppliers</p>
        </div>
        {!creating && (
          <button onClick={() => { setCreating(true); setForm(emptyForm); setError(''); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: PRIMARY }}>
            <Plus className="w-4 h-4" /> New Supplier
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2ab5ad]/40 focus:border-[#2ab5ad]"
            placeholder="Search suppliers..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1); } }}
          />
        </div>
      </div>

      {creating && (
        <div className="bg-white rounded-2xl border-2 p-4 flex flex-col gap-3" style={{ borderColor: PRIMARY }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: PRIMARY }}>New Supplier</p>
          <div className="flex gap-2">
            <input autoFocus value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Supplier name *" className={inp} />
            <input value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} placeholder="Contact person" className={inp} />
          </div>
          <div className="flex gap-2">
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone" className={inp} />
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" className={inp} />
            <input value={form.taxId} onChange={e => setForm(f => ({ ...f, taxId: e.target.value }))} placeholder="Tax ID" className={inp} />
          </div>
          <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Address" className={inp} />
          <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Note (optional)" rows={2} className={inp + ' resize-none'} />
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
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone / Email</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" /></td></tr>
              ) : suppliers.length === 0 ? (
                <tr><td colSpan={4} className="py-16 text-center">
                  <Truck className="w-8 h-8 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No suppliers found.</p>
                </td></tr>
              ) : suppliers.map(s => (
                <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                  {editId === s.id ? (
                    <td className="px-5 py-3.5" colSpan={4}>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <input autoFocus value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} placeholder="Supplier name *" className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-teal-400" />
                          <input value={editForm.contactPerson} onChange={e => setEditForm(f => ({ ...f, contactPerson: e.target.value }))} placeholder="Contact person" className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-teal-400" />
                          <button onClick={() => handleEdit(s.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: PRIMARY }}><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setEditId(null)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 shrink-0"><X className="w-3.5 h-3.5" /></button>
                        </div>
                        <div className="flex gap-2">
                          <input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone" className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-teal-400" />
                          <input value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-teal-400" />
                        </div>
                      </div>
                    </td>
                  ) : (
                    <>
                      <td className="px-5 py-3.5 text-sm font-semibold text-gray-700">{s.name}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{s.contactPerson || <span className="text-gray-300 text-xs italic">—</span>}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-400">{[s.phone, s.email].filter(Boolean).join(' · ') || '—'}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button onClick={() => startEdit(s)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteTarget(s)} disabled={busyId === s.id} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-400 disabled:opacity-30">
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
            <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      <DangerDeleteModal
        open={!!deleteTarget}
        title="Delete supplier?"
        message="This supplier will be permanently deleted."
        itemName={deleteTarget?.name ?? ''}
        loading={!!busyId}
        onConfirm={() => deleteTarget && doDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
