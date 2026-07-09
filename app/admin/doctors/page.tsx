'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search, Filter, Plus, ChevronLeft, ChevronRight,
  ChevronDown, X, Eye, Star, Stethoscope,
  CheckCircle2, XCircle, Loader2,
} from 'lucide-react';

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

  const hasFilter = specialty || isAvail || isActive;
  const resetFilters = () => { setSpecialty(''); setIsAvail(''); setIsActive(''); setPage(1); };

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
        <Link href="/admin/doctors/create"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ backgroundColor: PRIMARY }}>
          <Plus className="w-4 h-4" /> Create Doctor
        </Link>
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
          <table className="w-full min-w-[750px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['#','Doctor','Specialty','Experience','Price','Slots','Status','Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
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
              ) : doctors.map((d, i) => (
                <tr key={d.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3.5 text-xs text-gray-400">{(page-1)*PAGE_SIZE + i + 1}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      {d.imageUrl ? (
                        <img src={d.imageUrl} alt={d.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                          {d.name.split(' ').map((w:string) => w[0]).join('').slice(0,2)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-700 whitespace-nowrap">{d.name}</p>
                        <p className="text-[10px] text-gray-400">{d.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap">{d.specialty}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-500">{d.experience} yr{d.experience !== 1 ? 's':''}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap">{d.price.toLocaleString()} MMK</td>
                  <td className="px-4 py-3.5">
                    {d.slots.length === 0 ? (
                      <span className="text-xs text-gray-300">No slots</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {d.slots.slice(0,4).map((s, si) => (
                          <span key={si} className="text-[10px] font-bold px-1.5 py-0.5 rounded-lg bg-teal-50 text-teal-600">
                            {DAYS[s.dayOfWeek]}
                          </span>
                        ))}
                        {d.slots.length > 4 && <span className="text-[10px] text-gray-400">+{d.slots.length-4}</span>}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full w-fit ${d.isActive ? 'bg-green-50 text-green-600':'bg-red-50 text-red-400'}`}>
                        {d.isActive ? <CheckCircle2 className="w-3 h-3"/> : <XCircle className="w-3 h-3"/>}
                        {d.isActive ? 'Active':'Inactive'}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full w-fit ${d.isAvailable ? 'bg-blue-50 text-blue-500':'bg-gray-100 text-gray-400'}`}>
                        <Star className="w-3 h-3"/>
                        {d.isAvailable ? 'Available':'Unavailable'}
                      </span>
                      {d.isSuggested && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full w-fit bg-amber-50 text-amber-500">
                          <Star className="w-3 h-3 fill-amber-400"/>
                          Suggested
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <a href={`/admin/doctors/${d.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-all hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50"
                      style={{ borderColor: '#e5e7eb', color: '#6b7280' }}>
                      <Eye className="w-3.5 h-3.5" /> View
                    </a>
                  </td>
                </tr>
              ))}
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
    </div>
  );
}
