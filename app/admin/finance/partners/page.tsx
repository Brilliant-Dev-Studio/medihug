'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Building2, Loader2, Download } from 'lucide-react';
import { toCsv } from '@/lib/csv';

const PRIMARY = '#2ab5ad';
const RANGES = ['daily', 'weekly', 'monthly', 'yearly', 'custom'] as const;
const todayStr = () => new Date().toISOString().slice(0, 10);
const monthAgoStr = () => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10); };

interface Partner {
  clinic: { id: string; name: string; nameEn: string | null; imageUrl: string | null; type: string } | null;
  sales: number; referrals: number; commission: number;
  payableUnsettled: number; settled: number; profit: number; programsListed: number;
}

function downloadCsv(filename: string, rows: Record<string, unknown>[], columns: string[]) {
  const blob = new Blob([toCsv(rows, columns)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function PartnerFinancePage() {
  const [range, setRange] = useState<typeof RANGES[number]>('monthly');
  const [customFrom, setCustomFrom] = useState(monthAgoStr());
  const [customTo, setCustomTo] = useState(todayStr());
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = new URLSearchParams({ range });
    if (range === 'custom') { q.set('from', customFrom); q.set('to', customTo); }
    fetch(`/api/admin/finance/partners?${q}`)
      .then(r => r.json())
      .then(d => { setPartners(d.partners ?? []); setLoading(false); })
      .catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, range === 'custom' ? customFrom : null, range === 'custom' ? customTo : null]);

  const totals = partners.reduce((s, p) => ({
    sales: s.sales + p.sales, commission: s.commission + p.commission,
    payable: s.payable + p.payableUnsettled, settled: s.settled + p.settled, profit: s.profit + p.profit,
  }), { sales: 0, commission: 0, payable: 0, settled: 0, profit: 0 });

  const exportCsv = () => downloadCsv(
    `partner-pnl-${range}-${todayStr()}.csv`,
    partners.map(p => ({
      partner: p.clinic?.nameEn ?? p.clinic?.name ?? 'Unknown', type: p.clinic?.type ?? '',
      sales: p.sales, referrals: p.referrals, commission: p.commission,
      payable: p.payableUnsettled, settled: p.settled, profit: p.profit, programsListed: p.programsListed,
    })),
    ['partner', 'type', 'sales', 'referrals', 'commission', 'payable', 'settled', 'profit', 'programsListed'],
  );

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#e6f7f7' }}>
            <Building2 className="w-4.5 h-4.5" style={{ color: PRIMARY }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Partner P&amp;L</h1>
            <p className="text-sm text-gray-500 mt-0.5">Sales, commission, payable &amp; settlement per partner</p>
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
          <button onClick={exportCsv} disabled={partners.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32"><Loader2 size={28} className="animate-spin text-[#2ab5ad]" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { label: 'Total Sales', value: totals.sales },
              { label: 'Platform Commission', value: totals.commission },
              { label: 'Unsettled Payable', value: totals.payable, color: '#dc2626' },
              { label: 'Settled', value: totals.settled, color: '#16a34a' },
              { label: 'Partner Profit', value: totals.profit, color: PRIMARY },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-4">
                <p className="text-xs text-gray-400 mb-1">{c.label}</p>
                <p className="text-lg font-bold" style={{ color: c.color ?? '#374151' }}>{c.value.toLocaleString()} Ks</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {partners.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Building2 size={32} strokeWidth={1.2} />
                <p className="mt-2 text-xs">No partner activity in this period</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Partner</th>
                      <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sales</th>
                      <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Referrals</th>
                      <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Commission</th>
                      <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payable</th>
                      <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Settled</th>
                      <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Profit</th>
                      <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Programs Listed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {partners.map((p, i) => (
                      <tr key={p.clinic?.id ?? i} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                              {p.clinic?.imageUrl ? <Image src={p.clinic.imageUrl} alt="" width={28} height={28} className="object-cover w-full h-full" /> : <Building2 className="w-3.5 h-3.5 text-gray-300" />}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-700">{p.clinic?.nameEn ?? p.clinic?.name ?? 'Unknown'}</p>
                              <p className="text-[10px] text-gray-400">{p.clinic?.type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-700 text-right">{p.sales.toLocaleString()} Ks</td>
                        <td className="px-5 py-3.5 text-sm text-gray-500 text-right">{p.referrals}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-500 text-right">{p.commission.toLocaleString()} Ks</td>
                        <td className="px-5 py-3.5 text-sm text-right font-semibold" style={{ color: p.payableUnsettled > 0 ? '#dc2626' : '#9ca3af' }}>{p.payableUnsettled.toLocaleString()} Ks</td>
                        <td className="px-5 py-3.5 text-sm text-right" style={{ color: '#16a34a' }}>{p.settled.toLocaleString()} Ks</td>
                        <td className="px-5 py-3.5 text-sm font-bold text-right" style={{ color: PRIMARY }}>{p.profit.toLocaleString()} Ks</td>
                        <td className="px-5 py-3.5 text-sm text-gray-500 text-right">{p.programsListed || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 px-1">Payable/Settled reflect consultation referrals and clinic-owned bookings only — Program and Ads revenue have no per-partner split yet.</p>
        </>
      )}
    </div>
  );
}
