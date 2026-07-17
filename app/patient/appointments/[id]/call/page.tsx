'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import VideoCallRoom from '@/components/VideoCallRoom';

interface CallAppointment {
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  doctorApproved: boolean;
  doctor: { name: string; nameEn: string | null };
  user: { phone: string };
}

export default function PatientVideoCallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [appt, setAppt] = useState<CallAppointment | null>(null);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem('medihug_patient');
    if (raw) {
      try { setPhone((JSON.parse(raw) as { phone: string }).phone); } catch {}
    }
    fetch(`/api/patient/appointments/${id}`)
      .then(r => r.json())
      .then(d => setAppt(d.appointment ?? null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-white animate-spin" />
    </div>
  );

  if (!appt || appt.status !== 'CONFIRMED' || !appt.doctorApproved || !phone || phone !== appt.user.phone) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-white font-semibold">This call is not available.</p>
        <button onClick={() => router.push(`/patient/appointments/${id}/form`)} className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white" style={{ backgroundColor: '#2ab5ad' }}>
          Back to Appointment
        </button>
      </div>
    );
  }

  return (
    <VideoCallRoom
      appointmentId={id}
      role="patient"
      phone={phone}
      displayName="You"
      peerName={appt.doctor.nameEn ?? appt.doctor.name}
      backHref={`/patient/appointments/${id}/form`}
      shareable
    />
  );
}
