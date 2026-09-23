'use client';

import { useRef, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Download, FilterX } from 'lucide-react';
import type { LedgerExpiry, LedgerFilters, LedgerSummary } from './types';
import { DATE_PRESETS, SOURCE_LABEL, activeFilterCount, activePreset, fmtDate } from './types';

const inp = 'bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-teal-400 transition-colors';

export function StatCard({ label, value, sub, tone, active, onClick }: {
  label: string; value: string; sub?: string; tone?: string; active?: boolean; onClick?: () => void;
}) {
  const body = (
    <>
      <p className="text-[11px] text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-bold" style={{ color: tone ?? '#1f2937' }}>{value}</p>
      {sub && <p className="text-[11px] text-gray-400">{sub}</p>}
    </>
  );
  const cls = 'text-left bg-white rounded-2xl border p-4 flex flex-col gap-1 transition-all';
  return onClick ? (
    <button onClick={onClick} className={`${cls} hover:shadow-sm hover:border-gray-200`}
      style={{ borderColor: active ? tone : '#f3f4f6', boxShadow: active ? `0 0 0 2px ${tone}33` : undefined }}
      title={active ? 'Click to remove this filter' : 'Click to filter the list'}>
      {body}
    </button>
  ) : <div className={`${cls} border-gray-100`}>{body}</div>;
}

/** Summary cards double as one-click filters (Earned / Used / Adjusted / Deleted). */
export function SummaryCards({ summary, filters, onFilter, first }: {
  summary: LedgerSummary; filters: LedgerFilters; onFilter: (patch: Partial<LedgerFilters>) => void;
  first?: { label: string; value: string; sub?: string };
}) {
  const n = (x: number) => x.toLocaleString();
  const toggleType = (t: string) => onFilter({ type: filters.type === t ? '' : t });
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {first && <StatCard label={first.label} value={first.value} sub={first.sub} tone="#d97706" />}
      <StatCard label="Earned" value={`+${n(summary.earned.points)}`} sub={`${n(summary.earned.count)} purchases · ${n(summary.earned.ks)} Ks`}
        tone="#16a34a" active={filters.type === 'EARNED'} onClick={() => toggleType('EARNED')} />
      <StatCard label="Used" value={`−${n(summary.redeemed.points)}`} sub={`${n(summary.redeemed.count)} redemptions · ${n(summary.redeemed.ks)} Ks off`}
        tone="#c2410c" active={filters.type === 'REDEEMED'} onClick={() => toggleType('REDEEMED')} />
      <StatCard label="Adjusted (net)" value={`${summary.adjusted.points >= 0 ? '+' : '−'}${n(Math.abs(summary.adjusted.points))}`} sub={`${n(summary.adjusted.count)} manual entries`}
        tone="#1d4ed8" active={filters.type === 'ADJUSTED'} onClick={() => toggleType('ADJUSTED')} />
      <StatCard label="Deleted entries" value={n(summary.voidedCount)} sub="kept in history"
        tone="#6b7280" active={filters.status === 'voided'} onClick={() => onFilter({ status: filters.status === 'voided' ? 'all' : 'voided' })} />
    </div>
  );
}

/** Shown only while expiry is switched on: what has been lost, and what is about to be. */
export function ExpiryCards({ expiry }: { expiry: LedgerExpiry }) {
  if (!expiry.enabled) return null;
  const n = (x: number) => x.toLocaleString();
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard label="Expired (lost)" value={n(expiry.expiredTotal)} sub={`points expired ${expiry.value} ${expiry.unit === 'DAYS' ? 'day' : 'month'}${expiry.value === 1 ? '' : 's'} after earning`} tone="#dc2626" />
      <StatCard label="Expiring in 30 days" value={n(expiry.expiringSoon.points)}
        sub={expiry.expiringSoon.date ? `next on ${fmtDate(expiry.expiringSoon.date)}` : 'nothing about to expire'} tone="#d97706" />
    </div>
  );
}

