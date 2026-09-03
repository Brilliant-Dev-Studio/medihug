'use client';

import { X } from 'lucide-react';
import { t, type Appointment } from '@/app/admin/appointments/shared';
import { useLang } from '@/app/lib/LanguageContext';
import NoteReferralCard from '@/components/doctor/NoteReferralCard';

interface Props {
  appointment: Appointment | null;
  open: boolean;
  onClose: () => void;
}

/** In-call slide-in drawer so the doctor can write the clinical note / referral without leaving the video call. */
export default function NoteEditorPanel({ appointment, open, onClose }: Props) {
  const { lang } = useLang();
  const mm = lang === 'mm';

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:w-[420px] h-dvh bg-gray-50 overflow-y-auto flex flex-col">
        <div className="sticky top-0 z-10 flex items-center justify-end px-4 pt-4 bg-gray-50">
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-gray-100 hover:bg-gray-100 text-gray-400 shadow-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 pt-2">
          {!appointment ? (
            <p className="text-sm text-gray-400 text-center py-10">{t(mm, { mm: 'ချိန်းဆိုမှု ရှာမတွေ့ပါ', en: 'Appointment not available.' })}</p>
          ) : (
            <NoteReferralCard appt={appointment} mm={mm} onSaved={() => {}} />
          )}
        </div>
      </div>
    </div>
  );
}
