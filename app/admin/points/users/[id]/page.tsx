'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Coins, Plus, Minus, Phone } from 'lucide-react';
import PointsFeed from '@/components/admin/points/PointsFeed';
import PointsActionModal from '@/components/admin/points/PointsActionModal';
import { BySourceTable, ExpiryCards, FilterBar, Pager, SummaryCards } from '@/components/admin/points/PointsParts';
import { useLedgerUrlState } from '@/components/admin/points/useLedgerUrlState';
import { filtersToParams, type LedgerEntry, type LedgerExpiry, type LedgerRates, type LedgerSummary, type PointsAction } from '@/components/admin/points/types';
import { hasPermission } from '@/lib/permissions';

interface Statement {
  entries: LedgerEntry[]; total: number; pageSize: number; summary: LedgerSummary; rates: LedgerRates; expiry: LedgerExpiry;
  user?: { id: string; name: string; phone: string; isActive: boolean }; balance?: number;
}

function UserInner() {
  const { id } = useParams<{ id: string }>();
  const { filters, page, setFilters, setPage, clear } = useLedgerUrlState();
  const key = filtersToParams(filters, { userId: id, page: String(page) }).toString();

  const [data, setData] = useState<Statement | null>(null);
  const [loadedKey, setLoadedKey] = useState('');
  const [missing, setMissing] = useState(false);
  const [action, setAction] = useState<PointsAction | null>(null);
  const [tick, setTick] = useState(0);
  const [canManage, setCanManage] = useState(false);

  useEffect(() => {
    fetch('/api/admin/me').then(r => r.json()).then(d => setCanManage(!!d.admin?.role && hasPermission(d.admin.role, 'settings.manage'))).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/admin/points-ledger?${key}`);
      const d = await res.json().catch(() => null);
      if (cancelled) return;
      if (res.ok && d?.user) { setData(d); setLoadedKey(`${key}#${tick}`); } else setMissing(true);
    })();
    return () => { cancelled = true; };
  }, [key, tick]);

  const fetching = loadedKey !== `${key}#${tick}`;
  const refresh = useCallback(() => setTick(t => t + 1), []);

  if (missing) {
    return (
      <div className="flex flex-col items-center gap-3 py-24">
        <Coins className="w-10 h-10 text-gray-200" />
        <p className="text-sm text-gray-400">Patient not found.</p>
        <Link href="/admin/points/report" className="text-sm font-semibold text-teal-600 hover:underline">Back to Points Report</Link>
      </div>
    );
  }

  const user = data?.user;
  const balance = data?.balance ?? 0;

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/points/report" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-700 w-fit">
        <ArrowLeft className="w-4 h-4" /> Points Report
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <span className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#fef3c7' }}>
            <Coins className="w-6 h-6" style={{ color: '#d97706' }} />
          </span>
          <div className="min-w-0">
            {user ? (
              <>
                <h1 className="text-lg font-bold text-gray-800 truncate">{user.name}</h1>
                <a href={`tel:${user.phone}`} className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600"><Phone className="w-3.5 h-3.5" /> {user.phone}</a>
              </>
            ) : (
              <div className="flex flex-col gap-1.5"><div className="h-5 w-40 rounded bg-gray-100 animate-pulse" /><div className="h-4 w-28 rounded bg-gray-100 animate-pulse" /></div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-5 flex-wrap">
          <div className="sm:text-right">
            <p className="text-[11px] text-gray-400 uppercase tracking-widest">Balance</p>
            <p className="text-3xl font-bold text-amber-600">{data ? balance.toLocaleString() : '—'}</p>
            {data && <p className="text-[11px] text-gray-400">≈ {(balance * data.rates.redeem).toLocaleString()} Ks discount</p>}
          </div>
          {canManage && user && (
            <div className="flex items-center gap-2">
              <button onClick={() => setAction({ kind: 'adjust', user, balance, direction: 'credit' })}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90" style={{ backgroundColor: '#16a34a' }}>
                <Plus className="w-4 h-4" /> Add
              </button>
              <button onClick={() => setAction({ kind: 'adjust', user, balance, direction: 'debit' })}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90" style={{ backgroundColor: '#dc2626' }}>
                <Minus className="w-4 h-4" /> Deduct
              </button>
            </div>
          )}
        </div>
      </div>

      {data && (
        <>
          <SummaryCards summary={data.summary} filters={filters} onFilter={setFilters} />
          <ExpiryCards expiry={data.expiry} />
          <BySourceTable summary={data.summary} />
        </>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <FilterBar value={filters} onChange={setFilters} onClear={clear}
            exportHref={`/api/admin/points-ledger?${filtersToParams(filters, { userId: id, format: 'csv' })}`} />
        </div>
        <PointsFeed
          entries={data?.entries ?? []} rates={data?.rates ?? { earn: 1000, redeem: 1000 }}
          showUser={false} canManage={canManage} balance={data ? balance : null} onAction={setAction}
          loading={!data} dimmed={fetching} onClearFilters={clear}
        />
        {data && <div className="p-4 border-t border-gray-100"><Pager page={page} pageSize={data.pageSize} total={data.total} onPage={setPage} /></div>}
      </div>

      <PointsActionModal action={action} onClose={() => setAction(null)} onDone={refresh} expiryEnabled={data?.expiry.enabled ?? false} />
    </div>
  );
}

export default function PointsUserPage() {
  return (
    <Suspense fallback={<div className="flex flex-col gap-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />)}</div>}>
      <UserInner />
    </Suspense>
  );
}
