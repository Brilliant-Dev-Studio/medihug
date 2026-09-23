'use client';

import Link from 'next/link';
import { CirclePlus, CircleMinus, UserCog, Pencil, Trash2, Undo2, ExternalLink, Coins } from 'lucide-react';
import type { LedgerEntry, LedgerRates, PointsAction } from './types';
import { dayHeading, fmtDate, fmtDateTime, fmtTime } from './types';

const TYPE = {
  EARNED:   { label: 'Earned',   bg: '#dcfce7', fg: '#15803d', Icon: CirclePlus },
  REDEEMED: { label: 'Used',     bg: '#ffedd5', fg: '#c2410c', Icon: CircleMinus },
  ADJUSTED: { label: 'Adjusted', bg: '#dbeafe', fg: '#1d4ed8', Icon: UserCog },
} as const;

/** The arithmetic behind an entry, at the rate in force when it was written. */
function howLine(e: LedgerEntry, rates: LedgerRates): string | null {
  if (e.type === 'ADJUSTED') return null;
  const rate = e.rateKs ?? (e.type === 'EARNED' ? rates.earn : rates.redeem);
  const approx = e.rateKs === null ? ' (at current rate)' : '';
  return e.type === 'EARNED'
    ? `${e.amountKs.toLocaleString()} Ks ÷ ${rate.toLocaleString()} Ks per point = ${e.points.toLocaleString()} points${approx}`
    : `${Math.abs(e.points).toLocaleString()} points × ${rate.toLocaleString()} Ks = ${e.amountKs.toLocaleString()} Ks discount${approx}`;
}

function SourceLink({ e }: { e: LedgerEntry }) {
  if (!e.source) return null;
  return e.source.href ? (
    <Link href={e.source.href} className="font-semibold text-gray-800 hover:underline inline-flex items-center gap-1">
      {e.source.label} <ExternalLink className="w-3 h-3 text-gray-300" />
    </Link>
  ) : <span className="font-semibold text-gray-500">{e.source.label}</span>;
}

/** Where a credit stands on expiry: when it expires, how much is left, or what was lost. */
function ExpiryLine({ e }: { e: LedgerEntry }) {
  const x = e.expiry;
  if (!x) return null;
  if (x.never) return <p className="text-[11px] text-blue-500 mt-0.5">Never expires</p>;
  if (x.expired > 0 && x.expiresAt) {
    return <p className="text-[11px] text-red-500 mt-0.5">Expired {fmtDate(x.expiresAt)} — {x.expired.toLocaleString()} point{x.expired === 1 ? '' : 's'} lost</p>;
  }
  if (x.remaining <= 0 || !x.expiresAt) return <p className="text-[11px] text-gray-400 mt-0.5">Fully used</p>;
  return (
    <p className={`text-[11px] mt-0.5 ${x.soon ? 'text-amber-600 font-semibold' : 'text-gray-400'}`}>
      Expires {fmtDate(x.expiresAt)}{x.remaining < e.points ? ` · ${x.remaining.toLocaleString()} of ${e.points.toLocaleString()} left` : ''}
    </p>
  );
}

