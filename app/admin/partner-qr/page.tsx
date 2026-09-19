'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, Check, X, Pencil, QrCode, ChevronLeft, ChevronRight, Search } from 'lucide-react';

const PRIMARY = '#2ab5ad';
const inp = 'bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-teal-400 transition-colors';

interface Redemption {
  id: string; code: string; percent: number; discountAmount: number; createdAt: string;
  clinic: { id: string; name: string; nameEn: string | null };
  user: { id: string; name: string; phone: string };
  doctor: { id: string; name: string };
  appointment: { id: string; date: string; time: string | null; fee: number; status: string };
}
interface ClinicOpt { id: string; name: string; nameEn: string | null; referralQrCode: string | null }

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminPartnerQrPage() {
  const [percent, setPercent] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [savingPercent, setSavingPercent] = useState(false);
  const [percentError, setPercentError] = useState('');

  const [rows, setRows] = useState<Redemption[]>([]);
  const [clinics, setClinics] = useState<ClinicOpt[]>([]);
  const [total, setTotal] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [clinicId, setClinicId] = useState('');
  const [q, setQ] = useState('');
  const [qApplied, setQApplied] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const params = new URLSearchParams({ page: String(page) });
      if (clinicId) params.set('clinicId', clinicId);
      if (qApplied) params.set('q', qApplied);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const res = await fetch(`/api/admin/partner-qr?${params}`);
      const data = await res.json();
      if (cancelled) return;
      if (res.ok) {
        setPercent(data.percent);
        setRows(data.redemptions);
        setClinics(data.clinics);
        setTotal(data.total);
        setTotalDiscount(data.totalDiscount);
        setPageSize(data.pageSize);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [page, clinicId, qApplied, from, to]);

  const savePercent = async () => {
    const n = Number(draft);
    if (!Number.isInteger(n) || n < 0 || n > 100) { setPercentError('Whole number, 0 – 100.'); return; }
    setSavingPercent(true);
    const res = await fetch('/api/admin/partner-qr', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ percent: n }),
    });
    const data = await res.json();
    setSavingPercent(false);
    if (!res.ok) { setPercentError(data.error ?? 'Server error'); return; }
    setPercent(data.percent);
    setEditing(false);
  };

  const changeFilter = (fn: () => void) => { fn(); setPage(1); };
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Partner Referral QR</h1>
        <p className="text-sm text-gray-400 mt-0.5">Discount patients get when they use a partner&apos;s QR on a doctor booking, and who used which QR.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-widest">
            <QrCode className="w-3.5 h-3.5" /> Max discount (Doctor booking only)
          </div>
          {editing ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <input type="number" min={0} max={100} value={draft} onChange={e => setDraft(e.target.value)} autoFocus
                  className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-lg font-bold text-gray-700 outline-none focus:border-teal-400" />
                <span className="text-lg font-bold text-gray-400">%</span>
                <button onClick={savePercent} disabled={savingPercent} title="Save"
                  className="w-7 h-7 rounded-md flex items-center justify-center text-white disabled:opacity-50" style={{ backgroundColor: PRIMARY }}>
                  {savingPercent ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => { setEditing(false); setPercentError(''); }} disabled={savingPercent}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-50">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {percentError && <p className="text-[10px] text-red-500">{percentError}</p>}
            </div>
          ) : (
            <button onClick={() => { setDraft(String(percent ?? 0)); setPercentError(''); setEditing(true); }} disabled={percent === null}
              className="flex items-center gap-2 group w-fit">
              <span className="text-2xl font-bold" style={{ color: PRIMARY }}>{percent === null ? '—' : `${percent}%`}</span>
              <Pencil className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </button>
          )}
          <p className="text-[11px] text-gray-400">Partners can set their own QR lower than this, never higher. 0 turns partner QR discounts off.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-2">
          <p className="text-xs text-gray-400 uppercase tracking-widest">Bookings (filtered)</p>
          <p className="text-2xl font-bold text-gray-800">{total.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-2">
          <p className="text-xs text-gray-400 uppercase tracking-widest">Total discount given (filtered)</p>
          <p className="text-2xl font-bold text-gray-800">{totalDiscount.toLocaleString()} <span className="text-sm font-semibold text-gray-400">Ks</span></p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <select value={clinicId} onChange={e => changeFilter(() => setClinicId(e.target.value))} className={inp}>
            <option value="">All partners</option>
            {clinics.map(c => <option key={c.id} value={c.id}>{c.nameEn ?? c.name}</option>)}
          </select>
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={q} onChange={e => setQ(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') changeFilter(() => setQApplied(q.trim())); }}
                placeholder="Patient, phone, doctor or code…" className={`${inp} w-full pl-9`} />
            </div>
            <button onClick={() => changeFilter(() => setQApplied(q.trim()))}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white" style={{ backgroundColor: PRIMARY }}>Search</button>
          </div>
          <input type="date" value={from} onChange={e => changeFilter(() => setFrom(e.target.value))} className={inp} title="From" />
          <input type="date" value={to} onChange={e => changeFilter(() => setTo(e.target.value))} className={inp} title="To" />
        </div>

        {loading ? (
          <div className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" /></div>
        ) : rows.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-400">No partner QR usage yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-widest text-gray-400 border-b border-gray-100">
                  <th className="py-2 pr-4 font-semibold">Used at</th>
                  <th className="py-2 pr-4 font-semibold">Patient</th>
                  <th className="py-2 pr-4 font-semibold">Partner (QR)</th>
                  <th className="py-2 pr-4 font-semibold">Doctor</th>
                  <th className="py-2 pr-4 font-semibold">Appointment</th>
                  <th className="py-2 pr-4 font-semibold text-right">Discount</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} className="border-b border-gray-50 last:border-0 align-top">
                    <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">{fmtDateTime(r.createdAt)}</td>
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-gray-800">{r.user.name}</p>
                      <p className="text-[11px] text-gray-400">{r.user.phone}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-gray-800">{r.clinic.nameEn ?? r.clinic.name}</p>
                      <p className="text-[11px] text-gray-400 font-mono">{r.code}</p>
                    </td>
                    <td className="py-3 pr-4 text-gray-700">Dr. {r.doctor.name}</td>
                    <td className="py-3 pr-4">
                      <Link href={`/admin/appointments/${r.appointment.id}`} className="text-xs font-semibold hover:underline" style={{ color: PRIMARY }}>
                        {new Date(r.appointment.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {r.appointment.time ? ` · ${r.appointment.time}` : ''}
                      </Link>
                      <p className="text-[11px] text-gray-400">{r.appointment.status}</p>
                    </td>
                    <td className="py-3 text-right whitespace-nowrap">
                      <p className="font-semibold text-gray-800">−{r.discountAmount.toLocaleString()} Ks</p>
                      <p className="text-[11px] text-gray-400">{r.percent}% off · paid {r.appointment.fee.toLocaleString()} Ks</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
