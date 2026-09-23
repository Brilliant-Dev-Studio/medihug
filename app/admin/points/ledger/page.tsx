'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { Coins, Plus } from 'lucide-react';
import PointsFeed from '@/components/admin/points/PointsFeed';
import PointsActionModal from '@/components/admin/points/PointsActionModal';
import PatientPicker from '@/components/admin/points/PatientPicker';
import { BySourceTable, ExpiryCards, FilterBar, Pager, SummaryCards } from '@/components/admin/points/PointsParts';
import { useLedgerUrlState } from '@/components/admin/points/useLedgerUrlState';
import { filtersToParams, type LedgerEntry, type LedgerExpiry, type LedgerRates, type LedgerSummary, type PointsAction } from '@/components/admin/points/types';
import { hasPermission } from '@/lib/permissions';

interface Ledger { entries: LedgerEntry[]; total: number; pageSize: number; summary: LedgerSummary; rates: LedgerRates; expiry: LedgerExpiry; outstanding?: number }

function LedgerInner() {
  const { filters, page, setFilters, setPage, clear } = useLedgerUrlState();
  const key = filtersToParams(filters, { page: String(page) }).toString();

  const [data, setData] = useState<Ledger | null>(null);
  const [loadedKey, setLoadedKey] = useState('');
  const [tick, setTick] = useState(0);
  const [action, setAction] = useState<PointsAction | null>(null);
  const [picking, setPicking] = useState(false);
  const [canManage, setCanManage] = useState(false);

  useEffect(() => {
    fetch('/api/admin/me').then(r => r.json()).then(d => setCanManage(!!d.admin?.role && hasPermission(d.admin.role, 'settings.manage'))).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/admin/points-ledger?${key}`);
      const d = await res.json().catch(() => null);
      if (!cancelled && res.ok && d) { setData(d); setLoadedKey(`${key}#${tick}`); }
    })();
    return () => { cancelled = true; };
  }, [key, tick]);

  const fetching = loadedKey !== `${key}#${tick}`;
  const refresh = useCallback(() => setTick(t => t + 1), []);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#fef3c7' }}>
            <Coins className="w-4.5 h-4.5" style={{ color: '#d97706' }} />
          </span>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Points Ledger</h1>
            <p className="text-sm text-gray-400 mt-0.5">Every points transaction — who earned or used points, where, and how.</p>
          </div>
        </div>
        {canManage && (
          <button onClick={() => setPicking(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90" style={{ backgroundColor: '#2ab5ad' }}>
            <Plus className="w-4 h-4" /> Add / deduct points
          </button>
        )}
      </div>

      {data ? (
        <>
          <SummaryCards summary={data.summary} filters={filters} onFilter={setFilters}
            first={{ label: 'Points outstanding', value: (data.outstanding ?? 0).toLocaleString(), sub: 'all patients, live balance' }} />
          <ExpiryCards expiry={data.expiry} />
          <BySourceTable summary={data.summary} />
        </>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />)}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <FilterBar value={filters} onChange={setFilters} onClear={clear} withSearch
            exportHref={`/api/admin/points-ledger?${filtersToParams(filters, { format: 'csv' })}`} />
        </div>
        <PointsFeed
          entries={data?.entries ?? []} rates={data?.rates ?? { earn: 1000, redeem: 1000 }}
          showUser canManage={canManage} balance={null} onAction={setAction}
          loading={!data} dimmed={fetching} onClearFilters={clear}
        />
        {data && <div className="p-4 border-t border-gray-100"><Pager page={page} pageSize={data.pageSize} total={data.total} onPage={setPage} /></div>}
      </div>

      <PatientPicker open={picking} onClose={() => setPicking(false)}
        onPick={p => { setPicking(false); setAction({ kind: 'adjust', user: { id: p.id, name: p.name, phone: p.phone }, balance: p.balance, direction: 'credit' }); }} />
      <PointsActionModal action={action} onClose={() => setAction(null)} onDone={refresh} expiryEnabled={data?.expiry.enabled ?? false} />
    </div>
  );
}

export default function PointsLedgerPage() {
  return (
    <Suspense fallback={<div className="flex flex-col gap-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />)}</div>}>
      <LedgerInner />
    </Suspense>
  );
}
