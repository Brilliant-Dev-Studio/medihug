'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Search, X, ChevronLeft, ChevronRight, Calendar, ShoppingBag, Package,
  User, Phone, CheckCircle2, XCircle, Circle, ClipboardList,
} from 'lucide-react';
import { useRealtime } from '@/components/RealtimeProvider';

const PRIMARY = '#3b5bdb';
const PAGE_SIZE = 10;

interface Step { key: string; labelMm: string; labelEn: string; state: 'done' | 'cancelled' | 'upcoming'; at: string | null }
interface Doctor { id: string; name: string; nameEn: string | null }
interface AppointmentRow {
  id: string; date: string; user: { name: string; phone: string };
  doctor: { id: string; name: string; nameEn: string | null; specialty: string; specialtyEn: string | null; imageUrl: string | null };
  status: string; steps: Step[];
}
interface OrderItem { id: string; quantity: number; price: number; product: { name: string; nameEn: string | null; imageUrl: string | null } }
interface OrderRow {
  id: string; status: string; createdAt: string; user: { name: string; phone: string };
  items: OrderItem[]; subtotal: number; steps: Step[];
}

function Skel({ className }: { className: string }) {
  return <div className={`bg-gray-100 rounded-md animate-pulse ${className}`} />;
}

function StepTracker({ steps }: { steps: Step[] }) {
  return (
    <div className="flex items-center flex-wrap gap-x-1 gap-y-2">
      {steps.map((s, i) => {
        const isLast = i === steps.length - 1;
        const Icon = s.state === 'done' ? CheckCircle2 : s.state === 'cancelled' ? XCircle : Circle;
        const color = s.state === 'done' ? '#10b981' : s.state === 'cancelled' ? '#ef4444' : '#d1d5db';
        return (
          <div key={s.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1 px-1.5" style={{ minWidth: 84 }}>
              <Icon className="w-4 h-4 shrink-0" style={{ color }} />
              <span className="text-[10px] font-semibold text-center leading-tight" style={{ color: s.state === 'upcoming' ? '#9ca3af' : '#374151' }}>
                {s.labelEn}
              </span>
              {s.at && <span className="text-[9px] text-gray-400">{new Date(s.at).toLocaleDateString()}</span>}
            </div>
            {!isLast && <div className="w-5 h-px shrink-0" style={{ backgroundColor: s.state === 'done' ? '#10b981' : '#e5e7eb' }} />}
          </div>
        );
      })}
    </div>
  );
}

function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 py-1">
      <button onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1}
        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-colors">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
      <button onClick={() => onPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-colors">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function AppointmentsTab() {
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { fetch('/api/partner/doctors').then(r => r.json()).then(d => setDoctors(d.doctors ?? [])); }, []);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({ search, doctorId, page: String(page), pageSize: String(PAGE_SIZE) });
    const res = await fetch(`/api/partner/medi-record/appointments?${p}`);
    const data = await res.json();
    setAppointments(data.appointments ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [search, doctorId, page]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2.5 bg-gray-50 rounded-xl px-3.5 py-2.5">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by patient name or phone..."
            className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400" />
          {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-gray-300 hover:text-gray-500" /></button>}
        </div>
        <select value={doctorId} onChange={e => { setDoctorId(e.target.value); setPage(1); }}
          className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 outline-none bg-white">
          <option value="">All doctors</option>
          {doctors.map(d => <option key={d.id} value={d.id}>{d.nameEn ?? d.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-5 py-4 flex flex-col gap-3">
              <Skel className="h-3.5 w-40" />
              <Skel className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <Calendar className="w-8 h-8 mx-auto text-gray-200 mb-2" />
          <p className="text-sm text-gray-400">No appointments yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
          {appointments.map(a => {
            const doctorName = a.doctor.nameEn ?? a.doctor.name;
            return (
              <div key={a.id} className="px-5 py-4 flex flex-col gap-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <User className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                    <p className="text-sm font-semibold text-gray-800 truncate">{a.user.name}</p>
                    <span className="text-xs text-gray-300">·</span>
                    <Phone className="w-3 h-3 text-gray-300 shrink-0" />
                    <p className="text-xs text-gray-400">{a.user.phone}</p>
                    <span className="text-xs text-gray-300">·</span>
                    <p className="text-xs text-gray-400">Dr. {doctorName}</p>
                  </div>
                  <p className="text-xs text-gray-400 shrink-0">{new Date(a.date).toLocaleDateString()}</p>
                </div>
                <StepTracker steps={a.steps} />
              </div>
            );
          })}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({ search, page: String(page), pageSize: String(PAGE_SIZE) });
    const res = await fetch(`/api/partner/medi-record/orders?${p}`);
    const data = await res.json();
    setOrders(data.orders ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [search, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-2.5">
        <div className="flex-1 flex items-center gap-2.5 bg-gray-50 rounded-xl px-3.5 py-2.5">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by patient name or phone..."
            className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400" />
          {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-gray-300 hover:text-gray-500" /></button>}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-5 py-4 flex flex-col gap-3">
              <Skel className="h-3.5 w-40" />
              <Skel className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <ShoppingBag className="w-8 h-8 mx-auto text-gray-200 mb-2" />
          <p className="text-sm text-gray-400">No orders yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
          {orders.map(o => (
            <div key={o.id} className="px-5 py-4 flex flex-col gap-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <User className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                  <p className="text-sm font-semibold text-gray-800 truncate">{o.user.name}</p>
                  <span className="text-xs text-gray-300">·</span>
                  <Phone className="w-3 h-3 text-gray-300 shrink-0" />
                  <p className="text-xs text-gray-400">{o.user.phone}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {o.items[0]?.product.imageUrl ? (
                    <img src={o.items[0].product.imageUrl} alt="" className="w-6 h-6 rounded-lg object-cover border border-gray-100" />
                  ) : (
                    <div className="w-6 h-6 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                      <Package className="w-3 h-3 text-gray-300" />
                    </div>
                  )}
                  <span className="text-xs text-gray-500 truncate max-w-40">
                    {o.items[0]?.product.name}{o.items.length > 1 ? ` +${o.items.length - 1}` : ''}
                  </span>
                  <span className="text-sm font-bold text-gray-700">{o.subtotal.toLocaleString()} Ks</span>
                </div>
              </div>
              <StepTracker steps={o.steps} />
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </div>
  );
}

export default function MediRecordPage() {
  const [tab, setTab] = useState<'appointments' | 'orders'>('appointments');
  // Any Medi Record notification (medi-record-appointment-step / medi-record-order-step)
  // means a step changed server-side — re-render on the next notification arrival by keying
  // off the notifications list length so the active tab re-fetches without a second websocket.
  const { notifications } = useRealtime();
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    if (notifications.some(n => n.type.startsWith('medi-record-'))) setRefreshKey(k => k + 1);
  }, [notifications]);

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2"><ClipboardList className="w-5 h-5" style={{ color: PRIMARY }} /> Medi Record</h1>
        <p className="text-xs text-gray-400 mt-0.5">Track your doctors&apos; appointment steps and product purchase steps</p>
      </div>

      <div className="flex items-center gap-2 border-b border-gray-100">
        {(['appointments', 'orders'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors"
            style={{ borderColor: tab === t ? PRIMARY : 'transparent', color: tab === t ? PRIMARY : '#9ca3af' }}>
            {t === 'appointments' ? 'Appointments' : 'Purchases'}
          </button>
        ))}
      </div>

      {tab === 'appointments' ? <AppointmentsTab key={`a-${refreshKey}`} /> : <OrdersTab key={`o-${refreshKey}`} />}
    </div>
  );
}
