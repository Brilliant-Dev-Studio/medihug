'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, ChevronLeft, ChevronRight, X,
  Calendar, Loader2, Clock, CalendarClock,
  Hourglass, CheckCircle2, XCircle, ChevronDown, Eye,
} from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';

const PRIMARY = '#2ab5ad';
const AVATAR_COLORS = ['#2ab5ad', '#8b5cf6', '#f59e0b', '#3b82f6', '#10b981', '#ef4444'];

type T = { mm: string; en: string };
const t = (mm: boolean, x: T) => (mm ? x.mm : x.en);

type Status = 'PENDING' | 'APPROVED' | 'REJECTED';

interface CustomTimeRequest {
  id: string;
  requestedDate: string;
  requestedTime: string;
  note: string | null;
  status: Status;
  createdAt: string;
  user:   { name: string; phone: string };
  doctor: { name: string; nameEn: string | null; specialty: string; imageUrl: string | null };
}

const STATUS_STYLE: Record<Status, { bg: string; color: string; icon: React.ElementType; label: T }> = {
  PENDING:  { bg: '#fffbeb', color: '#d97706', icon: Hourglass,    label: { mm: 'စောင့်ဆိုင်းဆဲ', en: 'Pending' } },
  APPROVED: { bg: '#ecfdf5', color: '#10b981', icon: CheckCircle2, label: { mm: 'အတည်ပြုပြီး',    en: 'Approved' } },
  REJECTED: { bg: '#fef2f2', color: '#ef4444', icon: XCircle,      label: { mm: 'ပယ်ချ',          en: 'Rejected' } },
};
const STATUS_OPTIONS: Status[] = ['PENDING', 'APPROVED', 'REJECTED'];

function StatusBadge({ status, onChanged }: { status: Status; onChanged: (next: Status) => void }) {
  const [open, setOpen] = useState(false);
  const s = STATUS_STYLE[status];
  const { lang } = useLang();
  const mm = lang === 'mm';

  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <button onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full"
        style={{ backgroundColor: s.bg, color: s.color }}>
        <s.icon className="w-3 h-3" /> {t(mm, s.label)} <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute z-40 mt-1 bg-white rounded-xl border border-gray-100 shadow-lg py-1 min-w-32">
            {STATUS_OPTIONS.map(opt => {
              const os = STATUS_STYLE[opt];
              return (
                <button key={opt} onClick={() => { onChanged(opt); setOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-left hover:bg-gray-50 transition-colors"
                  style={{ color: os.color }}>
                  <os.icon className="w-3 h-3" /> {t(mm, os.label)}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function CustomTimeRequestsPage() {
  const { lang } = useLang();
  const mm = lang === 'mm';
  const [requests,  setRequests]  = useState<CustomTimeRequest[]>([]);
  const [total,     setTotal]     = useState(0);
  const [pending,   setPending]   = useState(0);
  const [approved,  setApproved]  = useState(0);
  const [rejected,  setRejected]  = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [status,    setStatus]    = useState('');
  const [page,      setPage]      = useState(1);
  const [showFilter, setShowFilter] = useState(false);
  const PAGE_SIZE = 10;

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasFilter = !!status;

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({ search, status, page: String(page), pageSize: String(PAGE_SIZE) });
    const res  = await fetch(`/api/admin/custom-time-requests?${p}`);
    const data = await res.json();
    setRequests(data.requests ?? []);
    setTotal(data.total ?? 0);
    setPending(data.pending ?? 0);
    setApproved(data.approved ?? 0);
    setRejected(data.rejected ?? 0);
    setLoading(false);
  }, [search, status, page]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  async function updateStatus(id: string, next: Status) {
    setRequests(r => r.map(x => x.id === id ? { ...x, status: next } : x));
    await fetch(`/api/admin/custom-time-requests/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    fetchRequests();
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Top row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          {[
            { label: t(mm, { mm: 'စုစုပေါင်း', en: 'Total' }),      value: total,    color: PRIMARY,   bg: '#e6f7f7' },
            { label: t(mm, { mm: 'စောင့်ဆိုင်းဆဲ', en: 'Pending' }), value: pending,  color: '#d97706', bg: '#fffbeb' },
            { label: t(mm, { mm: 'အတည်ပြုပြီး', en: 'Approved' }), value: approved, color: '#10b981', bg: '#ecfdf5' },
            { label: t(mm, { mm: 'ပယ်ချ', en: 'Rejected' }),        value: rejected, color: '#ef4444', bg: '#fef2f2' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-2xl px-4 py-2.5">
              <span className="text-lg font-bold" style={{ color: s.color }}>{s.value}</span>
              <span className="text-xs text-gray-400 font-medium">{s.label}</span>
            </div>
          ))}
        </div>
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
              ? <>တောင်းဆိုမှု <span className="font-bold text-gray-600">{total}</span> အနက် <span className="font-bold text-gray-600">{requests.length}</span> ခု ပြသနေသည်</>
              : <>Showing <span className="font-bold text-gray-600">{requests.length}</span> of <span className="font-bold text-gray-600">{total}</span> requests</>
            }
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-200">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {(mm
                  ? ['#', 'လူနာ', 'ဆရာဝန်', 'တောင်းဆိုသောရက်/အချိန်', 'မှတ်ချက်', 'အခြေအနေ', 'တောင်းဆိုချိန်', 'လုပ်ဆောင်ချက်']
                  : ['#', 'Patient', 'Doctor', 'Requested Date/Time', 'Note', 'Status', 'Requested At', 'Action']
                ).map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" /></td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center">
                  <CalendarClock className="w-8 h-8 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">{t(mm, { mm: 'တောင်းဆိုမှု မတွေ့ပါ', en: 'No requests found.' })}</p>
                </td></tr>
              ) : requests.map((r, i) => (
                <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3.5 text-xs text-gray-400">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-semibold text-gray-700 whitespace-nowrap">{r.user.name}</p>
                    <p className="text-[10px] text-gray-400">{r.user.phone}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      {r.doctor.imageUrl ? (
                        <img src={r.doctor.imageUrl} alt={r.doctor.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                          style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                          {r.doctor.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-700 whitespace-nowrap">{r.doctor.nameEn ?? r.doctor.name}</p>
                        <p className="text-[10px] text-gray-400">{r.doctor.specialty}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-300" />
                      {new Date(r.requestedDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-400">
                      <Clock className="w-3 h-3" /> {r.requestedTime}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 max-w-45 truncate">{r.note ?? '—'}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={r.status} onChanged={next => updateStatus(r.id, next)} />
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3.5">
                    <a href={`/admin/custom-time-requests/${r.id}`}
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
