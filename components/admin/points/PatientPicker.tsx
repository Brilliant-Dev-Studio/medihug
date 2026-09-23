'use client';

import { useEffect, useState } from 'react';
import { Search, X, Loader2, Coins } from 'lucide-react';

export interface PickedPatient { id: string; name: string; phone: string; balance: number }

/** Find a patient by name or phone, then hand them to the add/deduct flow. */
export default function PatientPicker({ open, onClose, onPick }: {
  open: boolean; onClose: () => void; onPick: (p: PickedPatient) => void;
}) {
  if (!open) return null;
  return <Inner onClose={onClose} onPick={onPick} />;
}

function Inner({ onClose, onPick }: { onClose: () => void; onPick: (p: PickedPatient) => void }) {
  const [q, setQ] = useState('');
  const [applied, setApplied] = useState('');
  const [results, setResults] = useState<PickedPatient[] | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setApplied(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/admin/points-report?${new URLSearchParams({ search: applied, pageSize: '8' })}`);
      const d = await res.json().catch(() => ({}));
      if (!cancelled) setResults(res.ok ? (d.patients ?? []) : []);
    })();
    return () => { cancelled = true; };
  }, [applied]);

  const loading = results === null || applied !== q.trim();

  return (
    <div className="fixed inset-0 z-100 flex items-start sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 pt-16 sm:pt-4" onClick={onClose}>
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-5 flex flex-col gap-3" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-50">
          <X className="w-4 h-4" />
        </button>
        <div>
          <h3 className="text-base font-bold text-gray-900">Choose a patient</h3>
          <p className="text-xs text-gray-400">Then add or deduct points for them.</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Name or phone…"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3.5 py-2.5 text-base sm:text-sm outline-none focus:border-teal-400" />
        </div>

        <div className="max-h-72 overflow-y-auto -mx-1 px-1 flex flex-col gap-1 min-h-[120px]">
          {loading && results === null ? (
            <div className="py-8 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-300" /></div>
          ) : (results ?? []).length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No patients found.</p>
          ) : (results ?? []).map(p => (
            <button key={p.id} onClick={() => onPick(p)}
              className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-gray-50 active:bg-gray-100">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                <p className="text-xs text-gray-400">{p.phone}</p>
              </div>
              <span className="flex items-center gap-1 text-sm font-bold text-amber-600 shrink-0"><Coins className="w-3.5 h-3.5" />{p.balance.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
