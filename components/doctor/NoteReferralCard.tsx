'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { marked } from 'marked';
import TurndownService from 'turndown';
import {
  NotebookPen, Share2, Search, X, Building2, Save, Loader2,
} from 'lucide-react';
import { PRIMARY, t, type Appointment } from '@/app/admin/appointments/shared';
import ReferralQRCard from '@/components/doctor/ReferralQRCard';
import 'react-quill-new/dist/quill.snow.css';

const QuillEditor = dynamic(() => import('react-quill-new'), { ssr: false });
const turndown = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-' });

interface DoctorHit { id: string; name: string; nameEn: string | null; specialty: string; specialtyEn: string | null; imageUrl: string | null }
interface ClinicHit { id: string; name: string; nameEn: string | null; type: string; imageUrl: string | null }

const DEFAULT_LIST_SIZE = 5;

/** Generic debounced search-and-pick control, shared by the doctor and clinic referral pickers.
 * Shows a lazily-loaded default list (fetched once, on first focus) before the user types anything. */
function ReferralPicker<T extends { id: string; name: string; nameEn: string | null; imageUrl: string | null }>({
  selected, onSelect, onClear, search, placeholder, renderSub, mm,
}: {
  selected: T | null | undefined;
  onSelect: (item: T) => void;
  onClear: () => void;
  search: (q: string, limit?: number) => Promise<T[]>;
  placeholder: string;
  renderSub: (item: T) => string;
  mm: boolean;
}) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<T[]>([]);
  const [defaultResults, setDefaultResults] = useState<T[]>([]);
  const [defaultLoaded, setDefaultLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setSearchResults([]); return; }
    setSearching(true);
    const timer = setTimeout(() => {
      search(query).then(r => { setSearchResults(r); setSearching(false); }).catch(() => setSearching(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  // Lazy-load a short default list the first time the picker is opened, so there's something
  // to pick from before the user types a single character.
  useEffect(() => {
    if (!open || defaultLoaded) return;
    setDefaultLoaded(true);
    setSearching(true);
    search('', DEFAULT_LIST_SIZE).then(r => { setDefaultResults(r); setSearching(false); }).catch(() => setSearching(false));
  }, [open, defaultLoaded, search]);

  const results = query.trim() ? searchResults : defaultResults;

  if (selected) {
    return (
      <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border" style={{ borderColor: `${PRIMARY}30`, backgroundColor: `${PRIMARY}08` }}>
        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-white border border-gray-100 flex items-center justify-center">
          {selected.imageUrl ? <img src={selected.imageUrl} alt="" className="w-full h-full object-cover" /> : <Building2 className="w-3.5 h-3.5 text-gray-300" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-800 truncate">{mm ? selected.name : (selected.nameEn ?? selected.name)}</p>
          <p className="text-xs text-gray-500 truncate">{renderSub(selected)}</p>
        </div>
        <button onClick={onClear} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-white hover:text-gray-600 shrink-0 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border bg-white transition-colors"
        style={{ borderColor: open ? PRIMARY : '#e5e7eb' }}>
        <Search className="w-3.5 h-3.5 text-gray-300 shrink-0" />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="flex-1 min-w-0 text-sm text-gray-800 outline-none placeholder:text-gray-400"
        />
        {searching && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-300 shrink-0" />}
      </div>
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-20 bg-white rounded-xl border border-gray-100 shadow-lg overflow-y-auto max-h-64 py-1">
          {results.map(r => (
            <button key={r.id} onMouseDown={() => { onSelect(r); setQuery(''); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-gray-50 transition-colors">
              <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 bg-gray-50 border border-gray-100 flex items-center justify-center">
                {r.imageUrl ? <img src={r.imageUrl} alt="" className="w-full h-full object-cover" /> : <Building2 className="w-3 h-3 text-gray-300" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{mm ? r.name : (r.nameEn ?? r.name)}</p>
                <p className="text-[11px] text-gray-400 truncate">{renderSub(r)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Doctor-written clinical note (Markdown, via Quill) + referral-to-doctor / referral-to-partner-clinic for this appointment. */
export default function NoteReferralCard({ appt, mm, onSaved }: {
  appt: Appointment; mm: boolean;
  onSaved: (patch: Partial<Appointment>) => void;
}) {
  const [html, setHtml] = useState(() => (appt.doctorNote ? String(marked.parse(appt.doctorNote, { async: false })) : ''));
  const [referredDoctor, setReferredDoctor] = useState<DoctorHit | null>(appt.referredDoctor ?? null);
  const [referredClinic, setReferredClinic] = useState<ClinicHit | null>(appt.referredClinic ?? null);
  const [ownDoctorId, setOwnDoctorId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(appt.clinicReferral?.code ?? null);
  const [referralVerifiedAt, setReferralVerifiedAt] = useState<string | null>(appt.clinicReferral?.verifiedAt ?? null);

  useEffect(() => {
    fetch('/api/doctor/me').then(r => r.json()).then(d => setOwnDoctorId(d.doctor?.id ?? null)).catch(() => {});
  }, []);

  const searchDoctors = async (q: string, limit = 8): Promise<DoctorHit[]> => {
    const res = await fetch(`/api/doctors?search=${encodeURIComponent(q)}&limit=${limit}`);
    const data = await res.json();
    return (data.doctors ?? []).filter((d: DoctorHit) => d.id !== ownDoctorId);
  };
  const searchClinics = async (q: string, limit = 8): Promise<ClinicHit[]> => {
    const res = await fetch(`/api/clinics?search=${encodeURIComponent(q)}&limit=${limit}`);
    const data = await res.json();
    return data.clinics ?? [];
  };

  async function save() {
    setSaving(true);
    const plain = html.replace(/<[^>]+>/g, '').trim();
    const markdown = plain ? turndown.turndown(html) : null;
    const body = {
      doctorNote: markdown,
      referredDoctorId: referredDoctor?.id ?? null,
      referredClinicId: referredClinic?.id ?? null,
    };
    const res = await fetch(`/api/doctor/appointments/${appt.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (body.referredClinicId) {
        if (data?.referralCode !== referralCode) setReferralVerifiedAt(null);
        setReferralCode(data?.referralCode ?? null);
      } else {
        setReferralCode(null);
        setReferralVerifiedAt(null);
      }
      onSaved({ doctorNote: body.doctorNote, referredDoctorId: body.referredDoctorId, referredClinicId: body.referredClinicId, referredDoctor, referredClinic });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-50 rounded-t-2xl">
        <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${PRIMARY}14` }}>
          <NotebookPen className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
        </span>
        <p className="text-sm font-bold text-gray-800">{t(mm, { mm: 'ဆေးမှတ်တမ်း နှင့် ညွှန်းပို့ခြင်း', en: 'Clinical Note & Referral' })}</p>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Note */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t(mm, { mm: 'ဆေးမှတ်တမ်း', en: 'Clinical Note' })}</p>
          <div className="quill-note border border-gray-200 bg-white">
            <QuillEditor
              theme="snow"
              value={html}
              onChange={setHtml}
              placeholder={t(mm, { mm: 'လက္ခဏာများ၊ ဆေးညွှန်းစသည် ရေးပါ...', en: 'Write findings, prescription, etc...' })}
              modules={{ toolbar: [['bold', 'italic', 'underline'], [{ header: [2, 3, false] }], [{ list: 'ordered' }, { list: 'bullet' }], ['link', 'blockquote'], ['clean']] }}
            />
          </div>
        </div>

        {/* Referrals */}
        <div className="grid sm:grid-cols-2 gap-3 pt-3.5 border-t border-gray-50">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Share2 className="w-3 h-3" /> {t(mm, { mm: 'ဆရာဝန်ထံ ညွှန်းပို့ရန်', en: 'Refer to Doctor' })}
            </p>
            <ReferralPicker<DoctorHit>
              selected={referredDoctor}
              onSelect={setReferredDoctor}
              onClear={() => setReferredDoctor(null)}
              search={searchDoctors}
              placeholder={t(mm, { mm: 'ဆရာဝန် ရှာပါ...', en: 'Search doctors...' })}
              renderSub={d => mm ? d.specialty : (d.specialtyEn ?? d.specialty)}
              mm={mm}
            />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Building2 className="w-3 h-3" /> {t(mm, { mm: 'ပါတနာ ဆေးခန်းထံ ညွှန်းပို့ရန်', en: 'Refer to Partner Clinic' })}
            </p>
            <ReferralPicker<ClinicHit>
              selected={referredClinic}
              onSelect={setReferredClinic}
              onClear={() => setReferredClinic(null)}
              search={searchClinics}
              placeholder={t(mm, { mm: 'ဆေးခန်း ရှာပါ...', en: 'Search clinics...' })}
              renderSub={c => c.type}
              mm={mm}
            />
          </div>
        </div>

        {referredClinic && referralCode && (
          <ReferralQRCard code={referralCode} verifiedAt={referralVerifiedAt} mm={mm} />
        )}

        <div className="flex items-center gap-3 pt-1">
          <button onClick={save} disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 transition-opacity hover:opacity-90"
            style={{ backgroundColor: PRIMARY }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {t(mm, { mm: 'သိမ်းမည်', en: 'Save' })}
          </button>
          {saved && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {t(mm, { mm: 'သိမ်းပြီးပါပြီ', en: 'Saved' })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
