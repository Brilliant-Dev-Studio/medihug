'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Video } from 'lucide-react';

const PRIMARY = '#2ab5ad';

/** Moderator landing page — no "live calls" list by design (kept thin); moderators are
 * told which appointment to join (e.g. via a shared link or a support escalation) and
 * paste the appointment ID here, or arrive directly at /admin/moderate/[appointmentId]. */
export default function ModerateLandingPage() {
  const [appointmentId, setAppointmentId] = useState('');
  const router = useRouter();

  const join = () => {
    if (!appointmentId.trim()) return;
    router.push(`/admin/moderate/${appointmentId.trim()}`);
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${PRIMARY}14` }}>
        <Video className="w-8 h-8" style={{ color: PRIMARY }} />
      </div>
      <div>
        <h1 className="text-lg font-bold text-gray-800">Join a Call as Moderator</h1>
        <p className="text-sm text-gray-400 mt-1 max-w-sm">Enter the appointment ID you were asked to moderate.</p>
      </div>
      <div className="flex items-center gap-2 w-full max-w-sm">
        <input
          value={appointmentId}
          onChange={e => setAppointmentId(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && join()}
          placeholder="Appointment ID"
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2ab5ad]"
        />
        <button onClick={join} disabled={!appointmentId.trim()}
          className="px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40"
          style={{ backgroundColor: PRIMARY }}>
          Join
        </button>
      </div>
    </div>
  );
}
