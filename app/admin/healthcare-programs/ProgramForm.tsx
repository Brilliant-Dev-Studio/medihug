'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Loader2, Stethoscope, Search, X, Building2 } from 'lucide-react';
import ImageDropzone from '@/components/admin/ImageDropzone';
import MarkdownEditor from '@/components/admin/MarkdownEditor';

const PRIMARY = '#2ab5ad';

export interface Program {
  id: string;
  imageUrl: string;
  titleMm: string; titleEn: string | null;
  descMm: string | null; descEn: string | null;
  ctaLink: string | null;
  price: number;
  order: number;
  isActive: boolean;
  createdAt: string;
  categoryId?: string | null;
  clinicId?: string | null;
  clinic?: { id: string; name: string; nameEn: string | null } | null;
  doctors?: { doctorId: string }[];
}

interface DoctorOption { id: string; name: string; nameEn: string | null; specialty: string; imageUrl: string | null; }
interface CategoryOption { id: string; name: string; nameEn: string | null; }
interface ClinicOption { id: string; name: string; nameEn: string | null; }

export const EMPTY_FORM = {
  imageUrl: '', titleMm: '', titleEn: '',
  descMm: '', descEn: '', ctaLink: '',
  price: 0, order: 0, isActive: true,
  categoryId: '',
  clinicId: '',
  doctorIds: [] as string[],
};

const inp = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-teal-400 transition-colors';
const lbl = 'text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
      <h2 className="font-semibold text-gray-700 text-sm">{title}</h2>
      {children}
    </div>
  );
}

