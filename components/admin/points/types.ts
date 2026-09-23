export interface LedgerEntry {
  id: string;
  type: 'EARNED' | 'REDEEMED' | 'ADJUSTED';
  points: number;
  amountKs: number;
  rateKs: number | null;
  note: string | null;
  createdAt: string;
  createdByAdminName: string | null;
  editedAt: string | null;
  editedByAdminName: string | null;
  voidedAt: string | null;
  voidedByAdminName: string | null;
  voidReason: string | null;
  sourceType: 'CONSULTATION' | 'PROGRAM' | 'PRODUCT' | null;
  sourceId: string | null;
  user?: { id: string; name: string; phone: string };
  source: { label: string; detail: string; href: string | null } | null;
  /** Balance right after this entry — only on a single patient's statement. */
  balanceAfter?: number | null;
  noExpiry?: boolean;
  /** For a credit while expiry is on: when it expires and how much of it is left / used / lost. */
  expiry?: { expiresAt: string | null; never: boolean; used: number; expired: number; remaining: number; soon: boolean } | null;
}

/** Expiry setting + headline numbers, as returned with a ledger / statement. */
export interface LedgerExpiry {
  enabled: boolean; value: number; unit: 'DAYS' | 'MONTHS';
  expiredTotal: number; expiringSoon: { points: number; date: string | null };
}

export interface LedgerRates { earn: number; redeem: number }

export interface LedgerSummary {
  earned: { points: number; count: number; ks: number };
  redeemed: { points: number; count: number; ks: number };
  adjusted: { points: number; count: number };
  voidedCount: number;
  bySource: { source: 'CONSULTATION' | 'PRODUCT' | 'PROGRAM' | 'MANUAL'; earned: number; redeemed: number; adjusted: number }[];
}

export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export type PointsAction =
  | { kind: 'adjust'; user: { id: string; name: string; phone: string }; balance: number; direction: 'credit' | 'debit' }
  | { kind: 'edit'; entry: LedgerEntry; balance: number | null }
  | { kind: 'void'; entry: LedgerEntry; balance: number | null }
  | { kind: 'restore'; entry: LedgerEntry; balance: number | null };

export const SOURCE_LABEL: Record<string, string> = {
  CONSULTATION: 'Doctor booking', PRODUCT: 'Product order', PROGRAM: 'Program', MANUAL: 'Manual (SuperAdmin)',
};

export function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/* ── filters (mirrored in the page URL so a filtered view can be shared / bookmarked) ── */
export interface LedgerFilters { type: string; source: string; status: string; from: string; to: string; q: string }
export const EMPTY_FILTERS: LedgerFilters = { type: '', source: '', status: 'all', from: '', to: '', q: '' };
export const FILTER_KEYS = Object.keys(EMPTY_FILTERS) as (keyof LedgerFilters)[];

export function filtersToParams(f: LedgerFilters, extra: Record<string, string>): URLSearchParams {
  const p = new URLSearchParams(extra);
  FILTER_KEYS.forEach(k => { if (f[k] && !(k === 'status' && f[k] === 'all')) p.set(k, f[k]); });
  return p;
}

export function activeFilterCount(f: LedgerFilters): number {
  return FILTER_KEYS.filter(k => (k === 'status' ? f[k] !== 'all' : f[k] !== '')).length;
}

const ymd = (d: Date) => d.toLocaleDateString('sv-SE'); // yyyy-mm-dd in local time

export const DATE_PRESETS = [
  { key: 'today', label: 'Today',      range: () => { const t = ymd(new Date()); return { from: t, to: t }; } },
  { key: '7d',    label: 'Last 7 days',  range: () => { const d = new Date(); d.setDate(d.getDate() - 6); return { from: ymd(d), to: ymd(new Date()) }; } },
  { key: '30d',   label: 'Last 30 days', range: () => { const d = new Date(); d.setDate(d.getDate() - 29); return { from: ymd(d), to: ymd(new Date()) }; } },
  { key: 'month', label: 'This month',   range: () => { const d = new Date(); d.setDate(1); return { from: ymd(d), to: ymd(new Date()) }; } },
] as const;

/** Which preset (if any) exactly matches the current from/to. */
export function activePreset(f: Pick<LedgerFilters, 'from' | 'to'>): string | null {
  return DATE_PRESETS.find(p => { const r = p.range(); return r.from === f.from && r.to === f.to; })?.key ?? null;
}

/** "Today", "Yesterday", or a readable date — for grouping the feed. */
export function dayHeading(iso: string): string {
  const d = new Date(iso);
  const start = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((start(new Date()) - start(d)) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}

export function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}
