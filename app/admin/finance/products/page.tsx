'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Package, Loader2, Download, Search } from 'lucide-react';
import { toCsv } from '@/lib/csv';

const PRIMARY = '#2ab5ad';
const RANGES = ['daily', 'weekly', 'monthly', 'yearly', 'custom'] as const;
const todayStr = () => new Date().toISOString().slice(0, 10);
const monthAgoStr = () => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10); };

interface ProductRow {
  id: string; name: string; nameEn: string | null; imageUrl: string | null; isActive: boolean; hasSizes: boolean;
  purchasePrice: number; sellingPrice: number; qtySold: number; stockBalance: number;
  revenue: number; cogs: number; grossProfit: number; margin: number;
}

function downloadCsv(filename: string, rows: Record<string, unknown>[], columns: string[]) {
  const blob = new Blob([toCsv(rows, columns)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function ProductFinancePage() {
  const [range, setRange] = useState<typeof RANGES[number]>('monthly');
  const [customFrom, setCustomFrom] = useState(monthAgoStr());
  const [customTo, setCustomTo] = useState(todayStr());
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = new URLSearchParams({ range });
    if (range === 'custom') { q.set('from', customFrom); q.set('to', customTo); }
    if (search) q.set('search', search);
    fetch(`/api/admin/finance/products?${q}`)
      .then(r => r.json())
      .then(d => { setProducts(d.products ?? []); setLoading(false); })
      .catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, range === 'custom' ? customFrom : null, range === 'custom' ? customTo : null, search]);

  const totals = products.reduce((s, p) => ({ revenue: s.revenue + p.revenue, cogs: s.cogs + p.cogs, grossProfit: s.grossProfit + p.grossProfit, qtySold: s.qtySold + p.qtySold }),
    { revenue: 0, cogs: 0, grossProfit: 0, qtySold: 0 });

  const exportCsv = () => downloadCsv(
    `product-pnl-${range}-${todayStr()}.csv`,
    products.map(p => ({
      product: p.nameEn ?? p.name, purchasePrice: p.purchasePrice, sellingPrice: p.sellingPrice,
      qtySold: p.qtySold, stockBalance: p.stockBalance, revenue: p.revenue, cogs: p.cogs, grossProfit: p.grossProfit, marginPct: p.margin,
    })),
    ['product', 'purchasePrice', 'sellingPrice', 'qtySold', 'stockBalance', 'revenue', 'cogs', 'grossProfit', 'marginPct'],
  );

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#e6f7f7' }}>
            <Package className="w-4.5 h-4.5" style={{ color: PRIMARY }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Product P&amp;L</h1>
            <p className="text-sm text-gray-500 mt-0.5">Purchase price, selling price, COGS &amp; margin per product</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {RANGES.map(r => (
              <button key={r} onClick={() => setRange(r)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors"
                style={{ backgroundColor: range === r ? '#fff' : 'transparent', color: range === r ? PRIMARY : '#9ca3af', boxShadow: range === r ? '0 1px 2px rgba(0,0,0,0.06)' : 'none' }}>
                {r}
              </button>
            ))}
          </div>
          {range === 'custom' && (
            <div className="flex items-center gap-2">
              <input type="date" value={customFrom} max={customTo} onChange={e => setCustomFrom(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 outline-none focus:border-[#2ab5ad]" />
              <span className="text-xs text-gray-400">to</span>
              <input type="date" value={customTo} min={customFrom} max={todayStr()} onChange={e => setCustomTo(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 outline-none focus:border-[#2ab5ad]" />
            </div>
          )}
          <button onClick={exportCsv} disabled={products.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
          className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 bg-white text-xs outline-none focus:border-[#2ab5ad]" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-[#2ab5ad]" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Revenue', value: totals.revenue },
              { label: 'COGS', value: totals.cogs },
              { label: 'Gross Profit', value: totals.grossProfit, color: PRIMARY },
              { label: 'Units Sold', value: totals.qtySold, isCount: true },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-4">
                <p className="text-xs text-gray-400 mb-1">{c.label}</p>
                <p className="text-lg font-bold" style={{ color: c.color ?? '#374151' }}>{c.value.toLocaleString()}{c.isCount ? '' : ' Ks'}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Package size={32} strokeWidth={1.2} />
                <p className="mt-2 text-xs">No products found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product</th>
                      <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Purchase Price</th>
                      <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Selling Price</th>
                      <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Qty Sold</th>
                      <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Stock Balance</th>
                      <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">COGS</th>
                      <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gross Profit</th>
                      <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map(p => {
                      const name = p.nameEn ?? p.name;
                      return (
                        <tr key={p.id} className={`hover:bg-gray-50/60 transition-colors ${!p.isActive ? 'opacity-50' : ''}`}>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                                {p.imageUrl ? <Image src={p.imageUrl} alt={name} width={32} height={32} className="object-cover w-full h-full" /> : <Package className="w-3.5 h-3.5 text-gray-300" />}
                              </div>
                              <span className="text-sm font-semibold text-gray-700 truncate">{name}{p.hasSizes && <span className="ml-1 text-[10px] font-normal text-gray-400">(sized)</span>}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-gray-500 text-right">{p.purchasePrice > 0 ? `${p.purchasePrice.toLocaleString()} Ks` : <span className="text-gray-300 text-xs italic">no purchase data</span>}</td>
                          <td className="px-5 py-3.5 text-sm text-gray-700 text-right">{p.sellingPrice.toLocaleString()} Ks</td>
                          <td className="px-5 py-3.5 text-sm text-gray-500 text-right">{p.qtySold}</td>
                          <td className={`px-5 py-3.5 text-sm text-right font-semibold ${p.stockBalance === 0 ? 'text-red-500' : p.stockBalance < 10 ? 'text-amber-500' : 'text-gray-700'}`}>{p.stockBalance}</td>
                          <td className="px-5 py-3.5 text-sm text-gray-500 text-right">{p.cogs.toLocaleString()} Ks</td>
                          <td className="px-5 py-3.5 text-sm font-bold text-right" style={{ color: PRIMARY }}>{p.grossProfit.toLocaleString()} Ks</td>
                          <td className="px-5 py-3.5 text-sm text-gray-500 text-right">{p.margin}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 px-1">Purchase Price is a weighted average over every Purchase received for that product. Stock Balance is the patient-facing balance checkout checks — see Stock Ledger for per-location detail.</p>
        </>
      )}
    </div>
  );
}
