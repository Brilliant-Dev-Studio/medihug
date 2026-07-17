'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, X, Search, Stethoscope } from 'lucide-react';
import TimePicker from '@/components/admin/TimePicker';
import ImageDropzone from '@/components/admin/ImageDropzone';
import GalleryEditor, { type GalleryItem } from '@/components/admin/GalleryEditor';

const PRIMARY = '#2ab5ad';

const inp  = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ab5ad]/40 focus:border-[#2ab5ad] transition-colors';
const lbl  = 'block text-xs font-semibold text-gray-600 mb-1.5';

const EMPTY = {
  name: '', nameEn: '', type: '',
  phone: '', phone2: '', phone3: '', website: '',
  facebookUrl: '', tiktokUrl: '', mapUrl: '',
  openTime: '', closeTime: '',
  address: '', addressEn: '',
  state: '', township: '',
  aboutMm: '', aboutEn: '',
  tagsMmRaw: '', tagsEnRaw: '',
  tagsMm: [] as string[], tagsEn: [] as string[],
  imageUrl: '', coverUrl: '',
  verified: false, isPartner: true,
};

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button" onClick={() => onChange(!on)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${on ? 'bg-[#2ab5ad]' : 'bg-gray-300'}`}
      aria-label={label}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${on ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
      <h2 className="font-semibold text-gray-700 text-sm">{title}</h2>
      {children}
    </div>
  );
}

interface DoctorOption { id: string; name: string; nameEn: string | null; specialty: string; imageUrl: string | null; }
interface PartnerType { id: string; name: string; nameEn: string | null; }