export default function ProgramForm({ editing }: { editing: Program | null }) {
  const router = useRouter();
  const [form, setForm] = useState(editing ? {
    imageUrl: editing.imageUrl, titleMm: editing.titleMm, titleEn: editing.titleEn ?? '',
    descMm: editing.descMm ?? '', descEn: editing.descEn ?? '', ctaLink: editing.ctaLink ?? '',
    price: editing.price, order: editing.order, isActive: editing.isActive,
    categoryId: editing.categoryId ?? '',
    clinicId: editing.clinicId ?? '',
    doctorIds: editing.doctors?.map(d => d.doctorId) ?? [],
  } : EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [doctorOptions, setDoctorOptions] = useState<DoctorOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [clinicQuery, setClinicQuery] = useState('');
  const [clinicHits, setClinicHits] = useState<ClinicOption[]>([]);
  const [clinicFocused, setClinicFocused] = useState(false);
  const [clinicName, setClinicName] = useState<string | null>(editing?.clinic ? (editing.clinic.nameEn ?? editing.clinic.name) : null);
  const clinicBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/admin/doctors?pageSize=500&isActive=true')
      .then(r => r.json())
      .then(d => setDoctorOptions(d.doctors ?? []))
      .catch(() => {});
    fetch('/api/program-categories')
      .then(r => r.json())
      .then(d => setCategoryOptions(d.categories ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!clinicFocused) return;
    const h = (e: MouseEvent) => { if (clinicBoxRef.current && !clinicBoxRef.current.contains(e.target as Node)) setClinicFocused(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [clinicFocused]);

  useEffect(() => {
    if (!clinicQuery.trim()) { setClinicHits([]); return; }
    const t = setTimeout(() => {
      fetch(`/api/admin/clinics?search=${encodeURIComponent(clinicQuery)}&pageSize=15`)
        .then(r => r.json())
        .then(d => setClinicHits(d.clinics ?? []));
    }, 250);
    return () => clearTimeout(t);
  }, [clinicQuery]);

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  const toggleDoctor = (id: string) => setForm(f => ({
    ...f,
    doctorIds: f.doctorIds.includes(id) ? f.doctorIds.filter(d => d !== id) : [...f.doctorIds, id],
  }));

  const handleSubmit = async () => {
    if (!form.imageUrl || !form.titleMm) {
      setError('Image and Title (MM) are required.'); return;
    }
    setError(''); setLoading(true);
    try {
      const url    = editing ? `/api/admin/healthcare-programs/${editing.id}` : '/api/admin/healthcare-programs';
      const method = editing ? 'PATCH' : 'POST';
      const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Error'); setLoading(false); return; }
      router.push('/admin/healthcare-programs');
    } catch { setError('Server error'); setLoading(false); }
  };

  return (
    <div className="p-6 flex flex-col gap-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><ArrowLeft size={18} /></button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{editing ? 'Edit Program' : 'Create Program'}</h1>
            <p className="text-xs text-gray-400">Shown on the landing page, between Doctors and Products</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.back()} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60 hover:opacity-90"
            style={{ backgroundColor: PRIMARY }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Saving...' : editing ? 'Save Changes' : 'Create Program'}
          </button>
        </div>
      </div>

      {error && <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>}

      <Section title="Image">
        <ImageDropzone label="Program Image *" value={form.imageUrl} onChange={v => set('imageUrl', v)} aspect="wide" />
      </Section>

      <Section title="Title & Description">
        <div><label className={lbl}>Title (Myanmar) *</label>
          <input className={inp} value={form.titleMm} onChange={e => set('titleMm', e.target.value)} placeholder="ကိုယ်အလေးချိန် စီမံခန့်ခွဲမှု အစီအစဉ်" /></div>
        <div><label className={lbl}>Title (English)</label>
          <input className={inp} value={form.titleEn} onChange={e => set('titleEn', e.target.value)} placeholder="Weight Management Program" /></div>

        <div><label className={lbl}>Description (Myanmar)</label>
          <MarkdownEditor value={form.descMm} onChange={v => set('descMm', v)} placeholder="ကိုယ်အလေးချိန် စီမံခန့်ခွဲမှု အစီအစဉ်အကြောင်း..." /></div>
        <div><label className={lbl}>Description (English)</label>
          <MarkdownEditor value={form.descEn} onChange={v => set('descEn', v)} placeholder="About this program..." /></div>
      </Section>

      <Section title="Category">
        <div><label className={lbl}>Program Category</label>
          <select className={inp} value={form.categoryId} onChange={e => set('categoryId', e.target.value)}>
            <option value="">— Uncategorized —</option>
            {categoryOptions.map(c => (
              <option key={c.id} value={c.id}>{c.name}{c.nameEn ? ` (${c.nameEn})` : ''}</option>
            ))}
          </select>
        </div>
      </Section>

      <Section title="Price">
        <div><label className={lbl}>Price (MMK)</label>
          <input type="number" className={inp} value={form.price || ''} onChange={e => set('price', parseInt(e.target.value) || 0)} placeholder="0" /></div>
        <p className="text-xs text-gray-400">Set above 0 to make this a purchasable program — patients pay this amount, then fill a medical form for review.</p>
      </Section>

      <Section title="Assigned Doctors">
        <p className="text-xs text-gray-400 -mt-1">Doctors attached here get notified once an enrollment for this program is approved.</p>
        {doctorOptions.length === 0 ? (
          <p className="text-xs text-gray-400">No doctors found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {doctorOptions.map(d => {
              const checked = form.doctorIds.includes(d.id);
              return (
                <label key={d.id} className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" checked={checked} onChange={() => toggleDoctor(d.id)} className="accent-teal-500 shrink-0" />
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-gray-100 bg-gray-50 flex items-center justify-center">
                    {d.imageUrl ? (
                      <Image src={d.imageUrl} alt={d.name} width={32} height={32} className="object-cover w-full h-full" />
                    ) : (
                      <Stethoscope className="w-4 h-4 text-gray-300" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-700 truncate">{d.nameEn ?? d.name}</p>
                    <p className="text-xs text-gray-400 truncate">{d.specialty}</p>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </Section>

      <Section title="Assigned Partner">
        <p className="text-xs text-gray-400 -mt-1">Optional — link this program to the partner clinic that runs it. Leave blank for a platform-authored program.</p>
        {clinicName ? (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border" style={{ borderColor: '#2ab5ad30', backgroundColor: '#2ab5ad08' }}>
            <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-sm text-gray-700 flex-1">{clinicName}</span>
            <button type="button" onClick={() => { set('clinicId', ''); setClinicName(null); setClinicQuery(''); }} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="relative" ref={clinicBoxRef}>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50">
              <Search className="w-3.5 h-3.5 text-gray-300 shrink-0" />
              <input value={clinicQuery} onChange={e => setClinicQuery(e.target.value)} onFocus={() => setClinicFocused(true)}
                placeholder="Search partner clinic..." className="flex-1 min-w-0 bg-transparent text-sm text-gray-700 outline-none" />
            </div>
            {clinicFocused && clinicHits.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-20 bg-white rounded-xl border border-gray-100 shadow-lg overflow-y-auto max-h-56 py-1">
                {clinicHits.map(c => (
                  <button key={c.id} type="button" onMouseDown={() => { set('clinicId', c.id); setClinicName(c.nameEn ?? c.name); setClinicQuery(''); setClinicHits([]); setClinicFocused(false); }}
                    className="w-full flex items-center text-left px-3.5 py-2 hover:bg-gray-50 text-sm text-gray-700 truncate">
                    {c.nameEn ?? c.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </Section>

      <Section title="Link & Order">
        <div><label className={lbl}>Link (optional)</label>
          <input className={inp} value={form.ctaLink} onChange={e => set('ctaLink', e.target.value)} placeholder="/patient/doctors?specialty=..." /></div>
        <div><label className={lbl}>Order</label>
          <input type="number" className={inp} value={form.order} onChange={e => set('order', parseInt(e.target.value) || 0)} /></div>
      </Section>

      <Section title="Visibility">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <button type="button" onClick={() => set('isActive', !form.isActive)}
            className="w-10 h-6 rounded-full transition-all relative shrink-0"
            style={{ backgroundColor: form.isActive ? PRIMARY : '#d1d5db' }}>
            <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
              style={{ left: form.isActive ? '1.25rem' : '0.125rem' }} />
          </button>
          <span className="text-sm text-gray-600">Active (visible to patients)</span>
        </label>
      </Section>

      {/* Bottom bar */}
      <div className="flex gap-3 pb-2">
        <button onClick={() => router.back()} className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
        <button onClick={handleSubmit} disabled={loading}
          className="flex-1 py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-90"
          style={{ backgroundColor: PRIMARY }}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? 'Saving...' : editing ? 'Save Changes' : 'Create Program'}
        </button>
      </div>
    </div>
  );
}
