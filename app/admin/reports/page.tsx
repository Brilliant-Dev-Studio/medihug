'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart2, Loader2, Wallet, Calendar, CheckCircle2, XCircle, ChevronRight, Stethoscope,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const PRIMARY = '#2ab5ad';

interface Overview {
  totalRevenue: number;
  totalAppointments: number;
  counts: Record<string, number>;
  monthly: { month: string; appointments: number; revenue: number }[];
  topDoctors: { doctor: { id: string; name: string; nameEn: string | null; imageUrl: string | null } | null; appointments: number; revenue: number }[];
  recent: { id: string; date: string; status: string; fee: number | null; patient: string; doctor: string }[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-lg px-3 py-2.5 text-xs">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="flex items-center gap-1.5" style={{ color: p.color }}>
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          {p.name}: {p.name === 'Revenue' ? `${p.value.toLocaleString()} Ks` : p.value}
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
        <p className="text-xl font-bold text-gray-800 truncate">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function AdminReportsPage() {
  const [data, setData]       = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/reports/overview').then(r => r.json()).then(d => {
      setData(d);
      setLoading(false);
    });
  }, []);

  const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#e6f7f7' }}>
          <BarChart2 className="w-4.5 h-4.5" style={{ color: PRIMARY }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">Revenue &amp; appointment performance</p>
        </div>
      </div>

      {loading || !data ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 size={28} className="animate-spin text-[#2ab5ad]" />
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Wallet}       label="Total Revenue (Completed)" value={`${data.totalRevenue.toLocaleString()} Ks`} color={PRIMARY}   bg="#e6f7f7" />
            <StatCard icon={Calendar}     label="Total Appointments"        value={String(data.totalAppointments)}             color="#3b82f6"   bg="#eff6ff" />
            <StatCard icon={CheckCircle2} label="Completed"                 value={String(data.counts.COMPLETED ?? 0)}         color="#10b981"   bg="#ecfdf5" />
            <StatCard icon={XCircle}      label="Cancelled"                 value={String(data.counts.CANCELLED ?? 0)}         color="#ef4444"   bg="#fef2f2" />
          </div>

          {/* Revenue & appointments chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-700 text-sm">Last 6 Months</h2>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PRIMARY }} /> Revenue</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> Appointments</span>
              </div>
            </div>
            {data.monthly.every(m => m.appointments === 0) ? (
              <div className="h-60 flex items-center justify-center text-sm text-gray-400">No appointment data for this period</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={data.monthly} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.18} />
                      <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradAppts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="revenue" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="appts" orientation="right" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 1.5 }} />
                  <Area yAxisId="revenue" type="monotone" dataKey="revenue" name="Revenue" stroke={PRIMARY} strokeWidth={2.5} fill="url(#gradRevenue)" dot={{ r: 4, fill: PRIMARY, strokeWidth: 0 }} activeDot={{ r: 6, fill: PRIMARY, strokeWidth: 0 }} />
                  <Area yAxisId="appts" type="monotone" dataKey="appointments" name="Appointments" stroke="#60a5fa" strokeWidth={2.5} fill="url(#gradAppts)" dot={{ r: 4, fill: '#60a5fa', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#60a5fa', strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Top doctors */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)] overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-700 text-sm">Top Doctors by Revenue</h2>
              </div>
              {data.topDoctors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Stethoscope size={32} strokeWidth={1.2} />
                  <p className="mt-2 text-xs">No completed appointments yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {data.topDoctors.map((d, i) => (
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
                        <p className="text-xs text-gray-400">{d.appointments} completed</p>
                      </div>
                      <p className="text-sm font-bold shrink-0" style={{ color: PRIMARY }}>{d.revenue.toLocaleString()} Ks</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent appointments */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-700 text-sm">Recent Activity</h2>
                <Link href="/admin/records" className="text-xs font-semibold flex items-center gap-0.5 text-gray-400 hover:text-[#2ab5ad] transition-colors">
                  View records <ChevronRight size={12} />
                </Link>
              </div>
              {data.recent.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Calendar size={32} strokeWidth={1.2} />
                  <p className="mt-2 text-xs">No appointments yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {data.recent.map(r => (
                    <div key={r.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{r.patient}</p>
                        <p className="text-xs text-gray-400 truncate">with {r.doctor} · {fmtDate(r.date)}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-600 shrink-0">{r.fee ? `${r.fee.toLocaleString()} Ks` : '—'}</p>
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
