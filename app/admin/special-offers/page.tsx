'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus, Loader2, Trash2, Pencil, Megaphone,
  Eye, EyeOff, ArrowUp, ArrowDown, GripVertical,
} from 'lucide-react';
import type { Offer } from './OfferForm';

const PRIMARY = '#2ab5ad';

/* ── Delete confirm ── */
function DeleteModal({ offer, onClose, onDeleted }: { offer: Offer; onClose: () => void; onDeleted: () => void }) {
  const [loading, setLoading] = useState(false);
  const run = async () => {
    setLoading(true);
    await fetch(`/api/admin/special-offers/${offer.id}`, { method: 'DELETE' });
    setLoading(false);
    onDeleted();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 w-80 shadow-2xl">
        <h3 className="font-bold text-gray-800 mb-2">Delete offer?</h3>
        <p className="text-sm text-gray-500 mb-5">
          <span className="font-medium text-gray-700">{offer.titleMm}</span> will be permanently deleted.
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

export default function AdminSpecialOffersPage() {
  const router = useRouter();
  const [offers,  setOffers]  = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Offer | null>(null);
  const [reordering, setReordering] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res  = await fetch('/api/admin/special-offers');
    const data = await res.json();
    setOffers(data.offers ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (o: Offer) => {
    await fetch(`/api/admin/special-offers/${o.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !o.isActive }),
    });
    load();
  };

  const move = async (o: Offer, dir: -1 | 1) => {
    const idx = offers.findIndex(x => x.id === o.id);
    const target = offers[idx + dir];
    if (!target) return;
    setReordering(o.id);
    await Promise.all([
      fetch(`/api/admin/special-offers/${o.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: target.order }),
      }),
      fetch(`/api/admin/special-offers/${target.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: o.order }),
      }),
    ]);
    setReordering(null);
    load();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Special Offers</h1>
          <p className="text-sm text-gray-500 mt-0.5">Banners shown on the patient dashboard · {offers.length} total</p>
        </div>
        <Link href="/admin/special-offers/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-[0_4px_14px_-4px_rgba(42,181,173,0.5)] hover:shadow-[0_6px_18px_-4px_rgba(42,181,173,0.6)] hover:-translate-y-px active:translate-y-0 transition-all"
          style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #1a9990 100%)` }}>
          <Plus className="w-4 h-4" /> Create Offer
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-[#2ab5ad]" />
          </div>
        ) : offers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Megaphone size={40} strokeWidth={1.2} />
            <p className="mt-3 text-sm">No special offers yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider w-10" />
                <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Offer</th>
                <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Badge</th>
                <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">CTA</th>
                <th className="text-center px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Status</th>
                <th className="px-4 py-3.5 w-28" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {offers.map((o, i) => (
                <tr key={o.id} onClick={() => router.push(`/admin/special-offers/${o.id}`)} className="hover:bg-gray-50/60 transition-colors cursor-pointer">
                  <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                    <div className="flex flex-col items-center gap-0.5">
                      <button disabled={i === 0 || reordering === o.id} onClick={() => move(o, -1)}
                        className="text-gray-300 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        <ArrowUp size={13} />
                      </button>
                      <GripVertical size={13} className="text-gray-200" />
                      <button disabled={i === offers.length - 1 || reordering === o.id} onClick={() => move(o, 1)}
                        className="text-gray-300 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        <ArrowDown size={13} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      {o.imageUrl ? (
                        <img src={o.imageUrl} alt={o.titleMm}
                          className="h-11 w-17 rounded-xl object-cover border border-gray-100 shrink-0 shadow-sm"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <div className="h-11 w-17 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                          <Megaphone size={16} className="text-gray-300" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 truncate max-w-55">{o.titleMm}</p>
                        {o.titleEn && <p className="text-xs text-gray-400 truncate max-w-55">{o.titleEn}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2.5 py-1 rounded-full bg-teal-50 text-[#2ab5ad] text-xs font-semibold">{o.badgeMm}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${o.ctaColor}15`, color: o.ctaColor }}>
                      {o.ctaMm}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center" onClick={e => e.stopPropagation()}>
                    <button onClick={() => toggleActive(o)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors"
                      style={o.isActive ? { backgroundColor: '#d1fae5', color: '#059669' } : { backgroundColor: '#f3f4f6', color: '#9ca3af' }}>
                      {o.isActive ? <Eye size={11} /> : <EyeOff size={11} />}
                      {o.isActive ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/special-offers/${o.id}`}
                        className="p-1.5 rounded-lg hover:bg-teal-50 text-gray-400 hover:text-[#2ab5ad] transition-colors">
                        <Pencil size={15} />
                      </Link>
                      <button onClick={() => setDeleteTarget(o)}
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
      </div>

      {deleteTarget && (
        <DeleteModal offer={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={() => { setDeleteTarget(null); load(); }} />
      )}
    </div>
  );
}
