'use client';

import { useState, useEffect } from 'react';
import {
  Store, Loader2, Wallet, ShoppingBag, CreditCard, Package, Stethoscope,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const PRIMARY = '#2ab5ad';

interface Overview {
  range: 'daily' | 'monthly';
  totalCommission: number;
  totalProductRevenue: number;
  totalAppointmentRevenue: number;
  ownership: { MEDIHUG: number; PARTNER: number; SHARED: number };
  series: { label: string; commission: number; productRevenue: number }[];
  bestSellingProducts: { productId: string; name: string; nameEn: string | null; imageUrl: string | null; qty: number; revenue: number }[];
  topDoctorsByBookings: { doctor: { id: string; name: string; nameEn: string | null; imageUrl: string | null } | null; bookings: number; commission: number }[];
}

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

function StatCard({ icon: Icon, label, value, color, bg, muted }: {
  icon: React.ElementType; label: string; value: string; color: string; bg: string; muted?: boolean;
}) {
  return (
    <div className={`bg-white rounded-2xl border p-5 flex items-center gap-4 ${muted ? 'border-gray-100' : 'border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)]'}`}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className={`text-xl font-bold truncate ${muted ? 'text-gray-500' : 'text-gray-800'}`}>{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function AdminPosPage() {
  const [range, setRange]     = useState<'daily' | 'monthly'>('daily');
  const [data, setData]       = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/pos/overview?range=${range}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [range]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#e6f7f7' }}>
            <Store className="w-4.5 h-4.5" style={{ color: PRIMARY }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">POS</h1>
            <p className="text-sm text-gray-500 mt-0.5">Platform commission profit, product sales, and top performers</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {(['daily', 'monthly'] as const).map(r => (
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
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard icon={Wallet} label="Platform Commission (Profit)" value={`${data.totalCommission.toLocaleString()} Ks`} color={PRIMARY} bg="#e6f7f7" />
            <StatCard icon={ShoppingBag} label="Product Sales Revenue" value={`${data.totalProductRevenue.toLocaleString()} Ks`} color="#f59e0b" bg="#fffbeb" />
            <StatCard icon={CreditCard} label="Appointment Revenue (Patient-Paid)" value={`${data.totalAppointmentRevenue.toLocaleString()} Ks`} color="#9ca3af" bg="#f9fafb" muted />
          </div>

          {/* Revenue Ownership breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)] p-6">
            <h2 className="font-bold text-gray-700 text-sm mb-4">Revenue Ownership</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">A. Medihug Revenue</p>
                <p className="text-lg font-bold text-gray-800 mt-1">{data.ownership.MEDIHUG.toLocaleString()} Ks</p>
                <p className="text-[11px] text-gray-400 mt-1">Doctor markup, service fee, platform fee — referral 5%</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">B. Partner Revenue</p>
                <p className="text-lg font-bold text-gray-800 mt-1">{data.ownership.PARTNER.toLocaleString()} Ks</p>
                <p className="text-[11px] text-gray-400 mt-1">Partner&apos;s products, services, packages — referral 0%</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">C. Shared Revenue</p>
                <p className="text-lg font-bold text-gray-800 mt-1">{data.ownership.SHARED.toLocaleString()} Ks</p>
                <p className="text-[11px] text-gray-400 mt-1">Co-run programs — split first, then referral per agreement</p>
              </div>
            </div>
          </div>

          {/* Commission + product revenue chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-700 text-sm">{range === 'daily' ? 'Last 30 Days' : 'Last 12 Months'}</h2>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PRIMARY }} /> Commission</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Product Revenue</span>
              </div>
            </div>
            {data.series.every(s => s.commission === 0 && s.productRevenue === 0) ? (
              <div className="h-60 flex items-center justify-center text-sm text-gray-400">No completed transactions for this period</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={data.series} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradCommission" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.18} />
                      <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradProductRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={range === 'daily' ? 4 : 0} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 1.5 }} />
                  <Area type="monotone" dataKey="commission" name="Commission" stroke={PRIMARY} strokeWidth={2.5} fill="url(#gradCommission)" dot={false} activeDot={{ r: 5, fill: PRIMARY, strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="productRevenue" name="Product Revenue" stroke="#fbbf24" strokeWidth={2.5} fill="url(#gradProductRev)" dot={false} activeDot={{ r: 5, fill: '#fbbf24', strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Best-selling products */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)] overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-700 text-sm">Best-Selling Products</h2>
              </div>
              {data.bestSellingProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Package size={32} strokeWidth={1.2} />
                  <p className="mt-2 text-xs">No completed orders yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {data.bestSellingProducts.map((p, i) => (
                    <div key={p.productId} className="flex items-center gap-3 px-5 py-3.5">
                      <span className="text-xs font-bold text-gray-300 w-4 shrink-0">{i + 1}</span>
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-9 h-9 rounded-lg object-cover border border-gray-100 shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                          <Package size={14} className="text-gray-300" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-800 truncate">{p.nameEn ?? p.name}</p>
                        <p className="text-xs text-gray-400">{p.qty} sold</p>
                      </div>
                      <p className="text-sm font-bold shrink-0" style={{ color: '#f59e0b' }}>{p.revenue.toLocaleString()} Ks</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top doctors by bookings */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)] overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-700 text-sm">Top Doctors by Bookings</h2>
              </div>
              {data.topDoctorsByBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Stethoscope size={32} strokeWidth={1.2} />
                  <p className="mt-2 text-xs">No completed appointments yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {data.topDoctorsByBookings.map((d, i) => (
                    <div key={d.doctor?.id ?? i} className="flex items-center gap-3 px-5 py-3.5">
                      <span className="text-xs font-bold text-gray-300 w-4 shrink-0">{i + 1}</span>
                      {d.doctor?.imageUrl ? (
                        <img src={d.doctor.imageUrl} alt={d.doctor.name} className="w-9 h-9 rounded-full object-cover border border-gray-100 shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                          <Stethoscope size={14} className="text-gray-300" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-800 truncate">{d.doctor?.nameEn ?? d.doctor?.name ?? 'Unknown'}</p>
                        <p className="text-xs text-gray-400">{d.bookings} bookings</p>
                      </div>
                      <p className="text-sm font-bold shrink-0" style={{ color: PRIMARY }}>{d.commission.toLocaleString()} Ks</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