/** One transaction as a plain sentence, with the detail underneath. */
function Row({ e, rates, showUser, canManage, balance, onAction }: {
  e: LedgerEntry; rates: LedgerRates; showUser: boolean; canManage: boolean; balance: number | null; onAction: (a: PointsAction) => void;
}) {
  const t = TYPE[e.type];
  const voided = e.voidedAt !== null;
  const how = howLine(e, rates);
  const who = e.user
    ? <Link href={`/admin/points/users/${e.user.id}`} className="font-bold text-gray-900 hover:underline">{e.user.name}</Link>
    : null;

  return (
    <div className={`flex items-start gap-3 px-4 py-3.5 ${voided ? 'bg-gray-50/70' : ''}`}>
      <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: t.bg }}>
        <t.Icon className="w-[18px] h-[18px]" style={{ color: t.fg }} />
      </span>

      <div className="min-w-0 flex-1">
        <p className={`text-sm leading-snug ${voided ? 'text-gray-400' : 'text-gray-600'}`}>
          {showUser && who}{showUser && ' '}
          {e.type === 'EARNED' && <>earned points from <SourceLink e={e} /></>}
          {e.type === 'REDEEMED' && <>used points on <SourceLink e={e} /></>}
          {e.type === 'ADJUSTED' && <>{showUser ? 'had' : 'Had'} points <b>{e.points > 0 ? 'added' : 'deducted'}</b> by {e.createdByAdminName ?? 'SuperAdmin'}</>}
          {voided && <span className="ml-2 align-middle text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-500">Deleted</span>}
        </p>

        <p className="text-xs text-gray-400 mt-0.5">
          {fmtTime(e.createdAt)}
          {e.source && ` · ${e.source.detail}`}
          {showUser && e.user && ` · ${e.user.phone}`}
        </p>

        {how && <p className="text-[11px] text-gray-400 mt-0.5">{how}</p>}
        {!voided && e.expiry && <ExpiryLine e={e} />}
        {e.note && <p className="text-xs text-gray-600 mt-1">“{e.note}”</p>}
        {e.editedAt && <p className="text-[11px] text-gray-400 mt-0.5">Edited by {e.editedByAdminName} · {fmtDateTime(e.editedAt)}</p>}
        {voided && (
          <p className="text-[11px] text-red-400 mt-0.5">
            Deleted by {e.voidedByAdminName} · {fmtDateTime(e.voidedAt as string)}{e.voidReason ? ` — “${e.voidReason}”` : ''}
          </p>
        )}
      </div>

      <div className="text-right shrink-0">
        <p className={`text-base font-bold ${voided ? 'line-through text-gray-400' : e.points > 0 ? 'text-green-600' : 'text-orange-600'}`}>
          {e.points > 0 ? '+' : '−'}{Math.abs(e.points).toLocaleString()}
        </p>
        <p className="text-[10px] uppercase tracking-wide text-gray-400">{t.label}</p>
        {e.balanceAfter !== undefined && e.balanceAfter !== null && !voided && (
          <p className="text-[11px] text-gray-400 mt-0.5">Balance {e.balanceAfter.toLocaleString()}</p>
        )}
        {canManage && (
          <div className="flex items-center justify-end gap-0.5 mt-1.5">
            {voided ? (
              <button onClick={() => onAction({ kind: 'restore', entry: e, balance })} title="Restore" aria-label="Restore"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-teal-600 hover:bg-teal-50">
                <Undo2 className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button onClick={() => onAction({ kind: 'edit', entry: e, balance })} title="Edit" aria-label="Edit"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => onAction({ kind: 'void', entry: e, balance })} title="Delete" aria-label="Delete"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PointsFeed({ entries, rates, showUser, canManage, balance, onAction, loading, dimmed, onClearFilters }: {
  entries: LedgerEntry[]; rates: LedgerRates; showUser: boolean; canManage: boolean; balance: number | null;
  onAction: (a: PointsAction) => void; loading?: boolean; dimmed?: boolean; onClearFilters?: () => void;
}) {
  if (loading) {
    return (
      <div className="flex flex-col divide-y divide-gray-50" aria-busy="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-4">
            <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse shrink-0" />
            <div className="flex-1 flex flex-col gap-2"><div className="h-4 w-2/3 rounded bg-gray-100 animate-pulse" /><div className="h-3 w-1/3 rounded bg-gray-100 animate-pulse" /></div>
            <div className="h-5 w-10 rounded bg-gray-100 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="py-16 text-center">
        <Coins className="w-9 h-9 mx-auto text-gray-200 mb-2" />
        <p className="text-sm text-gray-500 font-medium">No points activity found</p>
        <p className="text-xs text-gray-400 mt-1">Try widening the date range or clearing the filters.</p>
        {onClearFilters && (
          <button onClick={onClearFilters} className="mt-3 text-sm font-semibold text-teal-600 hover:underline">Clear filters</button>
        )}
      </div>
    );
  }

  // Group by calendar day (entries arrive newest-first, so groups do too).
  const groups: { heading: string; items: LedgerEntry[] }[] = [];
  for (const e of entries) {
    const heading = dayHeading(e.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.heading === heading) last.items.push(e); else groups.push({ heading, items: [e] });
  }

  return (
    <div className={`flex flex-col transition-opacity ${dimmed ? 'opacity-50 pointer-events-none' : ''}`}>
      {groups.map(g => (
        <div key={g.heading}>
          <p className="px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 border-y border-gray-100">{g.heading}</p>
          <div className="divide-y divide-gray-50">
            {g.items.map(e => <Row key={e.id} e={e} rates={rates} showUser={showUser} canManage={canManage} balance={balance} onAction={onAction} />)}
          </div>
        </div>
      ))}
    </div>
  );
}
