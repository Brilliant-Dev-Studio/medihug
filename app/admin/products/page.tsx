'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Plus, Loader2, CheckCircle2, XCircle,
  Package, ChevronLeft, ChevronRight, Edit2, Trash2,
} from 'lucide-react';

const PRIMARY = '#2ab5ad';

interface Product {
  id: string;
  name: string;
  nameEn: string | null;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  category: string | null;
  isActive: boolean;
  createdAt: string;
}

/* ── Delete Confirm Modal ── */
function DeleteModal({ product, onClose, onDeleted }: {
  product: Product; onClose: () => void; onDeleted: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
    setLoading(false);
    onDeleted();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 w-80 shadow-2xl">
        <h3 className="font-bold text-gray-800 mb-2">Delete product?</h3>
        <p className="text-sm text-gray-500 mb-5">
          <span className="font-medium text-gray-700">{product.name}</span> will be permanently deleted.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border text-sm font-medium text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleDelete} disabled={loading}
            className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts]   = useState<Product[]>([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('');
  const [isActive, setIsActive]   = useState('');
  const [page, setPage]           = useState(1);
  const pageSize                  = 12;
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const q = new URLSearchParams({
      page: String(page), pageSize: String(pageSize),
      ...(search   ? { search }   : {}),
      ...(category ? { category } : {}),
      ...(isActive !== '' ? { isActive } : {}),
    });
    const res  = await fetch(`/api/admin/products?${q}`);
    const data = await res.json();
    setProducts(data.products ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, search, category, isActive]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const toggleActive = async (p: Product) => {
    await fetch(`/api/admin/products/${p.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    load();
  };

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
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">Total {total} products</p>
        </div>
        <button
          onClick={() => router.push('/admin/products/new')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-[0_4px_14px_-4px_rgba(42,181,173,0.5)] hover:shadow-[0_6px_18px_-4px_rgba(42,181,173,0.6)] hover:-translate-y-px active:translate-y-0 transition-all"
          style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #1a9990 100%)` }}
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ab5ad]/40 focus:border-[#2ab5ad]"
            placeholder="Search products..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <input
          className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ab5ad]/40 focus:border-[#2ab5ad] min-w-[160px]"
          placeholder="Filter by category..."
          value={category}
          onChange={e => { setCategory(e.target.value); setPage(1); }}
        />
        <select
          className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ab5ad]/40 focus:border-[#2ab5ad]"
          value={isActive}
          onChange={e => { setIsActive(e.target.value); setPage(1); }}
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-[#2ab5ad]" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Package size={40} strokeWidth={1.2} />
            <p className="mt-3 text-sm">No products found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Product</th>
                <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Category</th>
                <th className="text-right px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Price</th>
                <th className="text-right px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Stock</th>
                <th className="text-center px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Status</th>
                <th className="px-4 py-3.5 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map(p => (
                <tr key={p.id} onClick={() => router.push(`/admin/products/${p.id}`)} className="hover:bg-gray-50/60 transition-colors cursor-pointer">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name}
                          className="h-11 w-11 rounded-xl object-cover border border-gray-100 shrink-0 shadow-sm"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <div className="h-11 w-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                          <Package size={18} className="text-gray-300" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-800">{p.name}</p>
                        {p.nameEn && <p className="text-xs text-gray-400">{p.nameEn}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-gray-500">
                    {p.category
                      ? <span className="px-2.5 py-1 rounded-full bg-teal-50 text-[#2ab5ad] text-xs font-semibold">{p.category}</span>
                      : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold text-gray-800">
                    {p.price.toLocaleString()} Ks
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className={`font-semibold ${p.stock === 0 ? 'text-red-500' : p.stock < 10 ? 'text-amber-500' : 'text-gray-700'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <button
                      onClick={e => { e.stopPropagation(); toggleActive(p); }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors"
                      style={p.isActive
                        ? { backgroundColor: '#d1fae5', color: '#059669' }
                        : { backgroundColor: '#fee2e2', color: '#dc2626' }}
                    >
                      {p.isActive ? <><CheckCircle2 size={11} /> Active</> : <><XCircle size={11} /> Inactive</>}
                    </button>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={e => { e.stopPropagation(); router.push(`/admin/products/${p.id}`); }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#2ab5ad] transition-colors"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setDeleteTarget(p); }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      >
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
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
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
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {deleteTarget && (
        <DeleteModal
          product={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => { setDeleteTarget(null); load(); }}
        />
      )}
    </div>
  );
}
