/* Points expiry — pure functions, no database.
 *
 * Each credit (earned points, or a manual credit) expires `value` days/months after the moment it
 * was created, unless it was marked "never expires". Debits (points used at checkout, manual
 * deductions) always spend the points that expire soonest first, and can only spend points that
 * hadn't expired yet at the moment of the debit. The balance right now is whatever is left of the
 * credits that haven't expired. Nothing is stored: it's recomputed from the ledger and the live
 * setting, so changing the setting applies to all points, past and future. */

export interface ExpiryConfig { enabled: boolean; value: number; unit: 'DAYS' | 'MONTHS' }
export const NO_EXPIRY: ExpiryConfig = { enabled: false, value: 12, unit: 'MONTHS' };

/** A ledger row as the engine sees it. Positive points = credit, negative = debit. */
export interface LedgerRow { id: string; points: number; createdAt: Date; noExpiry?: boolean }

export interface Lot {
  id: string;
  points: number;
  createdAt: Date;
  expiresAt: Date | null;
  /** Spent by later debits. */
  used: number;
  /** Lost to expiry (only once expiresAt has passed). */
  expired: number;
  /** Still spendable now. */
  remaining: number;
}

export function expiryDate(from: Date, cfg: ExpiryConfig): Date | null {
  if (!cfg.enabled) return null;
  const d = new Date(from);
  if (cfg.unit === 'DAYS') {
    d.setDate(d.getDate() + cfg.value);
  } else {
    const day = d.getDate();
    d.setMonth(d.getMonth() + cfg.value);
    if (d.getDate() !== day) d.setDate(0); // 31 Jan + 1 month -> 28/29 Feb, not 3 Mar
  }
  return d;
}

const byTime = (a: LedgerRow, b: LedgerRow) => a.createdAt.getTime() - b.createdAt.getTime() || a.id.localeCompare(b.id);

function process(rows: LedgerRow[], cfg: ExpiryConfig, upTo: Date | null, onEvent?: (row: LedgerRow, lots: Lot[]) => void): { lots: Lot[]; unmatched: number } {
  const lots: Lot[] = [];
  let unmatched = 0;
  for (const row of [...rows].sort(byTime)) {
    if (upTo && row.createdAt.getTime() > upTo.getTime()) break;
    if (row.points > 0) {
      lots.push({
        id: row.id, points: row.points, createdAt: row.createdAt,
        expiresAt: row.noExpiry ? null : expiryDate(row.createdAt, cfg),
        used: 0, expired: 0, remaining: row.points,
      });
    } else if (row.points < 0) {
      let need = -row.points;
      const t = row.createdAt.getTime();
      const spendable = lots
        .filter(l => l.remaining > 0 && (l.expiresAt === null || l.expiresAt.getTime() > t))
        .sort((a, b) => (a.expiresAt?.getTime() ?? Infinity) - (b.expiresAt?.getTime() ?? Infinity));
      for (const lot of spendable) {
        if (need <= 0) break;
        const take = Math.min(need, lot.remaining);
        lot.remaining -= take; lot.used += take; need -= take;
      }
      // Anything left in `need` had no unexpired points behind it — either it was spent under an
      // earlier, more generous expiry setting (it stays spent), or an edit/delete just removed the
      // credit it was drawn from. `unmatched` lets callers tell the two apart.
      unmatched += need;
    }
    onEvent?.(row, lots);
  }
  return { lots, unmatched };
}

function settle(lots: Lot[], at: Date): Lot[] {
  return lots.map(l => {
    const gone = l.expiresAt !== null && l.expiresAt.getTime() <= at.getTime();
    return { ...l, expired: gone ? l.remaining : 0, remaining: gone ? 0 : l.remaining };
  });
}

/** Balance and per-credit breakdown as of `now`. */
export function simulate(rows: LedgerRow[], cfg: ExpiryConfig, now: Date = new Date()) {
  const run = process(rows, cfg, null);
  const lots = settle(run.lots, now);
  return {
    lots,
    /** Points spent that no unexpired credit accounts for. */
    unmatched: run.unmatched,
    balance: lots.reduce((n, l) => n + l.remaining, 0),
    expiredTotal: lots.reduce((n, l) => n + l.expired, 0),
  };
}

/** Points that will expire within the next `days` days, and the earliest such date. */
export function expiringSoon(lots: Lot[], days: number, now: Date = new Date()): { points: number; date: Date | null } {
  const horizon = now.getTime() + days * 86400000;
  let points = 0; let date: Date | null = null;
  for (const l of lots) {
    if (l.remaining <= 0 || l.expiresAt === null) continue;
    const t = l.expiresAt.getTime();
    if (t > now.getTime() && t <= horizon) {
      points += l.remaining;
      if (!date || t < date.getTime()) date = l.expiresAt;
    }
  }
  return { points, date };
}

/** Balance right after each row, measured at that row's own moment (so expiry that had already
 * happened by then is reflected). Used for the "Balance after" column of a patient's statement. */
export function runningBalances(rows: LedgerRow[], cfg: ExpiryConfig): Map<string, number> {
  const out = new Map<string, number>();
  process(rows, cfg, null, (row, lots) => {
    out.set(row.id, settle(lots, row.createdAt).reduce((n, l) => n + l.remaining, 0));
  });
  return out;
}

export function describePeriod(cfg: Pick<ExpiryConfig, 'value' | 'unit'>): string {
  const unit = cfg.unit === 'DAYS' ? 'day' : 'month';
  return `${cfg.value} ${unit}${cfg.value === 1 ? '' : 's'}`;
}
