'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Calendar, Stethoscope, ShoppingBag, Building2, Receipt, Wallet, QrCode,
} from 'lucide-react';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const PRIMARY = '#3b5bdb';
const DARK    = '#22308f';

interface Clinic { id: string; name: string; nameEn: string | null; imageUrl: string | null; }
interface TrendPoint { day: string; appointments: number; orders: number; referrals: number; revenue: number; }
interface Totals { appointments: number; orders: number; referrals: number; revenue: number; }

function StatCard({ icon: Icon, label, value, color, bg }: {
  icon: React.ElementType; label: string; value: string; color: string; bg: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)]">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-xl font-bold text-gray-800 tabular-nums leading-none">{value}</p>
        <p className="text-[11px] font-semibold text-gray-400 mt-1.5 uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}

function ChartCard({ icon: Icon, title, badge, children }: {
  icon: React.ElementType; title: string; badge?: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)] p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#eef1fc' }}>
            <Icon className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
          </div>
          <h2 className="font-bold text-gray-700 text-sm">{title}</h2>
        </div>
        {badge && (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#eef1fc', color: DARK }}>{badge}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function EmptyChart({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="h-52 flex flex-col items-center justify-center text-gray-300 gap-2">
      <Icon size={28} strokeWidth={1.2} />
      <p className="text-xs text-gray-400">{message}</p>
    </div>
  );
}

function Skeleton({ className }: { className: string }) {
  return <div className={`bg-gray-100 rounded-md animate-pulse ${className}`} />;
}

export default function PartnerDashboardPage() {
  const [clinic, setClinic]   = useState<Clinic | null>(null);
  const [trend, setTrend]     = useState<TrendPoint[]>([]);
  const [totals, setTotals]   = useState<Totals>({ appointments: 0, orders: 0, referrals: 0, revenue: 0 });
  const [counts, setCounts]   = useState({ doctors: 0, products: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/partner/me').then(r => r.json()),
      fetch('/api/partner/dashboard').then(r => r.json()),
    ]).then(([me, stats]) => {
      setClinic(me.clinic ?? null);
      setTrend(stats.trend ?? []);
      setTotals(stats.totals ?? { appointments: 0, orders: 0, referrals: 0, revenue: 0 });
      setCounts(stats.counts ?? { doctors: 0, products: 0 });
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto flex flex-col gap-5">
      <div className="rounded-2xl p-6 flex items-center gap-4" style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${DARK} 100%)` }}>
        <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-white/15 overflow-hidden">
          {clinic?.imageUrl ? (
            <Image src={clinic.imageUrl} alt={clinic.name} fill sizes="56px" className="object-cover" />
          ) : (
            <Building2 className="w-6 h-6 text-white" />
          )}
        </div>
        <div>
          <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">ကြိုဆိုပါသည်</p>
          {loading ? (
            <div className="h-6 w-40 rounded-md bg-white/20 animate-pulse mt-1" />
          ) : (
            <h1 className="text-white text-xl font-bold">{clinic?.nameEn ?? clinic?.name ?? 'Partner'}</h1>
          )}
        </div>
      </div>

      {loading ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
                <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
                <div className="flex flex-col gap-2"><Skeleton className="w-14 h-5" /><Skeleton className="w-16 h-2.5" /></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6">
                <Skeleton className="w-40 h-4 mb-5" />
                <Skeleton className="w-full h-52" />
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Top stats — the four series the charts below track */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Calendar} label="Appointments (14d)" value={String(totals.appointments)} color="#3b82f6" bg="#eff6ff" />
            <StatCard icon={Receipt}  label="Orders (14d)"       value={String(totals.orders)}       color="#f59e0b" bg="#fffbeb" />
            <StatCard icon={Wallet}   label="Revenue (14d)"      value={`${totals.revenue.toLocaleString()} Ks`} color="#10b981" bg="#ecfdf5" />
            <StatCard icon={QrCode}   label="Referrals (14d)"    value={String(totals.referrals)}    color={PRIMARY} bg="#eef1fc" />
          </div>

          {/* Trend charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChartCard icon={Calendar} title="Appointments — Last 14 Days" badge={totals.appointments > 0 ? `${totals.appointments} total` : undefined}>
              {totals.appointments === 0 ? (
                <EmptyChart icon={Calendar} message="No appointments yet" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={trend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={2} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f9fafb' }} />
                    <Bar dataKey="appointments" name="Appointments" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard icon={Receipt} title="Orders — Last 14 Days" badge={totals.orders > 0 ? `${totals.orders} total` : undefined}>
              {totals.orders === 0 ? (
                <EmptyChart icon={Receipt} message="No orders yet" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={trend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={2} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f9fafb' }} />
                    <Bar dataKey="orders" name="Orders" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard icon={Wallet} title="Revenue — Last 14 Days" badge={totals.revenue > 0 ? `${totals.revenue.toLocaleString()} Ks` : undefined}>
              {totals.revenue === 0 ? (
                <EmptyChart icon={Wallet} message="No revenue yet" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={trend} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="partnerRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={2} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ stroke: '#10b981', strokeWidth: 1 }} formatter={(v) => `${Number(v ?? 0).toLocaleString()} Ks`} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2} fill="url(#partnerRevenueGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard icon={QrCode} title="MediHug Referrals — Last 14 Days" badge={totals.referrals > 0 ? `${totals.referrals} total` : undefined}>
              {totals.referrals === 0 ? (
                <EmptyChart icon={QrCode} message="No referrals yet" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={trend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={2} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f9fafb' }} />
                    <Bar dataKey="referrals" name="Referrals" fill={PRIMARY} radius={[6, 6, 0, 0]} maxBarSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          {/* Secondary quick links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a href="/partner/doctors" className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${PRIMARY}14` }}>
                <Stethoscope className="w-5 h-5" style={{ color: PRIMARY }} />
              </div>
              <div><p className="text-2xl font-bold text-gray-800">{counts.doctors}</p><p className="text-xs text-gray-400 mt-1">Doctors</p></div>
            </a>
            <a href="/partner/products" className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${PRIMARY}14` }}>
                <ShoppingBag className="w-5 h-5" style={{ color: PRIMARY }} />
              </div>
              <div><p className="text-2xl font-bold text-gray-800">{counts.products}</p><p className="text-xs text-gray-400 mt-1">Products</p></div>
            </a>
          </div>
        </>
      )}
    </div>
  );
}
