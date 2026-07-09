'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Check, X, Loader2, BookOpen, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import ImageDropzone from '@/components/admin/ImageDropzone';

const PRIMARY = '#2ab5ad';

interface BlogCategory { id: string; name: string; nameEn: string | null; imageUrl: string | null; createdAt: string; }

const inp = 'flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-teal-400 transition-colors';

export default function AdminBlogCategoriesPage() {
  const [categories,  setCategories]  = useState<BlogCategory[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [search,      setSearch]      = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [creating,    setCreating]    = useState(false);
  const [newName,     setNewName]     = useState('');
  const [newNameEn,   setNewNameEn]   = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [createError, setCreateError] = useState('');
  const [savingNew,   setSavingNew]   = useState(false);

  const [editId,       setEditId]       = useState<string | null>(null);
  const [editName,     setEditName]     = useState('');
  const [editNameEn,   setEditNameEn]   = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async (p = page) => {
    setLoading(true);
    const q = new URLSearchParams({ page: String(p) });
    if (search) q.set('search', search);
    const res  = await fetch(`/api/admin/blog-categories?${q}`);
    const data = await res.json();
    setCategories(data.categories ?? []);
    setTotal(data.total ?? 0);
    setPage(data.page ?? 1);
    setTotalPages(data.totalPages ?? 1);
    setLoading(false);
  }, [page, search]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(1); }, [search]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(page); }, [page]);  // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async () => {
    if (!newName.trim()) { setCreateError('Myanmar name လိုအပ်သည်'); return; }
    setSavingNew(true); setCreateError('');
    const res  = await fetch('/api/admin/blog-categories', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), nameEn: newNameEn.trim(), imageUrl: newImageUrl.trim() }),
    });
    const data = await res.json();
    if (!res.ok) { setCreateError(data.error); setSavingNew(false); return; }
    setNewName(''); setNewNameEn(''); setNewImageUrl(''); setCreating(false); setSavingNew(false);
    load(1);
  };

  const startEdit = (c: BlogCategory) => {
    setEditId(c.id); setEditName(c.name); setEditNameEn(c.nameEn ?? ''); setEditImageUrl(c.imageUrl ?? '');
  };

  const handleEdit = async (id: string) => {
    if (!editName.trim()) return;
    const res = await fetch(`/api/admin/blog-categories/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim(), nameEn: editNameEn.trim(), imageUrl: editImageUrl.trim() }),
    });
    if (res.ok) { setEditId(null); load(page); }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await fetch(`/api/admin/blog-categories/${id}`, { method: 'DELETE' });
    setDeletingId(null);
    load(page);
  };

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Blog Categories</h1>
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
            onKeyDown={e => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1); } }}
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
          <ImageDropzone label="Image (optional)" value={newImageUrl} onChange={setNewImageUrl} aspect="square" />
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={savingNew}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center gap-1.5"
              style={{ backgroundColor: PRIMARY }}>
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
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest w-8">#</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest w-12">Image</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Myanmar Name</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">English Name</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Created</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="py-16 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" />
                </td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center">
                  <BookOpen className="w-8 h-8 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No categories yet. Create one above.</p>
                </td></tr>
              ) : categories.map((c, i) => (
                <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5 text-xs text-gray-400">{(page - 1) * 15 + i + 1}</td>

                  {editId === c.id ? (
                    <>
                      <td className="px-5 py-3.5" colSpan={4}>
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <input autoFocus value={editName} onChange={e => setEditName(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') handleEdit(c.id); if (e.key === 'Escape') setEditId(null); }}
                              placeholder="Myanmar name *"
                              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-teal-400" />
                            <input value={editNameEn} onChange={e => setEditNameEn(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') handleEdit(c.id); if (e.key === 'Escape') setEditId(null); }}
                              placeholder="English name"
                              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-teal-400" />
                            <button onClick={() => handleEdit(c.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: PRIMARY }}>
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setEditId(null)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 shrink-0">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <ImageDropzone label="Image" value={editImageUrl} onChange={setEditImageUrl} aspect="square" />
                        </div>
                      </td>
                      <td /><td />
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-3.5">
                        {c.imageUrl
                          ? <img src={c.imageUrl} alt={c.name} className="w-9 h-9 rounded-full object-cover border border-gray-100" />
                          : <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#e6f7f7' }}>
                              <BookOpen className="w-4 h-4" style={{ color: PRIMARY }} />
                            </div>
                        }
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-semibold text-gray-700">{c.name}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-gray-500">{c.nameEn || <span className="text-gray-300 text-xs italic">—</span>}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button onClick={() => startEdit(c)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(c.id)} disabled={deletingId === c.id}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-400 transition-colors disabled:opacity-40">
                            {deletingId === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
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
                  style={p === page ? { backgroundColor: PRIMARY, color: '#fff' } : { color: '#6b7280' }}
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
    </div>
  );
}
