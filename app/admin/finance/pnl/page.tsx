'use client';

import { useState, useEffect } from 'react';
import { PieChart as PieChartIcon, Loader2, TrendingUp, TrendingDown, Wallet, Receipt, Stethoscope, Building2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PRIMARY = '#2ab5ad';

interface Overview {
  range: string;
  revenue: { consultation: number; product: number; program: number; ads: number; total: number };
  cost: { doctorPayout: number; gatewayFee: number; expenses: number; refunds: number; partnerPayout: number; txnCount: number };
  result: { grossProfit: number; netProfit: number; profitMargin: number };
  serviceBreakdown: { serviceType: string; sales: number; revenue: number; cost: number; netProfit: number; margin: number }[];
  doctorProfitability: { doctor: { id: string; name: string; nameEn: string | null; imageUrl: string | null } | null; patients: number; revenue: number; payout: number; commission: number }[];
  clinicProfitability: { clinic: { id: string; name: string; nameEn: string | null; imageUrl: string | null } | null; appointments: number; revenue: number; platformCommission: number; programRevenue: number; referralsReceived: number }[];
  series: { label: string; revenue: number; netProfit: number }[];
}

const SERVICE_LABEL: Record<string, string> = {
  CONSULTATION: 'Teleconsultation', PRODUCT: 'Products', PROGRAM: 'Programs', ADS: 'Advertisement',
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-lg px-3 py-2.5 text-xs">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="flex items-center gap-1.5" style={{ color: p.color }}>
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          {p.name}: {p.value.toLocaleString()} Ks
        </p>
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }: { icon: React.ElementType; label: string; value: string; color: string; bg: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)] p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold truncate text-gray-800">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

const RANGES = ['daily', 'weekly', 'monthly', 'yearly'] as const;

