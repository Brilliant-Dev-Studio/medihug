'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

export interface ClinicOption { id: string; name: string; nameEn: string | null; type: string; }

/** Multi-select dropdown for assigning a product to one or more partner clinics — shared
 * between the product create and edit forms so both stay in sync. */
export default function ClinicMultiSelect({ selected, onChange, clinics }: {
  selected: ClinicOption[]; onChange: (c: ClinicOption[]) => void; clinics: ClinicOption[];
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen]   = useState(false);
  const ref               = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const selectedIds = selected.map(c => c.id);
  const filtered = clinics.filter(c =>
    !selectedIds.includes(c.id) &&
    (!query || c.name.toLowerCase().includes(query.toLowerCase()) || (c.nameEn ?? '').toLowerCase().includes(query.toLowerCase()))
  );
  const toggle = (c: ClinicOption) => {
    onChange(selectedIds.includes(c.id) ? selected.filter(s => s.id !== c.id) : [...selected, c]);
    setQuery('');
  };
  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <div onClick={() => setOpen(o => !o)}
        className={`min-h-[42px] flex flex-wrap items-center gap-1.5 cursor-pointer rounded-xl border bg-gray-50 px-3 py-2 text-sm transition-colors ${open ? 'border-[#2ab5ad] ring-2 ring-[#2ab5ad]/40' : 'border-gray-200 hover:border-gray-300'}`}>
        {selected.length === 0
          ? <span className="text-gray-400 text-sm">Select partners... (optional)</span>
          : selected.map(c => (
              <span key={c.id} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-medium">
                {c.name}
                <button type="button" onClick={e => { e.stopPropagation(); toggle(c); }} className="text-teal-500 hover:text-red-500">
                  <X size={11} />
                </button>
              </span>
            ))}
        <ChevronDown size={13} className={`ml-auto text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>
      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input autoFocus className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#2ab5ad]"
                placeholder="Search partners..." value={query} onChange={e => setQuery(e.target.value)}
                onClick={e => e.stopPropagation()} />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0
              ? <p className="text-xs text-gray-400 text-center py-4">{query ? 'No partners found' : 'All partners selected'}</p>
              : filtered.map(c => (
                  <button key={c.id} type="button" onClick={() => toggle(c)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors">
                    <div className="w-6 h-6 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-bold text-teal-600">{c.type[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 font-medium truncate">{c.name}</p>
                      {c.nameEn && <p className="text-xs text-gray-400 truncate">{c.nameEn}</p>}
                    </div>
                  </button>
                ))}
          </div>
        </div>
      )}
    </div>
  );
}
