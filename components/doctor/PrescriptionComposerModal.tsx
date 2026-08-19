'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { marked } from 'marked';
import TurndownService from 'turndown';
import {
  X, Activity, Briefcase, Lightbulb, CalendarDays, ChevronLeft, ChevronRight,
  FlaskConical, Trash2, Plus, Save, Eye, ArrowLeft, Loader2, Send, Phone, History, FileText,
} from 'lucide-react';
import { PRIMARY, type Appointment } from '@/app/admin/appointments/shared';
import 'react-quill-new/dist/quill.snow.css';

const QuillEditor = dynamic(() => import('react-quill-new'), { ssr: false });
const turndown = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-' });
const toHtml = (md: string) => (md ? String(marked.parse(md, { async: false })) : '');
const toMarkdown = (html: string) => (html.replace(/<[^>]+>/g, '').trim() ? turndown.turndown(html) : '');
const QUILL_MODULES = { toolbar: [['bold', 'italic', 'underline'], [{ header: [2, 3, false] }], [{ list: 'ordered' }, { list: 'bullet' }], ['link', 'blockquote'], ['clean']] };

interface Medicine { name: string; dosage: string; frequency: string; duration: string }
interface PrescriptionData {
  diagnosis: string; advice: string; referredSpecialist: boolean;
  followUpDate: string | null; followUpTime: string; comeAfterDays: number | null;
  medicines: Medicine[]; status?: 'DRAFT' | 'SENT';
}
interface PrescriptionListItem {
  id: string; status: 'DRAFT' | 'SENT'; diagnosis: string | null; createdAt: string; sentAt: string | null;
}

const EMPTY: PrescriptionData = {
  diagnosis: '', advice: '', referredSpecialist: false,
  followUpDate: null, followUpTime: '', comeAfterDays: null, medicines: [],
};
const EMPTY_MED: Medicine = { name: '', dosage: '', frequency: '', duration: '' };
const FREQ_OPTIONS = ['-', 'OD', 'BD', 'TDS', 'QID', 'HS', 'SOS', 'PRN'];
const COME_AFTER_OPTIONS = [
  { days: 1,  label: { mm: '၁ ရက်', en: '1 Day' } },
  { days: 3,  label: { mm: '၃ ရက်', en: '3 Days' } },
  { days: 7,  label: { mm: '၁ ပတ်', en: '1 Week' } },
  { days: 14, label: { mm: '၂ ပတ်', en: '2 Weeks' } },
  { days: 30, label: { mm: '၁ လ',  en: '1 Month' } },
];

type Tab = 'diagnosis' | 'medicine' | 'advice' | 'followup';
type View = 'history' | 'edit' | 'preview';

