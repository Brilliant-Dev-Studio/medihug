'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Layers, User, Stethoscope, Package, HeartPulse, Receipt } from 'lucide-react';

const PRIMARY = '#2ab5ad';

interface ClinicRef { id: string; name: string; nameEn: string | null; type: string; imageUrl: string | null }
interface UserRef { id: string; name: string; phone: string | null; profileImage: string | null }

interface LedgerEntry {
  id: string;
  sourceType: 'CONSULTATION' | 'PROGRAM' | 'PRODUCT' | 'HOME_SERVICE' | 'PARTNER_SERVICE';
  sourceId: string;
  patientPaid: number;
  ownershipType: 'MEDIHUG' | 'PARTNER' | 'SHARED';
  clinic: ClinicRef | null;
  medihugSharePercent: number;
  medihugShareAmount: number;
  partnerShareAmount: number;
  referralClinic: ClinicRef | null;
  partnerReferralFeePercent: number;
  partnerReferralFeeAmount: number;
  gatewayFeePercent: number;
  gatewayFeeAmount: number;
  providerShareAmount: number;
  netMedihugRevenue: number;
  settlementStatus: 'PENDING' | 'APPROVED' | 'SETTLED' | 'HELD';
  settledAt: string | null;
  paymentReference: string | null;
  createdAt: string;
}

interface ConsultationSource {
  type: 'CONSULTATION';
  appointment: {
    id: string; date: string; time: string | null; reason: string | null; note: string | null; status: string;
    paymentMethod: string | null; fee: number | null; platformFeeAmount: number | null; doctorPayoutAmount: number | null;
    receiptUrl: string | null; cbPayStatus: string; cbPayRefOrder: string | null; cbPayTransactionId: string | null;
    cbPayAmountConfirmed: number | null; cbPayPaidAt: string | null; doctorNote: string | null;
    user: UserRef;
    doctor: { id: string; name: string; nameEn: string | null; specialty: string | null; specialtyEn: string | null; imageUrl: string | null };
    referredDoctor: { id: string; name: string; nameEn: string | null } | null;
    referredClinic: { id: string; name: string; nameEn: string | null } | null;
  };
}
interface ProgramSource {
  type: 'PROGRAM';
  enrollment: {
    id: string; amount: number; paymentMethod: string | null; receiptUrl: string | null; status: string; createdAt: string;
    cbPayStatus: string; cbPayRefOrder: string | null; cbPayTransactionId: string | null; cbPayAmountConfirmed: number | null; cbPayPaidAt: string | null;
    user: UserRef;
    program: { id: string; titleMm: string; titleEn: string | null; clinic: { id: string; name: string; nameEn: string | null } | null };
  };
}
interface ProductSource {
  type: 'PRODUCT';
  order: {
    id: string; totalAmount: number; paymentMethod: string | null; receiptUrl: string | null; status: string; createdAt: string;
    cbPayStatus: string; cbPayRefOrder: string | null; cbPayTransactionId: string | null; cbPayAmountConfirmed: number | null; cbPayPaidAt: string | null;
    user: UserRef;
    items: { quantity: number; price: number; product: { id: string; name: string; nameEn: string | null; imageUrl: string | null } }[];
  };
}
type Source = ConsultationSource | ProgramSource | ProductSource | null;

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

function MoneyCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="bg-white rounded-2xl border p-4" style={{ borderColor: highlight ? `${PRIMARY}40` : '#f3f4f6' }}>
      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: highlight ? PRIMARY : '#9ca3af' }}>{label}</p>
      <p className="text-lg font-bold mt-1" style={{ color: highlight ? PRIMARY : '#1f2937' }}>{value.toLocaleString()} Ks</p>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-400" />
        <h2 className="font-bold text-gray-700 text-sm">{title}</h2>
      </div>
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm text-gray-700 mt-0.5">{value}</p>
    </div>
  );
}

function fmtDate(d: string | null) {
  return d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;
}