export default function PnlPage() {
  const [range, setRange] = useState<typeof RANGES[number]>('monthly');
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/finance/pnl?range=${range}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [range]);

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#e6f7f7' }}>
            <PieChartIcon className="w-4.5 h-4.5" style={{ color: PRIMARY }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Profit &amp; Loss</h1>
            <p className="text-sm text-gray-500 mt-0.5">Revenue − payout − gateway fees − expenses</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {RANGES.map(r => (
            <button key={r} onClick={() => setRange(r)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors"
              style={{ backgroundColor: range === r ? '#fff' : 'transparent', color: range === r ? PRIMARY : '#9ca3af', boxShadow: range === r ? '0 1px 2px rgba(0,0,0,0.06)' : 'none' }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading || !data ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 size={28} className="animate-spin text-[#2ab5ad]" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Wallet} label="Total Revenue" value={`${data.revenue.total.toLocaleString()} Ks`} color={PRIMARY} bg="#e6f7f7" />
            <StatCard icon={TrendingUp} label="Gross Profit" value={`${data.result.grossProfit.toLocaleString()} Ks`} color="#f59e0b" bg="#fffbeb" />
            <StatCard
              icon={data.result.netProfit >= 0 ? TrendingUp : TrendingDown}
              label={`Net Profit (${data.result.profitMargin}% margin)`}
              value={`${data.result.netProfit.toLocaleString()} Ks`}
              color={data.result.netProfit >= 0 ? '#16a34a' : '#dc2626'}
              bg={data.result.netProfit >= 0 ? '#f0fdf4' : '#fef2f2'}
            />
            <StatCard icon={Receipt} label="Operating Expenses" value={`${data.cost.expenses.toLocaleString()} Ks`} color="#9ca3af" bg="#f9fafb" />
          </div>

          {/* Cost breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
            <div><p className="text-xs text-gray-400 mb-1">Doctor Payout</p><p className="font-bold text-gray-700">{data.cost.doctorPayout.toLocaleString()} Ks</p></div>
            <div><p className="text-xs text-gray-400 mb-1">Partner Payout (Program/Ads)</p><p className="font-bold text-gray-700">{data.cost.partnerPayout.toLocaleString()} Ks</p></div>
            <div><p className="text-xs text-gray-400 mb-1">Gateway Fees ({data.cost.txnCount} txns)</p><p className="font-bold text-gray-700">{data.cost.gatewayFee.toLocaleString()} Ks</p></div>
            <div><p className="text-xs text-gray-400 mb-1">Operating Expenses</p><p className="font-bold text-gray-700">{data.cost.expenses.toLocaleString()} Ks</p></div>
            <div><p className="text-xs text-gray-400 mb-1">Refunds</p><p className="font-bold text-gray-700">{data.cost.refunds.toLocaleString()} Ks</p></div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-700 text-sm capitalize">{range} Trend</h2>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PRIMARY }} /> Revenue</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Net Profit</span>
              </div>
            </div>
            {data.series.every(s => s.revenue === 0 && s.netProfit === 0) ? (
              <div className="h-60 flex items-center justify-center text-sm text-gray-400">No completed transactions for this period</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={data.series} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.18} />
                      <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 1.5 }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke={PRIMARY} strokeWidth={2.5} fill="url(#gradRevenue)" dot={false} activeDot={{ r: 5, fill: PRIMARY, strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="netProfit" name="Net Profit" stroke="#fbbf24" strokeWidth={2.5} fill="url(#gradNet)" dot={false} activeDot={{ r: 5, fill: '#fbbf24', strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Service-wise profitability */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100"><h2 className="font-bold text-gray-700 text-sm">Service-wise Profitability</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Service</th>
                    <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sales</th>
                    <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Revenue</th>
                    <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cost</th>
                    <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Net Profit</th>
                    <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.serviceBreakdown.map(s => (
                    <tr key={s.serviceType} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-semibold text-gray-700">{SERVICE_LABEL[s.serviceType] ?? s.serviceType}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500 text-right">{s.sales}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-700 text-right">{s.revenue.toLocaleString()} Ks</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500 text-right">{s.cost.toLocaleString()} Ks</td>
                      <td className="px-5 py-3.5 text-sm font-bold text-right" style={{ color: PRIMARY }}>{s.netProfit.toLocaleString()} Ks</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500 text-right">{s.margin}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Doctor profitability */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100"><h2 className="font-bold text-gray-700 text-sm">Doctor Profitability</h2></div>
            {data.doctorProfitability.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Stethoscope size={32} strokeWidth={1.2} />
                <p className="mt-2 text-xs">No completed appointments in this period</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Doctor</th>
                      <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Patients</th>
                      <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gross Revenue</th>
                      <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Doctor Payout</th>
                      <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Platform Net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.doctorProfitability.map((d, i) => (
                      <tr key={d.doctor?.id ?? i} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-3.5 text-sm font-semibold text-gray-700">{d.doctor?.nameEn ?? d.doctor?.name ?? 'Unknown'}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-500 text-right">{d.patients}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-700 text-right">{d.revenue.toLocaleString()} Ks</td>
                        <td className="px-5 py-3.5 text-sm text-gray-500 text-right">{d.payout.toLocaleString()} Ks</td>
                        <td className="px-5 py-3.5 text-sm font-bold text-right" style={{ color: PRIMARY }}>{d.commission.toLocaleString()} Ks</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Partner/clinic profitability */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100"><h2 className="font-bold text-gray-700 text-sm">Partner / Clinic Profitability</h2></div>
            {data.clinicProfitability.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Building2 size={32} strokeWidth={1.2} />
                <p className="mt-2 text-xs">No clinic-linked appointments, referrals, or program revenue in this period</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Clinic</th>
                      <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Appointments</th>
                      <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Revenue</th>
                      <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Platform Commission</th>
                      <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Program Revenue</th>
                      <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Referrals Received</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.clinicProfitability.map((c, i) => (
                      <tr key={c.clinic?.id ?? i} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-3.5 text-sm font-semibold text-gray-700">{c.clinic?.nameEn ?? c.clinic?.name ?? 'Unknown'}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-500 text-right">{c.appointments}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-700 text-right">{c.revenue.toLocaleString()} Ks</td>
                        <td className="px-5 py-3.5 text-sm font-bold text-right" style={{ color: PRIMARY }}>{c.platformCommission.toLocaleString()} Ks</td>
                        <td className="px-5 py-3.5 text-sm text-gray-500 text-right">{c.programRevenue.toLocaleString()} Ks</td>
                        <td className="px-5 py-3.5 text-sm text-gray-500 text-right">{c.referralsReceived}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
