'use client';

import { useState, useEffect } from 'react';
import { ArrowLeftRight, Loader2, ArrowDownCircle, ArrowUpCircle, Wallet } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const PRIMARY = '#2ab5ad';

interface Cashflow {
  range: string;
  series: { label: string; cashIn: number; cashOut: number; net: number; cumulative: number }[];
  totalCashIn: number; totalCashOut: number; netCashFlow: number; closingBalance: number;
  cashInByType: { consultation: number; product: number; program: number };
  cashOutByType: { doctorPayout: number; productPurchase: number; operatingExpenses: number; capex: number; refunds: number };
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

export default function CashFlowPage() {
  const [range, setRange] = useState<typeof RANGES[number]>('monthly');
  const [data, setData] = useState<Cashflow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/finance/cashflow?range=${range}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [range]);

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#e6f7f7' }}>
            <ArrowLeftRight className="w-4.5 h-4.5" style={{ color: PRIMARY }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Cash Flow</h1>
            <p className="text-sm text-gray-500 mt-0.5">Actual money in/out with a running balance — distinct from P&amp;L&apos;s accrual profit view</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StatCard icon={ArrowDownCircle} label="Cash In" value={`${data.totalCashIn.toLocaleString()} Ks`} color="#16a34a" bg="#f0fdf4" />
            <StatCard icon={ArrowUpCircle} label="Cash Out" value={`${data.totalCashOut.toLocaleString()} Ks`} color="#dc2626" bg="#fef2f2" />
            <StatCard
              icon={Wallet} label="Net Cash Flow" value={`${data.netCashFlow.toLocaleString()} Ks`}
              color={data.netCashFlow >= 0 ? PRIMARY : '#dc2626'} bg={data.netCashFlow >= 0 ? '#e6f7f7' : '#fef2f2'}
            />
            <StatCard
              icon={Wallet} label="Closing Balance" value={`${data.closingBalance.toLocaleString()} Ks`}
              color={data.closingBalance >= 0 ? '#2ab5ad' : '#dc2626'} bg={data.closingBalance >= 0 ? '#e6f7f7' : '#fef2f2'}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-700 text-sm mb-3">Cash In</h2>
              {[
                { label: 'Doctor Consultation', value: data.cashInByType.consultation },
                { label: 'Product / E-commerce', value: data.cashInByType.product },
                { label: 'Weight / Other Programs', value: data.cashInByType.program },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between py-1.5 text-sm">
                  <span className="text-gray-500">{r.label}</span>
                  <span className="font-semibold text-green-600">{r.value.toLocaleString()} Ks</span>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-700 text-sm mb-3">Cash Out</h2>
              {[
                { label: 'Doctor Payout', value: data.cashOutByType.doctorPayout },
                { label: 'Product Purchase (Suppliers)', value: data.cashOutByType.productPurchase },
                { label: 'Operating Expenses', value: data.cashOutByType.operatingExpenses },
                { label: 'Investment / CAPEX', value: data.cashOutByType.capex, capex: true },
                { label: 'Refunds', value: data.cashOutByType.refunds },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between py-1.5 text-sm">
                  <span className="text-gray-500">{r.label}{r.capex && <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600">not operating</span>}</span>
                  <span className="font-semibold text-red-500">{r.value.toLocaleString()} Ks</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)] p-6">
            <h2 className="font-bold text-gray-700 text-sm mb-4 capitalize">{range} — Cash In / Out + Running Balance</h2>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={data.series} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => `${Number(v ?? 0).toLocaleString()} Ks`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="cashIn" name="Cash In" fill="#16a34a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="cashOut" name="Cash Out" fill="#f87171" radius={[6, 6, 0, 0]} />
                <Line type="monotone" dataKey="cumulative" name="Cumulative Balance" stroke={PRIMARY} strokeWidth={2.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
