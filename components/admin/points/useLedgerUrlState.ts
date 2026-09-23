'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FILTER_KEYS, type LedgerFilters } from './types';

/** Filters + page live in the URL, so a filtered ledger can be bookmarked / shared and the
 * browser Back button steps through filter changes. Pages using this must sit under <Suspense>. */
export function useLedgerUrlState() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo<LedgerFilters>(() => ({
    type: sp.get('type') ?? '', source: sp.get('source') ?? '', status: sp.get('status') ?? 'all',
    from: sp.get('from') ?? '', to: sp.get('to') ?? '', q: sp.get('q') ?? '',
  }), [sp]);
  const page = Math.max(1, parseInt(sp.get('page') ?? '1') || 1);

  const replace = useCallback((mutate: (p: URLSearchParams) => void) => {
    const p = new URLSearchParams(sp.toString());
    mutate(p);
    const qs = p.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [sp, router, pathname]);

  const setFilters = useCallback((patch: Partial<LedgerFilters>) => replace(p => {
    (Object.keys(patch) as (keyof LedgerFilters)[]).forEach(k => {
      const v = patch[k];
      if (!v || (k === 'status' && v === 'all')) p.delete(k); else p.set(k, v);
    });
    p.delete('page');
  }), [replace]);

  const setPage = useCallback((n: number) => replace(p => { if (n <= 1) p.delete('page'); else p.set('page', String(n)); }), [replace]);
  const clear = useCallback(() => replace(p => { FILTER_KEYS.forEach(k => p.delete(k)); p.delete('page'); }), [replace]);

  return { filters, page, setFilters, setPage, clear };
}
