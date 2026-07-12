'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Loader2, FileText, Plus,
  ChevronLeft, ChevronRight, Trash2, Globe, EyeOff,
} from 'lucide-react';

const PRIMARY = '#2ab5ad';

interface Blog {
  id: string; title: string; titleEn: string | null; slug: string;
  excerpt: string | null; imageUrl: string | null; category: string | null;
  isPublished: boolean; publishedAt: string | null; createdAt: string;
}

function DeleteModal({ blog, onClose, onDeleted }: { blog: Blog; onClose: () => void; onDeleted: () => void }) {
  const [loading, setLoading] = useState(false);
  const run = async () => {
    setLoading(true);
    await fetch(`/api/doctor/blogs/${blog.id}`, { method: 'DELETE' });
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

export default function DoctorBlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs]     = useState<Blog[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const pageSize = 12;
  const [deleteTarget, setDeleteTarget] = useState<Blog | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const q = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) q.set('search', search);
    const res  = await fetch(`/api/doctor/blogs?${q}`);
    const data = await res.json();
    setBlogs(data.blogs ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const togglePublished = async (b: Blog) => {
    setToggling(b.id);
    await fetch(`/api/doctor/blogs/${b.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !b.isPublished }),
    });
    setToggling(null);
    load();
  };

  const fmtDate = (s: string | null) => s ? new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Blogs</h1>
          <p className="text-sm text-gray-500 mt-0.5">Total {total} articles you&apos;ve written</p>
        </div>
        <button
          onClick={() => router.push('/doctor/blogs/new')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-[0_4px_14px_-4px_rgba(42,181,173,0.5)] hover:shadow-[0_6px_18px_-4px_rgba(42,181,173,0.6)] hover:-translate-y-px active:translate-y-0 transition-all"
          style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #1a9990 100%)` }}
        >
          <Plus size={16} /> Write Blog
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ab5ad]/40 focus:border-[#2ab5ad]"
          placeholder="Search your blogs..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)] overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3.5">
                <div className="bg-gray-100 rounded-xl animate-pulse h-11 w-15 shrink-0" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="bg-gray-100 rounded-md animate-pulse h-3 w-40" />
                  <div className="bg-gray-100 rounded-md animate-pulse h-2.5 w-24" />
                </div>
                <div className="bg-gray-100 rounded-full animate-pulse h-5 w-16 shrink-0" />
                <div className="bg-gray-100 rounded-full animate-pulse h-6 w-20 shrink-0" />
                <div className="bg-gray-100 rounded-md animate-pulse h-2.5 w-16 shrink-0" />
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <FileText size={40} strokeWidth={1.2} />
            <p className="mt-3 text-sm">You haven&apos;t written any blogs yet</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Article</th>
                <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Category</th>
                <th className="text-center px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider hidden lg:table-cell">Created</th>
                <th className="px-4 py-3.5 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {blogs.map(b => (
                <tr key={b.id} onClick={() => router.push(`/doctor/blogs/${b.id}`)} className="hover:bg-gray-50/60 transition-colors cursor-pointer">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      {b.imageUrl ? (
                        <img src={b.imageUrl} alt={b.title} className="h-11 w-15 rounded-xl object-cover border border-gray-100 shrink-0 shadow-sm" />
                      ) : (
                        <div className="h-11 w-15 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                          <FileText size={16} className="text-gray-300" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 truncate max-w-65">{b.title}</p>
                        {b.titleEn && <p className="text-xs text-gray-400 truncate max-w-65">{b.titleEn}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    {b.category
                      ? <span className="px-2.5 py-1 rounded-full bg-teal-50 text-[#2ab5ad] text-xs font-semibold">{b.category}</span>
                      : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3.5 text-center" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => togglePublished(b)}
                      disabled={toggling === b.id}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors disabled:opacity-60"
                      style={b.isPublished ? { backgroundColor: '#d1fae5', color: '#059669' } : { backgroundColor: '#f3f4f6', color: '#9ca3af' }}>
                      {toggling === b.id ? <Loader2 size={11} className="animate-spin" /> : b.isPublished ? <Globe size={11} /> : <EyeOff size={11} />}
                      {b.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-400 hidden lg:table-cell whitespace-nowrap">
                    {fmtDate(b.createdAt)}
                  </td>
                  <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setDeleteTarget(b)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && total > 0 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={15} />
              </button>
              <span className="text-xs text-gray-500 font-semibold px-2">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {deleteTarget && (
        <DeleteModal blog={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={() => { setDeleteTarget(null); load(); }} />
      )}
    </div>
  );
}
