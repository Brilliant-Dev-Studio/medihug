'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Loader2, Wallet, Receipt, Scale3D } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const PRIMARY = '#2ab5ad';

interface Forecast {
  history: { month: string; revenue: number; expense: number }[];
  projectedRevenue: number;
  projectedExpense: number;
  projectedProfit: number;
  breakEvenRevenue: number;
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

export default function ForecastPage() {
  const [data, setData] = useState<Forecast | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/finance/forecast')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#e6f7f7' }}>
          <TrendingUp className="w-4.5 h-4.5" style={{ color: PRIMARY }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Forecast</h1>
          <p className="text-sm text-gray-500 mt-0.5">Next-month projection based on the last 3 months&apos; actuals</p>
        </div>
      </div>

      {loading || !data ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 size={28} className="animate-spin text-[#2ab5ad]" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard icon={Wallet} label="Projected Revenue (next month)" value={`${data.projectedRevenue.toLocaleString()} Ks`} color={PRIMARY} bg="#e6f7f7" />
            <StatCard icon={Receipt} label="Projected Expense (next month)" value={`${data.projectedExpense.toLocaleString()} Ks`} color="#f59e0b" bg="#fffbeb" />
            <StatCard
              icon={TrendingUp} label="Projected Profit (next month)"
              value={`${data.projectedProfit.toLocaleString()} Ks`}
              color={data.projectedProfit >= 0 ? '#16a34a' : '#dc2626'}
              bg={data.projectedProfit >= 0 ? '#f0fdf4' : '#fef2f2'}
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#f3f4f6' }}>
              <Scale3D className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Break-Even Revenue</p>
              <p className="text-xs text-gray-400 mt-0.5">Revenue needed next month to cover average costs (profit = 0)</p>
            </div>
            <p className="ml-auto text-lg font-bold text-gray-700">{data.breakEvenRevenue.toLocaleString()} Ks</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)] p-6">
            <h2 className="font-bold text-gray-700 text-sm mb-4">Last 3 Months — Revenue vs Expense</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => `${Number(v ?? 0).toLocaleString()} Ks`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="revenue" name="Revenue" fill={PRIMARY} radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#fbbf24" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
