'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Layers, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const PRIMARY = '#2ab5ad';

interface LedgerEntry {
  id: string;
  sourceType: 'CONSULTATION' | 'PROGRAM' | 'PRODUCT' | 'HOME_SERVICE' | 'PARTNER_SERVICE';
  sourceId: string;
  appointment: {
    id: string; date: string; time: string | null;
    user: { name: string; phone: string | null } | null;
    doctor: { name: string; nameEn: string | null } | null;
  } | null;
  patientPaid: number;
  ownershipType: 'MEDIHUG' | 'PARTNER' | 'SHARED';
  clinic: { id: string; name: string; nameEn: string | null } | null;
  medihugSharePercent: number;
  medihugShareAmount: number;
  partnerShareAmount: number;
  referralClinic: { id: string; name: string; nameEn: string | null } | null;
  partnerReferralFeePercent: number;
  partnerReferralFeeAmount: number;
  gatewayFeePercent: number;
  gatewayFeeAmount: number;
  providerShareAmount: number;
  netMedihugRevenue: number;
  settlementStatus: 'PENDING' | 'APPROVED' | 'SETTLED' | 'HELD';
  paymentReference: string | null;
  createdAt: string;
}

const OWNERSHIP_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  MEDIHUG: { label: 'Medihug', bg: '#e6f7f7', color: PRIMARY },
  PARTNER: { label: 'Partner', bg: '#fef2f2', color: '#ef4444' },
  SHARED:  { label: 'Shared',  bg: '#eff6ff', color: '#3b82f6' },
};

const SETTLEMENT_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  PENDING:  { label: 'Pending',  bg: '#fffbeb', color: '#d97706' },
  APPROVED: { label: 'Approved', bg: '#eff6ff', color: '#3b82f6' },
  SETTLED:  { label: 'Settled',  bg: '#f0fdf4', color: '#16a34a' },
  HELD:     { label: 'Held',     bg: '#f9fafb', color: '#6b7280' },
};

function Badge({ style }: { style: { label: string; bg: string; color: string } }) {
  return (
    <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ backgroundColor: style.bg, color: style.color }}>
      {style.label}
    </span>
  );
}

