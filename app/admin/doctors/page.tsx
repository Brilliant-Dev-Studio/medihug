'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, Plus, ChevronLeft, ChevronRight,
  ChevronDown, X, Eye, Star, Clock, Stethoscope,
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
const DAYS_MM     = ['တနင်္ဂနွေ','တနင်္လာ','အင်္ဂါ','ဗုဒ္ဓဟူး','ကြာသပတေး','သောကြာ','စနေ'];
const AVATAR_COLORS = ['#2ab5ad','#8b5cf6','#f59e0b','#3b82f6','#10b981','#ef4444'];
const SLOT_DURATION = 15; // fixed 15 min

/* ─────────────────────────────────────────────
   Create Doctor Drawer
───────────────────────────────────────────── */
interface SpecialtyItem { id: string; name: string; }

const EMPTY_FORM = {
  name:'', nameEn:'', specialty:'', bio:'', phone:'', password:'',
  phoneSecondary:'', viber:'',
  imageUrl:'', experience: 0, price: 0, isAvailable: true,
};

function CreateDrawer({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm]               = useState(EMPTY_FORM);
  const [slots, setSlots]             = useState<Slot[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [step, setStep]               = useState<1|2>(1);
  const [specialties, setSpecialties] = useState<SpecialtyItem[]>([]);

  useEffect(() => {
    fetch('/api/admin/specialties').then(r => r.json()).then(d => setSpecialties(d.specialties ?? []));
  }, []);

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const toggleDay = (day: number) => {
    if (slots.find(s => s.dayOfWeek === day))
      setSlots(s => s.filter(sl => sl.dayOfWeek !== day));
    else
      setSlots(s => [...s, { dayOfWeek: day, startTime: '09:00', endTime: '17:00', duration: SLOT_DURATION, maxPerSlot: 1 }]);
  };
  const updateSlot = (day: number, k: keyof Slot, v: string | number) =>
    setSlots(s => s.map(sl => sl.dayOfWeek === day ? { ...sl, [k]: v } : sl));

  const handleSubmit = async () => {
    if (!form.name || !form.specialty || !form.phone || !form.password) {
      setError('Name, Specialty, Phone, Password လိုအပ်သည်။'); return;
    }
    setError(''); setLoading(true);
    try {
      const res  = await fetch('/api/admin/doctors', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, slots }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Error'); setLoading(false); return; }
      onCreated(); onClose();
    } catch { setError('Server error'); setLoading(false); }
  };

  const inp = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-teal-400 transition-colors';
  const lbl = 'text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block';

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-lg z-50 bg-white shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="text-base font-bold text-gray-800">Create Doctor</p>
            <p className="text-xs text-gray-400">Step {step} of 2</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-1 px-6 pt-4">
          {([1,2] as const).map(s => (
            <div key={s} className="flex-1 h-1 rounded-full transition-all"
              style={{ backgroundColor: step >= s ? PRIMARY : '#e5e7eb' }} />
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">

          {step === 1 && (<>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Doctor Info</p>

            <div className="grid grid-cols-2 gap-3">
              <div><label className={lbl}>Name (Myanmar) *</label>
                <input className={inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="ဒေါ်မြတ်မြတ်" /></div>
              <div><label className={lbl}>Name (English)</label>
                <input className={inp} value={form.nameEn} onChange={e => set('nameEn', e.target.value)} placeholder="Dr. Myat Myat" /></div>
            </div>

            <div><label className={lbl}>Specialty *</label>
              <div className="relative">
                <select className={inp + ' pr-8 appearance-none'} value={form.specialty} onChange={e => set('specialty', e.target.value)}>
                  <option value="">-- ရွေးချယ်ပါ --</option>
                  {specialties.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div><label className={lbl}>Experience (Years)</label>
                <input type="number" min={0} className={inp} value={form.experience}
                  onChange={e => set('experience', parseInt(e.target.value) || 0)} /></div>
              <div><label className={lbl}>Price (MMK)</label>
                <input type="number" min={0} className={inp} value={form.price}
                  onChange={e => set('price', parseInt(e.target.value) || 0)} /></div>
            </div>

            <div><label className={lbl}>Bio</label>
              <textarea rows={3} className={inp + ' resize-none'} value={form.bio}
                onChange={e => set('bio', e.target.value)} placeholder="Doctor biography..." /></div>

            <div><label className={lbl}>Profile Image URL</label>
              <input className={inp} value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} placeholder="https://..." /></div>

            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <span className="text-sm text-gray-600 flex-1">Available for appointments</span>
              <button onClick={() => set('isAvailable', !form.isAvailable)}
                className="w-10 h-6 rounded-full transition-all relative"
                style={{ backgroundColor: form.isAvailable ? PRIMARY : '#d1d5db' }}>
                <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                  style={{ left: form.isAvailable ? '1.25rem' : '0.125rem' }} />
              </button>
            </div>

            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">Contact</p>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lbl}>Main Phone *</label>
                <input type="tel" className={inp} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="09XXXXXXXXX" /></div>
              <div><label className={lbl}>Secondary Phone</label>
                <input type="tel" className={inp} value={form.phoneSecondary} onChange={e => set('phoneSecondary', e.target.value)} placeholder="09XXXXXXXXX" /></div>
            </div>
            <div><label className={lbl}>Viber</label>
              <input type="tel" className={inp} value={form.viber} onChange={e => set('viber', e.target.value)} placeholder="09XXXXXXXXX (Viber)" /></div>

            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">Login Account</p>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lbl}>Login Phone *</label>
                <input type="tel" value={form.phone} readOnly className={inp + ' bg-gray-100 text-gray-400 cursor-not-allowed'} /></div>
              <div><label className={lbl}>Password *</label>
                <input type="password" className={inp} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 6 chars" /></div>
            </div>
          </>)}

          {step === 2 && (<>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Weekly Slots</p>
            <p className="text-xs text-gray-400">ရုံးနေ့ရက်တွေကို ရွေးပြီး အချိန်သတ်မှတ်ပါ</p>

            <div className="flex flex-wrap gap-2">
              {DAYS.map((d, i) => {
                const active = !!slots.find(s => s.dayOfWeek === i);
                return (
                  <button key={d} onClick={() => toggleDay(i)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
                    style={{ backgroundColor: active ? PRIMARY : 'transparent', borderColor: active ? PRIMARY : '#e5e7eb', color: active ? '#fff' : '#9ca3af' }}>
                    {DAYS_MM[i]}
                  </button>
                );
              })}
            </div>

            {[...slots].sort((a,b) => a.dayOfWeek - b.dayOfWeek).map(slot => (
              <div key={slot.dayOfWeek} className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-700">{DAYS_MM[slot.dayOfWeek]} <span className="text-gray-400 font-normal">({DAYS[slot.dayOfWeek]})</span></p>
                  <button onClick={() => toggleDay(slot.dayOfWeek)} className="text-gray-300 hover:text-red-400"><X className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className={lbl}>Start Time</label>
                    <input type="time" className={inp} value={slot.startTime} onChange={e => updateSlot(slot.dayOfWeek,'startTime',e.target.value)} /></div>
                  <div><label className={lbl}>End Time</label>
                    <input type="time" className={inp} value={slot.endTime} onChange={e => updateSlot(slot.dayOfWeek,'endTime',e.target.value)} /></div>
                  <div><label className={lbl}>Duration</label>
                    <div className={inp + ' flex items-center gap-2 text-gray-500'}>
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-sm font-semibold" style={{ color: PRIMARY }}>15 min</span>
                      <span className="text-xs text-gray-400">(fixed)</span>
                    </div>
                  </div>
                  <div><label className={lbl}>Max per Slot</label>
                    <input type="number" min={1} max={10} className={inp} value={slot.maxPerSlot}
                      onChange={e => updateSlot(slot.dayOfWeek,'maxPerSlot',parseInt(e.target.value)||1)} /></div>
                </div>
              </div>
            ))}

            {slots.length === 0 && (
              <div className="text-center py-10 text-gray-300">
                <Clock className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">နေ့ရက်တစ်ခုခု ရွေးချယ်ပါ</p>
              </div>
            )}
          </>)}

          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-500">{error}</div>}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          {step === 2 && (
            <button onClick={() => setStep(1)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
              ← Back
            </button>
          )}
          {step === 1 && (
            <button onClick={() => setStep(2)}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor: PRIMARY }}>
              Next: Slots →
            </button>
          )}
          {step === 2 && (
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ backgroundColor: PRIMARY }}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create Doctor'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

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
  const [showCreate,     setShowCreate]     = useState(false);
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
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ backgroundColor: PRIMARY }}>
          <Plus className="w-4 h-4" /> Create Doctor
        </button>
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

      {showCreate && <CreateDrawer onClose={() => setShowCreate(false)} onCreated={fetchDoctors} />}
    </div>
  );
}
