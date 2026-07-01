'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  Users, Stethoscope, ShoppingBag, Calendar, XCircle,
  TrendingUp, TrendingDown, CalendarDays, RefreshCcw,
  BookOpen, Clock, CheckCircle2, Ban, Loader2,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

const PRIMARY = '#2ab5ad';
const MONTHS   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface Totals {
  patients: number; doctors: number; products: number;
  appointments: number; cancelled: number; blogs: number;
}
interface ChartPoint { label: string; appointments: number; cancelled: number; }
interface LatestAppt  { id: string; patient: string; doctor: string; date: string; time: string; status: string; }
interface StatsData {
  totals: Totals; prev: Totals;
  chart: ChartPoint[]; latest: LatestAppt[];
  appointmentDates: string[]; availableYears: number[];
}

/* ─────────────────────────────────────────────
   Custom Tooltip
───────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-lg px-4 py-3 text-xs">
      <p className="font-bold text-gray-600 mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-gray-500">{p.name}</span>
          <span className="font-bold text-gray-700 ml-auto pl-4">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Stat Card
───────────────────────────────────────────── */
function trend(curr: number, prev: number) {
  if (prev === 0) return { pct: curr > 0 ? 100 : 0, up: true };
  const pct = Math.round(((curr - prev) / prev) * 100);
  return { pct, up: pct >= 0 };
}

