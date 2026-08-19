'use client';

import { useState, useEffect } from 'react';
import { marked } from 'marked';
import { X, Loader2, FileWarning, ChevronLeft } from 'lucide-react';

const toHtml = (md: string) => (md ? String(marked.parse(md, { async: false })) : '');

const PRIMARY = 'var(--color-primary)';

interface Medicine { name: string; dosage: string | null; frequency: string | null; duration: string | null }
interface Prescription {
  id: string;
  diagnosis: string | null; advice: string | null; referredSpecialist: boolean;
  followUpDate: string | null; followUpTime: string | null; comeAfterDays: number | null;
  sentAt: string | null; medicines: Medicine[];
}

const COME_AFTER_LABELS: Record<number, { mm: string; en: string }> = {
  1:  { mm: '၁ ရက်', en: '1 Day' },
  3:  { mm: '၃ ရက်', en: '3 Days' },
  7:  { mm: '၁ ပတ်', en: '1 Week' },
  14: { mm: '၂ ပတ်', en: '2 Weeks' },
  30: { mm: '၁ လ',  en: '1 Month' },
};

/** Read-only view of doctor-sent prescriptions, opened from the patient's appointment list. Shows every round if more than one was sent. */
export default function PrescriptionViewerModal({ appointmentId, mm, onClose }: {
  appointmentId: string; mm: boolean; onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<Prescription[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/patient/appointments/${appointmentId}/prescriptions`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (!active) return;
        const prescriptions: Prescription[] = data.prescriptions ?? [];
        setList(prescriptions);
        if (prescriptions.length === 1) setActiveId(prescriptions[0].id);
        setLoading(false);
      })
      .catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [appointmentId]);

  const rx = list.find(p => p.id === activeId) ?? null;
  const comeAfterLabel = rx?.comeAfterDays ? COME_AFTER_LABELS[rx.comeAfterDays] : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] flex flex-col overflow-hidden">

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            {rx && list.length > 1 && (
              <button onClick={() => setActiveId(null)} className="w-8 h-8 -ml-2 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100">
                <ChevronLeft className="w-4.5 h-4.5" />
              </button>
            )}
            <h2 className="text-lg font-bold text-gray-800">{mm ? 'ဆေးညွှန်း' : 'Prescription'}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <FileWarning className="w-8 h-8 text-gray-200" />
              <p className="text-sm text-gray-400">{mm ? 'ဆေးညွှန်း မတွေ့ပါ' : 'Prescription not found.'}</p>
            </div>
          ) : !rx ? (
            <div className="flex flex-col gap-2.5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{mm ? 'ဆေးညွှန်းများ' : 'Prescriptions'}</p>
              {list.map((p, i) => (
                <button key={p.id} onClick={() => setActiveId(p.id)}
                  className="flex items-center justify-between rounded-xl border border-gray-100 p-4 text-left hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{mm ? `ဆေးညွှန်း အကြိမ် ${list.length - i}` : `Round ${list.length - i}`}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{p.diagnosis || '—'}</p>
                  </div>
                  <p className="text-[11px] text-gray-300 shrink-0 ml-3">{p.sentAt && new Date(p.sentAt).toLocaleDateString()}</p>
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">{mm ? 'ရောဂါအမည်' : 'Diagnosis'}</p>
                {rx.diagnosis
                  ? <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: toHtml(rx.diagnosis) }} />
                  : <p className="text-sm text-gray-700">—</p>}
              </div>

              {rx.medicines.length > 0 && (
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-4 pt-4 pb-1.5">{mm ? 'ညွှန်းထားသော ဆေးဝါးများ' : 'Prescribed Medicines'}</p>
                  <table className="w-full text-xs mt-1">
                    <thead>
                      <tr className="bg-gray-50 text-gray-400">
                        <th className="text-left px-4 py-2 font-semibold">#</th>
                        <th className="text-left px-2 py-2 font-semibold">{mm ? 'ဆေး' : 'Medicine'}</th>
                        <th className="text-left px-2 py-2 font-semibold">{mm ? 'ပမာဏ' : 'Dosage'}</th>
                        <th className="text-left px-2 py-2 font-semibold">{mm ? 'အကြိမ်' : 'Freq'}</th>
                        <th className="text-left px-2 py-2 font-semibold">{mm ? 'ကြာချိန်' : 'Duration'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {rx.medicines.map((m, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                          <td className="px-2 py-2 font-semibold text-gray-700">{m.name}</td>
                          <td className="px-2 py-2 text-gray-500">{m.dosage || '—'}</td>
                          <td className="px-2 py-2 text-gray-500">{m.frequency || '—'}</td>
                          <td className="px-2 py-2 text-gray-500">{m.duration || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {rx.advice && (
                <div className="rounded-xl border border-gray-100 p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">{mm ? 'အကြံပြုချက်' : 'Advice'}</p>
                  <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: toHtml(rx.advice) }} />
                </div>
              )}

              {(rx.followUpDate || rx.referredSpecialist || comeAfterLabel) && (
                <div className="rounded-xl border border-gray-100 p-4 flex flex-col gap-1.5 text-sm text-gray-600">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">{mm ? 'နောက်လာရန်' : 'Follow-up'}</p>
                  {rx.followUpDate && <p>{new Date(rx.followUpDate).toLocaleDateString()} {rx.followUpTime}</p>}
                  {rx.referredSpecialist && <p>{mm ? 'ကျွမ်းကျင်သူထံ ညွှန်းပို့ထားသည်' : 'Referred to specialist'}</p>}
                  {comeAfterLabel && <p>{mm ? 'ပြန်လာရန်' : 'Come after'}: {mm ? comeAfterLabel.mm : comeAfterLabel.en}</p>}
                </div>
              )}

              {rx.sentAt && (
                <p className="text-[11px] text-gray-300 text-center pt-1">
                  {mm ? 'ပို့ချိန်' : 'Sent'} · {new Date(rx.sentAt).toLocaleString()}
                </p>
              )}
            </>
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-100 shrink-0">
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: PRIMARY }}>
            {mm ? 'ပိတ်မည်' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
