'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import VideoCallRoom from '@/components/VideoCallRoom';

interface CallAppointment {
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  doctorApproved: boolean;
  user: { name: string };
}

export default function DoctorVideoCallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [appt, setAppt] = useState<CallAppointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/doctor/appointments/${id}`)
      .then(r => r.json())
      .then(d => { setAppt(d.appointment ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-white animate-spin" />
    </div>
  );

  if (!appt || appt.status !== 'CONFIRMED' || !appt.doctorApproved) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-white font-semibold">This call is not available.</p>
        <button onClick={() => router.push(`/doctor/appointments/${id}`)} className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white" style={{ backgroundColor: '#2ab5ad' }}>
          Back to Appointment
        </button>
      </div>
    );
  }

  return (
    <VideoCallRoom
      appointmentId={id}
      role="doctor"
      displayName="You"
      peerName={appt.user.name}
      backHref={`/doctor/appointments/${id}`}
      shareable
    />
  );
}
