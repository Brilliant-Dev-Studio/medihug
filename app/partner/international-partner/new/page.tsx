'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, X } from 'lucide-react';
import TimePicker from '@/components/admin/TimePicker';
import ImageDropzone from '@/components/admin/ImageDropzone';
import GalleryEditor, { type GalleryItem } from '@/components/admin/GalleryEditor';
import BranchEditor, { type BranchItem } from '@/components/admin/BranchEditor';

const PRIMARY = '#3b5bdb';
const ACCENT  = '#2ab5ad';

const inp = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3b5bdb]/40 focus:border-[#3b5bdb] transition-colors';
const lbl = 'block text-xs font-semibold text-gray-600 mb-1.5';

const EMPTY = {
  name: '', nameEn: '', type: '',
  country: '', countryEn: '',
  phone: '', phone2: '', phone3: '', website: '',
  facebookUrl: '', tiktokUrl: '', mapUrl: '',
  openTime: '', closeTime: '',
  address: '', addressEn: '',
  state: '', township: '',
  aboutMm: '', aboutEn: '',
  tagsMmRaw: '', tagsEnRaw: '',
  tagsMm: [] as string[], tagsEn: [] as string[],
  imageUrl: '', coverUrl: '',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
      <h2 className="font-semibold text-gray-700 text-sm">{title}</h2>
      {children}
    </div>
  );
}

interface PartnerType { id: string; name: string; nameEn: string | null; }

export default function NewSubClinicPage() {
  const router = useRouter();
  const [form, setForm]         = useState(EMPTY);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [gallery, setGallery]   = useState<GalleryItem[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [partnerTypes, setPartnerTypes] = useState<PartnerType[]>([]);

  useEffect(() => {
    fetch('/api/partner-types').then(r => r.json()).then(d => {
      const types: PartnerType[] = d.partnerTypes ?? [];
      setPartnerTypes(types);
      if (types.length > 0) setForm(f => f.type ? f : { ...f, type: types[0].name });
    });
  }, []);

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
    if (!form.name.trim()) { setError('Name is required.'); return; }
    if (!form.country.trim()) { setError('Country is required.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/partner/sub-clinics', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:      form.name,
          nameEn:    form.nameEn    || null,
          type:      form.type,
          country:   form.country   || null,
          countryEn: form.countryEn || null,
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
          gallery,
          branches,
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Error'); return; }
      router.push('/partner/international-partner');
    } finally { setLoading(false); }
  };

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Add International Partner</h1>
            <p className="text-xs text-gray-400">A new International Partner listing — managed with your same login, no separate password needed</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60 hover:opacity-90"
            style={{ backgroundColor: ACCENT }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Saving...' : 'Create International Partner'}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>
      )}

      {/* Type selector */}
      <Section title="Type">
        {partnerTypes.length === 0 ? (
          <p className="text-xs text-gray-400">Loading types...</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {partnerTypes.map(t => (
              <button key={t.id} type="button" onClick={() => set('type', t.name)}
                className={`flex-1 min-w-32 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${form.type === t.name ? 'border-[#3b5bdb] bg-blue-50 text-[#3b5bdb]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                {t.name}
              </button>
            ))}
          </div>
        )}
      </Section>

      <Section title="Basic Info">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Name (Myanmar) *</label>
            <input className={inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Clinic name in Myanmar" />
          </div>
          <div>
            <label className={lbl}>Name (English)</label>
            <input className={inp} value={form.nameEn} onChange={e => set('nameEn', e.target.value)} placeholder="Clinic name" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Country (Myanmar) *</label>
            <input className={inp} value={form.country} onChange={e => set('country', e.target.value)} placeholder="e.g. ထိုင်း" />
          </div>
          <div>
            <label className={lbl}>Country (English)</label>
            <input className={inp} value={form.countryEn} onChange={e => set('countryEn', e.target.value)} placeholder="e.g. Thailand" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={lbl}>Phone 1</label>
            <input className={inp} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+..." />
          </div>
          <div>
            <label className={lbl}>Phone 2</label>
            <input className={inp} value={form.phone2} onChange={e => set('phone2', e.target.value)} placeholder="+..." />
          </div>
          <div>
            <label className={lbl}>Phone 3</label>
            <input className={inp} value={form.phone3} onChange={e => set('phone3', e.target.value)} placeholder="+..." />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <input className={inp} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full address" />
        </div>
        <div>
          <label className={lbl}>Address (English)</label>
          <input className={inp} value={form.addressEn} onChange={e => set('addressEn', e.target.value)} placeholder="Address in English" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={lbl}>State / Region</label>
            <input className={inp} value={form.state} onChange={e => set('state', e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Township / City</label>
            <input className={inp} value={form.township} onChange={e => set('township', e.target.value)} />
          </div>
        </div>
      </Section>

      <Section title="Branches">
        <p className="text-xs text-gray-400 -mt-2">Add as many branch locations as this International Partner has (optional)</p>
        <BranchEditor items={branches} onChange={setBranches} />
      </Section>

      <Section title="About">
        <div>
          <label className={lbl}>About (Myanmar)</label>
          <textarea className={inp + ' resize-none'} rows={5} value={form.aboutMm}
            onChange={e => set('aboutMm', e.target.value)} placeholder="About this clinic in Myanmar..." />
        </div>
        <div>
          <label className={lbl}>About (English)</label>
          <textarea className={inp + ' resize-none'} rows={5} value={form.aboutEn}
            onChange={e => set('aboutEn', e.target.value)} placeholder="About this clinic..." />
        </div>
      </Section>

      <Section title="Images">
        <ImageDropzone label="Logo / ဓာတ်ပုံ (1:1)" value={form.imageUrl} onChange={v => set('imageUrl', v)} aspect="square" />
        <ImageDropzone label="Cover Image (16:6 — 1600×600)" value={form.coverUrl} onChange={v => set('coverUrl', v)} aspect="wide" />
      </Section>

      <Section title="Gallery">
        <p className="text-xs text-gray-400 -mt-2">Extra photos shown on the public profile (optional)</p>
        <GalleryEditor items={gallery} onChange={setGallery} />
      </Section>

      <Section title="Tags / Services">
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
                <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                  {t}<button type="button" onClick={() => removeTag('Mm', t)} className="hover:text-red-500"><X size={10} /></button>
                </span>
              ))}
            </div>
          )}
        </div>
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
                <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                  {t}<button type="button" onClick={() => removeTag('En', t)} className="hover:text-red-500"><X size={10} /></button>
                </span>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* Bottom save bar */}
      <div className="flex gap-3 pb-2">
        <button onClick={() => router.back()}
          className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={loading}
          className="flex-1 py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-90"
          style={{ backgroundColor: ACCENT }}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? 'Saving...' : 'Create International Partner'}
        </button>
      </div>
    </div>
  );
}
