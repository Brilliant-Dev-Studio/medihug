'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock, Phone, User } from 'lucide-react';
import { STATUS_STYLE, type Appointment } from '@/app/admin/appointments/shared';

export default function PartnerAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/partner/appointments')
      .then(r => r.json())
      .then(d => setAppointments(d.appointments ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto flex flex-col gap-4">
      <h1 className="text-lg font-bold text-gray-800">Appointments</h1>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <Calendar className="w-8 h-8 mx-auto text-gray-200 mb-2" />
          <p className="text-sm text-gray-400">No appointments yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
          {appointments.map(a => {
            const s = STATUS_STYLE[a.status];
            const doctorName = a.doctor.nameEn ?? a.doctor.name;
            return (
              <div key={a.id} className="flex items-center gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                    <p className="text-sm font-semibold text-gray-800 truncate">{a.user.name}</p>
                    <span className="text-xs text-gray-300">·</span>
                    <Phone className="w-3 h-3 text-gray-300 shrink-0" />
                    <p className="text-xs text-gray-400">{a.user.phone}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Dr. {doctorName}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(a.date).toLocaleDateString()}
                  {a.time && <><Clock className="w-3.5 h-3.5 ml-2" />{a.time}</>}
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0" style={{ backgroundColor: s.bg, color: s.color }}>
                  <s.icon className="w-3 h-3" /> {s.label.en}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
