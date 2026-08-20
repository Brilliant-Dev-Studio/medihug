'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, ChevronLeft, ChevronRight, ClipboardList, Loader2, Calendar, Eye,
} from 'lucide-react';
import { PRIMARY, MED_LABELS, MED_MEDS, CATEGORIES, t, type Appointment } from '../appointments/shared';
import { useLang } from '../../lib/LanguageContext';

export default function AdminMedicalRecordsPage() {
  const router = useRouter();
  const { lang } = useLang();
  const mm = lang === 'mm';

  const [records, setRecords] = useState<Appointment[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [from, setFrom]       = useState('');
  const [to, setTo]           = useState('');
  const [page, setPage]       = useState(1);
  const pageSize = 15;

  const load = useCallback(async () => {
    setLoading(true);
    const q = new URLSearchParams({ page: String(page), pageSize: String(pageSize), hasIntake: 'true' });
    if (search) q.set('search', search);
    if (from)   q.set('from', from);
    if (to)     q.set('to', to);
    const res  = await fetch(`/api/admin/appointments?${q}`);
    const data = await res.json();
    setRecords(data.appointments ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, search, from, to]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#e6f7f7' }}>
          <ClipboardList className="w-4.5 h-4.5" style={{ color: PRIMARY }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t(mm, { mm: 'ဆေးမှတ်တမ်းများ', en: 'Medical Records' })}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {t(mm, { mm: 'ချိန်းဆိုမှုများထဲမှ ကြိုတင် ဆေးမှတ်တမ်းများ', en: 'Pre-consultation medical forms submitted with appointments' })} · {total} {t(mm, { mm: 'ခု', en: 'records' })}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-55">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ab5ad]/40 focus:border-[#2ab5ad]"
            placeholder={t(mm, { mm: 'လူနာ (သို့) ဆရာဝန် ရှာဖွေရန်...', en: 'Search patient or doctor...' })}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50">
          <Calendar size={14} className="text-gray-400 shrink-0" />
          <input type="date" value={from} onChange={e => { setFrom(e.target.value); setPage(1); }}
            className="bg-transparent text-sm text-gray-600 outline-none w-32" />
          <span className="text-gray-300 text-xs">–</span>
          <input type="date" value={to} onChange={e => { setTo(e.target.value); setPage(1); }}
            className="bg-transparent text-sm text-gray-600 outline-none w-32" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)] overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-[#2ab5ad]" />
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <ClipboardList size={40} strokeWidth={1.2} />
            <p className="mt-3 text-sm">{t(mm, { mm: 'ဆေးမှတ်တမ်း မတွေ့ပါ', en: 'No medical records found' })}</p>
          </div>
        ) : (
          <table className="w-full text-sm min-w-275">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider whitespace-nowrap">{t(mm, { mm: 'လူနာ', en: 'Patient' })}</th>
                <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider whitespace-nowrap">{t(mm, { mm: 'ဆရာဝန်', en: 'Doctor' })}</th>
                <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider whitespace-nowrap">{t(mm, { mm: 'ရက်စွဲ', en: 'Date' })}</th>
                <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">{t(mm, { mm: 'အဓိက ပြဿနာ', en: 'Main Complaint' })}</th>
                <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider whitespace-nowrap">{t(mm, { mm: 'အမျိုးအစား', en: 'Category' })}</th>
                <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">{t(mm, { mm: 'အခံရောဂါ', en: 'Chronic Conditions' })}</th>
                <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">{t(mm, { mm: 'ဆေးမတည့်ခြင်း', en: 'Drug Allergy' })}</th>
                <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">{t(mm, { mm: 'လက်ရှိဆေးဝါး', en: 'Current Meds' })}</th>
                <th className="text-left px-4 py-3.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider whitespace-nowrap">{t(mm, { mm: 'လုပ်ဆောင်ချက်', en: 'Action' })}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {records.map(r => {
                const d = r.intake!;
                const chronic = (d.medHistory ?? []).filter(k => k !== 'none').map(k => MED_LABELS[k] ? t(mm, MED_LABELS[k]) : k);
                const meds = (d.currentMeds ?? []).filter(k => k !== 'none').map(k => MED_MEDS[k] ? t(mm, MED_MEDS[k]) : k);
                const categoryLabel = d.category ? (CATEGORIES[d.category] ? t(mm, CATEGORIES[d.category]) : d.category) : null;
                return (
                  <tr key={r.id} onClick={() => router.push(`/admin/appointments/${r.id}`)} className="hover:bg-gray-50/60 transition-colors cursor-pointer">
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="font-semibold text-gray-800">{d.name || r.user.name}</p>
                      <p className="text-xs text-gray-400">{d.phone || r.user.phone}</p>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="font-medium text-gray-700">{mm ? r.doctor.name : (r.doctor.nameEn ?? r.doctor.name)}</p>
                      <p className="text-xs text-gray-400">{mm ? r.doctor.specialty : (r.doctor.specialtyEn ?? r.doctor.specialty)}</p>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                      {fmtDate(r.date)}{r.time ? ` · ${r.time}` : ''}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 max-w-50">
                      <p className="truncate">{d.mainComplaint || '—'}</p>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{categoryLabel ?? '—'}</td>
                    <td className="px-4 py-3.5 text-gray-500 max-w-40">
                      <p className="truncate">{chronic.length > 0 ? chronic.join('၊ ') : '—'}</p>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 max-w-40">
                      <p className="truncate">{d.drugAllergy === 'yes' ? (d.allergyDetail || t(mm, { mm: 'ရှိပါသည်', en: 'Yes' })) : '—'}</p>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 max-w-40">
                      <p className="truncate">{meds.length > 0 ? meds.join('၊ ') : '—'}</p>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <button
                        onClick={e => { e.stopPropagation(); router.push(`/admin/appointments/${r.id}`); }}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-all hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50"
                        style={{ borderColor: '#e5e7eb', color: '#6b7280' }}>
                        <Eye className="w-3.5 h-3.5 shrink-0" /> {t(mm, { mm: 'ကြည့်ရှုရန်', en: 'View Detail' })}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {!loading && total > 0 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={15} />
              </button>
              <span className="text-xs text-gray-500 font-semibold px-2">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
