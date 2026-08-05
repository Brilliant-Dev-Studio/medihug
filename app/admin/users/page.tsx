'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Filter, ChevronLeft, ChevronRight,
  Eye, CheckCircle2, XCircle, ChevronDown, X, Trash2, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/admin/ConfirmModal';

const PRIMARY = '#2ab5ad';

interface Patient {
  id: string; name: string; phone: string;
  gender: 'MALE' | 'FEMALE' | null;
  birthday: string | null;
  state: string | null; township: string | null;
  isActive: boolean; createdAt: string;
  _count: { appointments: number };
}

const STATES = ['Yangon', 'Mandalay', 'Naypyidaw', 'Bago', 'Sagaing', 'Magway', 'Ayeyarwady', 'Tanintharyi', 'Mon', 'Kayah', 'Kayin', 'Chin', 'Kachin', 'Shan', 'Rakhine'];
const PAGE_SIZE_OPTIONS = [5, 10, 20];
const AVATAR_COLORS = ['#2ab5ad','#8b5cf6','#f59e0b','#3b82f6','#10b981'];

function age(birthday: string | null) {
  if (!birthday) return '—';
  const b = new Date(birthday);
  const now = new Date();
  let a = now.getFullYear() - b.getFullYear();
  if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) a--;
  return a;
}

export default function AdminPatientsPage() {
  const router = useRouter();
  const [patients,   setPatients]   = useState<Patient[]>([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [genderF,    setGenderF]    = useState('');
  const [statusF,    setStatusF]    = useState('');
  const [stateF,     setStateF]     = useState('');
  const [page,       setPage]       = useState(1);
  const [pageSize,   setPageSize]   = useState(10);
  const [showFilter, setShowFilter] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Patient | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({
      search, gender: genderF, isActive: statusF, state: stateF,
      page: String(page), pageSize: String(pageSize),
    });
    const res  = await fetch(`/api/admin/users?${p}`);
    const data = await res.json();
    setPatients(data.users ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [search, genderF, statusF, stateF, page, pageSize]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const totalPages = Math.ceil(total / pageSize);
  const resetFilters = () => { setGenderF(''); setStatusF(''); setStateF(''); setPage(1); };
  const hasFilter    = genderF || statusF || stateF;
  const activeCount  = patients.filter(p => p.isActive).length;

  const confirmRemove = async () => {
    if (!removeTarget) return;
    setRemovingId(removeTarget.id);
    try {
      const res = await fetch(`/api/admin/users/${removeTarget.id}`, { method: 'DELETE' });
      if (!res.ok) { toast.error('Failed to delete patient'); return; }
      toast.success('Patient deleted');
      setPatients(prev => prev.filter(p => p.id !== removeTarget.id));
      setTotal(prev => Math.max(0, prev - 1));
    } catch {
      toast.error('Failed to delete patient');
    } finally {
      setRemovingId(null);
      setRemoveTarget(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">

      {/* ── Summary chips ── */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Total Patients', value: total,                          color: PRIMARY,   bg: '#e6f7f7' },
          { label: 'Active',         value: activeCount,                    color: '#10b981', bg: '#ecfdf5' },
          { label: 'Inactive',       value: patients.length - activeCount,  color: '#ef4444', bg: '#fef2f2' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-2xl px-4 py-2.5">
            <span className="text-lg font-bold" style={{ color: s.color }}>{s.value}</span>
            <span className="text-xs text-gray-400 font-medium">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Search + filter bar ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">

        <div className="flex-1 flex items-center gap-2.5 bg-gray-50 rounded-xl px-3.5 py-2.5">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or phone..."
            className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-gray-300 hover:text-gray-500">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilter(f => !f)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all"
          style={{
            backgroundColor: showFilter ? PRIMARY : 'transparent',
            borderColor:     showFilter ? PRIMARY : '#e5e7eb',
            color:           showFilter ? '#fff'  : '#6b7280',
          }}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasFilter && <span className="w-4 h-4 rounded-full bg-white text-[10px] font-bold flex items-center justify-center" style={{ color: PRIMARY }}>{[genderF, statusF, stateF].filter(Boolean).length}</span>}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 shrink-0">Show</span>
          <div className="relative">
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 pl-3 pr-7 py-2.5 outline-none cursor-pointer"
            >
              {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── Filter panel ── */}
      {showFilter && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-4 items-end">

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gender</label>
            <div className="flex gap-1.5">
              {([['','All'],['MALE','Male'],['FEMALE','Female']] as [string,string][]).map(([v,l]) => (
                <button key={v} onClick={() => { setGenderF(v); setPage(1); }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
                  style={{
                    backgroundColor: genderF === v ? `${PRIMARY}15` : 'transparent',
                    borderColor:     genderF === v ? PRIMARY : '#e5e7eb',
                    color:           genderF === v ? PRIMARY : '#9ca3af',
                  }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</label>
            <div className="flex gap-1.5">
              {([['','All'],['true','Active'],['false','Inactive']] as [string,string][]).map(([v,l]) => (
                <button key={v} onClick={() => { setStatusF(v); setPage(1); }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
                  style={{
                    backgroundColor: statusF === v ? `${PRIMARY}15` : 'transparent',
                    borderColor:     statusF === v ? PRIMARY : '#e5e7eb',
                    color:           statusF === v ? PRIMARY : '#9ca3af',
                  }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">State / Region</label>
            <div className="relative">
              <select
                value={stateF}
                onChange={e => { setStateF(e.target.value); setPage(1); }}
                className="appearance-none bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 pl-3 pr-8 py-2 outline-none cursor-pointer min-w-35"
              >
                <option value="">All States</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {hasFilter && (
            <button onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 border border-red-100 hover:bg-red-50 transition-colors">
              <X className="w-3 h-3" /> Reset
            </button>
          )}
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Showing <span className="font-bold text-gray-600">{patients.length}</span> of <span className="font-bold text-gray-600">{total}</span> patients
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-175">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['#', 'Patient', 'Phone', 'Gender', 'Age', 'Location', 'Joined', 'Status', 'Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={9} className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" /></td></tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-sm text-gray-400">No patients found.</td>
                </tr>
              ) : patients.map((p, i) => (
                <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3.5 text-xs text-gray-400">{(page - 1) * pageSize + i + 1}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                        {p.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <p className="text-sm font-semibold text-gray-700 whitespace-nowrap">{p.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap">{p.phone}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-500">{p.gender ? (p.gender === 'MALE' ? 'Male' : 'Female') : '—'}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-500">{age(p.birthday)}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap">{[p.township, p.state].filter(Boolean).join(', ') || '—'}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${p.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-400'}`}>
                      {p.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => router.push(`/admin/users/${p.id}`)}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50"
                        style={{ borderColor: '#e5e7eb', color: '#6b7280' }}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setRemoveTarget(p)}
                        disabled={removingId === p.id}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all hover:border-red-300 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
                        style={{ borderColor: '#e5e7eb', color: '#6b7280' }}
                      >
                        {removingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className="w-8 h-8 rounded-xl text-xs font-bold transition-all"
                  style={{
                    backgroundColor: page === n ? PRIMARY : 'transparent',
                    color:           page === n ? '#fff'  : '#9ca3af',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!removeTarget}
        title="Delete patient permanently?"
        message={removeTarget ? `"${removeTarget.name}" and all related data (appointments${removeTarget._count.appointments ? ` — ${removeTarget._count.appointments} record(s)` : ''}, favorites, custom time requests) will be permanently deleted. This cannot be undone.` : ''}
        confirmLabel="Delete"
        variant="danger"
        loading={removingId === removeTarget?.id}
        onConfirm={confirmRemove}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}
