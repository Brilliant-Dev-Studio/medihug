'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

interface Option { id: string; label: string; }

export default function SearchableSelect({
  options, value, onChange, placeholder = '-- ရွေးချယ်ပါ --', emptyText = 'No match',
}: {
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  emptyText?: string;
}) {
  const [open, setOpen]     = useState(false);
  const [query, setQuery]   = useState('');
  const rootRef             = useRef<HTMLDivElement>(null);
  const searchRef           = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    if (open) { setQuery(''); setTimeout(() => searchRef.current?.focus(), 0); }
  }, [open]);

  const filtered = options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()));
  const selected  = options.find(o => o.label === value);

  const inp = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-teal-400 transition-colors';

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={inp + ' pr-8 text-left flex items-center'}
      >
        <span className={selected ? 'text-gray-700' : 'text-gray-400'}>
          {selected ? selected.label : placeholder}
        </span>
      </button>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />

      {open && (
        <div className="absolute z-20 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="relative border-b border-gray-100">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              ref={searchRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2.5 text-sm outline-none text-gray-700"
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="px-3.5 py-3 text-xs text-gray-400">{emptyText}</p>
            )}
            {filtered.map(o => (
              <button
                key={o.id}
                type="button"
                onClick={() => { onChange(o.label); setOpen(false); }}
                className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-700">{o.label}</span>
                {o.label === value && <Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#2ab5ad' }} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