/* ── minimal month-grid date picker ── */
function MonthCalendar({ value, onChange }: { value: string | null; onChange: (iso: string) => void }) {
  const selected = value ? new Date(value + 'T00:00:00') : null;
  const [viewDate, setViewDate] = useState(() => selected ?? new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const isSelected = (d: number) => selected && selected.getFullYear() === year && selected.getMonth() === month && selected.getDate() === d;
  const isToday = (d: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

  const pick = (d: number) => {
    const iso = new Date(year, month, d).toISOString().slice(0, 10);
    onChange(iso);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-50">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <p className="text-sm font-bold text-gray-700">{viewDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
        <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-50">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-2 text-center">
        {cells.map((d, i) => d === null ? <div key={i} /> : (
          <button key={i} type="button" onClick={() => pick(d)}
            className="w-9 h-9 mx-auto rounded-full flex items-center justify-center text-sm font-semibold transition-colors"
            style={isSelected(d)
              ? { backgroundColor: PRIMARY, color: '#fff' }
              : isToday(d)
                ? { border: `1.5px solid ${PRIMARY}`, color: PRIMARY }
                : { color: '#374151' }}>
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}

function SectionShell({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border-2 p-4" style={{ borderColor: `${PRIMARY}40` }}>{children}</div>;
}

export default function PrescriptionComposerModal({ appt, mm, onClose, initialView = 'edit', onSent }: {
  appt: Appointment; mm: boolean; onClose: () => void; initialView?: View; onSent?: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('diagnosis');
  const [view, setView] = useState<View>('history');
  const [list, setList] = useState<PrescriptionListItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [data, setData] = useState<PrescriptionData>(EMPTY);
  const [diagnosisHtml, setDiagnosisHtml] = useState('');
  const [adviceHtml, setAdviceHtml] = useState('');
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  function applyPrescription(p: { diagnosis: string | null; advice: string | null; referredSpecialist: boolean;
    followUpDate: string | null; followUpTime: string | null; comeAfterDays: number | null;
    medicines: Medicine[]; status: 'DRAFT' | 'SENT'; id: string }) {
    setActiveId(p.id);
    setData({
      diagnosis: p.diagnosis ?? '', advice: p.advice ?? '', referredSpecialist: !!p.referredSpecialist,
      followUpDate: p.followUpDate ? String(p.followUpDate).slice(0, 10) : null,
      followUpTime: p.followUpTime ?? '', comeAfterDays: p.comeAfterDays ?? null,
      medicines: (p.medicines ?? []).map((m: Medicine) => ({ name: m.name, dosage: m.dosage ?? '', frequency: m.frequency ?? '', duration: m.duration ?? '' })),
      status: p.status,
    });
    setDiagnosisHtml(toHtml(p.diagnosis ?? ''));
    setAdviceHtml(toHtml(p.advice ?? ''));
  }

  const loadList = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/doctor/appointments/${appt.id}/prescriptions`, { cache: 'no-store' });
    const json = await res.json().catch(() => null);
    const prescriptions: (PrescriptionListItem & { medicines: Medicine[]; advice: string | null; referredSpecialist: boolean; followUpDate: string | null; followUpTime: string | null; comeAfterDays: number | null })[] = json?.prescriptions ?? [];
    setList(prescriptions);

    const draft = prescriptions.find(p => p.status === 'DRAFT');
    if (draft) {
      applyPrescription(draft);
      setView(initialView);
    } else if (initialView === 'edit') {
      const res2 = await fetch(`/api/doctor/appointments/${appt.id}/prescriptions`, { method: 'POST' });
      const json2 = await res2.json().catch(() => null);
      if (json2?.prescription) {
        applyPrescription(json2.prescription);
        setList(l => [json2.prescription, ...l]);
        setView('edit');
      }
    } else {
      setView('history');
    }
    setLoading(false);
  }, [appt.id, initialView]);

  useEffect(() => { loadList(); }, [loadList]);

  const locked = data.status === 'SENT';

  async function startNew() {
    setCreating(true);
    setError('');
    const res = await fetch(`/api/doctor/appointments/${appt.id}/prescriptions`, { method: 'POST' });
    const json = await res.json().catch(() => null);
    setCreating(false);
    if (!res.ok || !json?.prescription) {
      setError(mm ? 'အသစ် မစနိုင်ပါ' : 'Could not start new prescription');
      return;
    }
    applyPrescription(json.prescription);
    setList(l => l.some(p => p.id === json.prescription.id) ? l : [json.prescription, ...l]);
    setTab('diagnosis');
    setView('edit');
  }

  function openPast(p: PrescriptionListItem) {
    fetch(`/api/doctor/appointments/${appt.id}/prescriptions`, { cache: 'no-store' })
      .then(r => r.json())
      .then(json => {
        const full = (json?.prescriptions ?? []).find((x: { id: string }) => x.id === p.id);
        if (full) { applyPrescription(full); setView('preview'); }
      });
  }

  async function persist(): Promise<boolean> {
    if (!activeId) return false;
    setSaving(true);
    setError('');
    const res = await fetch(`/api/doctor/appointments/${appt.id}/prescriptions/${activeId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        diagnosis: data.diagnosis, advice: data.advice, referredSpecialist: data.referredSpecialist,
        followUpDate: data.followUpDate, followUpTime: data.followUpTime, comeAfterDays: data.comeAfterDays,
        medicines: data.medicines.filter(m => m.name.trim()),
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => null);
      setError(j?.error || (mm ? 'သိမ်း၍ မရပါ' : 'Failed to save'));
      return false;
    }
    return true;
  }

  async function saveAndClose() {
    if (!(await persist())) return;
    onClose();
  }

  async function goPreview() {
    if (!(await persist())) return;
    setView('preview');
  }

  async function submit() {
    if (!data.diagnosis.trim()) {
      setError(mm ? 'ရောဂါအမည် လိုအပ်ပါသည်' : 'Diagnosis is required');
      setView('edit'); setTab('diagnosis');
      return;
    }
    if (!activeId) return;
    setSending(true);
    setError('');
    const res = await fetch(`/api/doctor/appointments/${appt.id}/prescriptions/${activeId}/send`, { method: 'POST' });
    setSending(false);
    if (!res.ok) {
      const j = await res.json().catch(() => null);
      setError(j?.error || (mm ? 'ပို့၍ မရပါ' : 'Failed to send'));
      return;
    }
    setData(d => ({ ...d, status: 'SENT' }));
    setList(l => l.map(p => p.id === activeId ? { ...p, status: 'SENT', sentAt: new Date().toISOString() } : p));
    onSent?.();
    onClose();
  }

  const TABS: { key: Tab; label: { mm: string; en: string }; icon: React.ElementType }[] = [
    { key: 'diagnosis', label: { mm: 'ရောဂါ', en: 'Diagnosis' }, icon: Activity },
    { key: 'medicine',  label: { mm: 'ဆေးဝါး', en: 'Medicine' }, icon: Briefcase },
    { key: 'advice',    label: { mm: 'အကြံပြု', en: 'Advice' },  icon: Lightbulb },
    { key: 'followup',  label: { mm: 'ပြန်လာရန်', en: 'Follow-up' }, icon: CalendarDays },
  ];

  const doctorName = appt.doctor.nameEn ?? appt.doctor.name;
  const specialty = appt.doctor.specialtyEn ?? appt.doctor.specialty;
  const d = appt.intake;
  const comeAfterLabel = COME_AFTER_OPTIONS.find(o => o.days === data.comeAfterDays)?.label;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl h-[92vh] sm:h-[85vh] flex flex-col overflow-hidden">

        {view === 'history' ? (
          <>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-bold text-gray-800">{mm ? 'ဆေးညွှန်းများ' : 'Prescriptions'}</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3">
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>
              ) : list.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                  <FileText className="w-8 h-8 text-gray-200" />
                  <p className="text-sm text-gray-400">{mm ? 'ဆေးညွှန်း မရှိသေးပါ' : 'No prescriptions yet.'}</p>
                </div>
              ) : (
                list.map((p, i) => (
                  <button key={p.id} onClick={() => openPast(p)}
                    className="flex items-center justify-between rounded-xl border border-gray-100 p-4 text-left hover:bg-gray-50">
                    <div>
                      <p className="text-sm font-bold text-gray-800">{mm ? `အကြိမ် ${list.length - i}` : `Round ${list.length - i}`}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{p.diagnosis || (mm ? '(ရေးဆွဲဆဲ)' : '(draft)')}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full"
                        style={p.status === 'SENT' ? { backgroundColor: `${PRIMARY}15`, color: PRIMARY } : { backgroundColor: '#f3f4f6', color: '#9ca3af' }}>
                        {p.status === 'SENT' ? (mm ? 'ပို့ပြီး' : 'Sent') : (mm ? 'မပို့ရသေး' : 'Draft')}
                      </span>
                      <p className="text-[11px] text-gray-300">{new Date(p.sentAt ?? p.createdAt).toLocaleDateString()}</p>
                    </div>
                  </button>
                ))
              )}
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>

            <div className="px-5 py-4 border-t border-gray-100 shrink-0">
              <button onClick={startNew} disabled={creating}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #1a9990 100%)` }}>
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {mm ? 'ဆေးညွှန်း အသစ် ရေးမည်' : 'New Prescription'}
              </button>
            </div>
          </>
        ) : view === 'edit' ? (
          <>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-bold text-gray-800">{mm ? 'ဆေးညွှန်း ရေးရန်' : 'Prescription Composer'}</h2>
              <div className="flex items-center gap-1">
                {list.length > 0 && (
                  <button onClick={() => setView('history')} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100">
                    <History className="w-4.5 h-4.5" />
                  </button>
                )}
                <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            <div className="flex border-b border-gray-100 shrink-0">
              {TABS.map(tb => {
                const active = tab === tb.key;
                return (
                  <button key={tb.key} onClick={() => setTab(tb.key)}
                    className="flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-bold uppercase tracking-wide transition-colors"
                    style={{ color: active ? PRIMARY : '#9ca3af', borderBottom: active ? `2px solid ${PRIMARY}` : '2px solid transparent' }}>
                    <tb.icon className="w-4.5 h-4.5" />
                    <span className="truncate max-w-full px-1">{mm ? tb.label.mm : tb.label.en}</span>
                  </button>
                );
              })}
            </div>

            {locked && (
              <div className="px-5 py-2 text-xs font-semibold text-center" style={{ backgroundColor: `${PRIMARY}10`, color: PRIMARY }}>
                {mm ? 'ဤဆေးညွှန်းကို ပို့ပြီးဖြစ်၍ ပြင်၍ မရတော့ပါ' : 'This prescription has been sent and can no longer be edited.'}
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-5 py-5">
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>
              ) : tab === 'diagnosis' ? (
                <div className="flex flex-col gap-4">
                  {(appt.reason || appt.note) && (
                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-3.5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{mm ? 'လက်ရှိ ပြဿနာ' : 'Presenting Symptoms'}</p>
                      <p className="text-sm text-gray-700">{appt.reason || appt.note}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                      {mm ? 'ရောဂါအမည်' : 'Diagnosis'} <span className="text-red-400">*</span>
                    </label>
                    <div className="quill-note border border-gray-200 bg-white rounded-xl overflow-hidden">
                      <QuillEditor
                        theme="snow"
                        value={diagnosisHtml}
                        readOnly={locked}
                        onChange={html => { setDiagnosisHtml(html); setData(s => ({ ...s, diagnosis: toMarkdown(html) })); }}
                        placeholder={mm ? 'ရောဂါ အမည် ရေးပါ...' : 'e.g. Lumbar strain'}
                        modules={QUILL_MODULES}
                      />
                    </div>
                  </div>
                </div>
              ) : tab === 'medicine' ? (
                <div className="flex flex-col gap-4">
                  {data.medicines.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">{mm ? 'ဆေးဝါး မထည့်ရသေးပါ' : 'No medicines added yet.'}</p>
                  )}
                  {data.medicines.map((med, i) => (
                    <SectionShell key={i}>
                      <div className="flex items-center justify-between pb-3 mb-3 border-b" style={{ borderColor: `${PRIMARY}25` }}>
                        <p className="flex items-center gap-2 text-sm font-bold text-gray-800">
                          <FlaskConical className="w-4 h-4" style={{ color: PRIMARY }} /> {mm ? `ဆေး ${i + 1}` : `Medicine ${i + 1}`}
                        </p>
                        {!locked && (
                          <button onClick={() => setData(s => ({ ...s, medicines: s.medicines.filter((_, j) => j !== i) }))}
                            className="flex items-center gap-1 text-xs font-bold text-red-500">
                            <Trash2 className="w-3.5 h-3.5" /> {mm ? 'ဖျက်မည်' : 'Remove'}
                          </button>
                        )}
                      </div>
                      <div className="flex flex-col gap-3">
                        <div>
                          <label className="text-xs text-gray-400 mb-1.5 block">{mm ? 'အမည်' : 'Name'}</label>
                          <input value={med.name} disabled={locked}
                            onChange={e => setData(s => ({ ...s, medicines: s.medicines.map((m, j) => j === i ? { ...m, name: e.target.value } : m) }))}
                            placeholder={mm ? 'ဥပမာ Paracetamol' : 'e.g. Paracetamol'}
                            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#2ab5ad] disabled:bg-gray-50" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-400 mb-1.5 block">{mm ? 'ပမာဏ' : 'Dosage'}</label>
                            <input value={med.dosage} disabled={locked}
                              onChange={e => setData(s => ({ ...s, medicines: s.medicines.map((m, j) => j === i ? { ...m, dosage: e.target.value } : m) }))}
                              placeholder={mm ? 'ဥပမာ 500mg' : 'e.g. 500mg'}
                              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#2ab5ad] disabled:bg-gray-50" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 mb-1.5 block">{mm ? 'အကြိမ်ရေ' : 'Frequency'}</label>
                            <select value={med.frequency || '-'} disabled={locked}
                              onChange={e => setData(s => ({ ...s, medicines: s.medicines.map((m, j) => j === i ? { ...m, frequency: e.target.value } : m) }))}
                              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#2ab5ad] disabled:bg-gray-50">
                              {FREQ_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1.5 block">{mm ? 'ကြာချိန်' : 'Duration'}</label>
                          <input value={med.duration} disabled={locked}
                            onChange={e => setData(s => ({ ...s, medicines: s.medicines.map((m, j) => j === i ? { ...m, duration: e.target.value } : m) }))}
                            placeholder={mm ? 'ဥပမာ ၅ ရက်' : 'e.g. 5 days'}
                            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#2ab5ad] disabled:bg-gray-50" />
                        </div>
                      </div>
                    </SectionShell>
                  ))}
                  {!locked && (
                    <button onClick={() => setData(s => ({ ...s, medicines: [...s.medicines, { ...EMPTY_MED }] }))}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border-2"
                      style={{ borderColor: PRIMARY, color: PRIMARY }}>
                      <Plus className="w-4 h-4" /> {mm ? 'ဆေးထပ်ထည့်မည်' : 'Add Medicine'}
                    </button>
                  )}
                </div>
              ) : tab === 'advice' ? (
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">{mm ? 'လူနာအတွက် အကြံပြုချက်' : 'Advice for Patient'}</label>
                  <div className="quill-note border border-gray-200 bg-white rounded-xl overflow-hidden">
                    <QuillEditor
                      theme="snow"
                      value={adviceHtml}
                      readOnly={locked}
                      onChange={html => { setAdviceHtml(html); setData(s => ({ ...s, advice: toMarkdown(html) })); }}
                      placeholder={mm ? 'နားနေရန်၊ ရေများများသောက်ရန် စသည်...' : 'Rest, drink plenty of fluids, etc...'}
                      modules={QUILL_MODULES}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <SectionShell>
                    <MonthCalendar value={data.followUpDate} onChange={iso => !locked && setData(s => ({ ...s, followUpDate: iso }))} />
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-50">
                      <span className="text-sm text-gray-500">{mm ? 'အချိန်' : 'Time'}</span>
                      <input type="time" value={data.followUpTime} disabled={locked}
                        onChange={e => setData(s => ({ ...s, followUpTime: e.target.value }))}
                        className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-700 outline-none disabled:opacity-60" />
                    </div>
                  </SectionShell>

                  <SectionShell>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">{mm ? 'ကျွမ်းကျင်သူထံ ညွှန်းပို့ရန်လား?' : 'Referred to Specialist?'}</span>
                      <button type="button" disabled={locked}
                        onClick={() => setData(s => ({ ...s, referredSpecialist: !s.referredSpecialist }))}
                        className="w-11 h-6 rounded-full relative transition-colors shrink-0"
                        style={{ backgroundColor: data.referredSpecialist ? PRIMARY : '#d1d5db' }}>
                        <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ left: data.referredSpecialist ? '22px' : '2px' }} />
                      </button>
                    </div>
                  </SectionShell>

                  <SectionShell>
                    <label className="text-xs text-gray-400 mb-2 block">{mm ? 'ဘယ်တော့ ပြန်လာရန်' : 'Come After'}</label>
                    <select value={data.comeAfterDays ?? ''} disabled={locked}
                      onChange={e => setData(s => ({ ...s, comeAfterDays: e.target.value ? Number(e.target.value) : null }))}
                      className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-[#2ab5ad] disabled:bg-gray-50"
                      style={{ borderColor: `${PRIMARY}40` }}>
                      <option value="">—</option>
                      {COME_AFTER_OPTIONS.map(o => <option key={o.days} value={o.days}>{mm ? o.label.mm : o.label.en}</option>)}
                    </select>
                  </SectionShell>
                </div>
              )}
              {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
            </div>

            <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-gray-100 shrink-0">
              <button onClick={saveAndClose} disabled={saving || locked}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {mm ? 'သိမ်းပြီး ပိတ်မည်' : 'Save & Close'}
              </button>
              <button onClick={goPreview} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #1a9990 100%)` }}>
                <Eye className="w-4 h-4" /> {mm ? 'အစမ်းကြည့်မည်' : 'Preview'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-bold text-gray-800">{mm ? 'ဆေးညွှန်း အစမ်းကြည့်ခြင်း' : 'Prescription Preview'}</h2>
              <div className="flex items-center gap-1">
                {list.length > 0 && (
                  <button onClick={() => setView('history')} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100">
                    <History className="w-4.5 h-4.5" />
                  </button>
                )}
                <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3">
              {loading && (
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>
              )}
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="text-lg font-bold text-gray-800">{doctorName}</p>
                <p className="text-xs text-gray-400">{specialty}</p>
                <p className="text-[11px] text-gray-300 mt-1">{mm ? 'ချိန်းဆိုမှု ID' : 'Appointment Ref'}: #{appt.id.slice(-6).toUpperCase()}</p>
              </div>

              <div className="rounded-xl border border-gray-100 p-4 grid grid-cols-2 gap-2.5 text-sm">
                <p className="flex items-center gap-1.5 font-semibold text-gray-700">{appt.user.name}</p>
                <p className="flex items-center gap-1.5 text-gray-500"><Phone className="w-3.5 h-3.5" /> {appt.user.phone}</p>
                {d?.age && <p className="text-gray-500">{d.age} {mm ? 'နှစ်' : 'yrs'}</p>}
                {d?.gender && <p className="text-gray-500 capitalize">{d.gender}</p>}
              </div>

              {(appt.reason || appt.note) && (
                <div className="rounded-xl border border-gray-100 p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">{mm ? 'လက်ရှိ ပြဿနာ' : 'Presenting Symptoms'}</p>
                  <p className="text-sm text-gray-700">{appt.reason || appt.note}</p>
                </div>
              )}

              <div className="rounded-xl border border-gray-100 p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">{mm ? 'ရောဂါအမည်' : 'Diagnosis'}</p>
                {data.diagnosis
                  ? <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: toHtml(data.diagnosis) }} />
                  : <p className="text-sm text-gray-700">—</p>}
              </div>

              {data.medicines.length > 0 && (
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
                      {data.medicines.map((m, i) => (
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

              {data.advice && (
                <div className="rounded-xl border border-gray-100 p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">{mm ? 'အကြံပြုချက်' : 'Advice'}</p>
                  <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: toHtml(data.advice) }} />
                </div>
              )}

              {(data.followUpDate || data.referredSpecialist || data.comeAfterDays) && (
                <div className="rounded-xl border border-gray-100 p-4 flex flex-col gap-1.5 text-sm text-gray-600">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">{mm ? 'နောက်လာရန်' : 'Follow-up'}</p>
                  {data.followUpDate && <p>{new Date(data.followUpDate).toLocaleDateString()} {data.followUpTime}</p>}
                  {data.referredSpecialist && <p>{mm ? 'ကျွမ်းကျင်သူထံ ညွှန်းပို့ထားသည်' : 'Referred to specialist'}</p>}
                  {comeAfterLabel && <p>{mm ? 'ပြန်လာရန်' : 'Come after'}: {mm ? comeAfterLabel.mm : comeAfterLabel.en}</p>}
                </div>
              )}

              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>

            <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-gray-100 shrink-0">
              <button onClick={() => setView(locked ? 'history' : 'edit')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-gray-200 text-gray-600">
                <ArrowLeft className="w-4 h-4" /> {locked ? (mm ? 'နောက်သို့' : 'Back') : (mm ? 'ပြင်ရန် ပြန်သွားမည်' : 'Back to Edit')}
              </button>
              {locked ? (
                <span className="text-sm font-bold" style={{ color: PRIMARY }}>{mm ? 'ပို့ပြီးပါပြီ' : 'Sent'}</span>
              ) : (
                <button onClick={submit} disabled={sending}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                  style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #1a9990 100%)` }}>
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {mm ? 'ဆေးညွှန်း ပို့မည်' : 'Submit Prescription'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
