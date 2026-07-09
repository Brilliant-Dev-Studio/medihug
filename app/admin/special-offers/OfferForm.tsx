'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ImageDropzone from '@/components/admin/ImageDropzone';

const PRIMARY = '#2ab5ad';

export interface Offer {
  id: string;
  imageUrl: string;
  badgeMm: string; badgeEn: string | null;
  titleMm: string; titleEn: string | null;
  descMm: string | null; descEn: string | null;
  ctaMm: string; ctaEn: string | null;
  ctaLink: string | null;
  ctaColor: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export const EMPTY_FORM = {
  imageUrl: '', badgeMm: '', badgeEn: '', titleMm: '', titleEn: '',
  descMm: '', descEn: '', ctaMm: '', ctaEn: '', ctaLink: '', ctaColor: '#0d2b6e',
  order: 0, isActive: true,
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

export default function OfferForm({ editing }: { editing: Offer | null }) {
  const router = useRouter();
  const [form, setForm] = useState(editing ? {
    imageUrl: editing.imageUrl, badgeMm: editing.badgeMm, badgeEn: editing.badgeEn ?? '',
    titleMm: editing.titleMm, titleEn: editing.titleEn ?? '',
    descMm: editing.descMm ?? '', descEn: editing.descEn ?? '',
    ctaMm: editing.ctaMm, ctaEn: editing.ctaEn ?? '', ctaLink: editing.ctaLink ?? '',
    ctaColor: editing.ctaColor, order: editing.order, isActive: editing.isActive,
  } : EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.imageUrl || !form.badgeMm || !form.titleMm || !form.ctaMm) {
      setError('Image URL, Badge (MM), Title (MM), CTA (MM) are required.'); return;
    }
    setError(''); setLoading(true);
    try {
      const url    = editing ? `/api/admin/special-offers/${editing.id}` : '/api/admin/special-offers';
      const method = editing ? 'PATCH' : 'POST';
      const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Error'); setLoading(false); return; }
      router.push('/admin/special-offers');
    } catch { setError('Server error'); setLoading(false); }
  };

  return (
    <div className="p-6 flex flex-col gap-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><ArrowLeft size={18} /></button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{editing ? 'Edit Offer' : 'Create Offer'}</h1>
            <p className="text-xs text-gray-400">Banner shown on the patient dashboard</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.back()} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60 hover:opacity-90"
            style={{ backgroundColor: PRIMARY }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Saving...' : editing ? 'Save Changes' : 'Create Offer'}
          </button>
        </div>
      </div>

      {error && <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>}

      <Section title="Image">
        <ImageDropzone label="Banner Image *" value={form.imageUrl} onChange={v => set('imageUrl', v)} aspect="wide" />
      </Section>

      <Section title="Badge & Title">
        <div className="grid grid-cols-2 gap-3">
          <div><label className={lbl}>Badge (Myanmar) *</label>
            <input className={inp} value={form.badgeMm} onChange={e => set('badgeMm', e.target.value)} placeholder="အထူးလျှော့စျေး" /></div>
          <div><label className={lbl}>Badge (English)</label>
            <input className={inp} value={form.badgeEn} onChange={e => set('badgeEn', e.target.value)} placeholder="Special Discount" /></div>
        </div>

        <div><label className={lbl}>Title (Myanmar) *</label>
          <input className={inp} value={form.titleMm} onChange={e => set('titleMm', e.target.value)} placeholder="ပထမဆုံး Consultation ၅၀% လျှော့ပေးမည်" /></div>
        <div><label className={lbl}>Title (English)</label>
          <input className={inp} value={form.titleEn} onChange={e => set('titleEn', e.target.value)} placeholder="50% Off Your First Consultation" /></div>

        <div><label className={lbl}>Description (Myanmar)</label>
          <textarea rows={2} className={inp + ' resize-none'} value={form.descMm} onChange={e => set('descMm', e.target.value)} /></div>
        <div><label className={lbl}>Description (English)</label>
          <textarea rows={2} className={inp + ' resize-none'} value={form.descEn} onChange={e => set('descEn', e.target.value)} /></div>
      </Section>

      <Section title="Call To Action">
        <div className="grid grid-cols-2 gap-3">
          <div><label className={lbl}>CTA Text (Myanmar) *</label>
            <input className={inp} value={form.ctaMm} onChange={e => set('ctaMm', e.target.value)} placeholder="ယခုပင် ချိန်းဆိုရန်" /></div>
          <div><label className={lbl}>CTA Text (English)</label>
            <input className={inp} value={form.ctaEn} onChange={e => set('ctaEn', e.target.value)} placeholder="Book Now" /></div>
        </div>

        <div><label className={lbl}>CTA Link</label>
          <input className={inp} value={form.ctaLink} onChange={e => set('ctaLink', e.target.value)} placeholder="/patient/doctors" /></div>

        <div className="grid grid-cols-2 gap-3 items-end">
          <div><label className={lbl}>CTA Text Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.ctaColor} onChange={e => set('ctaColor', e.target.value)}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer shrink-0" />
              <input className={inp} value={form.ctaColor} onChange={e => set('ctaColor', e.target.value)} />
            </div>
          </div>
          <div><label className={lbl}>Order</label>
            <input type="number" className={inp} value={form.order} onChange={e => set('order', parseInt(e.target.value) || 0)} /></div>
        </div>
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
          {loading ? 'Saving...' : editing ? 'Save Changes' : 'Create Offer'}
        </button>
      </div>
    </div>
  );
}
