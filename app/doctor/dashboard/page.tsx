'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Hourglass, CheckCircle2, XCircle, User, BarChart2, PieChart as PieIcon } from 'lucide-react';
import { motion, animate } from 'motion/react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const PRIMARY = '#2ab5ad';
const DARK    = '#1a9990';

interface Appt {
  id: string; date: string; time: string | null; reason: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  user: { name: string; phone: string };
}

interface WeeklyPoint { day: string; appointments: number; }

const STATUS_STYLE: Record<Appt['status'], { bg: string; color: string; icon: React.ElementType; label: string }> = {
  PENDING:   { bg: '#fffbeb', color: '#d97706', icon: Hourglass,    label: 'Pending' },
  CONFIRMED: { bg: '#eff6ff', color: '#3b82f6', icon: CheckCircle2, label: 'Confirmed' },
  COMPLETED: { bg: '#ecfdf5', color: '#10b981', icon: CheckCircle2, label: 'Completed' },
  CANCELLED: { bg: '#fef2f2', color: '#ef4444', icon: XCircle,      label: 'Cancelled' },
};

function useCountUp(value: number) {
  const [display, setDisplay] = useState(0);
  const first = useRef(true);
  useEffect(() => {
    const from = first.current ? 0 : display;
    first.current = false;
    const controls = animate(from, value, {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: v => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return display;
}

function StatCard({ icon: Icon, label, value, color, bg, index }: {
  icon: React.ElementType; label: string; value: number; color: string; bg: string; index: number;
}) {
  const displayValue = useCountUp(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
      className="group relative bg-white rounded-2xl border border-gray-100 p-5 overflow-hidden transition-shadow duration-300"
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 10px 28px -18px rgba(0,0,0,0.12)' }}
    >
      {/* Ambient wash */}
      <div
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color}22 0%, transparent 70%)` }}
      />

      <div className="relative flex items-center gap-4">
        <motion.div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: bg, boxShadow: `inset 0 0 0 1px ${color}22` }}
          whileHover={{ scale: 1.08, rotate: -4 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </motion.div>
        <div>
          <p className="text-2xl font-bold text-gray-800 tabular-nums leading-none">{displayValue}</p>
          <p className="text-[11px] font-semibold text-gray-400 mt-1.5 uppercase tracking-wide">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

function CardHeader({ icon: Icon, title, badge }: { icon: React.ElementType; title: string; badge?: string }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#e6f7f7' }}>
          <Icon className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
        </div>
        <h2 className="font-bold text-gray-700 text-sm">{title}</h2>
      </div>
      {badge && (
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#e6f7f7', color: DARK }}>{badge}</span>
      )}
    </div>
  );
}

function EmptyChart({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="h-60 flex flex-col items-center justify-center text-gray-300 gap-2">
      <Icon size={30} strokeWidth={1.2} />
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}

function Skeleton({ className, style }: { className: string; style?: React.CSSProperties }) {
  return <div className={`bg-gray-100 rounded-md animate-pulse ${className}`} style={style} />;
}

function DashboardSkeleton() {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)] p-5">
            <div className="flex items-center gap-4">
              <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
              <div className="flex flex-col gap-2">
                <Skeleton className="w-10 h-6" />
                <Skeleton className="w-16 h-2.5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)] p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <Skeleton className="w-7 h-7 rounded-lg" />
            <Skeleton className="w-40 h-4" />
          </div>
          <div className="flex items-center gap-6">
            <Skeleton className="w-40 h-40 rounded-full shrink-0" />
            <div className="flex-1 flex flex-col gap-3.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Skeleton className="w-2.5 h-2.5 rounded-full shrink-0" />
                  <Skeleton className="flex-1 h-3" />
                  <Skeleton className="w-6 h-3 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)] p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <Skeleton className="w-7 h-7 rounded-lg" />
            <Skeleton className="w-44 h-4" />
          </div>
          <div className="h-60 flex items-end justify-between gap-3 px-2 pb-1">
            {[45, 70, 30, 85, 55, 95, 40].map((h, i) => (
              <Skeleton key={i} className="flex-1" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)] overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
          <Skeleton className="w-7 h-7 rounded-lg" />
          <Skeleton className="w-36 h-4" />
        </div>
        <div className="divide-y divide-gray-50">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5">
              <Skeleton className="w-9 h-9 rounded-full shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <Skeleton className="w-32 h-3" />
                <Skeleton className="w-20 h-2.5" />
              </div>
              <Skeleton className="w-14 h-3 shrink-0" />
              <Skeleton className="w-20 h-6 rounded-full shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function DoctorDashboardPage() {
  const [today, setToday]     = useState<Appt[]>([]);
  const [counts, setCounts]   = useState<Record<string, number>>({});
  const [weekly, setWeekly]   = useState<WeeklyPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/doctor/dashboard').then(r => r.json()).then(d => {
      setToday(d.today ?? []);
      setCounts(d.counts ?? {});
      setWeekly(d.weekly ?? []);
      setLoading(false);
    });
  }, []);

  const pieData = (['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const)
    .map(status => ({ name: STATUS_STYLE[status].label, value: counts[status] ?? 0, color: STATUS_STYLE[status].color }));
  const totalAppts = pieData.reduce((sum, d) => sum + d.value, 0);
  const activePie = pieData.filter(d => d.value > 0);

  const weekTotal = weekly.reduce((sum, w) => sum + w.appointments, 0);

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">{todayStr}</p>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard index={0} icon={Hourglass}    label="Pending"   value={counts.PENDING ?? 0}   color="#d97706" bg="#fffbeb" />
            <StatCard index={1} icon={CheckCircle2} label="Confirmed" value={counts.CONFIRMED ?? 0} color="#3b82f6" bg="#eff6ff" />
            <StatCard index={2} icon={CheckCircle2} label="Completed" value={counts.COMPLETED ?? 0} color="#10b981" bg="#ecfdf5" />
            <StatCard index={3} icon={XCircle}      label="Cancelled" value={counts.CANCELLED ?? 0} color="#ef4444" bg="#fef2f2" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Status breakdown — donut with center total + list legend */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)] p-6">
              <CardHeader icon={PieIcon} title="Appointment Status Breakdown" badge={totalAppts > 0 ? `${totalAppts} total` : undefined} />
              {totalAppts === 0 ? (
                <EmptyChart icon={PieIcon} message="No appointments yet" />
              ) : (
                <div className="flex items-center gap-6">
                  <div className="relative shrink-0" style={{ width: 160, height: 160 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={activePie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={54} outerRadius={78} paddingAngle={3} stroke="none">
                          {activePie.map(d => <Cell key={d.name} fill={d.color} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <p className="text-2xl font-bold text-gray-800 leading-none">{totalAppts}</p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">Total</p>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-3">
                    {pieData.map(d => {
                      const pct = totalAppts > 0 ? Math.round((d.value / totalAppts) * 100) : 0;
                      return (
                        <div key={d.name} className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                          <span className="text-xs font-medium text-gray-600 flex-1 truncate">{d.name}</span>
                          <span className="text-xs font-bold text-gray-800 tabular-nums">{d.value}</span>
                          <span className="text-[10px] text-gray-400 tabular-nums w-9 text-right">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Last 7 days — gradient bar chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)] p-6">
              <CardHeader icon={BarChart2} title="Appointments — Last 7 Days" badge={weekTotal > 0 ? `${weekTotal} this week` : undefined} />
              {weekTotal === 0 ? (
                <EmptyChart icon={BarChart2} message="No appointments this week" />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={weekly} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="doctorWeeklyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={PRIMARY} stopOpacity={1} />
                        <stop offset="100%" stopColor={PRIMARY} stopOpacity={0.55} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f9fafb' }} />
                    <Bar dataKey="appointments" name="Appointments" fill="url(#doctorWeeklyGradient)" radius={[8, 8, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)] overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#e6f7f7' }}>
                  <Calendar className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
                </div>
                <h2 className="font-bold text-gray-700 text-sm">Today&apos;s Appointments</h2>
              </div>
              {today.length > 0 && (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#e6f7f7', color: DARK }}>{today.length} today</span>
              )}
            </div>
            {today.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Calendar size={32} strokeWidth={1.2} />
                <p className="mt-2 text-sm">No appointments scheduled for today</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {today.map(a => {
                  const s = STATUS_STYLE[a.status];
                  return (
                    <Link key={a.id} href={`/doctor/appointments/${a.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: PRIMARY }}>
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-800 truncate">{a.user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{a.reason || a.user.phone}</p>
                      </div>
                      {a.time && (
                        <span className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                          <Clock size={12} /> {a.time}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0" style={{ backgroundColor: s.bg, color: s.color }}>
                        <s.icon size={11} /> {s.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