function StatCard({ icon: Icon, label, value, color, bg, pct, up, loading }: {
  icon: React.ElementType; label: string; value: number;
  color: string; bg: string; pct: number; up: boolean; loading: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ backgroundColor: bg }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {loading
          ? <div className="w-14 h-6 rounded-full bg-gray-100 animate-pulse" />
          : (
            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${up ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
              {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(pct)}%
            </div>
          )}
      </div>
      <div>
        {loading
          ? <div className="w-16 h-7 rounded-lg bg-gray-100 animate-pulse mb-1" />
          : <p className="text-2xl font-bold text-gray-800">{value.toLocaleString()}</p>}
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Advanced Filter Panel
───────────────────────────────────────────── */
function FilterPanel({
  year, month, day, availableYears,
  setYear, setMonth, setDay, onReset, appointmentDates,
}: {
  year: number | null; month: number | null; day: Date | null; availableYears: number[];
  setYear:  (v: number | null) => void;
  setMonth: (v: number | null) => void;
  setDay:   (v: Date   | null) => void;
  onReset:  () => void;
  appointmentDates: string[];
}) {
  const hasFilter = year !== null || month !== null || day !== null;
  const highlightDates = appointmentDates.map(d => new Date(d + 'T00:00:00'));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4" style={{ color: PRIMARY }} />
          <p className="text-sm font-bold text-gray-700">Date Filter</p>
        </div>
        {hasFilter && (
          <button onClick={onReset} className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-red-400 transition-colors">
            <RefreshCcw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {hasFilter && (
        <div className="flex flex-wrap gap-1.5">
          {year !== null && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: PRIMARY }}>
              {year}
              <button onClick={() => { setYear(null); setMonth(null); setDay(null); }} className="ml-0.5 opacity-70 hover:opacity-100">×</button>
            </span>
          )}
          {month !== null && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-teal-100 text-teal-700">
              {MONTHS[month]}
              <button onClick={() => { setMonth(null); setDay(null); }} className="ml-0.5 opacity-70 hover:opacity-100">×</button>
            </span>
          )}
          {day && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
              {day.getDate()} {MONTHS[day.getMonth()]}
              <button onClick={() => setDay(null)} className="ml-0.5 opacity-70 hover:opacity-100">×</button>
            </span>
          )}
        </div>
      )}

      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Year</p>
        <div className="flex gap-2 flex-wrap">
          {availableYears.map(y => (
            <button key={y}
              onClick={() => { setYear(year === y ? null : y); setMonth(null); setDay(null); }}
              className="flex-1 py-2 rounded-xl text-sm font-bold transition-all border"
              style={{
                backgroundColor: year === y ? PRIMARY : 'transparent',
                borderColor:     year === y ? PRIMARY : '#e5e7eb',
                color:           year === y ? '#fff'  : '#6b7280',
              }}>
              {y}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Month</p>
        <div className="grid grid-cols-4 gap-1.5">
          {MONTHS.map((m, i) => (
            <button key={m}
              onClick={() => { setMonth(month === i ? null : i); setDay(null); }}
              className="py-1.5 rounded-xl text-xs font-bold transition-all border"
              style={{
                backgroundColor: month === i ? `${PRIMARY}20` : 'transparent',
                borderColor:     month === i ? PRIMARY         : '#e5e7eb',
                color:           month === i ? PRIMARY         : '#9ca3af',
              }}>
              {m}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          Specific Date <span className="normal-case font-normal text-gray-300">(optional)</span>
        </p>
        <div className="advanced-datepicker">
          <DatePicker
            inline
            selected={day}
            onChange={(d: Date | null) => setDay(d && day && d.getTime() === day.getTime() ? null : d)}
            openToDate={
              day ? day
              : year !== null && month !== null ? new Date(year, month, 1)
              : year !== null ? new Date(year, 0, 1)
              : new Date()
            }
            highlightDates={highlightDates}
            calendarClassName="adv-cal"
          />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Dashboard Page
───────────────────────────────────────────── */
const EMPTY_TOTALS: Totals = { patients: 0, doctors: 0, products: 0, appointments: 0, cancelled: 0, blogs: 0 };

export default function AdminDashboardPage() {
  const [year,  setYear]  = useState<number | null>(null);
  const [month, setMonth] = useState<number | null>(null);
  const [day,   setDay]   = useState<Date   | null>(null);

  const [data,    setData]    = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const onReset = () => { setYear(null); setMonth(null); setDay(null); };

  const fetchStats = useCallback(async (y: number | null, m: number | null, d: Date | null) => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams();
      if (y !== null)   params.set('year',  String(y));
      if (m !== null)   params.set('month', String(m));
      if (d !== null)   params.set('day',   d.toISOString().slice(0, 10));
      const res = await fetch(`/api/admin/dashboard/stats?${params}`);
      if (!res.ok) throw new Error('Server error');
      setData(await res.json());
    } catch {
      setError('ဒေတာ တင်မရသေးပါ။');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(year, month, day); }, [year, month, day, fetchStats]);

  const totals = data?.totals ?? EMPTY_TOTALS;
  const prev   = data?.prev   ?? EMPTY_TOTALS;

  const hasFilter    = year !== null || month !== null || day !== null;
  const availableYears = data?.availableYears ?? [new Date().getFullYear() - 1, new Date().getFullYear()];

  const filterLabel = useMemo(() => {
    if (!hasFilter) return 'All-time totals';
    if (day)   return day.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    if (month !== null && year) return `${MONTHS[month]} ${year}`;
    if (year)  return `Year ${year}`;
    return 'Filtered';
  }, [year, month, day, hasFilter]);

  const chartLabel = useMemo(() => {
    if (!hasFilter) return 'All years';
    if (day)         return filterLabel;
    if (month !== null && year) return `${MONTHS[month]} ${year} — daily`;
    if (year)        return `${year} — monthly`;
    return '';
  }, [year, month, day, hasFilter, filterLabel]);

  const stats = [
    { icon: Users,       label: 'Total Patients',         value: totals.patients,     color: PRIMARY,   bg: '#e6f7f7', ...trend(totals.patients, prev.patients) },
    { icon: Stethoscope, label: 'Total Doctors',          value: totals.doctors,      color: '#8b5cf6', bg: '#f5f3ff', ...trend(totals.doctors, prev.doctors) },
    { icon: ShoppingBag, label: 'Total Products',         value: totals.products,     color: '#f59e0b', bg: '#fffbeb', ...trend(totals.products, prev.products) },
    { icon: Calendar,    label: 'Total Appointments',     value: totals.appointments, color: '#3b82f6', bg: '#eff6ff', ...trend(totals.appointments, prev.appointments) },
    { icon: XCircle,     label: 'Cancelled Appointments', value: totals.cancelled,    color: '#ef4444', bg: '#fef2f2', ...trend(totals.cancelled, prev.cancelled) },
    { icon: BookOpen,    label: 'Total Blogs',            value: totals.blogs,        color: '#10b981', bg: '#ecfdf5', ...trend(totals.blogs, prev.blogs) },
  ];

  const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    confirmed: { label: 'Confirmed', color: '#10b981', bg: '#ecfdf5', icon: CheckCircle2 },
    completed: { label: 'Completed', color: '#3b82f6', bg: '#eff6ff', icon: CheckCircle2 },
    pending:   { label: 'Pending',   color: '#f59e0b', bg: '#fffbeb', icon: Clock        },
    cancelled: { label: 'Cancelled', color: '#ef4444', bg: '#fef2f2', icon: Ban          },
  };
  const AVATAR_COLORS = ['#2ab5ad','#8b5cf6','#f59e0b','#3b82f6','#10b981'];

  return (
    <>
      <style>{`
        .advanced-datepicker .react-datepicker {
          border: none; font-family: inherit; width: 100%; background: transparent;
        }
        .advanced-datepicker .react-datepicker__month-container { width: 100%; }
        .advanced-datepicker .react-datepicker__header {
          background: transparent; border-bottom: 1px solid #f3f4f6; padding: 8px 0 6px;
        }
        .advanced-datepicker .react-datepicker__current-month { font-size: 12px; font-weight: 700; color: #374151; }
        .advanced-datepicker .react-datepicker__navigation { top: 10px; }
        .advanced-datepicker .react-datepicker__navigation-icon::before {
          border-color: #9ca3af; border-width: 2px 2px 0 0; width: 6px; height: 6px;
        }
        .advanced-datepicker .react-datepicker__day-names { margin: 4px 0 0; }
        .advanced-datepicker .react-datepicker__day-name {
          font-size: 10px; font-weight: 700; color: #d1d5db; width: 30px; line-height: 28px; margin: 1px;
        }
        .advanced-datepicker .react-datepicker__day {
          width: 30px; line-height: 28px; margin: 1px;
          font-size: 11px; font-weight: 500; color: #374151; border-radius: 8px; transition: all 0.15s;
        }
        .advanced-datepicker .react-datepicker__day:hover { background: #e6f7f7; color: ${PRIMARY}; }
        .advanced-datepicker .react-datepicker__day--selected { background: ${PRIMARY} !important; color: #fff !important; font-weight: 700; }
        .advanced-datepicker .react-datepicker__day--highlighted { background: #e6f7f7; color: ${PRIMARY}; font-weight: 700; }
        .advanced-datepicker .react-datepicker__day--outside-month { color: #e5e7eb; }
        .advanced-datepicker .react-datepicker__day--today {
          font-weight: 800; color: ${PRIMARY}; box-shadow: inset 0 0 0 1.5px ${PRIMARY};
        }
        .advanced-datepicker .react-datepicker__month { margin: 4px 0; }
        .advanced-datepicker .react-datepicker__week { display: flex; justify-content: space-around; }
      `}</style>

      <div className="flex flex-col lg:flex-row gap-6 h-full">

        {/* ── Left ── */}
        <div className="flex-1 flex flex-col gap-5 min-w-0">

          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-sm text-gray-400 mt-0.5">{filterLabel}</p>
            </div>
            <div className="flex items-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
              {hasFilter && !loading && (
                <button onClick={onReset}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-gray-200 text-gray-400 hover:text-red-400 hover:border-red-200 transition-all">
                  <RefreshCcw className="w-3 h-3" /> Show all data
                </button>
              )}
            </div>
          </div>

          {error && <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>}

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {stats.map(s => <StatCard key={s.label} {...s} loading={loading} />)}
          </div>

          {/* Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
              <div>
                <p className="text-sm font-bold text-gray-700">Appointment Overview</p>
                <p className="text-xs text-gray-400 mt-0.5">{chartLabel}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PRIMARY }} />
                  Appointments
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  Cancelled
                </span>
              </div>
            </div>

            {loading ? (
              <div className="h-[220px] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
              </div>
            ) : (data?.chart?.length ?? 0) === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-sm text-gray-400">No appointment data for this period</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data!.chart} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradAppt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={PRIMARY}  stopOpacity={0.18} />
                      <stop offset="95%" stopColor={PRIMARY}  stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradCancel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#f87171" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 1.5 }} />
                  <Area type="monotone" dataKey="appointments" name="Appointments" stroke={PRIMARY}  strokeWidth={2.5} fill="url(#gradAppt)"   dot={{ r: 4, fill: PRIMARY,    strokeWidth: 0 }} activeDot={{ r: 6, fill: PRIMARY,    strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="cancelled"    name="Cancelled"    stroke="#f87171" strokeWidth={2.5} fill="url(#gradCancel)" dot={{ r: 4, fill: '#f87171', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#f87171', strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Latest Appointments */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: PRIMARY }} />
                <p className="text-sm font-bold text-gray-700">Latest Appointments</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: PRIMARY }}>
                Recent 5
              </span>
            </div>

            <div className="hidden sm:grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-5 py-2.5 bg-gray-50 border-b border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Patient</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Doctor</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date & Time</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
            </div>

            <div className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="w-32 h-3 rounded bg-gray-100 animate-pulse" />
                      <div className="w-20 h-2.5 rounded bg-gray-100 animate-pulse" />
                    </div>
                  </div>
                ))
              ) : (data?.latest?.length ?? 0) === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-gray-400">No appointments yet</div>
              ) : (
                data!.latest.map((appt, i) => {
                  const s = STATUS_MAP[appt.status] ?? STATUS_MAP.pending;
                  const StatusIcon = s.icon;
                  return (
                    <div key={appt.id} className="grid sm:grid-cols-[1fr_1fr_auto_auto] gap-2 sm:gap-4 px-5 py-3.5 items-center hover:bg-gray-50/60 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ backgroundColor: AVATAR_COLORS[i % 5] }}>
                          {appt.patient.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700 leading-tight">{appt.patient}</p>
                          <p className="text-[10px] text-gray-400 sm:hidden">{appt.doctor}</p>
                        </div>
                      </div>
                      <p className="hidden sm:block text-sm text-gray-500">{appt.doctor}</p>
                      <div className="flex flex-col items-end sm:items-start">
                        <p className="text-xs font-semibold text-gray-600">{appt.date}</p>
                        <p className="text-[10px] text-gray-400">{appt.time}</p>
                      </div>
                      <div className="flex justify-end sm:justify-start">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: s.bg, color: s.color }}>
                          <StatusIcon className="w-3 h-3" />
                          {s.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* ── Right: filter ── */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="sticky top-0">
            <FilterPanel
              year={year} month={month} day={day}
              availableYears={availableYears}
              appointmentDates={data?.appointmentDates ?? []}
              setYear={setYear} setMonth={setMonth} setDay={setDay}
              onReset={onReset}
            />
          </div>
        </div>

      </div>
    </>
  );
}
