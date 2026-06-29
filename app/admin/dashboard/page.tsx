'use client';

import { useState, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  Users, Stethoscope, ShoppingBag, Calendar, XCircle,
  TrendingUp, TrendingDown, CalendarDays, RefreshCcw,
  BookOpen, Clock, CheckCircle2, Ban,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

const PRIMARY = '#2ab5ad';

/* ─────────────────────────────────────────────
   Mock data
───────────────────────────────────────────── */
type DayStat = { patients: number; doctors: number; products: number; appointments: number; cancelled: number; blogs: number };

const DAY_DATA: Record<string, DayStat> = {
  '2025-01-10': { patients: 80,  doctors: 12, products: 30, appointments: 20, cancelled: 2, blogs: 5  },
  '2025-03-15': { patients: 95,  doctors: 14, products: 34, appointments: 28, cancelled: 3, blogs: 8  },
  '2025-06-20': { patients: 105, doctors: 15, products: 38, appointments: 35, cancelled: 4, blogs: 11 },
  '2025-09-05': { patients: 115, doctors: 16, products: 41, appointments: 42, cancelled: 5, blogs: 14 },
  '2025-12-01': { patients: 128, doctors: 17, products: 43, appointments: 48, cancelled: 5, blogs: 17 },
  '2026-01-08': { patients: 132, doctors: 18, products: 44, appointments: 51, cancelled: 3, blogs: 19 },
  '2026-02-14': { patients: 138, doctors: 18, products: 45, appointments: 55, cancelled: 4, blogs: 21 },
  '2026-03-22': { patients: 142, doctors: 19, products: 46, appointments: 58, cancelled: 6, blogs: 23 },
  '2026-04-10': { patients: 148, doctors: 20, products: 47, appointments: 62, cancelled: 5, blogs: 25 },
  '2026-05-18': { patients: 158, doctors: 21, products: 50, appointments: 68, cancelled: 7, blogs: 28 },
  '2026-06-01': { patients: 160, doctors: 22, products: 51, appointments: 34, cancelled: 3, blogs: 29 },
  '2026-06-05': { patients: 162, doctors: 22, products: 52, appointments: 52, cancelled: 4, blogs: 30 },
  '2026-06-10': { patients: 165, doctors: 22, products: 53, appointments: 60, cancelled: 6, blogs: 31 },
  '2026-06-15': { patients: 168, doctors: 23, products: 54, appointments: 71, cancelled: 8, blogs: 33 },
  '2026-06-20': { patients: 172, doctors: 23, products: 55, appointments: 65, cancelled: 5, blogs: 34 },
  '2026-06-25': { patients: 175, doctors: 24, products: 55, appointments: 78, cancelled: 7, blogs: 35 },
  '2026-06-28': { patients: 180, doctors: 24, products: 56, appointments: 85, cancelled: 9, blogs: 36 },
};

const ALL_TOTAL: DayStat = { patients: 180, doctors: 24, products: 56, appointments: 85, cancelled: 9, blogs: 36 };
const PREV: DayStat      = { patients: 160, doctors: 22, products: 50, appointments: 70, cancelled: 6, blogs: 28 };

/* ── Latest Appointments ── */
type Appointment = { id: number; patient: string; doctor: string; date: string; time: string; status: 'confirmed' | 'pending' | 'cancelled' };

const LATEST_APPOINTMENTS: Appointment[] = [
  { id: 1, patient: 'Ma Hnin Wai',     doctor: 'Dr. Aung Ko',      date: '2026-06-28', time: '09:00 AM', status: 'confirmed' },
  { id: 2, patient: 'Ko Zaw Lin',      doctor: 'Dr. Su Su Khin',   date: '2026-06-28', time: '10:30 AM', status: 'pending'   },
  { id: 3, patient: 'Daw Khin May',    doctor: 'Dr. Aung Ko',      date: '2026-06-28', time: '11:00 AM', status: 'cancelled' },
  { id: 4, patient: 'Ko Naing Htike',  doctor: 'Dr. Thida Myint',  date: '2026-06-27', time: '02:00 PM', status: 'confirmed' },
  { id: 5, patient: 'Ma Ei Phyu',      doctor: 'Dr. Kyaw Zin',     date: '2026-06-27', time: '03:30 PM', status: 'confirmed' },
];

function sumRange(keys: string[]): DayStat {
  if (!keys.length) return ALL_TOTAL;
  return keys.reduce(
    (acc, k) => {
      const d = DAY_DATA[k] ?? { patients: 0, doctors: 0, products: 0, appointments: 0, cancelled: 0 };
      return {
        patients:     Math.max(acc.patients,     d.patients),
        doctors:      Math.max(acc.doctors,      d.doctors),
        products:     Math.max(acc.products,     d.products),
        appointments: acc.appointments + d.appointments,
        cancelled:    acc.cancelled    + d.cancelled,
        blogs:        Math.max(acc.blogs,        d.blogs),
      };
    },
    { patients: 0, doctors: 0, products: 0, appointments: 0, cancelled: 0, blogs: 0 },
  );
}

function filterKeys(year: number | null, month: number | null, day: Date | null): string[] {
  if (!year && !month && !day) return [];
  return Object.keys(DAY_DATA).filter(k => {
    const [y, m, d2] = k.split('-').map(Number);
    if (year  && y !== year)                         return false;
    if (month !== null && m !== month + 1)           return false;
    if (day   && (d2 !== day.getDate() || m !== day.getMonth() + 1 || y !== day.getFullYear())) return false;
    return true;
  });
}

function buildChart(year: number | null, month: number | null, day: Date | null) {
  const keys = Object.keys(DAY_DATA).sort();
  if (day) {
    const k   = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}`;
    const d   = DAY_DATA[k] ?? { appointments: 0, cancelled: 0 };
    return [{ label: k.slice(5).replace('-', '/'), appointments: d.appointments, cancelled: d.cancelled }];
  }
  if (month !== null && year) {
    return keys
      .filter(k => { const [y,m] = k.split('-').map(Number); return y === year && m === month + 1; })
      .map(k => ({ label: k.slice(8), appointments: DAY_DATA[k].appointments, cancelled: DAY_DATA[k].cancelled }));
  }
  if (year) {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    return months.map(m => {
      const mk  = String(m).padStart(2, '0');
      const mKeys = keys.filter(k => k.startsWith(`${year}-${mk}`));
      const appt = mKeys.reduce((s, k) => s + DAY_DATA[k].appointments, 0);
      const canc = mKeys.reduce((s, k) => s + DAY_DATA[k].cancelled, 0);
      const label = new Date(year, m - 1).toLocaleString('en-US', { month: 'short' });
      return { label, appointments: appt, cancelled: canc };
    });
  }
  // All data: group by year
  const years = [...new Set(keys.map(k => k.slice(0,4)))];
  return years.map(y => {
    const yKeys = keys.filter(k => k.startsWith(y));
    return {
      label: y,
      appointments: yKeys.reduce((s, k) => s + DAY_DATA[k].appointments, 0),
      cancelled:    yKeys.reduce((s, k) => s + DAY_DATA[k].cancelled, 0),
    };
  });
}

function trend(curr: number, prev: number) {
  if (prev === 0) return { pct: 0, up: true };
  const pct = Math.round(((curr - prev) / prev) * 100);
  return { pct, up: pct >= 0 };
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
function StatCard({ icon: Icon, label, value, color, bg, pct, up }: {
  icon: React.ElementType; label: string; value: number;
  color: string; bg: string; pct: number; up: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ backgroundColor: bg }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${up ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
          {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(pct)}%
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value.toLocaleString()}</p>
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Advanced Filter Panel
───────────────────────────────────────────── */
const YEARS = [...new Set(Object.keys(DAY_DATA).map(k => parseInt(k.slice(0, 4))))].sort();
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function FilterPanel({
  year, month, day,
  setYear, setMonth, setDay, onReset,
}: {
  year:    number | null;
  month:   number | null;
  day:     Date   | null;
  setYear:  (v: number | null) => void;
  setMonth: (v: number | null) => void;
  setDay:   (v: Date   | null) => void;
  onReset:  () => void;
}) {
  const hasFilter = year !== null || month !== null || day !== null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4" style={{ color: PRIMARY }} />
          <p className="text-sm font-bold text-gray-700">Date Filter</p>
        </div>
        {hasFilter && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-red-400 transition-colors"
          >
            <RefreshCcw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {/* Active filter tag */}
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

      {/* Year picker */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Year</p>
        <div className="flex gap-2 flex-wrap">
          {YEARS.map(y => (
            <button
              key={y}
              onClick={() => { setYear(year === y ? null : y); setMonth(null); setDay(null); }}
              className="flex-1 py-2 rounded-xl text-sm font-bold transition-all border"
              style={{
                backgroundColor: year === y ? PRIMARY : 'transparent',
                borderColor:     year === y ? PRIMARY : '#e5e7eb',
                color:           year === y ? '#fff'  : '#6b7280',
              }}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Month picker — always visible */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Month</p>
        <div className="grid grid-cols-4 gap-1.5">
          {MONTHS.map((m, i) => (
            <button
              key={m}
              onClick={() => { setMonth(month === i ? null : i); setDay(null); }}
              className="py-1.5 rounded-xl text-xs font-bold transition-all border"
              style={{
                backgroundColor: month === i ? `${PRIMARY}20` : 'transparent',
                borderColor:     month === i ? PRIMARY         : '#e5e7eb',
                color:           month === i ? PRIMARY         : '#9ca3af',
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Date picker — always visible */}
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
              : new Date(2026, 5, 1)
            }
            highlightDates={Object.keys(DAY_DATA).map(k => new Date(k + 'T00:00:00'))}
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
export default function AdminDashboardPage() {
  const [year,  setYear]  = useState<number | null>(null);
  const [month, setMonth] = useState<number | null>(null);
  const [day,   setDay]   = useState<Date   | null>(null);

  const onReset = () => { setYear(null); setMonth(null); setDay(null); };

  const data = useMemo(() => {
    const keys = filterKeys(year, month, day);
    return keys.length ? sumRange(keys) : ALL_TOTAL;
  }, [year, month, day]);

  const chartData = useMemo(() => buildChart(year, month, day), [year, month, day]);

  const hasFilter = year !== null || month !== null || day !== null;

  const filterLabel = useMemo(() => {
    if (!hasFilter) return 'All-time totals';
    if (day)   return day.toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
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
    { icon: Users,       label: 'Total Patients',         value: data.patients,     color: PRIMARY,   bg: '#e6f7f7', ...trend(data.patients, PREV.patients) },
    { icon: Stethoscope, label: 'Total Doctors',          value: data.doctors,      color: '#8b5cf6', bg: '#f5f3ff', ...trend(data.doctors, PREV.doctors) },
    { icon: ShoppingBag, label: 'Total Products',         value: data.products,     color: '#f59e0b', bg: '#fffbeb', ...trend(data.products, PREV.products) },
    { icon: Calendar,    label: 'Total Appointments',     value: data.appointments, color: '#3b82f6', bg: '#eff6ff', ...trend(data.appointments, PREV.appointments) },
    { icon: XCircle,     label: 'Cancelled Appointments', value: data.cancelled,    color: '#ef4444', bg: '#fef2f2', ...trend(data.cancelled, PREV.cancelled) },
    { icon: BookOpen,    label: 'Total Blogs',            value: data.blogs,        color: '#10b981', bg: '#ecfdf5', ...trend(data.blogs, PREV.blogs) },
  ];

  return (
    <>
      {/* Custom datepicker styles */}
      <style>{`
        .advanced-datepicker .react-datepicker {
          border: none;
          font-family: inherit;
          width: 100%;
          background: transparent;
        }
        .advanced-datepicker .react-datepicker__month-container { width: 100%; }
        .advanced-datepicker .react-datepicker__header {
          background: transparent;
          border-bottom: 1px solid #f3f4f6;
          padding: 8px 0 6px;
        }
        .advanced-datepicker .react-datepicker__current-month {
          font-size: 12px; font-weight: 700; color: #374151;
        }
        .advanced-datepicker .react-datepicker__navigation { top: 10px; }
        .advanced-datepicker .react-datepicker__navigation-icon::before {
          border-color: #9ca3af; border-width: 2px 2px 0 0; width: 6px; height: 6px;
        }
        .advanced-datepicker .react-datepicker__day-names { margin: 4px 0 0; }
        .advanced-datepicker .react-datepicker__day-name {
          font-size: 10px; font-weight: 700; color: #d1d5db;
          width: 30px; line-height: 28px; margin: 1px;
        }
        .advanced-datepicker .react-datepicker__day {
          width: 30px; line-height: 28px; margin: 1px;
          font-size: 11px; font-weight: 500; color: #374151;
          border-radius: 8px; transition: all 0.15s;
        }
        .advanced-datepicker .react-datepicker__day:hover {
          background: #e6f7f7; color: ${PRIMARY};
        }
        .advanced-datepicker .react-datepicker__day--selected {
          background: ${PRIMARY} !important; color: #fff !important; font-weight: 700;
        }
        .advanced-datepicker .react-datepicker__day--highlighted {
          background: #e6f7f7; color: ${PRIMARY}; font-weight: 700;
        }
        .advanced-datepicker .react-datepicker__day--outside-month { color: #e5e7eb; }
        .advanced-datepicker .react-datepicker__day--today {
          font-weight: 800; color: ${PRIMARY};
          box-shadow: inset 0 0 0 1.5px ${PRIMARY};
        }
        .advanced-datepicker .react-datepicker__month { margin: 4px 0; }
        .advanced-datepicker .react-datepicker__week { display: flex; justify-content: space-around; }
      `}</style>

      <div className="flex flex-col lg:flex-row gap-6 h-full">

        {/* ── Left: stats + chart ── */}
        <div className="flex-1 flex flex-col gap-5 min-w-0">

          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-sm text-gray-400 mt-0.5">{filterLabel}</p>
            </div>
            {hasFilter && (
              <button
                onClick={onReset}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-gray-200 text-gray-400 hover:text-red-400 hover:border-red-200 transition-all"
              >
                <RefreshCcw className="w-3 h-3" /> Show all data
              </button>
            )}
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {stats.map(s => <StatCard key={s.label} {...s} />)}
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

            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
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
                <Area type="monotone" dataKey="appointments" name="Appointments" stroke={PRIMARY}    strokeWidth={2.5} fill="url(#gradAppt)"   dot={{ r: 4, fill: PRIMARY,    strokeWidth: 0 }} activeDot={{ r: 6, fill: PRIMARY,    strokeWidth: 0 }} />
                <Area type="monotone" dataKey="cancelled"    name="Cancelled"    stroke="#f87171"   strokeWidth={2.5} fill="url(#gradCancel)" dot={{ r: 4, fill: '#f87171', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#f87171', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* ── Latest Appointments ── */}
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

            {/* Table header */}
            <div className="hidden sm:grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-5 py-2.5 bg-gray-50 border-b border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Patient</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Doctor</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date & Time</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-50">
              {LATEST_APPOINTMENTS.map((appt, i) => {
                const statusMap = {
                  confirmed: { label: 'Confirmed', color: '#10b981', bg: '#ecfdf5', icon: CheckCircle2 },
                  pending:   { label: 'Pending',   color: '#f59e0b', bg: '#fffbeb', icon: Clock        },
                  cancelled: { label: 'Cancelled', color: '#ef4444', bg: '#fef2f2', icon: Ban          },
                };
                const s = statusMap[appt.status];
                const StatusIcon = s.icon;
                return (
                  <div key={appt.id} className="grid sm:grid-cols-[1fr_1fr_auto_auto] gap-2 sm:gap-4 px-5 py-3.5 items-center hover:bg-gray-50/60 transition-colors">
                    {/* Patient */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ backgroundColor: ['#2ab5ad','#8b5cf6','#f59e0b','#3b82f6','#10b981'][i % 5] }}>
                        {appt.patient.split(' ').map(w => w[0]).join('').slice(0,2)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 leading-tight">{appt.patient}</p>
                        <p className="text-[10px] text-gray-400 sm:hidden">{appt.doctor}</p>
                      </div>
                    </div>
                    {/* Doctor */}
                    <p className="hidden sm:block text-sm text-gray-500">{appt.doctor}</p>
                    {/* Date */}
                    <div className="flex flex-col items-end sm:items-start">
                      <p className="text-xs font-semibold text-gray-600">{appt.date}</p>
                      <p className="text-[10px] text-gray-400">{appt.time}</p>
                    </div>
                    {/* Status */}
                    <div className="flex justify-end sm:justify-start">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: s.bg, color: s.color }}>
                        <StatusIcon className="w-3 h-3" />
                        {s.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* ── Right: Advanced filter ── */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="sticky top-0">
            <FilterPanel
              year={year} month={month} day={day}
              setYear={setYear} setMonth={setMonth} setDay={setDay}
              onReset={onReset}
            />
          </div>
        </div>

      </div>
    </>
  );
}