export function BySourceTable({ summary }: { summary: LedgerSummary }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <p className="px-4 pt-3.5 pb-2 text-xs font-bold text-gray-500">Where points come from and go</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-widest text-gray-400 border-y border-gray-100 bg-gray-50">
              <th className="px-4 py-2 font-bold">Source</th>
              <th className="px-4 py-2 font-bold text-right">Earned</th>
              <th className="px-4 py-2 font-bold text-right">Used</th>
              <th className="px-4 py-2 font-bold text-right">Adjusted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {summary.bySource.map(r => (
              <tr key={r.source}>
                <td className="px-4 py-2.5 text-gray-700 font-medium">{SOURCE_LABEL[r.source]}</td>
                <td className="px-4 py-2.5 text-right text-green-600 font-semibold">{r.earned ? `+${r.earned.toLocaleString()}` : '—'}</td>
                <td className="px-4 py-2.5 text-right text-orange-600 font-semibold">{r.redeemed ? `−${r.redeemed.toLocaleString()}` : '—'}</td>
                <td className="px-4 py-2.5 text-right text-blue-600 font-semibold">{r.adjusted ? `${r.adjusted > 0 ? '+' : '−'}${Math.abs(r.adjusted).toLocaleString()}` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const chip = (on: boolean) =>
  `px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap ${on ? 'text-white border-transparent' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`;

export function FilterBar({ value, onChange, onClear, withSearch, exportHref }: {
  value: LedgerFilters; onChange: (patch: Partial<LedgerFilters>) => void; onClear: () => void;
  withSearch?: boolean; exportHref?: string;
}) {
  const preset = activePreset(value);
  const hasCustomDates = (value.from || value.to) && !preset;
  const active = activeFilterCount(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Bumped on Clear so the (uncontrolled) search box empties without remounting while you type.
  const [searchReset, setSearchReset] = useState(0);

  // Typing in search waits a moment before filtering, so every keystroke isn't its own request.
  const onSearch = (q: string) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange({ q: q.trim() }), 350);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {[{ v: '', l: 'All' }, { v: 'EARNED', l: 'Earned' }, { v: 'REDEEMED', l: 'Used' }, { v: 'ADJUSTED', l: 'Adjusted' }].map(t => (
          <button key={t.v} onClick={() => onChange({ type: t.v })} className={chip(value.type === t.v)}
            style={value.type === t.v ? { backgroundColor: '#0f766e' } : undefined}>{t.l}</button>
        ))}
        <span className="w-px h-5 bg-gray-200 mx-1 hidden sm:block" />
        <select value={value.source} onChange={e => onChange({ source: e.target.value })} className={`${inp} py-1.5 text-xs`} aria-label="Source">
          <option value="">Any source</option>
          <option value="CONSULTATION">Doctor booking</option>
          <option value="PRODUCT">Product order</option>
          <option value="PROGRAM">Program</option>
          <option value="MANUAL">Manual (SuperAdmin)</option>
        </select>
        <select value={value.status} onChange={e => onChange({ status: e.target.value })} className={`${inp} py-1.5 text-xs`} aria-label="Status">
          <option value="all">Active + deleted</option>
          <option value="active">Active only</option>
          <option value="voided">Deleted only</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {DATE_PRESETS.map(p => (
          <button key={p.key} onClick={() => onChange(preset === p.key ? { from: '', to: '' } : p.range())} className={chip(preset === p.key)}
            style={preset === p.key ? { backgroundColor: '#0f766e' } : undefined}>{p.label}</button>
        ))}
        <input type="date" value={value.from} onChange={e => onChange({ from: e.target.value })} className={`${inp} py-1.5 text-xs`} title="From" aria-label="From date" />
        <span className="text-xs text-gray-300">–</span>
        <input type="date" value={value.to} onChange={e => onChange({ to: e.target.value })} className={`${inp} py-1.5 text-xs`} title="To" aria-label="To date" />
        {hasCustomDates && <span className="text-[11px] text-gray-400">custom range</span>}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {withSearch && (
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input defaultValue={value.q} key={searchReset} onChange={e => onSearch(e.target.value)}
              placeholder="Search patient name, phone or note…" className={`${inp} w-full pl-9`} />
          </div>
        )}
        {active > 0 && (
          <button onClick={() => { setSearchReset(n => n + 1); onClear(); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50">
            <FilterX className="w-3.5 h-3.5" /> Clear {active} filter{active === 1 ? '' : 's'}
          </button>
        )}
        {exportHref && (
          <a href={exportHref} download className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </a>
        )}
      </div>
    </div>
  );
}

export function Pager({ page, pageSize, total, onPage }: { page: number; pageSize: number; total: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap px-1">
      <p className="text-xs text-gray-400">
        {total === 0 ? 'No entries' : `Showing ${from.toLocaleString()}–${to.toLocaleString()} of ${total.toLocaleString()}`}
      </p>
      {pages > 1 && (
        <div className="flex items-center gap-1.5">
          <button onClick={() => onPage(Math.max(1, page - 1))} disabled={page <= 1} aria-label="Previous page"
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-xs text-gray-500 px-1">Page {page} / {pages}</span>
          <button onClick={() => onPage(Math.min(pages, page + 1))} disabled={page >= pages} aria-label="Next page"
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  );
}