export default function NewClinicPage() {
  const router = useRouter();
  const [form, setForm]         = useState(EMPTY);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [gallery, setGallery]   = useState<GalleryItem[]>([]);
  const [allDoctors, setAllDoctors]         = useState<DoctorOption[]>([]);
  const [selectedDoctors, setSelectedDoctors] = useState<DoctorOption[]>([]);
  const [doctorSearch, setDoctorSearch]     = useState('');
  const [dropdownOpen, setDropdownOpen]     = useState(false);
  const [partnerTypes, setPartnerTypes]     = useState<PartnerType[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/admin/doctors?pageSize=200').then(r => r.json()).then(d => setAllDoctors(d.doctors ?? []));
  }, []);

  useEffect(() => {
    fetch('/api/admin/partner-types').then(r => r.json()).then(d => {
      const types: PartnerType[] = d.partnerTypes ?? [];
      setPartnerTypes(types);
      if (types.length > 0) setForm(f => f.type ? f : { ...f, type: types[0].name });
    });
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredDoctors = allDoctors.filter(d =>
    !selectedDoctors.find(s => s.id === d.id) &&
    (d.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
     (d.nameEn ?? '').toLowerCase().includes(doctorSearch.toLowerCase()) ||
     d.specialty.toLowerCase().includes(doctorSearch.toLowerCase()))
  );

  const selectDoctor = (d: DoctorOption) => {
    setSelectedDoctors(prev => [...prev, d]);
    setDoctorSearch('');
    setDropdownOpen(false);
  };
  const removeDoctor = (id: string) => setSelectedDoctors(prev => prev.filter(d => d.id !== id));

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const addTag = (lang: 'Mm' | 'En') => {
    const raw  = lang === 'Mm' ? form.tagsMmRaw : form.tagsEnRaw;
    const list = lang === 'Mm' ? form.tagsMm    : form.tagsEn;
    const rawKey = lang === 'Mm' ? 'tagsMmRaw' : 'tagsEnRaw';
    const listKey = lang === 'Mm' ? 'tagsMm'   : 'tagsEn';
    const v = raw.trim();
    if (v && !list.includes(v)) set(listKey, [...list, v]);
    set(rawKey, '');
  };
  const removeTag = (lang: 'Mm' | 'En', t: string) => {
    const listKey = lang === 'Mm' ? 'tagsMm' : 'tagsEn';
    const list    = lang === 'Mm' ? form.tagsMm : form.tagsEn;
    set(listKey, list.filter(x => x !== t));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Partner name is required.'); return; }
    if (!form.type) { setError('Partner type is required.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/admin/clinics', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:      form.name,
          nameEn:    form.nameEn    || null,
          type:      form.type,
          phone:     form.phone     || null,
          phone2:    form.phone2    || null,
          phone3:    form.phone3    || null,
          website:   form.website   || null,
          facebookUrl: form.facebookUrl || null,
          tiktokUrl:   form.tiktokUrl   || null,
          mapUrl:      form.mapUrl      || null,
          openTime:  form.openTime  || null,
          closeTime: form.closeTime || null,
          address:   form.address   || null,
          addressEn: form.addressEn || null,
          state:     form.state     || null,
          township:  form.township  || null,
          aboutMm:   form.aboutMm   || null,
          aboutEn:   form.aboutEn   || null,
          tagsMm:    form.tagsMm,
          tagsEn:    form.tagsEn,
          imageUrl:  form.imageUrl  || null,
          coverUrl:  form.coverUrl  || null,
          verified:  form.verified,
          isPartner: form.isPartner,
          doctorIds: selectedDoctors.map(d => d.id),
          gallery,
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Error'); return; }
      const d = await res.json();
      router.push(`/admin/clinics/${d.clinic.id}`);
    } finally { setLoading(false); }
  };


  return (
    <div className="p-6 h-full flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Add New Partner</h1>
            <p className="text-xs text-gray-400">Fill in the fields and save</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60 hover:opacity-90"
            style={{ backgroundColor: PRIMARY }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Saving...' : 'Add Partner'}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>
      )}

      {/* Type selector — full width */}
      <Section title="Type">
        {partnerTypes.length === 0 ? (
          <p className="text-xs text-gray-400">
            No partner types yet — create one in <a href="/admin/partner-types" className="underline font-semibold" style={{ color: PRIMARY }}>Partner Types</a> first.
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {partnerTypes.map(t => (
              <button key={t.id} type="button" onClick={() => set('type', t.name)}
                className={`flex-1 min-w-32 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${form.type === t.name ? 'border-[#2ab5ad] bg-teal-50 text-[#2ab5ad]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                {t.name}
              </button>
            ))}
          </div>
        )}
      </Section>

      {/* 2-column main layout */}
      <div className="grid grid-cols-2 gap-5 flex-1">
        {/* LEFT column */}
        <div className="space-y-5">
          <Section title="Basic Info">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Name (Myanmar) *</label>
                <input className={inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Partner name in Myanmar" />
              </div>
              <div>
                <label className={lbl}>Name (English)</label>
                <input className={inp} value={form.nameEn} onChange={e => set('nameEn', e.target.value)} placeholder="Partner name" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={lbl}>Phone 1</label>
                <input className={inp} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="09..." />
              </div>
              <div>
                <label className={lbl}>Phone 2</label>
                <input className={inp} value={form.phone2} onChange={e => set('phone2', e.target.value)} placeholder="09..." />
              </div>
              <div>
                <label className={lbl}>Phone 3</label>
                <input className={inp} value={form.phone3} onChange={e => set('phone3', e.target.value)} placeholder="09..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <TimePicker label="Open Time"  value={form.openTime}  onChange={v => set('openTime', v)}  />
              <TimePicker label="Close Time" value={form.closeTime} onChange={v => set('closeTime', v)} />
            </div>
          </Section>

          <Section title="Links">
            <div>
              <label className={lbl}>Website</label>
              <input className={inp} value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <label className={lbl}>Facebook</label>
              <input className={inp} value={form.facebookUrl} onChange={e => set('facebookUrl', e.target.value)} placeholder="https://facebook.com/..." />
            </div>
            <div>
              <label className={lbl}>TikTok</label>
              <input className={inp} value={form.tiktokUrl} onChange={e => set('tiktokUrl', e.target.value)} placeholder="https://tiktok.com/@..." />
            </div>
            <div>
              <label className={lbl}>Google Map Link</label>
              <input className={inp} value={form.mapUrl} onChange={e => set('mapUrl', e.target.value)} placeholder="https://maps.google.com/..." />
            </div>
          </Section>

          <Section title="Location">
            <div>
              <label className={lbl}>Address (Myanmar)</label>
              <input className={inp} value={form.address} onChange={e => set('address', e.target.value)} placeholder="State / Township / Address" />
            </div>
            <div>
              <label className={lbl}>Address (English)</label>
              <input className={inp} value={form.addressEn} onChange={e => set('addressEn', e.target.value)} placeholder="Address in English" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>State / Region</label>
                <input className={inp} value={form.state} onChange={e => set('state', e.target.value)} />
              </div>
              <div>
                <label className={lbl}>Township</label>
                <input className={inp} value={form.township} onChange={e => set('township', e.target.value)} />
              </div>
            </div>
          </Section>

          <Section title="About">
            <div>
              <label className={lbl}>About (Myanmar)</label>
              <textarea className={inp + ' resize-none'} rows={5} value={form.aboutMm}
                onChange={e => set('aboutMm', e.target.value)} placeholder="About the clinic in Myanmar..." />
            </div>
            <div>
              <label className={lbl}>About (English)</label>
              <textarea className={inp + ' resize-none'} rows={5} value={form.aboutEn}
                onChange={e => set('aboutEn', e.target.value)} placeholder="About the clinic..." />
            </div>
          </Section>
        </div>

        {/* RIGHT column */}
        <div className="space-y-5">
          <Section title="Images">
            <ImageDropzone label="Logo / ဓာတ်ပုံ (1:1)" value={form.imageUrl} onChange={v => set('imageUrl', v)} aspect="square" />
            <ImageDropzone label="Cover Image (16:6 — 1600×600)" value={form.coverUrl} onChange={v => set('coverUrl', v)} aspect="wide" />
          </Section>

          <Section title="Gallery">
            <p className="text-xs text-gray-400 -mt-2">Extra photos shown on the clinic profile (optional)</p>
            <GalleryEditor items={gallery} onChange={setGallery} />
          </Section>

          <Section title="Tags / Services">
            {/* Tags Myanmar */}
            <div>
              <label className={lbl}>Tags (Myanmar)</label>
              <div className="flex gap-2">
                <input className={inp} value={form.tagsMmRaw}
                  onChange={e => set('tagsMmRaw', e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag('Mm'); } }}
                  placeholder="Type tag, press Enter" />
                <button type="button" onClick={() => addTag('Mm')}
                  className="px-4 py-2.5 rounded-xl text-white text-sm font-medium shrink-0"
                  style={{ backgroundColor: PRIMARY }}>+</button>
              </div>
              {form.tagsMm.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.tagsMm.map(t => (
                    <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-medium">
                      {t}<button type="button" onClick={() => removeTag('Mm', t)} className="hover:text-red-500"><X size={10} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            {/* Tags English */}
            <div>
              <label className={lbl}>Tags (English)</label>
              <div className="flex gap-2">
                <input className={inp} value={form.tagsEnRaw}
                  onChange={e => set('tagsEnRaw', e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag('En'); } }}
                  placeholder="Type tag, press Enter" />
                <button type="button" onClick={() => addTag('En')}
                  className="px-4 py-2.5 rounded-xl text-white text-sm font-medium shrink-0"
                  style={{ backgroundColor: PRIMARY }}>+</button>
              </div>
              {form.tagsEn.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.tagsEn.map(t => (
                    <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-medium">
                      {t}<button type="button" onClick={() => removeTag('En', t)} className="hover:text-red-500"><X size={10} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Section>

          <Section title="Settings">
            <div className="space-y-3">
              {[
                { key: 'verified',  label: 'Verified ✓', desc: 'Show verified badge' },
                { key: 'isPartner', label: 'Partner',     desc: 'Show as partner clinic' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                  <Toggle on={form[key as keyof typeof form] as boolean} onChange={v => set(key, v)} label={label} />
                </div>
              ))}
            </div>
          </Section>

          {/* Doctors */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h2 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
              <Stethoscope size={14} /> Doctors ({selectedDoctors.length})
            </h2>

            {/* Search dropdown */}
            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ab5ad]/40 focus:border-[#2ab5ad] transition-colors"
                  placeholder="Search doctors to add..."
                  value={doctorSearch}
                  onChange={e => { setDoctorSearch(e.target.value); setDropdownOpen(true); }}
                  onFocus={() => setDropdownOpen(true)}
                />
              </div>
              {dropdownOpen && filteredDoctors.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                  {filteredDoctors.map(d => (
                    <button key={d.id} type="button" onClick={() => selectDoctor(d)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left">
                      {d.imageUrl
                        ? <img src={d.imageUrl} alt={d.name} className="h-8 w-8 rounded-full object-cover shrink-0" />
                        : <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">{d.name[0]}</div>}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{d.name}</p>
                        <p className="text-xs text-gray-400 truncate">{d.specialty}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {dropdownOpen && doctorSearch && filteredDoctors.length === 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-xs text-gray-400">
                  No doctors found
                </div>
              )}
            </div>

            {/* Selected doctors */}
            {selectedDoctors.length > 0 && (
              <div className="space-y-1.5 max-h-52 overflow-y-auto">
                {selectedDoctors.map(d => (
                  <div key={d.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-teal-50 border border-teal-200">
                    {d.imageUrl
                      ? <img src={d.imageUrl} alt={d.name} className="h-8 w-8 rounded-full object-cover shrink-0" />
                      : <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-xs font-bold text-teal-600 shrink-0">{d.name[0]}</div>}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{d.name}</p>
                      <p className="text-xs text-gray-500 truncate">{d.specialty}</p>
                    </div>
                    <button type="button" onClick={() => removeDoctor(d.id)}
                      className="p-1 rounded-lg hover:bg-teal-100 text-teal-500 hover:text-red-500 shrink-0">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {selectedDoctors.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-3">No doctors added yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom save bar */}
      <div className="flex gap-3 pb-2">
        <button onClick={() => router.back()}
          className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={loading}
          className="flex-1 py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-90"
          style={{ backgroundColor: PRIMARY }}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? 'Saving...' : 'Add Partner'}
        </button>
      </div>
    </div>
  );
}