export default function RevenueLedgerPage() {
  const router = useRouter();
  const [entries, setEntries]   = useState<LedgerEntry[]>([]);
  const [totals, setTotals]     = useState({ patientPaid: 0, medihugShareAmount: 0, partnerShareAmount: 0, partnerReferralFeeAmount: 0, gatewayFeeAmount: 0, providerShareAmount: 0, netMedihugRevenue: 0 });
  const [loading, setLoading]   = useState(true);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sourceType, setSourceType] = useState('');
  const [ownershipType, setOwnershipType] = useState('');
  const [settlementStatus, setSettlementStatus] = useState('');
  const [settlingId, setSettlingId] = useState<string | null>(null);

  const load = useCallback(async (p = page) => {
    setLoading(true);
    const q = new URLSearchParams({ page: String(p) });
    if (sourceType) q.set('sourceType', sourceType);
    if (ownershipType) q.set('ownershipType', ownershipType);
    if (settlementStatus) q.set('settlementStatus', settlementStatus);
    const res = await fetch(`/api/admin/finance/revenue-ledger?${q}`);
    const d = await res.json();
    setEntries(d.entries ?? []);
    setTotal(d.total ?? 0);
    setPage(d.page ?? 1);
    setTotalPages(d.totalPages ?? 1);
    setTotals(d.totals ?? { patientPaid: 0, medihugShareAmount: 0, partnerShareAmount: 0, partnerReferralFeeAmount: 0, gatewayFeeAmount: 0, providerShareAmount: 0, netMedihugRevenue: 0 });
    setLoading(false);
  }, [page, sourceType, ownershipType, settlementStatus]);

  useEffect(() => { load(1); }, [sourceType, ownershipType, settlementStatus]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(page); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateSettlement = async (id: string, settlementStatus: string) => {
    setSettlingId(id);
    await fetch(`/api/admin/finance/revenue-ledger/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settlementStatus }),
    });
    setSettlingId(null);
    load(page);
  };

  const updatePaymentReference = async (id: string, paymentReference: string) => {
    await fetch(`/api/admin/finance/revenue-ledger/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentReference }),
    });
    load(page);
  };

  const selectCls = 'bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ab5ad]/40 focus:border-[#2ab5ad]';

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Revenue Ledger</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Patient Paid → Revenue Ownership → Medihug Share → Partner Referral Fee → Net Medihug Revenue, per transaction
        </p>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Patient Paid</p>
          <p className="text-lg font-bold text-gray-800 mt-1">{totals.patientPaid.toLocaleString()} Ks</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Medihug Share</p>
          <p className="text-lg font-bold text-gray-800 mt-1">{totals.medihugShareAmount.toLocaleString()} Ks</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Partner Share</p>
          <p className="text-lg font-bold text-gray-800 mt-1">{totals.partnerShareAmount.toLocaleString()} Ks</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Referral Fees</p>
          <p className="text-lg font-bold text-gray-800 mt-1">{totals.partnerReferralFeeAmount.toLocaleString()} Ks</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gateway Fees</p>
          <p className="text-lg font-bold text-gray-800 mt-1">{totals.gatewayFeeAmount.toLocaleString()} Ks</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Doctor Payouts</p>
          <p className="text-lg font-bold text-gray-800 mt-1">{totals.providerShareAmount.toLocaleString()} Ks</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4" style={{ borderColor: `${PRIMARY}40` }}>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: PRIMARY }}>Net Medihug Revenue</p>
          <p className="text-lg font-bold mt-1" style={{ color: PRIMARY }}>{totals.netMedihugRevenue.toLocaleString()} Ks</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select className={selectCls} value={sourceType} onChange={e => setSourceType(e.target.value)}>
          <option value="">All Sources</option>
          <option value="CONSULTATION">Consultation</option>
          <option value="PROGRAM">Program</option>
          <option value="PRODUCT">Product</option>
          <option value="HOME_SERVICE">Home Service</option>
          <option value="PARTNER_SERVICE">Partner Service</option>
        </select>
        <select className={selectCls} value={ownershipType} onChange={e => setOwnershipType(e.target.value)}>
          <option value="">All Ownership</option>
          <option value="MEDIHUG">Medihug</option>
          <option value="PARTNER">Partner</option>
          <option value="SHARED">Shared</option>
        </select>
        <select className={selectCls} value={settlementStatus} onChange={e => setSettlementStatus(e.target.value)}>
          <option value="">All Settlement</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="SETTLED">Settled</option>
          <option value="HELD">Held</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-287.5">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Source</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Patient</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Doctor</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ownership</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Clinic</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Patient Paid</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Medihug Share</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Partner Share</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Referral Fee</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gateway Fee</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Doctor Payout</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Net Revenue</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={13} className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" /></td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={13} className="py-16 text-center">
                  <Layers className="w-8 h-8 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No revenue ledger entries yet.</p>
                </td></tr>
              ) : entries.map(e => (
                <tr key={e.id} onClick={() => router.push(`/admin/finance/revenue-ledger/${e.id}`)} className="hover:bg-gray-50/60 transition-colors cursor-pointer">
                  <td className="px-4 py-3.5">
                    <p className="text-xs font-semibold text-gray-700">{e.sourceType}</p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(e.appointment?.date ?? e.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {e.appointment?.time ? ` · ${e.appointment.time}` : ''}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-600">
                    {e.appointment?.user?.name ?? '—'}
                    {e.appointment?.user?.phone && <p className="text-[10px] text-gray-400">{e.appointment.user.phone}</p>}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-600">
                    {e.appointment?.doctor ? (e.appointment.doctor.nameEn ?? e.appointment.doctor.name) : '—'}
                  </td>
                  <td className="px-4 py-3.5"><Badge style={OWNERSHIP_STYLE[e.ownershipType]} /></td>
                  <td className="px-4 py-3.5 text-xs text-gray-500">
                    {e.clinic?.name ?? '—'}
                    {e.referralClinic && <p className="text-[10px] text-gray-400">ref: {e.referralClinic.name}</p>}
                  </td>
                  <td className="px-4 py-3.5 text-right text-sm font-semibold text-gray-700">{e.patientPaid.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-right text-xs text-gray-500">
                    {e.medihugShareAmount.toLocaleString()} <span className="text-gray-300">({e.medihugSharePercent}%)</span>
                  </td>
                  <td className="px-4 py-3.5 text-right text-xs text-gray-500">
                    {e.partnerShareAmount > 0 ? e.partnerShareAmount.toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-right text-xs text-gray-500">
                    {e.partnerReferralFeeAmount > 0 ? `${e.partnerReferralFeeAmount.toLocaleString()} (${e.partnerReferralFeePercent}%)` : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-right text-xs text-gray-500">
                    {e.gatewayFeeAmount > 0 ? e.gatewayFeeAmount.toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-right text-xs text-gray-500">
                    {e.providerShareAmount > 0 ? e.providerShareAmount.toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-right text-sm font-bold" style={{ color: PRIMARY }}>{e.netMedihugRevenue.toLocaleString()}</td>
                  <td className="px-4 py-3.5" onClick={ev => ev.stopPropagation()}>
                    <select
                      value={e.settlementStatus}
                      disabled={settlingId === e.id}
                      onChange={ev => updateSettlement(e.id, ev.target.value)}
                      className="text-[10px] font-bold px-2 py-1 rounded-lg border-0 focus:outline-none disabled:opacity-50"
                      style={{ backgroundColor: SETTLEMENT_STYLE[e.settlementStatus].bg, color: SETTLEMENT_STYLE[e.settlementStatus].color }}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="APPROVED">Approved</option>
                      <option value="SETTLED">Settled</option>
                      <option value="HELD">Held</option>
                    </select>
                    <input
                      type="text"
                      defaultValue={e.paymentReference ?? ''}
                      placeholder="Payment ref #"
                      onBlur={ev => { if (ev.target.value !== (e.paymentReference ?? '')) updatePaymentReference(e.id, ev.target.value); }}
                      className="block mt-1 text-[10px] text-gray-400 border-b border-dashed border-gray-200 focus:outline-none focus:border-gray-400 w-24 bg-transparent"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
            <p className="text-xs text-gray-400">{total} entries</p>
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
    </div>
  );
}
