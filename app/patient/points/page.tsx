'use client';

import { useState, useEffect, useCallback } from 'react';
import { Coins, ChevronLeft, ChevronRight, Loader2, Hourglass } from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';

const PRIMARY = 'var(--color-primary)';

interface PointsEntry {
  id: string;
  type: 'EARNED' | 'REDEEMED' | 'ADJUSTED';
  points: number;
  sourceType: 'CONSULTATION' | 'PROGRAM' | 'PRODUCT' | 'HOME_SERVICE' | 'PARTNER_SERVICE' | null;
  amountKs: number;
  note: string | null;
  createdAt: string;
  expiry: { expiresAt: string | null; expired: number; remaining: number } | null;
}

interface ExpiryInfo { value: number; unit: 'DAYS' | 'MONTHS'; expiredTotal: number; expiringSoon: { points: number; date: string | null } }

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const SOURCE_LABEL: Record<string, string> = {
  CONSULTATION: 'Consultation', PROGRAM: 'Program', PRODUCT: 'Product',
  HOME_SERVICE: 'Home Service', PARTNER_SERVICE: 'Partner Service',
};

export default function PatientPointsPage() {
  const { lang } = useLang();
  const mm = lang === 'mm';

  const [hasPhone, setHasPhone] = useState(true);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [kyatPerPointRedeem, setKyatPerPointRedeem] = useState(0);
  const [entries, setEntries] = useState<PointsEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expiry, setExpiry] = useState<ExpiryInfo | null>(null);

  const load = useCallback(async (p = page) => {
    const stored = localStorage.getItem('medihug_patient');
    if (!stored) { setHasPhone(false); setLoading(false); return; }
    const { phone } = JSON.parse(stored) as { phone: string };
    setLoading(true);
    const res = await fetch(`/api/patient/points?phone=${encodeURIComponent(phone)}&page=${p}`);
    const d = await res.json();
    setBalance(d.balance ?? 0);
    setKyatPerPointRedeem(d.kyatPerPointRedeem ?? 0);
    setEntries(d.entries ?? []);
    setTotal(d.total ?? 0);
    setPage(d.page ?? 1);
    setTotalPages(d.totalPages ?? 1);
    setExpiry(d.expiry ?? null);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(page); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!loading && !hasPhone) {
    return (
      <div className="p-4 lg:p-6 flex flex-col items-center justify-center py-20 text-center gap-2">
        <Coins className="w-10 h-10 text-gray-200" />
        <p className="text-sm text-gray-400">{mm ? 'ဝင်ရောက်ထားရန် လိုအပ်ပါသည်' : 'Please sign in to see your points.'}</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#fef3c7' }}>
          <Coins className="w-4.5 h-4.5" style={{ color: '#d97706' }} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">{mm ? 'ပွိုင့်များ' : 'Points'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{mm ? 'ဝယ်ယူမှုတိုင်းမှ ရရှိသော ပွိုင့်များနှင့် သမိုင်းကြောင်း' : 'Points earned from your purchases, and their history'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border-2 p-4" style={{ borderColor: '#fbbf2450' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">{mm ? 'လက်ကျန် Points' : 'Balance'}</p>
          <p className="text-2xl font-bold mt-1 text-amber-600">{loading ? '—' : balance.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{mm ? 'ခန့်မှန်းတန်ဖိုး' : '≈ Discount Value'}</p>
          <p className="text-2xl font-bold mt-1 text-gray-800">{loading ? '—' : `${(balance * kyatPerPointRedeem).toLocaleString()} Ks`}</p>
        </div>
      </div>

      {!loading && expiry && (
        <div className="rounded-2xl px-4 py-3.5 flex items-start gap-3"
          style={{ backgroundColor: expiry.expiringSoon.points > 0 ? '#fffbeb' : '#f9fafb', border: `1px solid ${expiry.expiringSoon.points > 0 ? '#fde68a' : '#f3f4f6'}` }}>
          <Hourglass className="w-4.5 h-4.5 mt-0.5 shrink-0" style={{ color: expiry.expiringSoon.points > 0 ? '#d97706' : '#9ca3af' }} />
          <div className="text-xs leading-relaxed" style={{ color: expiry.expiringSoon.points > 0 ? '#92400e' : '#6b7280' }}>
            {expiry.expiringSoon.points > 0 && expiry.expiringSoon.date && (
              <p className="font-bold text-sm">
                {mm
                  ? `Points ${expiry.expiringSoon.points.toLocaleString()} ခုသည် ${fmtDate(expiry.expiringSoon.date)} တွင် သက်တမ်းကုန်မည်`
                  : `${expiry.expiringSoon.points.toLocaleString()} points expire on ${fmtDate(expiry.expiringSoon.date)}`}
              </p>
            )}
            <p>
              {mm
                ? `ရရှိသော Points များသည် ရရှိသည့်နေ့မှ ${expiry.value} ${expiry.unit === 'DAYS' ? 'ရက်' : 'လ'} အတွင်း အသုံးပြုရမည်။ အရင်ရသော Points ကို အရင်သုံးပါမည်။`
                : `Points must be used within ${expiry.value} ${expiry.unit === 'DAYS' ? 'day' : 'month'}${expiry.value === 1 ? '' : 's'} of earning them. Older points are used first.`}
              {expiry.expiredTotal > 0 && (mm ? ` သက်တမ်းကုန်ပြီးသော Points စုစုပေါင်း ${expiry.expiredTotal.toLocaleString()} ခု။` : ` ${expiry.expiredTotal.toLocaleString()} points have expired so far.`)}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-150">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">{mm ? 'ရင်းမြစ်' : 'Source'}</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">{mm ? 'တန်ဖိုး' : 'Amount'}</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={3} className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" /></td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={3} className="py-16 text-center">
                  <Coins className="w-8 h-8 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">{mm ? 'Points မရှိသေးပါ' : 'No points yet.'}</p>
                </td></tr>
              ) : entries.map(e => (
                <tr key={e.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3.5">
                    <p className="text-xs font-semibold text-gray-700">
                      {e.sourceType ? (SOURCE_LABEL[e.sourceType] ?? e.sourceType) : (mm ? 'MediHug မှ ချိန်ညှိထားသည်' : 'Adjusted by MediHug')}
                    </p>
                    {!e.sourceType && e.note && <p className="text-[10px] text-gray-500">{e.note}</p>}
                    {e.expiry && e.expiry.expired > 0 && e.expiry.expiresAt && (
                      <p className="text-[10px] text-red-500">{mm ? `${fmtDate(e.expiry.expiresAt)} တွင် ${e.expiry.expired} ခု သက်တမ်းကုန်ခဲ့သည်` : `${e.expiry.expired} expired on ${fmtDate(e.expiry.expiresAt)}`}</p>
                    )}
                    {e.expiry && e.expiry.expired === 0 && e.expiry.remaining > 0 && e.expiry.expiresAt && (
                      <p className="text-[10px] text-gray-400">{mm ? `${fmtDate(e.expiry.expiresAt)} တွင် သက်တမ်းကုန်မည်` : `Expires ${fmtDate(e.expiry.expiresAt)}`}</p>
                    )}
                    <p className="text-[10px] text-gray-400">{new Date(e.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </td>
                  <td className="px-4 py-3.5 text-right text-sm text-gray-600">{e.amountKs > 0 ? `${e.amountKs.toLocaleString()} Ks` : '—'}</td>
                  <td className="px-4 py-3.5 text-right text-sm font-bold" style={{ color: e.points > 0 ? '#16a34a' : '#ef4444' }}>
                    {e.points > 0 ? '+' : '-'}{Math.abs(e.points).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
            <p className="text-xs text-gray-400">{total} {mm ? 'ခု' : 'entries'}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-500 px-2">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      <p className="text-[11px] text-gray-400" style={{ color: PRIMARY }}>{' '}</p>
    </div>
  );
}
