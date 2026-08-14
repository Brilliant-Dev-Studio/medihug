'use client';

import { use, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import InvoiceView, { type InvoiceData } from '@/components/InvoiceView';
import type { Appointment } from '../../shared';

export default function AdminAppointmentInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/appointments/${id}`).then(r => r.json()),
      fetch(`/api/admin/refunds?appointmentId=${id}`).then(r => r.json()),
    ]).then(([apptData, refundData]) => {
      const appt: Appointment | null = apptData.appointment ?? null;
      if (!appt) { setLoading(false); return; }
      const refundTotal = (refundData.refunds ?? []).reduce((s: number, r: { amount: number }) => s + r.amount, 0);
      setData({
        invoiceNo: appt.id.slice(-8).toUpperCase(),
        date: appt.date,
        status: appt.status,
        billTo: { name: appt.user.name, phone: appt.user.phone },
        providerLabel: `Dr. ${appt.doctor.nameEn ?? appt.doctor.name}`,
        paymentMethod: appt.paymentMethod,
        lines: [{ label: 'Teleconsultation', amount: appt.fee ?? 0 }],
        total: appt.fee ?? 0,
        refundTotal,
        cancelReason: appt.cancelReason,
      });
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>;
  if (!data) return <div className="p-6 text-sm text-gray-500">Appointment not found.</div>;

  return <InvoiceView data={data} />;
}
