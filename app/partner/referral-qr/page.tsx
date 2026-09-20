'use client';

import { useEffect, useRef, useState } from 'react';
import type QRCodeStyling from 'qr-code-styling';
import { Download, Share2, Copy, Check, Loader2, QrCode, Users, Pencil, X, ChevronLeft, ChevronRight } from 'lucide-react';

const PRIMARY = '#3b5bdb';

interface UsageRow {
  id: string; createdAt: string; percent: number; discountAmount: number;
  patient: { name: string; phone: string };
  doctor: { name: string; nameEn: string | null };
  appointment: { date: string; time: string | null; status: string; fee: number };
}

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-600',
  CONFIRMED: 'bg-blue-50 text-blue-600',
  COMPLETED: 'bg-green-50 text-green-600',
  CANCELLED: 'bg-red-50 text-red-400',
};

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** Bookings that came in through this clinic's referral QR — who, when, which doctor. */
function UsageHistory() {
  const [rows, setRows] = useState<UsageRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const params = new URLSearchParams({ page: String(page) });
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      try {
        const res = await fetch(`/api/partner/referral-qr/usage?${params}`);
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) {
          setRows(data.usage);
          setTotal(data.total);
          setTotalDiscount(data.totalDiscount);
          setPageSize(data.pageSize);
        }
      } catch { /* leave the previous rows in place */ }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [page, from, to]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const dateInp = 'bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 outline-none focus:border-blue-400';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-gray-800">Referral history</h2>
          <p className="text-xs text-gray-400 mt-0.5">Bookings that used your QR</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="date" value={from} onChange={e => { setFrom(e.target.value); setPage(1); }} className={dateInp} title="From" />
          <span className="text-xs text-gray-300">–</span>
          <input type="date" value={to} onChange={e => { setTo(e.target.value); setPage(1); }} className={dateInp} title="To" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-gray-50 px-4 py-3">
          <p className="text-[11px] text-gray-400 uppercase tracking-widest">Bookings</p>
          <p className="text-xl font-bold text-gray-800 mt-0.5">{total.toLocaleString()}</p>
        </div>
        <div className="rounded-xl bg-gray-50 px-4 py-3">
          <p className="text-[11px] text-gray-400 uppercase tracking-widest">Discount given</p>
          <p className="text-xl font-bold text-gray-800 mt-0.5">{totalDiscount.toLocaleString()} <span className="text-xs font-semibold text-gray-400">Ks</span></p>
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-300" /></div>
      ) : rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">No bookings have used your QR yet.</p>
      ) : (
        <div className="flex flex-col">
          {rows.map(r => (
            <div key={r.id} className="flex items-start justify-between gap-3 py-3 border-t border-gray-50 first:border-t-0">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {r.patient.name} <span className="text-xs font-normal text-gray-400 font-mono">{r.patient.phone}</span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">Dr. {r.doctor.nameEn ?? r.doctor.name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Used {fmtDateTime(r.createdAt)} · Appt {new Date(r.appointment.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}{r.appointment.time ? ` ${r.appointment.time}` : ''}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-gray-800">−{r.discountAmount.toLocaleString()} Ks</p>
                <p className="text-[11px] text-gray-400">{r.percent}% off</p>
                <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[r.appointment.status] ?? 'bg-gray-50 text-gray-400'}`}>
                  {r.appointment.status}
                </span>
              </div>
            </div>
          ))}
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
  );
}

export default function PartnerReferralQrPage() {
  const boxRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);
  const [info, setInfo] = useState<{ code: string; percent: number; maxPercent: number; usageCount: number } | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [percentError, setPercentError] = useState('');

  useEffect(() => {
    fetch('/api/partner/referral-qr')
      .then(r => r.json().then(d => ({ ok: r.ok, d })))
      .then(({ ok, d }) => { if (ok) setInfo(d); else setError(d.error ?? 'Could not load QR'); })
      .catch(() => setError('Could not load QR'));
  }, []);

  // qr-code-styling touches `document` at module scope — load it client-side only.
  useEffect(() => {
    if (!info) return;
    let cancelled = false;
    import('qr-code-styling').then(({ default: QRCodeStyling }) => {
      if (cancelled || !boxRef.current) return;
      qrRef.current = new QRCodeStyling({
        width: 260, height: 260, data: info.code,
        image: '/medihug-logo.png',
        dotsOptions: { color: '#2ab5ad', type: 'rounded' },
        backgroundOptions: { color: '#FFFFFF' },
        cornersSquareOptions: { type: 'extra-rounded', color: '#2ab5ad' },
        cornersDotOptions: { type: 'dot', color: '#2ab5ad' },
        imageOptions: { crossOrigin: 'anonymous', margin: 4, imageSize: 0.35 },
      });
      boxRef.current.innerHTML = '';
      qrRef.current.append(boxRef.current);
    });
    return () => { cancelled = true; };
  }, [info]);

  const savePercent = async () => {
    if (!info) return;
    const n = Number(draft);
    if (!Number.isInteger(n) || n < 0 || n > info.maxPercent) { setPercentError(`Whole number, 0 – ${info.maxPercent}.`); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/partner/referral-qr', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ percent: n }),
      });
      const data = await res.json();
      if (!res.ok) { setPercentError(data.error ?? 'Server error'); return; }
      setInfo(prev => prev ? { ...prev, percent: data.percent, maxPercent: data.maxPercent } : prev);
      setEditing(false);
    } catch {
      setPercentError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const download = () => qrRef.current?.download({ name: `medihug-${info?.code}`, extension: 'png' });

  const share = async () => {
    if (!info) return;
    try {
      const blob = await qrRef.current?.getRawData('png');
      if (blob && blob instanceof Blob) {
        const file = new File([blob], `medihug-${info.code}.png`, { type: 'image/png' });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'MediHug',
            text: `MediHug ${info.percent}% OFF — code ${info.code}`,
          });
          return;
        }
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
    }
    // Browser can't share files (most desktops) — fall back to saving the image.
    download();
  };

  const copyCode = async () => {
    if (!info) return;
    try {
      await navigator.clipboard.writeText(info.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-lg font-bold text-gray-800">Referral QR</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Share this QR with your patients. When they use it on a MediHug doctor booking, they get a discount.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-red-500 font-semibold">{error}</p>
      ) : !info ? (
        <div className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" /></div>
      ) : (
        <>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col items-center gap-4 w-full max-w-lg mx-auto">
          {editing ? (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <input type="number" min={0} max={info.maxPercent} value={draft} onChange={e => setDraft(e.target.value)} autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') savePercent(); }}
                  className="w-16 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-sm font-bold text-gray-700 outline-none focus:border-blue-400" />
                <span className="text-sm font-bold text-gray-400">% OFF</span>
                <button onClick={savePercent} disabled={saving} title="Save"
                  className="w-7 h-7 rounded-md flex items-center justify-center text-white disabled:opacity-50" style={{ backgroundColor: PRIMARY }}>
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => { setEditing(false); setPercentError(''); }} disabled={saving}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-50">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {percentError
                ? <p className="text-[11px] text-red-500">{percentError}</p>
                : <p className="text-[11px] text-gray-400">Max {info.maxPercent}% (set by MediHug)</p>}
            </div>
          ) : (
            <button onClick={() => { setDraft(String(info.percent)); setPercentError(''); setEditing(true); }}
              disabled={info.maxPercent <= 0} title="Change discount %"
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full group disabled:cursor-default"
              style={{ backgroundColor: `${PRIMARY}12`, color: PRIMARY }}>
              <QrCode className="w-3.5 h-3.5" /> {info.percent}% OFF · Doctor booking only
              {info.maxPercent > 0 && <Pencil className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />}
            </button>
          )}

          <div className="p-3 rounded-xl border border-gray-100">
            <div ref={boxRef} />
          </div>

          <button onClick={copyCode} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
            <span className="text-sm font-bold font-mono text-gray-700">{info.code}</span>
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
          </button>

          <div className="grid grid-cols-2 gap-2 w-full">
            <button onClick={download}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: PRIMARY }}>
              <Download className="w-4 h-4" /> Download
            </button>
            <button onClick={share}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold border-2 hover:bg-gray-50 transition-colors"
              style={{ borderColor: PRIMARY, color: PRIMARY }}>
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>

          <p className="flex items-center gap-1.5 text-xs text-gray-400">
            <Users className="w-3.5 h-3.5" /> Used on {info.usageCount} booking{info.usageCount === 1 ? '' : 's'}
          </p>
        </div>

        <UsageHistory />
        </>
      )}
    </div>
  );
}
