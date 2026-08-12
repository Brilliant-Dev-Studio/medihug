'use client';

import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, CalendarClock, User, Calendar, Clock } from 'lucide-react';

const PRIMARY = '#2ab5ad';
const DARK    = '#1a9990';

interface WalletAppt {
  id: string; date: string; time: string | null;
  status: 'CONFIRMED' | 'COMPLETED';
  fee: number | null; doctorPayoutAmount: number | null;
  user: { name: string };
}

interface WalletData {
  totalEarned: number; upcomingTotal: number; thisMonthEarned: number;
  completedCount: number; appointments: WalletAppt[];
}

function payoutOf(a: WalletAppt): number {
  return a.doctorPayoutAmount ?? a.fee ?? 0;
}

function StatCard({ icon: Icon, label, value, color, bg }: {
  icon: React.ElementType; label: string; value: string; color: string; bg: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold text-gray-800 truncate">{value}</p>
        <p className="text-[11px] font-semibold text-gray-400 mt-0.5 uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 animate-pulse">
      <div className="w-9 h-9 rounded-full bg-gray-100 shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-3 w-32 bg-gray-100 rounded" />
        <div className="h-2.5 w-20 bg-gray-100 rounded" />
      </div>
      <div className="h-4 w-16 bg-gray-100 rounded" />
    </div>
  );
}

export default function DoctorWalletPage() {
  const [data, setData]       = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/doctor/wallet')
      .then(r => r.json())
      .then(d => setData(d))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Wallet className="w-5 h-5" style={{ color: PRIMARY }} /> Wallet
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">Your own slot fee per appointment — platform commission is never included here.</p>
      </div>

      {/* Hero */}
      <div className="rounded-2xl p-6 flex items-center gap-4" style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${DARK} 100%)` }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-white/15">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">Total Earned</p>
          {loading ? (
            <div className="h-8 w-40 rounded-lg bg-white/20 animate-pulse mt-1" />
          ) : (
            <p className="text-3xl font-extrabold text-white mt-0.5">{(data?.totalEarned ?? 0).toLocaleString()} <span className="text-base font-semibold text-white/70">MMK</span></p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={TrendingUp} label="This Month" color={PRIMARY} bg="#e6f7f7"
          value={loading ? '—' : `${(data?.thisMonthEarned ?? 0).toLocaleString()} MMK`} />
        <StatCard icon={CalendarClock} label="Upcoming (Confirmed)" color="#3b82f6" bg="#eff6ff"
          value={loading ? '—' : `${(data?.upcomingTotal ?? 0).toLocaleString()} MMK`} />
        <StatCard icon={User} label="Completed Appointments" color="#f59e0b" bg="#fffbeb"
          value={loading ? '—' : `${data?.completedCount ?? 0}`} />
      </div>

      {/* Appointment earnings list */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-700">Earnings by Appointment</p>
        </div>
        <div className="divide-y divide-gray-50">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : !data || data.appointments.length === 0 ? (
            <div className="py-16 text-center">
              <Wallet className="w-8 h-8 mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">No appointments yet.</p>
            </div>
          ) : (
            data.appointments.map(a => (
              <div key={a.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold" style={{ backgroundColor: PRIMARY }}>
                  {a.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 truncate">{a.user.name}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                    <Calendar className="w-3 h-3" /> {new Date(a.date).toLocaleDateString()}
                    {a.time && <><Clock className="w-3 h-3 ml-1" /> {a.time}</>}
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0"
                  style={{
                    backgroundColor: a.status === 'COMPLETED' ? '#ecfdf5' : '#eff6ff',
                    color: a.status === 'COMPLETED' ? '#10b981' : '#3b82f6',
                  }}>
                  {a.status === 'COMPLETED' ? 'Paid' : 'Upcoming'}
                </span>
                <p className="text-sm font-bold text-gray-800 shrink-0 w-24 text-right">{payoutOf(a).toLocaleString()} MMK</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
