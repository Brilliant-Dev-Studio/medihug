'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Filter, ChevronLeft, ChevronRight,
  Eye, CheckCircle2, XCircle, ChevronDown, X,
} from 'lucide-react';

const PRIMARY = '#2ab5ad';

/* ─────────────────────────────────────────────
   Types & Mock Data
───────────────────────────────────────────── */
type Gender = 'Male' | 'Female';
type Status = 'Active' | 'Inactive';

interface Patient {
  id:         number;
  name:       string;
  phone:      string;
  gender:     Gender;
  age:        number;
  birthday:   string;
  state:      string;
  township:   string;
  joinedDate: string;
  status:     Status;
}

const STATES = ['Yangon', 'Mandalay', 'Naypyidaw', 'Bago', 'Sagaing', 'Magway', 'Ayeyarwady', 'Tanintharyi', 'Mon', 'Kayah', 'Kayin', 'Chin', 'Kachin', 'Shan', 'Rakhine'];

const MOCK_PATIENTS: Patient[] = [
  { id: 1,  name: 'Ma Hnin Wai',       phone: '09251234567', gender: 'Female', age: 28, birthday: '1998-03-12', state: 'Yangon',      township: 'Hlaing',        joinedDate: '2026-01-05', status: 'Active'   },
  { id: 2,  name: 'Ko Zaw Lin',        phone: '09261234567', gender: 'Male',   age: 35, birthday: '1991-07-22', state: 'Mandalay',    township: 'Chanmyathazi',  joinedDate: '2026-01-12', status: 'Active'   },
  { id: 3,  name: 'Daw Khin May',      phone: '09791234567', gender: 'Female', age: 52, birthday: '1974-11-05', state: 'Yangon',      township: 'Sanchaung',     joinedDate: '2026-02-03', status: 'Active'   },
  { id: 4,  name: 'Ko Naing Htike',    phone: '09421234567', gender: 'Male',   age: 41, birthday: '1985-01-30', state: 'Bago',        township: 'Bago Township', joinedDate: '2026-02-18', status: 'Inactive' },
  { id: 5,  name: 'Ma Ei Phyu',        phone: '09501234567', gender: 'Female', age: 24, birthday: '2002-09-14', state: 'Yangon',      township: 'Thingangyun',   joinedDate: '2026-02-25', status: 'Active'   },
  { id: 6,  name: 'U Kyaw Thu',        phone: '09681234567', gender: 'Male',   age: 60, birthday: '1966-04-08', state: 'Sagaing',     township: 'Monywa',        joinedDate: '2026-03-07', status: 'Active'   },
  { id: 7,  name: 'Ma Thida Oo',       phone: '09311234567', gender: 'Female', age: 33, birthday: '1993-06-19', state: 'Mandalay',    township: 'Amarapura',     joinedDate: '2026-03-15', status: 'Active'   },
  { id: 8,  name: 'Ko Min Thura',      phone: '09451234567', gender: 'Male',   age: 29, birthday: '1997-12-01', state: 'Yangon',      township: 'Insein',        joinedDate: '2026-03-22', status: 'Inactive' },
  { id: 9,  name: 'Daw Su Su Myint',   phone: '09211234567', gender: 'Female', age: 47, birthday: '1979-08-25', state: 'Ayeyarwady',  township: 'Pathein',       joinedDate: '2026-04-01', status: 'Active'   },
  { id: 10, name: 'Ko Aung Kyaw',      phone: '09751234567', gender: 'Male',   age: 38, birthday: '1988-02-14', state: 'Yangon',      township: 'Tamwe',         joinedDate: '2026-04-10', status: 'Active'   },
  { id: 11, name: 'Ma Nwe Nwe Oo',     phone: '09551234567', gender: 'Female', age: 22, birthday: '2004-05-07', state: 'Mon',         township: 'Mawlamyine',    joinedDate: '2026-04-18', status: 'Active'   },
  { id: 12, name: 'Ko Pyae Sone',      phone: '09881234567', gender: 'Male',   age: 31, birthday: '1995-10-20', state: 'Yangon',      township: 'Kamayut',       joinedDate: '2026-04-25', status: 'Active'   },
  { id: 13, name: 'Daw Myint Myint',   phone: '09201234567', gender: 'Female', age: 55, birthday: '1971-03-18', state: 'Magway',      township: 'Magway Township',joinedDate: '2026-05-02', status: 'Inactive' },
  { id: 14, name: 'Ko Htet Aung',      phone: '09601234567', gender: 'Male',   age: 26, birthday: '2000-07-11', state: 'Yangon',      township: 'Dagon',         joinedDate: '2026-05-09', status: 'Active'   },
  { id: 15, name: 'Ma Kay Zin Thaw',   phone: '09701234567', gender: 'Female', age: 30, birthday: '1996-11-28', state: 'Naypyidaw',   township: 'Ottarathiri',   joinedDate: '2026-05-16', status: 'Active'   },
  { id: 16, name: 'U Win Naing',       phone: '09401234567', gender: 'Male',   age: 49, birthday: '1977-01-03', state: 'Shan',        township: 'Taunggyi',      joinedDate: '2026-05-22', status: 'Active'   },
  { id: 17, name: 'Ma Phyo Wai',       phone: '09901234567', gender: 'Female', age: 20, birthday: '2006-04-15', state: 'Yangon',      township: 'Shwepyithar',   joinedDate: '2026-06-01', status: 'Active'   },
  { id: 18, name: 'Ko Sithu Kyaw',     phone: '09271234567', gender: 'Male',   age: 44, birthday: '1982-09-09', state: 'Kachin',      township: 'Myitkyina',     joinedDate: '2026-06-08', status: 'Inactive' },
  { id: 19, name: 'Daw Aye Aye Win',   phone: '09811234567', gender: 'Female', age: 58, birthday: '1968-06-30', state: 'Yangon',      township: 'Mingaladon',    joinedDate: '2026-06-15', status: 'Active'   },
  { id: 20, name: 'Ko Thiha Zaw',      phone: '09241234567', gender: 'Male',   age: 37, birthday: '1989-12-22', state: 'Rakhine',     township: 'Sittwe',        joinedDate: '2026-06-22', status: 'Active'   },
];

