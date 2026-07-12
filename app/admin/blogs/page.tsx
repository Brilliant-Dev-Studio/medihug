'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Loader2, FileText, Plus,
  ChevronLeft, ChevronRight, Trash2,
  Globe, EyeOff, ChevronDown,
} from 'lucide-react';

const PRIMARY = '#2ab5ad';

interface Blog {
  id: string;
  title: string;
  titleEn: string | null;
  slug: string;
  excerpt: string | null;
  imageUrl: string | null;
  category: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
}
interface BlogCategory { id: string; name: string; nameEn: string | null; }

/* ── Delete Modal ── */
function DeleteModal({ blog, onClose, onDeleted }: { blog: Blog; onClose: () => void; onDeleted: () => void }) {
  const [loading, setLoading] = useState(false);
  const run = async () => {
    setLoading(true);
    await fetch(`/api/admin/blogs/${blog.id}`, { method: 'DELETE' });
    setLoading(false);
    onDeleted();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 w-80 shadow-2xl">
        <h3 className="font-bold text-gray-800 mb-2">Delete blog?</h3>
        <p className="text-sm text-gray-500 mb-5">
          <span className="font-medium text-gray-700">{blog.title}</span> will be permanently deleted.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={run} disabled={loading}
            className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Category Select Dropdown ── */
function CategorySelect({ value, onChange, categories }: {
  value: string; onChange: (v: string) => void; categories: BlogCategory[];
}) {
  const [open, setOpen] = useState(false);
  const selected = categories.find(c => c.name === value);
  return (
    <div className="relative min-w-[180px]">
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border bg-gray-50 text-sm transition-colors ${open ? 'border-[#2ab5ad]' : 'border-gray-200'}`}>
        <span className={selected ? 'text-gray-800' : 'text-gray-400'}>
          {selected ? selected.name : 'All Categories'}
        </span>
        <ChevronDown size={13} className={`shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-52 overflow-y-auto">
            <button onClick={() => { onChange(''); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${value === '' ? 'text-[#2ab5ad] font-semibold' : 'text-gray-500'}`}>
              All Categories
            </button>
            {categories.map(c => (
              <button key={c.id} onClick={() => { onChange(c.name); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${value === c.name ? 'text-[#2ab5ad] font-semibold bg-teal-50' : 'text-gray-700'}`}>
                {c.name}
                {c.nameEn && <span className="text-xs text-gray-400 ml-1.5">{c.nameEn}</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Main Page ── */
export default function AdminBlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs]         = useState<Blog[]>([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('');
  const [isPublished, setIsPublished] = useState('');
  const [page, setPage]           = useState(1);
  const pageSize                  = 12;
  const [deleteTarget, setDeleteTarget] = useState<Blog | null>(null);
  const [categories, setCategories]     = useState<BlogCategory[]>([]);
  const [toggling, setToggling]         = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/blog-categories')
      .then(r => r.json())
      .then(d => setCategories(d.categories ?? []));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const q = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search)            q.set('search', search);
    if (category)          q.set('category', category);
    if (isPublished !== '') q.set('isPublished', isPublished);
    const res  = await fetch(`/api/admin/blogs?${q}`);
    const data = await res.json();
    setBlogs(data.blogs ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, search, category, isPublished]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const togglePublished = async (b: Blog) => {
    setToggling(b.id);
    await fetch(`/api/admin/blogs/${b.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !b.isPublished }),
    });
    setToggling(null);
    load();
  };

  const fmtDate = (s: string | null) => s ? new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const pageNums = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const nums: (number | '…')[] = [1];
    if (page > 3) nums.push('…');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) nums.push(i);
    if (page < totalPages - 2) nums.push('…');
    nums.push(totalPages);
    return nums;
  })();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Blogs</h1>
          <p className="text-sm text-gray-500 mt-0.5">Total {total} articles</p>
        </div>
        <button
          onClick={() => router.push('/admin/blogs/new')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-[0_4px_14px_-4px_rgba(42,181,173,0.5)] hover:shadow-[0_6px_18px_-4px_rgba(42,181,173,0.6)] hover:-translate-y-px active:translate-y-0 transition-all"
          style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #1a9990 100%)` }}
        >
          <Plus size={16} /> Create Blog
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ab5ad]/40 focus:border-[#2ab5ad]"
            placeholder="Search title..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <CategorySelect value={category} onChange={v => { setCategory(v); setPage(1); }} categories={categories} />
        <select
          className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ab5ad]/40 focus:border-[#2ab5ad]"
          value={isPublished}
          onChange={e => { setIsPublished(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="true">Published</option>
          <option value="false">Draft</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-[#2ab5ad]" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <FileText size={40} strokeWidth={1.2} />
            <p className="mt-3 text-sm">No blogs found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider w-8">#</th>
                <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Article</th>
                <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Category</th>
                <th className="text-center px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider hidden lg:table-cell">Published</th>
                <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider hidden xl:table-cell">Created</th>
                <th className="px-4 py-3.5 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {blogs.map((b, i) => (
                <tr key={b.id} onClick={() => router.push(`/admin/blogs/${b.id}`)} className="hover:bg-gray-50/60 transition-colors cursor-pointer">
                  {/* # */}
                  <td className="px-4 py-3.5 text-xs text-gray-400 font-medium">
                    {(page - 1) * pageSize + i + 1}
                  </td>
                  {/* Article */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      {b.imageUrl ? (
                        <img src={b.imageUrl} alt={b.title}
                          className="h-11 w-15 rounded-xl object-cover border border-gray-100 shrink-0 shadow-sm"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <div className="h-11 w-15 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                          <FileText size={16} className="text-gray-300" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 truncate max-w-65">{b.title}</p>
                        {b.titleEn && <p className="text-xs text-gray-400 truncate max-w-65">{b.titleEn}</p>}
                        <p className="text-[10px] text-gray-300 font-mono mt-0.5">/{b.slug}</p>
                      </div>
                    </div>
                  </td>
                  {/* Category */}
                  <td className="px-4 py-3.5">
                    {b.category
                      ? <span className="px-2.5 py-1 rounded-full bg-teal-50 text-[#2ab5ad] text-xs font-semibold">{b.category}</span>
                      : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  {/* Status toggle */}
                  <td className="px-4 py-3.5 text-center">
                    <button
                      onClick={e => { e.stopPropagation(); togglePublished(b); }}
                      disabled={toggling === b.id}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors disabled:opacity-60"
                      style={b.isPublished
                        ? { backgroundColor: '#d1fae5', color: '#059669' }
                        : { backgroundColor: '#f3f4f6', color: '#9ca3af' }}>
                      {toggling === b.id
                        ? <Loader2 size={11} className="animate-spin" />
                        : b.isPublished ? <Globe size={11} /> : <EyeOff size={11} />}
                      {b.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  {/* Published date */}
                  <td className="px-4 py-3.5 text-xs text-gray-500 hidden lg:table-cell whitespace-nowrap">
                    {fmtDate(b.publishedAt)}
                  </td>
                  {/* Created */}
                  <td className="px-4 py-3.5 text-xs text-gray-400 hidden xl:table-cell whitespace-nowrap">
                    {fmtDate(b.createdAt)}
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={e => { e.stopPropagation(); setDeleteTarget(b); }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination inside table card */}
        {!loading && total > 0 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={15} />
              </button>
              {pageNums.map((n, idx) =>
                n === '…'
                  ? <span key={`el-${idx}`} className="w-8 text-center text-xs text-gray-400">…</span>
                  : (
                    <button key={n} onClick={() => setPage(n)}
                      className="w-8 h-8 rounded-lg text-xs font-bold transition-colors"
                      style={n === page ? { background: `linear-gradient(135deg, ${PRIMARY} 0%, #1a9990 100%)`, color: '#fff' } : { color: '#6b7280' }}>
                      {n}
                    </button>
                  )
              )}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {deleteTarget && (
        <DeleteModal
          blog={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => { setDeleteTarget(null); load(); }}
        />
      )}
    </div>
  );
}
