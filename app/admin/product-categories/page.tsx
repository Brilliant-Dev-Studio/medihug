'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Check, X, Loader2, Layers, ChevronLeft, ChevronRight, Search, Stethoscope, ArrowUp, ArrowDown, HeartPulse } from 'lucide-react';
import ImageUploadSlot from '@/components/admin/ImageUploadSlot';

const PRIMARY = '#2ab5ad';

interface Category {
  id: string; name: string; nameEn: string | null;
  descriptionMm: string | null; descriptionEn: string | null;
  iconUrl: string | null; bgImageUrl: string | null; order: number; createdAt: string;
  doctors?: { doctorId: string }[];
  programs?: { programId: string }[];
}
interface DoctorOption { id: string; name: string; nameEn: string | null; specialty: string; imageUrl: string | null; }
interface ProgramOption { id: string; titleMm: string; titleEn: string | null; imageUrl: string; }

const inp = 'flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-teal-400 transition-colors';

function DoctorChecklist({ doctorOptions, selected, onToggle }: {
  doctorOptions: DoctorOption[]; selected: string[]; onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[11px] font-semibold text-gray-500">Assigned Doctors (optional — link this category to doctors instead of products)</p>
      {doctorOptions.length === 0 ? (
        <p className="text-xs text-gray-400">No doctors available.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto border border-gray-100 rounded-xl p-2">
          {doctorOptions.map(d => {
            const checked = selected.includes(d.id);
            return (
              <label key={d.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" checked={checked} onChange={() => onToggle(d.id)} className="accent-teal-500 shrink-0" />
                <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-gray-100 bg-gray-50 flex items-center justify-center">
                  {d.imageUrl ? (
                    <Image src={d.imageUrl} alt={d.name} width={24} height={24} className="object-cover w-full h-full" />
                  ) : (
                    <Stethoscope className="w-3 h-3 text-gray-300" />
                  )}
                </div>
                <span className="text-xs text-gray-700 truncate">{d.nameEn ?? d.name}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProgramChecklist({ programOptions, selected, onToggle }: {
  programOptions: ProgramOption[]; selected: string[]; onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[11px] font-semibold text-gray-500">Assigned Programs (optional — link this category to healthcare programs instead of products)</p>
      {programOptions.length === 0 ? (
        <p className="text-xs text-gray-400">No programs available.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto border border-gray-100 rounded-xl p-2">
          {programOptions.map(p => {
            const checked = selected.includes(p.id);
            return (
              <label key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" checked={checked} onChange={() => onToggle(p.id)} className="accent-teal-500 shrink-0" />
                <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-gray-100 bg-gray-50 flex items-center justify-center">
                  {p.imageUrl ? (
                    <Image src={p.imageUrl} alt={p.titleMm} width={24} height={24} className="object-cover w-full h-full" />
                  ) : (
                    <HeartPulse className="w-3 h-3 text-gray-300" />
                  )}
                </div>
                <span className="text-xs text-gray-700 truncate">{p.titleEn ?? p.titleMm}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ProductCategoriesPage() {
  const [categories,   setCategories]   = useState<Category[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [total,        setTotal]        = useState(0);
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [search,       setSearch]       = useState('');
  const [searchInput,  setSearchInput]  = useState('');

  const [creating,    setCreating]    = useState(false);
  const [newName,     setNewName]     = useState('');
  const [newNameEn,   setNewNameEn]   = useState('');
  const [newDescMm,   setNewDescMm]   = useState('');
  const [newDescEn,   setNewDescEn]   = useState('');
  const [newIconUrl,  setNewIconUrl]  = useState<string | null>(null);
  const [newBgUrl,    setNewBgUrl]    = useState<string | null>(null);
  const [newDoctorIds, setNewDoctorIds] = useState<string[]>([]);
  const [newProgramIds, setNewProgramIds] = useState<string[]>([]);
  const [createError, setCreateError] = useState('');
  const [savingNew,   setSavingNew]   = useState(false);

  const [editId,     setEditId]     = useState<string | null>(null);
  const [editName,   setEditName]   = useState('');
  const [editNameEn, setEditNameEn] = useState('');
  const [editDescMm, setEditDescMm] = useState('');
  const [editDescEn, setEditDescEn] = useState('');
  const [editIconUrl, setEditIconUrl] = useState<string | null>(null);
  const [editBgUrl,   setEditBgUrl]   = useState<string | null>(null);
  const [editDoctorIds, setEditDoctorIds] = useState<string[]>([]);
  const [editProgramIds, setEditProgramIds] = useState<string[]>([]);

  const [doctorOptions, setDoctorOptions] = useState<DoctorOption[]>([]);
  const [programOptions, setProgramOptions] = useState<ProgramOption[]>([]);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/doctors?pageSize=500&isActive=true')
      .then(r => r.json())
      .then(d => setDoctorOptions(d.doctors ?? []))
      .catch(() => {});
    fetch('/api/admin/healthcare-programs')
      .then(r => r.json())
      .then(d => setProgramOptions(d.programs ?? []))
      .catch(() => {});
  }, []);

  const load = useCallback(async (p = page) => {
    setLoading(true);
    const q   = new URLSearchParams({ page: String(p) });
    if (search) q.set('search', search);
    const res = await fetch(`/api/admin/product-categories?${q}`);
    const d   = await res.json();
    setCategories(d.categories ?? []);
    setTotal(d.total ?? 0);
    setPage(d.page ?? 1);
    setTotalPages(d.totalPages ?? 1);
    setLoading(false);
  }, [page, search]);

  useEffect(() => { load(1); }, [search]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(page); }, [page]);  // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchSubmit = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleCreate = async () => {
    if (!newName.trim()) { setCreateError('Myanmar name is required.'); return; }
    setSavingNew(true); setCreateError('');
    const res  = await fetch('/api/admin/product-categories', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newName.trim(), nameEn: newNameEn.trim(),
        descriptionMm: newDescMm.trim(), descriptionEn: newDescEn.trim(),
        iconUrl: newIconUrl, bgImageUrl: newBgUrl, doctorIds: newDoctorIds, programIds: newProgramIds, order: categories.length,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setCreateError(data.error); setSavingNew(false); return; }
    setNewName(''); setNewNameEn(''); setNewDescMm(''); setNewDescEn(''); setNewIconUrl(null); setNewBgUrl(null); setNewDoctorIds([]); setNewProgramIds([]); setCreating(false); setSavingNew(false);
    load(1);
  };

  const toggleNewDoctor = (id: string) => setNewDoctorIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);
  const toggleEditDoctor = (id: string) => setEditDoctorIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);
  const toggleNewProgram = (id: string) => setNewProgramIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);
  const toggleEditProgram = (id: string) => setEditProgramIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);

  const startEdit = (c: Category) => {
    setEditId(c.id); setEditName(c.name); setEditNameEn(c.nameEn ?? '');
    setEditDescMm(c.descriptionMm ?? ''); setEditDescEn(c.descriptionEn ?? '');
    setEditIconUrl(c.iconUrl); setEditBgUrl(c.bgImageUrl);
    setEditDoctorIds(c.doctors?.map(d => d.doctorId) ?? []);
    setEditProgramIds(c.programs?.map(p => p.programId) ?? []);
  };

  const handleEdit = async (id: string) => {
    if (!editName.trim()) return;
    const res = await fetch(`/api/admin/product-categories/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editName.trim(), nameEn: editNameEn.trim(),
        descriptionMm: editDescMm.trim(), descriptionEn: editDescEn.trim(),
        iconUrl: editIconUrl, bgImageUrl: editBgUrl, doctorIds: editDoctorIds, programIds: editProgramIds,
      }),
    });
    if (res.ok) { setEditId(null); load(page); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    await fetch(`/api/admin/product-categories/${deleteTarget.id}`, { method: 'DELETE' });
    setDeletingId(null);
    setDeleteTarget(null);
    load(page);
  };

  const move = async (c: Category, dir: -1 | 1) => {
    const idx = categories.findIndex(x => x.id === c.id);
    const swapWith = categories[idx + dir];
    if (!swapWith) return;
    setMovingId(c.id);
    await Promise.all([
      fetch(`/api/admin/product-categories/${c.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: swapWith.order }) }),
      fetch(`/api/admin/product-categories/${swapWith.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: c.order }) }),
    ]);
    setMovingId(null);
    load(page);
  };

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Product Categories</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total} categories</p>
        </div>
        {!creating && (
          <button
            onClick={() => { setCreating(true); setNewName(''); setNewNameEn(''); setCreateError(''); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ backgroundColor: PRIMARY }}
          >
            <Plus className="w-4 h-4" /> New Category
          </button>
        )}
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2ab5ad]/40 focus:border-[#2ab5ad]"
            placeholder="Search categories..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearchSubmit(); }}
          />
        </div>
        {searchInput && (
          <button
            onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Create form */}
      {creating && (
        <div className="bg-white rounded-2xl border-2 p-4 flex flex-col gap-3" style={{ borderColor: PRIMARY }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: PRIMARY }}>New Category</p>
          <div className="flex gap-2">
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false); }}
              placeholder="Myanmar name *"
              className={inp}
            />
            <input
              value={newNameEn}
              onChange={e => setNewNameEn(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false); }}
              placeholder="English name"
              className={inp}
            />
          </div>
          <div className="flex gap-2">
            <textarea
              value={newDescMm}
              onChange={e => setNewDescMm(e.target.value)}
              placeholder="Short description (Myanmar) — shown on landing page card"
              rows={2}
              className={inp + ' resize-none'}
            />
            <textarea
              value={newDescEn}
              onChange={e => setNewDescEn(e.target.value)}
              placeholder="Short description (English)"
              rows={2}
              className={inp + ' resize-none'}
            />
          </div>
          <div className="flex gap-4">
            <ImageUploadSlot label="Icon" url={newIconUrl} onChange={setNewIconUrl} />
            <ImageUploadSlot label="Background" url={newBgUrl} onChange={setNewBgUrl} />
          </div>
          <DoctorChecklist doctorOptions={doctorOptions} selected={newDoctorIds} onToggle={toggleNewDoctor} />
          <ProgramChecklist programOptions={programOptions} selected={newProgramIds} onToggle={toggleNewProgram} />
          <div className="flex gap-2">
            <button
              onClick={handleCreate} disabled={savingNew}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center gap-1.5"
              style={{ backgroundColor: PRIMARY }}
            >
              {savingNew ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest w-14">Order</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Myanmar Name</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">English Name</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Created</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="py-16 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" />
                </td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={5} className="py-16 text-center">
                  <Layers className="w-8 h-8 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No categories found.</p>
                </td></tr>
              ) : categories.map((c, i) => (
                <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => move(c, -1)} disabled={i === 0 || movingId !== null || !!search}
                        title={search ? 'Clear search to reorder' : undefined}
                        className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-20">
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button onClick={() => move(c, 1)} disabled={i === categories.length - 1 || movingId !== null || !!search}
                        title={search ? 'Clear search to reorder' : undefined}
                        className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-20">
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                  </td>

                  {editId === c.id ? (
                    <>
                      <td className="px-5 py-3.5" colSpan={4}>
                        <div className="flex flex-col gap-3">
                          <div className="flex gap-2">
                            <input
                              autoFocus
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') handleEdit(c.id); if (e.key === 'Escape') setEditId(null); }}
                              placeholder="Myanmar name *"
                              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-teal-400"
                            />
                            <input
                              value={editNameEn}
                              onChange={e => setEditNameEn(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') handleEdit(c.id); if (e.key === 'Escape') setEditId(null); }}
                              placeholder="English name"
                              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-teal-400"
                            />
                            <button onClick={() => handleEdit(c.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: PRIMARY }}>
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setEditId(null)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 shrink-0">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <textarea
                              value={editDescMm}
                              onChange={e => setEditDescMm(e.target.value)}
                              placeholder="Short description (Myanmar) — shown on landing page card"
                              rows={2}
                              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-teal-400 resize-none"
                            />
                            <textarea
                              value={editDescEn}
                              onChange={e => setEditDescEn(e.target.value)}
                              placeholder="Short description (English)"
                              rows={2}
                              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-teal-400 resize-none"
                            />
                          </div>
                          <div className="flex gap-4">
                            <ImageUploadSlot label="Icon" url={editIconUrl} onChange={setEditIconUrl} />
                            <ImageUploadSlot label="Background" url={editBgUrl} onChange={setEditBgUrl} />
                          </div>
                          <DoctorChecklist doctorOptions={doctorOptions} selected={editDoctorIds} onToggle={toggleEditDoctor} />
                          <ProgramChecklist programOptions={programOptions} selected={editProgramIds} onToggle={toggleEditProgram} />
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 overflow-hidden" style={{ backgroundColor: '#e6f7f7' }}>
                            {c.iconUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={c.iconUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Layers className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
                            )}
                          </div>
                          <span className="text-sm font-semibold text-gray-700">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-gray-500">{c.nameEn || <span className="text-gray-300 text-xs italic">—</span>}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => startEdit(c)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(c)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="w-8 h-8 rounded-lg text-xs font-semibold transition-colors"
                  style={p === page
                    ? { backgroundColor: PRIMARY, color: '#fff' }
                    : { color: '#6b7280' }}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-80 shadow-2xl">
            <h3 className="font-bold text-gray-800 mb-2">Delete category?</h3>
            <p className="text-sm text-gray-500 mb-5">
              <span className="font-medium text-gray-700">"{deleteTarget.name}"</span> will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 rounded-xl border text-sm font-medium text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={!!deletingId}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-60 flex items-center justify-center gap-2">
                {deletingId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