const PAGE_SIZE_OPTIONS = [5, 10, 20];


/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function AdminPatientsPage() {
  const router = useRouter();
  const [search,     setSearch]     = useState('');
  const [genderF,    setGenderF]    = useState<Gender | ''>('');
  const [statusF,    setStatusF]    = useState<Status | ''>('');
  const [stateF,     setStateF]     = useState('');
  const [page,       setPage]       = useState(1);
  const [pageSize,   setPageSize]   = useState(10);
  const [showFilter, setShowFilter] = useState(false);

  /* ── Filter & search ── */
  const filtered = useMemo(() => {
    return MOCK_PATIENTS.filter(p => {
      if (search   && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.phone.includes(search)) return false;
      if (genderF  && p.gender !== genderF)  return false;
      if (statusF  && p.status !== statusF)  return false;
      if (stateF   && p.state  !== stateF)   return false;
      return true;
    });
  }, [search, genderF, statusF, stateF]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);

  const resetFilters = () => { setGenderF(''); setStatusF(''); setStateF(''); setPage(1); };
  const hasFilter    = genderF || statusF || stateF;

  const activeCount  = MOCK_PATIENTS.filter(p => p.status === 'Active').length;

  return (
    <div className="flex flex-col gap-5">

      {/* ── Summary chips ── */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Total Patients', value: MOCK_PATIENTS.length, color: PRIMARY,   bg: '#e6f7f7' },
          { label: 'Active',         value: activeCount,           color: '#10b981', bg: '#ecfdf5' },
          { label: 'Inactive',       value: MOCK_PATIENTS.length - activeCount, color: '#ef4444', bg: '#fef2f2' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-2xl px-4 py-2.5">
            <span className="text-lg font-bold" style={{ color: s.color }}>{s.value}</span>
            <span className="text-xs text-gray-400 font-medium">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Search + filter bar ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">

        {/* Search */}
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

        {/* Filter toggle */}
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

        {/* Page size */}
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

          {/* Gender */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gender</label>
            <div className="flex gap-1.5">
              {(['', 'Male', 'Female'] as const).map(g => (
                <button key={g} onClick={() => { setGenderF(g as Gender | ''); setPage(1); }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
                  style={{
                    backgroundColor: genderF === g ? `${PRIMARY}15` : 'transparent',
                    borderColor:     genderF === g ? PRIMARY : '#e5e7eb',
                    color:           genderF === g ? PRIMARY : '#9ca3af',
                  }}>
                  {g || 'All'}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</label>
            <div className="flex gap-1.5">
              {(['', 'Active', 'Inactive'] as const).map(s => (
                <button key={s} onClick={() => { setStatusF(s as Status | ''); setPage(1); }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
                  style={{
                    backgroundColor: statusF === s ? `${PRIMARY}15` : 'transparent',
                    borderColor:     statusF === s ? PRIMARY : '#e5e7eb',
                    color:           statusF === s ? PRIMARY : '#9ca3af',
                  }}>
                  {s || 'All'}
                </button>
              ))}
            </div>
          </div>

          {/* State */}
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

          {/* Reset */}
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

        {/* Result count */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Showing <span className="font-bold text-gray-600">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)}</span> of <span className="font-bold text-gray-600">{filtered.length}</span> patients
          </p>
        </div>

        {/* Desktop table */}
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
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-sm text-gray-400">No patients found.</td>
                </tr>
              ) : paginated.map((p, i) => (
                <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3.5 text-xs text-gray-400">{(page - 1) * pageSize + i + 1}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ backgroundColor: ['#2ab5ad','#8b5cf6','#f59e0b','#3b82f6','#10b981'][p.id % 5] }}>
                        {p.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <p className="text-sm font-semibold text-gray-700 whitespace-nowrap">{p.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap">{p.phone}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-500">{p.gender}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-500">{p.age}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap">{p.township}, {p.state}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap">{p.joinedDate}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${p.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-400'}`}>
                      {p.status === 'Active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => router.push(`/admin/users/${p.id}`)}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50"
                      style={{ borderColor: '#e5e7eb', color: '#6b7280' }}
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

    </div>
  );
}
