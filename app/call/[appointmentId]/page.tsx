'use client';

import { use, useEffect, useState } from 'react';
import { Loader2, Video } from 'lucide-react';
import VideoCallRoom from '@/components/VideoCallRoom';

interface CallAppointment {
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  doctorApproved: boolean;
  doctor: { name: string; nameEn: string | null };
  user: { name: string };
}

export default function GuestVideoCallPage({ params }: { params: Promise<{ appointmentId: string }> }) {
  const { appointmentId } = use(params);
  const [appt, setAppt] = useState<CallAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetch(`/api/patient/appointments/${appointmentId}`)
      .then(r => r.json())
      .then(d => setAppt(d.appointment ?? null))
      .finally(() => setLoading(false));
  }, [appointmentId]);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-white animate-spin" />
    </div>
  );

  if (!appt || appt.status !== 'CONFIRMED' || !appt.doctorApproved) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-white font-semibold">This call link is not available.</p>
        <p className="text-white/50 text-sm">It may not have started yet, or has already ended.</p>
      </div>
    );
  }

  const doctorName = appt.doctor.nameEn ?? appt.doctor.name;

  if (!joining) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-5 px-6 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#2ab5ad22' }}>
          <Video className="w-7 h-7" style={{ color: '#2ab5ad' }} />
        </div>
        <div>
          <p className="text-white font-bold text-lg">You&apos;ve been invited to join a call</p>
          <p className="text-white/50 text-sm mt-1">{appt.user.name} &amp; {doctorName}</p>
        </div>
        <button onClick={() => setJoining(true)}
          className="px-6 py-3 rounded-2xl text-sm font-bold text-white" style={{ backgroundColor: '#2ab5ad' }}>
          Join Call
        </button>
      </div>
    );
  }

  return (
    <VideoCallRoom
      appointmentId={appointmentId}
      role="guest"
      displayName="Guest"
      peerName={`${appt.user.name} & ${doctorName}`}
      backHref={`/call/${appointmentId}`}
    />
  );
}
