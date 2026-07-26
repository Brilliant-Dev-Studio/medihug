'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { PhoneCall, PhoneOff } from 'lucide-react';

const POLL_MS = 3000;
const AUTO_DISMISS_MS = 45000;

interface RingingAppointment {
  id: string;
  callRinging: boolean;
  doctor: { name: string; nameEn: string | null; imageUrl: string | null };
}

export default function IncomingCallRing() {
  const router = useRouter();
  const pathname = usePathname();
  const [ringing, setRinging] = useState<RingingAppointment | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('medihug_patient');
    if (!raw) return;
    let phone = '';
    try { phone = (JSON.parse(raw) as { phone: string }).phone; } catch { return; }
    if (!phone) return;

    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch(`/api/patient/appointments?phone=${encodeURIComponent(phone)}`);
        const data = await res.json();
        if (cancelled) return;
        const found = (data.appointments ?? []).find((a: RingingAppointment) => a.callRinging);
        setRinging(prev => {
          // Don't re-trigger the ring for an appointment the patient is already on the call page for.
          if (found && pathname === `/patient/appointments/${found.id}/call`) return null;
          if (found) return found;
          return prev && prev.id === (found?.id ?? '') ? prev : (found ?? null);
        });
      } catch {}
    }
    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => { cancelled = true; clearInterval(interval); };
  }, [pathname]);

  useEffect(() => {
    if (!ringing) {
      audioRef.current?.pause();
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
      return;
    }
    audioRef.current?.play().catch(() => {});
    dismissTimer.current = setTimeout(() => decline(), AUTO_DISMISS_MS);
    return () => { if (dismissTimer.current) clearTimeout(dismissTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ringing?.id]);

  async function clearRing(id: string, declined: boolean) {
    const raw = localStorage.getItem('medihug_patient');
    if (!raw) return;
    let phone = '';
    try { phone = (JSON.parse(raw) as { phone: string }).phone; } catch { return; }
    await fetch(`/api/patient/appointments/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, callRinging: false, ...(declined ? { callDeclined: true } : {}) }),
    }).catch(() => {});
  }

  function decline() {
    if (!ringing) return;
    clearRing(ringing.id, true);
    setRinging(null);
  }

  function accept() {
    if (!ringing) return;
    const id = ringing.id;
    setRinging(null);
    router.push(`/patient/appointments/${id}/call`);
  }

  if (!ringing) return null;

  const doctorName = ringing.doctor.nameEn ?? ringing.doctor.name;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-6">
      <audio ref={audioRef} src="/mixkit-happy-bells-notification-937.wav" loop />
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 flex flex-col items-center gap-4 text-center animate-[pulse_2s_ease-in-out_infinite]">
        <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center text-3xl font-bold text-white shrink-0" style={{ backgroundColor: 'var(--color-primary)' }}>
          {ringing.doctor.imageUrl
            ? <img src={ringing.doctor.imageUrl} alt={doctorName} className="w-full h-full object-cover" />
            : doctorName.split(' ').map(w => w[0]).join('').slice(0, 2)}
        </div>
        <div>
          <p className="text-lg font-bold text-gray-800">{doctorName}</p>
          <p className="text-sm text-gray-400">Incoming video call…</p>
        </div>
        <div className="flex items-center gap-6 mt-2">
          <button onClick={decline} className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg transition-colors">
            <PhoneOff className="w-6 h-6" />
          </button>
          <button onClick={accept} className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white shadow-lg transition-colors">
            <PhoneCall className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
