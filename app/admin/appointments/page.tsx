'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, ChevronLeft, ChevronRight, X,
  Calendar, Loader2, Clock, Eye,
} from 'lucide-react';
import {
  PRIMARY, AVATAR_COLORS, STATUS_STYLE, STATUS_OPTIONS, t,
  StatusBadgeClickable, LangDropdown, type Appointment,
} from './shared';
import { useLang } from '../../lib/LanguageContext';

export default function AdminAppointmentsPage() {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [total,        setTotal]        = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [status,       setStatus]       = useState('');
  const [page,         setPage]         = useState(1);
  const [showFilter,   setShowFilter]   = useState(false);
  const PAGE_SIZE = 10;

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasFilter = !!status;

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({ search, status, page: String(page), pageSize: String(PAGE_SIZE) });
    const res  = await fetch(`/api/admin/appointments?${p}`);
    const data = await res.json();
    setAppointments(data.appointments ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [search, status, page]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  async function updateStatus(id: string, next: Appointment['status']) {
    setAppointments(a => a.map(x => x.id === id ? { ...x, status: next } : x));
    await fetch(`/api/admin/appointments/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
  }

  const counts = {
    pending:   appointments.filter(a => a.status === 'PENDING').length,
    confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
    completed: appointments.filter(a => a.status === 'COMPLETED').length,
  };

  return (
    <div className="flex flex-col gap-5">

      {/* Top row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          {[
            { label: t(mm, { mm: 'စုစုပေါင်း', en: 'Total' }),     value: total,             color: PRIMARY,   bg: '#e6f7f7' },
            { label: t(mm, { mm: 'စောင့်ဆိုင်းဆဲ', en: 'Pending' }),   value: counts.pending,    color: '#d97706', bg: '#fffbeb' },
            { label: t(mm, { mm: 'အတည်ပြုပြီး', en: 'Confirmed' }), value: counts.confirmed,  color: '#3b82f6', bg: '#eff6ff' },
            { label: t(mm, { mm: 'ပြီးဆုံး', en: 'Completed' }), value: counts.completed,  color: '#10b981', bg: '#ecfdf5' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-2xl px-4 py-2.5">
              <span className="text-lg font-bold" style={{ color: s.color }}>{s.value}</span>
              <span className="text-xs text-gray-400 font-medium">{s.label}</span>
            </div>
          ))}
        </div>
        <LangDropdown />
      </div>

      {/* Search + filter bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2.5 bg-gray-50 rounded-xl px-3.5 py-2.5">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder={t(mm, { mm: 'လူနာ၊ ဆရာဝန်အမည် သို့မဟုတ် ဖုန်းဖြင့် ရှာပါ...', en: 'Search by patient or doctor name, phone...' })}
            className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400" />
          {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-gray-300 hover:text-gray-500" /></button>}
        </div>
        <button onClick={() => setShowFilter(f => !f)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all"
          style={{ backgroundColor: showFilter ? PRIMARY : 'transparent', borderColor: showFilter ? PRIMARY : '#e5e7eb', color: showFilter ? '#fff' : '#6b7280' }}>
          <Filter className="w-4 h-4" /> {t(mm, { mm: 'စစ်ထုတ်ရန်', en: 'Filters' })}
          {hasFilter && <span className="w-4 h-4 rounded-full bg-white text-[10px] font-bold flex items-center justify-center" style={{ color: PRIMARY }}>1</span>}
        </button>
      </div>

      {/* Filter panel */}
      {showFilter && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t(mm, { mm: 'အခြေအနေ', en: 'Status' })}</label>
            <div className="flex gap-1.5">
              {([['', t(mm, { mm: 'အားလုံး', en: 'All' })], ...STATUS_OPTIONS.map(s => [s, t(mm, STATUS_STYLE[s].label)])] as [string, string][]).map(([v, l]) => (
                <button key={v} onClick={() => { setStatus(v); setPage(1); }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
                  style={{ backgroundColor: status === v ? `${PRIMARY}15` : 'transparent', borderColor: status === v ? PRIMARY : '#e5e7eb', color: status === v ? PRIMARY : '#9ca3af' }}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          {hasFilter && (
            <button onClick={() => { setStatus(''); setPage(1); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 border border-red-100 hover:bg-red-50 transition-colors">
              <X className="w-3 h-3" /> {t(mm, { mm: 'ပြန်လည်သတ်မှတ်ရန်', en: 'Reset' })}
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-xs text-gray-400">
            {mm
              ? <>ချိန်းဆိုမှု <span className="font-bold text-gray-600">{total}</span> အနက် <span className="font-bold text-gray-600">{appointments.length}</span> ခု ပြသနေသည်</>
              : <>Showing <span className="font-bold text-gray-600">{appointments.length}</span> of <span className="font-bold text-gray-600">{total}</span> bookings</>
            }
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-225">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {(mm
                  ? ['#', 'လူနာ', 'ဆရာဝန်', 'ရက်စွဲ / အချိန်', 'အကြောင်းအရာ', 'ကျသင့်ငွေ', 'ငွေပေးချေမှု', 'အခြေအနေ', 'လုပ်ဆောင်ချက်']
                  : ['#', 'Patient', 'Doctor', 'Date / Time', 'Reason', 'Fee', 'Payment', 'Status', 'Action']
                ).map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={9} className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" /></td></tr>
              ) : appointments.length === 0 ? (
                <tr><td colSpan={9} className="py-16 text-center">
                  <Calendar className="w-8 h-8 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">{t(mm, { mm: 'ချိန်းဆိုမှု မတွေ့ပါ', en: 'No bookings found.' })}</p>
                </td></tr>
              ) : appointments.map((a, i) => (
                <tr key={a.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3.5 text-xs text-gray-400">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-semibold text-gray-700 whitespace-nowrap">{a.user.name}</p>
                    <p className="text-[10px] text-gray-400">{a.user.phone}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      {a.doctor.imageUrl ? (
                        <img src={a.doctor.imageUrl} alt={a.doctor.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                          style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                          {a.doctor.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-700 whitespace-nowrap">{a.doctor.nameEn ?? a.doctor.name}</p>
                        <p className="text-[10px] text-gray-400">{a.doctor.specialtyEn ?? a.doctor.specialty}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-300" />
                      {new Date(a.date).toLocaleDateString()}
                    </div>
                    {a.time && (
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-400">
                        <Clock className="w-3 h-3" /> {a.time}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 max-w-45 truncate">{a.reason ?? '—'}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap">{a.fee ? `${a.fee.toLocaleString()} MMK` : '—'}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap capitalize">{a.paymentMethod ?? '—'}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadgeClickable status={a.status} onChanged={next => updateStatus(a.id, next)} />
                  </td>
                  <td className="px-4 py-3.5">
                    <a href={`/admin/appointments/${a.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-all hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50"
                      style={{ borderColor: '#e5e7eb', color: '#6b7280' }}>
                      <Eye className="w-3.5 h-3.5" /> {t(mm, { mm: 'ကြည့်ရှုရန်', en: 'View' })}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-all">
              <ChevronLeft className="w-3.5 h-3.5" /> {t(mm, { mm: 'ရှေ့သို့', en: 'Prev' })}
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  className="w-8 h-8 rounded-xl text-xs font-bold transition-all"
                  style={{ backgroundColor: page === n ? PRIMARY : 'transparent', color: page === n ? '#fff' : '#9ca3af' }}>
                  {n}
                </button>
              ))}
            </div>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-all">
              {t(mm, { mm: 'နောက်သို့', en: 'Next' })} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
