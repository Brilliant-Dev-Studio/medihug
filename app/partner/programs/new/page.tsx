'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Loader2, Stethoscope } from 'lucide-react';
import ImageDropzone from '@/components/admin/ImageDropzone';
import MarkdownEditor from '@/components/admin/MarkdownEditor';

const PRIMARY = '#3b5bdb';
const inp = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-400 transition-colors';
const lbl = 'text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block';

interface DoctorOption { id: string; name: string; nameEn: string | null; specialty: string; imageUrl: string | null; }
interface CategoryOption { id: string; name: string; nameEn: string | null; }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
      <h2 className="font-semibold text-gray-700 text-sm">{title}</h2>
      {children}
    </div>
  );
}

export default function PartnerNewProgramPage() {
  const router = useRouter();
  const [form, setForm] = useState({ imageUrl: '', titleMm: '', titleEn: '', descMm: '', descEn: '', price: 0, categoryId: '', doctorIds: [] as string[] });
  const [doctorOptions, setDoctorOptions] = useState<DoctorOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetch('/api/partner/doctors').then(r => r.json()).then(d => setDoctorOptions(d.doctors ?? [])).catch(() => {});
    fetch('/api/program-categories').then(r => r.json()).then(d => setCategoryOptions(d.categories ?? [])).catch(() => {});
  }, []);

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  const toggleDoctor = (id: string) => setForm(f => ({
    ...f, doctorIds: f.doctorIds.includes(id) ? f.doctorIds.filter(d => d !== id) : [...f.doctorIds, id],
  }));

  const handleSubmit = async () => {
    if (!form.imageUrl || !form.titleMm.trim()) { setError('Image and Title (MM) are required.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/partner/programs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Error'); setLoading(false); return; }
      router.push('/partner/programs');
    } catch { setError('Server error'); setLoading(false); }
  };

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-5 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><ArrowLeft size={18} /></button>
          <div>
            <h1 className="text-lg font-bold text-gray-800">New Healthcare Program</h1>
            <p className="text-xs text-gray-400">Listed under your clinic — patients can pay and enroll</p>
          </div>
        </div>
        <button onClick={handleSubmit} disabled={loading}
          className="hidden sm:flex px-5 py-2.5 rounded-xl text-white text-sm font-semibold items-center gap-2 disabled:opacity-60 hover:opacity-90"
          style={{ backgroundColor: PRIMARY }}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? 'Saving...' : 'Create Program'}
        </button>
      </div>

      {error && <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>}

      <Section title="Image">
        <ImageDropzone label="Program Image *" value={form.imageUrl} onChange={v => set('imageUrl', v)} aspect="wide" />
      </Section>

      <Section title="Title & Description">
        <div><label className={lbl}>Title (Myanmar) *</label>
          <input className={inp} value={form.titleMm} onChange={e => set('titleMm', e.target.value)} placeholder="အစီအစဉ် ခေါင်းစဉ်" /></div>
        <div><label className={lbl}>Title (English)</label>
          <input className={inp} value={form.titleEn} onChange={e => set('titleEn', e.target.value)} placeholder="Program title" /></div>
        <div><label className={lbl}>Description (Myanmar)</label>
          <MarkdownEditor value={form.descMm} onChange={v => set('descMm', v)} placeholder="အစီအစဉ်အကြောင်း..." /></div>
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
      </Section>

      <Section title="Assigned Doctors">
        <p className="text-xs text-gray-400 -mt-1">Only doctors already on your clinic can be attached.</p>
        {doctorOptions.length === 0 ? (
          <p className="text-xs text-gray-400">No doctors on your clinic yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {doctorOptions.map(d => {
              const checked = form.doctorIds.includes(d.id);
              return (
                <label key={d.id} className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" checked={checked} onChange={() => toggleDoctor(d.id)} className="accent-blue-500 shrink-0" />
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

      <div className="flex gap-3 pb-2 sm:hidden">
        <button onClick={() => router.back()} className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
        <button onClick={handleSubmit} disabled={loading}
          className="flex-1 py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-90"
          style={{ backgroundColor: PRIMARY }}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? 'Saving...' : 'Create Program'}
        </button>
      </div>
    </div>
  );
}
