export type CurrencyCode = 'MMK' | 'THB' | 'USD';

export interface ProductPriceLike {
  price: number;
  priceThb?: number | null;
  priceUsd?: number | null;
}

export interface PriceEntry {
  code: CurrencyCode;
  amount: number;
  formatted: string;
  label: string;
}

export type CurrencyLabelOverrides = Partial<Record<CurrencyCode, string>>;

const DEFAULT_LABELS: Record<CurrencyCode, string> = { MMK: 'MMK', THB: 'Baht', USD: 'USD' };

function formatAmount(code: CurrencyCode, amount: number): string {
  return code === 'MMK'
    ? Math.round(amount).toLocaleString('en-US')
    : amount.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

/** Which currencies actually have a real value set on this product. Falls back to MMK so nothing renders blank. */
export function getActiveCurrencies(product: ProductPriceLike): CurrencyCode[] {
  const codes: CurrencyCode[] = [];
  if (product.price > 0) codes.push('MMK');
  if (product.priceThb != null && product.priceThb > 0) codes.push('THB');
  if (product.priceUsd != null && product.priceUsd > 0) codes.push('USD');
  return codes.length > 0 ? codes : ['MMK'];
}

/** One entry per currency actually entered for this product — for a single price display. */
export function getProductPriceEntries(product: ProductPriceLike, opts?: { labels?: CurrencyLabelOverrides }): PriceEntry[] {
  const labels = { ...DEFAULT_LABELS, ...opts?.labels };
  return getActiveCurrencies(product).map(code => {
    const amount = code === 'MMK' ? product.price : code === 'THB' ? (product.priceThb ?? 0) : (product.priceUsd ?? 0);
    return { code, amount, formatted: formatAmount(code, amount), label: labels[code] };
  });
}

/** Per-currency subtotals across a cart/checkout line list — amounts of different currencies are never blended together. */
export function sumProductPricesByCurrency(
  items: (ProductPriceLike & { quantity: number })[],
  opts?: { labels?: CurrencyLabelOverrides }
): PriceEntry[] {
  const labels = { ...DEFAULT_LABELS, ...opts?.labels };
  const totals: Partial<Record<CurrencyCode, number>> = {};
  for (const item of items) {
    for (const code of getActiveCurrencies(item)) {
      const amount = code === 'MMK' ? item.price : code === 'THB' ? (item.priceThb ?? 0) : (item.priceUsd ?? 0);
      totals[code] = (totals[code] ?? 0) + amount * item.quantity;
    }
  }
  return (Object.keys(totals) as CurrencyCode[]).map(code => {
    const amount = totals[code]!;
    return { code, amount, formatted: formatAmount(code, amount), label: labels[code] };
  });
}

/** Joins price entries into one display string, e.g. "12,000 MMK + 6 USD". */
export function formatPriceEntries(entries: PriceEntry[], opts?: { separator?: string }): string {
  const separator = opts?.separator ?? ' + ';
  return entries.map(e => `${e.formatted} ${e.label}`).join(separator);
}