export default function RevenueLedgerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [entry, setEntry] = useState<LedgerEntry | null>(null);
  const [source, setSource] = useState<Source>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/finance/revenue-ledger/${id}`);
    if (res.status === 404) { setNotFound(true); setLoading(false); return; }
    const d = await res.json();
    setEntry(d.entry ?? null);
    setSource(d.source ?? null);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const updateSettlement = async (settlementStatus: string) => {
    setSaving(true);
    await fetch(`/api/admin/finance/revenue-ledger/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settlementStatus }),
    });
    setSaving(false);
    load();
  };

  const updatePaymentReference = async (paymentReference: string) => {
    await fetch(`/api/admin/finance/revenue-ledger/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentReference }),
    });
    load();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: PRIMARY }} />
    </div>
  );

  if (notFound || !entry) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Layers className="w-12 h-12 text-gray-200" />
      <p className="text-gray-400">Ledger entry not found.</p>
      <button onClick={() => router.back()} className="text-sm font-semibold" style={{ color: PRIMARY }}>← Back</button>
    </div>
  );

  const doctorName = source?.type === 'CONSULTATION' ? (source.appointment.doctor.nameEn ?? source.appointment.doctor.name) : null;
  const specialty = source?.type === 'CONSULTATION' ? (source.appointment.doctor.specialtyEn ?? source.appointment.doctor.specialty) : null;

  return (
    <div className="flex flex-col gap-5 pb-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          <select
            value={entry.settlementStatus}
            disabled={saving}
            onChange={ev => updateSettlement(ev.target.value)}
            className="text-xs font-bold px-3 py-1.5 rounded-lg border-0 focus:outline-none disabled:opacity-50"
            style={{ backgroundColor: SETTLEMENT_STYLE[entry.settlementStatus].bg, color: SETTLEMENT_STYLE[entry.settlementStatus].color }}
          >
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="SETTLED">Settled</option>
            <option value="HELD">Held</option>
          </select>
        </div>
      </div>

      <div>
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          {entry.sourceType}
          <Badge style={OWNERSHIP_STYLE[entry.ownershipType]} />
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {fmtDate(entry.createdAt)} · ID {entry.id}
        </p>
      </div>

      {/* Who / what */}
      {source?.type === 'CONSULTATION' && (
        <Section title="Consultation" icon={HeartPulse}>
          <Field label="Patient" value={
            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-gray-300" />{source.appointment.user.name}{source.appointment.user.phone ? ` · ${source.appointment.user.phone}` : ''}</span>
          } />
          <Field label="Doctor" value={
            <span className="flex items-center gap-1.5"><Stethoscope className="w-3.5 h-3.5 text-gray-300" />{doctorName}{specialty ? ` · ${specialty}` : ''}</span>
          } />
          <Field label="Appointment Date" value={`${new Date(source.appointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}${source.appointment.time ? ` · ${source.appointment.time}` : ''}`} />
          <Field label="Status" value={source.appointment.status} />
          <Field label="Reason" value={source.appointment.reason} />
          <Field label="Note" value={source.appointment.note} />
          <Field label="Doctor Note" value={source.appointment.doctorNote} />
          {source.appointment.referredDoctor && <Field label="Referred To Doctor" value={source.appointment.referredDoctor.nameEn ?? source.appointment.referredDoctor.name} />}
          {source.appointment.referredClinic && <Field label="Referred To Clinic" value={source.appointment.referredClinic.nameEn ?? source.appointment.referredClinic.name} />}
        </Section>
      )}
      {source?.type === 'PROGRAM' && (
        <Section title="Program Enrollment" icon={HeartPulse}>
          <Field label="Patient" value={
            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-gray-300" />{source.enrollment.user.name}{source.enrollment.user.phone ? ` · ${source.enrollment.user.phone}` : ''}</span>
          } />
          <Field label="Program" value={source.enrollment.program.titleEn ?? source.enrollment.program.titleMm} />
          <Field label="Clinic" value={source.enrollment.program.clinic ? (source.enrollment.program.clinic.nameEn ?? source.enrollment.program.clinic.name) : '—'} />
          <Field label="Enrolled" value={fmtDate(source.enrollment.createdAt)} />
          <Field label="Status" value={source.enrollment.status} />
        </Section>
      )}
      {source?.type === 'PRODUCT' && (
        <Section title="Order" icon={Package}>
          <Field label="Patient" value={
            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-gray-300" />{source.order.user.name}{source.order.user.phone ? ` · ${source.order.user.phone}` : ''}</span>
          } />
          <Field label="Ordered" value={fmtDate(source.order.createdAt)} />
          <Field label="Status" value={source.order.status} />
          <div className="sm:col-span-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Items</p>
            <div className="divide-y divide-gray-50 border border-gray-100 rounded-xl overflow-hidden">
              {source.order.items.map((it, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                  <span className="text-gray-700">{it.product.nameEn ?? it.product.name} <span className="text-gray-400">× {it.quantity}</span></span>
                  <span className="font-semibold text-gray-700">{(it.price * it.quantity).toLocaleString()} Ks</span>
                </div>
              ))}
            </div>
          </div>
        </Section>
      )}
      {!source && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-sm text-gray-400">
          No linked record found for source {entry.sourceType} / {entry.sourceId} (reserved source type or the underlying record was removed).
        </div>
      )}

      {/* Money breakdown */}
      <div>
        <h2 className="font-bold text-gray-700 text-sm mb-3">Revenue Breakdown</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <MoneyCard label="Patient Paid" value={entry.patientPaid} />
          <MoneyCard label={`Medihug Share (${entry.medihugSharePercent}%)`} value={entry.medihugShareAmount} />
          <MoneyCard label="Partner Share" value={entry.partnerShareAmount} />
          <MoneyCard label={`Referral Fee (${entry.partnerReferralFeePercent}%)`} value={entry.partnerReferralFeeAmount} />
          <MoneyCard label={`Gateway Fee (${entry.gatewayFeePercent}%)`} value={entry.gatewayFeeAmount} />
          <MoneyCard label="Doctor Payout" value={entry.providerShareAmount} />
          <MoneyCard label="Net Medihug Revenue" value={entry.netMedihugRevenue} highlight />
        </div>
      </div>

      {/* Ownership & clinic */}
      <Section title="Ownership" icon={Layers}>
        <Field label="Ownership Type" value={<Badge style={OWNERSHIP_STYLE[entry.ownershipType]} />} />
        <Field label="Owning / Shared Clinic" value={entry.clinic ? (entry.clinic.nameEn ?? entry.clinic.name) : '—'} />
        <Field label="Referring Clinic" value={entry.referralClinic ? (entry.referralClinic.nameEn ?? entry.referralClinic.name) : '—'} />
      </Section>

      {/* Payment */}
      <Section title="Payment" icon={Receipt}>
        {source?.type === 'CONSULTATION' && <>
          <Field label="Payment Method" value={source.appointment.paymentMethod} />
          <Field label="CBPay Status" value={source.appointment.cbPayStatus} />
          <Field label="CBPay Ref Order" value={source.appointment.cbPayRefOrder} />
          <Field label="CBPay Transaction ID" value={source.appointment.cbPayTransactionId} />
          <Field label="CBPay Amount Confirmed" value={source.appointment.cbPayAmountConfirmed?.toLocaleString()} />
          <Field label="CBPay Paid At" value={fmtDate(source.appointment.cbPayPaidAt)} />
          {source.appointment.receiptUrl && (
            <div className="sm:col-span-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Receipt</p>
              <img src={source.appointment.receiptUrl} alt="Receipt" className="max-w-xs rounded-xl border border-gray-100" />
            </div>
          )}
        </>}
        {source?.type === 'PROGRAM' && <>
          <Field label="Payment Method" value={source.enrollment.paymentMethod} />
          <Field label="CBPay Status" value={source.enrollment.cbPayStatus} />
          <Field label="CBPay Ref Order" value={source.enrollment.cbPayRefOrder} />
          <Field label="CBPay Transaction ID" value={source.enrollment.cbPayTransactionId} />
          <Field label="CBPay Amount Confirmed" value={source.enrollment.cbPayAmountConfirmed?.toLocaleString()} />
          <Field label="CBPay Paid At" value={fmtDate(source.enrollment.cbPayPaidAt)} />
          {source.enrollment.receiptUrl && (
            <div className="sm:col-span-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Receipt</p>
              <img src={source.enrollment.receiptUrl} alt="Receipt" className="max-w-xs rounded-xl border border-gray-100" />
            </div>
          )}
        </>}
        {source?.type === 'PRODUCT' && <>
          <Field label="Payment Method" value={source.order.paymentMethod} />
          <Field label="CBPay Status" value={source.order.cbPayStatus} />
          <Field label="CBPay Ref Order" value={source.order.cbPayRefOrder} />
          <Field label="CBPay Transaction ID" value={source.order.cbPayTransactionId} />
          <Field label="CBPay Amount Confirmed" value={source.order.cbPayAmountConfirmed?.toLocaleString()} />
          <Field label="CBPay Paid At" value={fmtDate(source.order.cbPayPaidAt)} />
          {source.order.receiptUrl && (
            <div className="sm:col-span-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Receipt</p>
              <img src={source.order.receiptUrl} alt="Receipt" className="max-w-xs rounded-xl border border-gray-100" />
            </div>
          )}
        </>}
        {!source && <Field label="Payment Method" value="—" />}
      </Section>

      {/* Settlement */}
      <Section title="Settlement" icon={Receipt}>
        <Field label="Status" value={<Badge style={SETTLEMENT_STYLE[entry.settlementStatus]} />} />
        <Field label="Settled At" value={fmtDate(entry.settledAt)} />
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment Reference</p>
          <input
            type="text"
            defaultValue={entry.paymentReference ?? ''}
            placeholder="Payment ref #"
            onBlur={ev => { if (ev.target.value !== (entry.paymentReference ?? '')) updatePaymentReference(ev.target.value); }}
            className="mt-1 text-sm text-gray-700 border-b border-dashed border-gray-200 focus:outline-none focus:border-gray-400 bg-transparent w-full max-w-xs"
          />
        </div>
      </Section>
    </div>
  );
}
