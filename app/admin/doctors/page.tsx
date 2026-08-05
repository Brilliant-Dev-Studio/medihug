'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Search, Filter, Plus, ChevronLeft, ChevronRight,
  ChevronDown, X, Eye, Star, Stethoscope,
  Loader2, Download, Upload, Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/admin/ConfirmModal';

const PRIMARY = '#2ab5ad';

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface Slot {
  id?:        string;
  dayOfWeek:  number;
  startTime:  string;
  endTime:    string;
  duration:   number;
  maxPerSlot: number;
}
interface Doctor {
  id: string; name: string; nameEn: string | null;
  specialty: string; specialtyEn: string | null;
  phone: string | null; imageUrl: string | null;
  experience: number; rating: number; price: number;
  isAvailable: boolean; isActive: boolean; isSuggested: boolean;
  createdAt: string; slots: Slot[];
}

const DAYS        = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const AVATAR_COLORS = ['#2ab5ad','#8b5cf6','#f59e0b','#3b82f6','#10b981','#ef4444'];

interface SpecialtyItem { id: string; name: string; }

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function AdminDoctorsPage() {
  const [doctors,        setDoctors]        = useState<Doctor[]>([]);
  const [total,          setTotal]          = useState(0);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState('');
  const [specialty,      setSpecialty]      = useState('');
  const [isAvail,        setIsAvail]        = useState('');
  const [isActive,       setIsActive]       = useState('');
  const [page,           setPage]           = useState(1);
  const [showFilter,     setShowFilter]     = useState(false);
  const [filterSpecialties, setFilterSpecialties] = useState<SpecialtyItem[]>([]);
  const [importing, setImporting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<Doctor | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [suggestTarget, setSuggestTarget] = useState<Doctor | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  const PAGE_SIZE = 10;

  useEffect(() => {
    fetch('/api/admin/specialties').then(r => r.json()).then(d => setFilterSpecialties(d.specialties ?? []));
  }, []);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({ search, specialty, isAvailable: isAvail, isActive, page: String(page), pageSize: String(PAGE_SIZE) });
    const res  = await fetch(`/api/admin/doctors?${p}`);
    const data = await res.json();
    setDoctors(data.doctors ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [search, specialty, isAvail, isActive, page]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const confirmRemove = async () => {
    if (!removeTarget) return;
    setRemovingId(removeTarget.id);
    try {
      const res = await fetch(`/api/admin/doctors/${removeTarget.id}`, { method: 'DELETE' });
      if (!res.ok) { toast.error('Failed to remove doctor'); return; }
      toast.success('Doctor removed');
      setDoctors(prev => prev.filter(d => d.id !== removeTarget.id));
      setTotal(prev => Math.max(0, prev - 1));
    } catch {
      toast.error('Failed to remove doctor');
    } finally {
      setRemovingId(null);
      setRemoveTarget(null);
    }
  };

  const confirmToggleSuggested = async () => {
    if (!suggestTarget) return;
    const doctor = suggestTarget;
    setTogglingId(doctor.id);
    const next = !doctor.isSuggested;
    setDoctors(prev => prev.map(d => d.id === doctor.id ? { ...d, isSuggested: next } : d));
    try {
      const res = await fetch(`/api/admin/doctors/${doctor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSuggested: next }),
      });
      if (!res.ok) throw new Error();
      toast.success(next ? 'Marked as suggested' : 'Removed from suggested');
    } catch {
      setDoctors(prev => prev.map(d => d.id === doctor.id ? { ...d, isSuggested: !next } : d));
      toast.error('Failed to update suggestion');
    } finally {
      setTogglingId(null);
      setSuggestTarget(null);
    }
  };

  const hasFilter = specialty || isAvail || isActive;
  const resetFilters = () => { setSpecialty(''); setIsAvail(''); setIsActive(''); setPage(1); };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImporting(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res  = await fetch('/api/admin/doctors/import', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? 'Import failed'); return; }
      if (data.createdCount > 0) {
        toast.success(`Imported ${data.createdCount} of ${data.total} doctors`);
      }
      if (data.skipped?.length > 0) {
        toast.error(`${data.skipped.length} row(s) skipped — e.g. row ${data.skipped[0].row}: ${data.skipped[0].reason}`, { duration: 6000 });
      }
      fetchDoctors();
    } catch {
      toast.error('Import failed — check the file and try again');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">

      {/* Top row */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Total', value: total,                                       color: PRIMARY,   bg: '#e6f7f7' },
            { label: 'Active', value: doctors.filter(d => d.isActive).length,    color: '#10b981', bg: '#ecfdf5' },
            { label: 'Available', value: doctors.filter(d => d.isAvailable).length, color: '#3b82f6', bg: '#eff6ff' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-2xl px-4 py-2.5">
              <span className="text-lg font-bold" style={{ color: s.color }}>{s.value}</span>
              <span className="text-xs text-gray-400 font-medium">{s.label}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2.5">
          <a href="/api/admin/doctors/export"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </a>
          <button onClick={() => importFileRef.current?.click()} disabled={importing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-60">
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {importing ? 'Importing…' : 'Import CSV'}
          </button>
          <input ref={importFileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleImport} />
          <Link href="/admin/doctors/create"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ backgroundColor: PRIMARY }}>
            <Plus className="w-4 h-4" /> Create Doctor
          </Link>
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2.5 bg-gray-50 rounded-xl px-3.5 py-2.5">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or phone..."
            className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400" />
          {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-gray-300 hover:text-gray-500" /></button>}
        </div>
        <button onClick={() => setShowFilter(f => !f)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all"
          style={{ backgroundColor: showFilter ? PRIMARY : 'transparent', borderColor: showFilter ? PRIMARY : '#e5e7eb', color: showFilter ? '#fff' : '#6b7280' }}>
          <Filter className="w-4 h-4" /> Filters
          {hasFilter && <span className="w-4 h-4 rounded-full bg-white text-[10px] font-bold flex items-center justify-center" style={{ color: PRIMARY }}>
            {[specialty, isAvail, isActive].filter(Boolean).length}
          </span>}
        </button>
      </div>

      {/* Filter panel */}
      {showFilter && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Specialty</label>
            <div className="relative">
              <select value={specialty} onChange={e => { setSpecialty(e.target.value); setPage(1); }}
                className="appearance-none bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 pl-3 pr-8 py-2 outline-none cursor-pointer min-w-44">
                <option value="">All</option>
                {filterSpecialties.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Availability</label>
            <div className="flex gap-1.5">
              {([['','All'],['true','Available'],['false','Unavailable']] as [string,string][]).map(([v,l]) => (
                <button key={v} onClick={() => { setIsAvail(v); setPage(1); }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
                  style={{ backgroundColor: isAvail===v ? `${PRIMARY}15`:'transparent', borderColor: isAvail===v ? PRIMARY:'#e5e7eb', color: isAvail===v ? PRIMARY:'#9ca3af' }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</label>
            <div className="flex gap-1.5">
              {([['','All'],['true','Active'],['false','Inactive']] as [string,string][]).map(([v,l]) => (
                <button key={v} onClick={() => { setIsActive(v); setPage(1); }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
                  style={{ backgroundColor: isActive===v ? `${PRIMARY}15`:'transparent', borderColor: isActive===v ? PRIMARY:'#e5e7eb', color: isActive===v ? PRIMARY:'#9ca3af' }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {hasFilter && (
            <button onClick={resetFilters} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 border border-red-100 hover:bg-red-50 transition-colors">
              <X className="w-3 h-3" /> Reset
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-xs text-gray-400">
            Showing <span className="font-bold text-gray-600">{doctors.length}</span> of <span className="font-bold text-gray-600">{total}</span> doctors
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] table-fixed">
            <colgroup>
              <col className="w-10" />
              <col className="w-56" />
              <col className="w-40" />
              <col className="w-20" />
              <col className="w-28" />
              <col className="w-32" />
              <col className="w-28" />
              <col className="w-24" />
            </colgroup>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['#','Doctor','Specialty','Exp','Price','Slots','Suggestion','Action'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" /></td></tr>
              ) : doctors.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center">
                  <Stethoscope className="w-8 h-8 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No doctors found.</p>
                </td></tr>
              ) : doctors.map((d, i) => {
                const slotDays = [...new Set(d.slots.map(s => s.dayOfWeek))].sort((a,b)=>a-b);
                return (
                <tr key={d.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-3 py-2.5 text-xs text-gray-400">{(page-1)*PAGE_SIZE + i + 1}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      {d.imageUrl ? (
                        <img src={d.imageUrl} alt={d.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                          style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                          {d.name.split(' ').map((w:string) => w[0]).join('').slice(0,2)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-700 truncate" title={d.name}>{d.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{d.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-500 truncate" title={d.specialty}>{d.specialty}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">{d.experience}y</td>
                  <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap truncate">{d.price.toLocaleString()}</td>
                  <td className="px-3 py-2.5">
                    {slotDays.length === 0 ? (
                      <span className="text-[11px] text-gray-300">—</span>
                    ) : (
                      <span className="text-[11px] font-semibold text-teal-600 truncate block" title={slotDays.map(n=>DAYS[n]).join(', ')}>
                        {slotDays.slice(0,3).map(n=>DAYS[n]).join(', ')}{slotDays.length>3 && ` +${slotDays.length-3}`}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <button
                        onClick={() => setSuggestTarget(d)}
                        disabled={togglingId === d.id}
                        title={d.isSuggested ? 'Suggested — click to unsuggest' : 'Click to mark as suggested'}
                        className="flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Star className={`w-3 h-3 shrink-0 ${d.isSuggested ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                        <span
                          className="relative inline-flex items-center w-7 h-4 rounded-full transition-colors shrink-0"
                          style={{ backgroundColor: d.isSuggested ? '#f59e0b' : '#e5e7eb' }}
                        >
                          <span
                            className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all"
                            style={{ left: d.isSuggested ? '14px' : '2px' }}
                          />
                        </span>
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <a href={`/admin/doctors/${d.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1.5 rounded-xl border transition-all hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50"
                        style={{ borderColor: '#e5e7eb', color: '#6b7280' }}>
                        <Eye className="w-3.5 h-3.5" />
                      </a>
                      <button onClick={() => setRemoveTarget(d)} disabled={removingId === d.id}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1.5 rounded-xl border transition-all hover:border-red-300 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
                        style={{ borderColor: '#e5e7eb', color: '#6b7280' }}>
                        {removingId === d.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              );})}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-all">
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i+1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  className="w-8 h-8 rounded-xl text-xs font-bold transition-all"
                  style={{ backgroundColor: page===n ? PRIMARY:'transparent', color: page===n ? '#fff':'#9ca3af' }}>
                  {n}
                </button>
              ))}
            </div>
            <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-all">
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!removeTarget}
        title="Delete doctor permanently?"
        message={removeTarget ? `"${removeTarget.name}" and all related data (appointments, reviews, slots, gallery) will be permanently deleted. This cannot be undone.` : ''}
        confirmLabel="Delete"
        variant="danger"
        loading={removingId === removeTarget?.id}
        onConfirm={confirmRemove}
        onCancel={() => setRemoveTarget(null)}
      />

      <ConfirmModal
        open={!!suggestTarget}
        title={suggestTarget?.isSuggested ? 'Remove from suggested?' : 'Mark as suggested?'}
        message={suggestTarget
          ? (suggestTarget.isSuggested
            ? `"${suggestTarget.name}" will no longer appear in the "Our Suggesting Doctors" section.`
            : `"${suggestTarget.name}" will appear in the "Our Suggesting Doctors" section on the homepage.`)
          : ''}
        confirmLabel={suggestTarget?.isSuggested ? 'Remove' : 'Suggest'}
        variant={suggestTarget?.isSuggested ? 'danger' : 'default'}
        loading={togglingId === suggestTarget?.id}
        onConfirm={confirmToggleSuggested}
        onCancel={() => setSuggestTarget(null)}
      />
    </div>
  );
}
