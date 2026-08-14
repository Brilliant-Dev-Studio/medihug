'use client';

import { use, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import InvoiceView, { type InvoiceData } from '@/components/InvoiceView';

interface Appointment {
  id: string; status: string; fee: number | null; paymentMethod: string | null; date: string;
  user: { name: string; phone: string };
  doctor: { name: string; nameEn: string | null };
}

export default function PatientAppointmentInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/patient/appointments/${id}`)
      .then(r => r.json())
      .then(d => {
        const appt: Appointment | null = d.appointment ?? null;
        if (!appt) { setLoading(false); return; }
        setData({
          invoiceNo: appt.id.slice(-8).toUpperCase(),
          date: appt.date,
          status: appt.status,
          billTo: { name: appt.user.name, phone: appt.user.phone },
          providerLabel: `Dr. ${appt.doctor.nameEn ?? appt.doctor.name}`,
          paymentMethod: appt.paymentMethod,
          lines: [{ label: 'Teleconsultation', amount: appt.fee ?? 0 }],
          total: appt.fee ?? 0,
        });
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>;
  if (!data) return <div className="p-6 text-sm text-gray-500">Appointment not found.</div>;

  return <InvoiceView data={data} />;
}
