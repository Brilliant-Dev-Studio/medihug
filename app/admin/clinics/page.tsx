'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Plus, Loader2, CheckCircle2, XCircle,
  Building2, ChevronLeft, ChevronRight, MapPin, Phone, Clock, ShieldCheck,
} from 'lucide-react';

const PRIMARY = '#2ab5ad';

interface Clinic {
  id: string; name: string; nameEn: string | null;
  type: string; address: string | null; phone: string | null;
  openTime: string | null; closeTime: string | null;
  imageUrl: string | null; coverUrl: string | null;
  verified: boolean; isActive: boolean; isPartner: boolean;
  _count?: { doctors: number };
}
interface PartnerType { id: string; name: string; nameEn: string | null; }

export default function AdminClinicsPage() {
  const router = useRouter();
  const [clinics, setClinics]       = useState<Clinic[]>([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isActive, setIsActive]     = useState('');
  const [page, setPage]             = useState(1);
  const [partnerTypes, setPartnerTypes] = useState<PartnerType[]>([]);
  const pageSize                    = 12;

  useEffect(() => {
    fetch('/api/admin/partner-types').then(r => r.json()).then(d => setPartnerTypes(d.partnerTypes ?? []));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const q = new URLSearchParams({
      page: String(page), pageSize: String(pageSize),
      ...(search     ? { search }          : {}),
      ...(typeFilter ? { type: typeFilter } : {}),
      ...(isActive !== '' ? { isActive }   : {}),
    });
    const res  = await fetch(`/api/admin/clinics?${q}`);
    const data = await res.json();
    setClinics(data.clinics ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, search, typeFilter, isActive]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const toggleActive = async (e: React.MouseEvent, c: Clinic) => {
    e.stopPropagation();
    await fetch(`/api/admin/clinics/${c.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !c.isActive }),
    });
    load();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Partners</h1>
          <p className="text-sm text-gray-500 mt-0.5">Total {total} partners</p>
        </div>
        <button
          onClick={() => router.push('/admin/clinics/new')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90"
          style={{ backgroundColor: PRIMARY }}
        >
          <Plus size={16} /> Create Partner
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ab5ad]/40 focus:border-[#2ab5ad]"
            placeholder="Search partners..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ab5ad]/40 focus:border-[#2ab5ad]"
          value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Types</option>
          {partnerTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
        </select>
        <select
          className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ab5ad]/40 focus:border-[#2ab5ad]"
          value={isActive}
          onChange={e => { setIsActive(e.target.value); setPage(1); }}
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-[#2ab5ad]" />
        </div>
      ) : clinics.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Building2 size={40} strokeWidth={1.2} />
          <p className="mt-3 text-sm">No clinics found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clinics.map(c => (
            <div
              key={c.id}
              onClick={() => router.push(`/admin/clinics/${c.id}`)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
            >
              {/* Cover */}
              <div className="h-24 bg-gradient-to-br from-teal-50 to-teal-100 relative">
                {c.coverUrl
                  ? <img src={c.coverUrl} alt="cover" className="w-full h-full object-cover" />
                  : <div className="flex items-center justify-center h-full"><Building2 size={32} className="text-teal-300" /></div>}
                {c.imageUrl && (
                  <img
                    src={c.imageUrl} alt={c.name}
                    className="absolute bottom-0 left-4 translate-y-1/2 h-12 w-12 rounded-xl object-cover border-2 border-white shadow"
                  />
                )}
              </div>

              <div className="px-4 pt-8 pb-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-gray-800 text-sm leading-tight">{c.name}</p>
                      {c.verified && <ShieldCheck size={13} className="text-[#2ab5ad] flex-shrink-0" />}
                    </div>
                    {c.nameEn && <p className="text-xs text-gray-400">{c.nameEn}</p>}
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 bg-teal-50 text-teal-700">
                    {c.type}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                  {c.phone && <span className="flex items-center gap-1"><Phone size={11} />{c.phone}</span>}
                  {c.openTime && c.closeTime && <span className="flex items-center gap-1"><Clock size={11} />{c.openTime}–{c.closeTime}</span>}
                </div>
                {c.address && (
                  <p className="text-xs text-gray-400 flex items-start gap-1">
                    <MapPin size={11} className="mt-0.5 flex-shrink-0" />{c.address}
                  </p>
                )}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-gray-400">{c._count?.doctors ?? 0} doctors</span>
                  <button
                    onClick={e => toggleActive(e, c)}
                    className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}
                  >
                    {c.isActive
                      ? <><CheckCircle2 size={11} /> Active</>
                      : <><XCircle size={11} /> Inactive</>}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-5 py-3.5">
          <p className="text-xs text-gray-400">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)}
                className="w-8 h-8 rounded-lg text-xs font-semibold transition-colors"
                style={n === page ? { backgroundColor: PRIMARY, color: '#fff' } : { color: '#6b7280' }}>
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
