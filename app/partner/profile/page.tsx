'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageDropzone from '@/components/admin/ImageDropzone';

const PRIMARY = '#3b5bdb';
const inp = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3b5bdb]/40 focus:border-[#3b5bdb] transition-colors';
const lbl = 'block text-xs font-semibold text-gray-600 mb-1.5';

interface ClinicForm {
  name: string; nameEn: string;
  phone: string; phone2: string; phone3: string;
  website: string; facebookUrl: string; tiktokUrl: string; mapUrl: string;
  openTime: string; closeTime: string;
  address: string; addressEn: string; state: string; township: string;
  aboutMm: string; aboutEn: string;
  imageUrl: string; coverUrl: string;
}

const EMPTY: ClinicForm = {
  name: '', nameEn: '', phone: '', phone2: '', phone3: '',
  website: '', facebookUrl: '', tiktokUrl: '', mapUrl: '',
  openTime: '', closeTime: '', address: '', addressEn: '', state: '', township: '',
  aboutMm: '', aboutEn: '', imageUrl: '', coverUrl: '',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</p>
      {children}
    </div>
  );
}

export default function PartnerProfilePage() {
  const [form, setForm] = useState<ClinicForm>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/partner/clinic')
      .then(r => r.json())
      .then(d => {
        if (!d.clinic) return;
        const c = d.clinic;
        setForm({
          name: c.name ?? '', nameEn: c.nameEn ?? '',
          phone: c.phone ?? '', phone2: c.phone2 ?? '', phone3: c.phone3 ?? '',
          website: c.website ?? '', facebookUrl: c.facebookUrl ?? '', tiktokUrl: c.tiktokUrl ?? '', mapUrl: c.mapUrl ?? '',
          openTime: c.openTime ?? '', closeTime: c.closeTime ?? '',
          address: c.address ?? '', addressEn: c.addressEn ?? '', state: c.state ?? '', township: c.township ?? '',
          aboutMm: c.aboutMm ?? '', aboutEn: c.aboutEn ?? '',
          imageUrl: c.imageUrl ?? '', coverUrl: c.coverUrl ?? '',
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof ClinicForm>(key: K, value: ClinicForm[K]) => setForm(f => ({ ...f, [key]: value }));

  const save = async () => {
    if (!form.name.trim()) { toast.error('Clinic name လိုအပ်သည်'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/partner/clinic', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success('Clinic profile updated');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="p-6 flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: PRIMARY }} />
    </div>
  );

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-800">Clinic Profile</h1>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
          style={{ backgroundColor: PRIMARY }}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </button>
      </div>

      <Section title="Images">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ImageDropzone label="Logo / ဓာတ်ပုံ (1:1)" value={form.imageUrl} onChange={v => set('imageUrl', v)} aspect="square" />
          <ImageDropzone label="Cover Image (16:6)" value={form.coverUrl} onChange={v => set('coverUrl', v)} aspect="wide" />
        </div>
      </Section>

      <Section title="Basic Info">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={lbl}>Name (Myanmar)</label><input className={inp} value={form.name} onChange={e => set('name', e.target.value)} /></div>
          <div><label className={lbl}>Name (English)</label><input className={inp} value={form.nameEn} onChange={e => set('nameEn', e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={lbl}>Open Time</label><input className={inp} placeholder="09:00" value={form.openTime} onChange={e => set('openTime', e.target.value)} /></div>
          <div><label className={lbl}>Close Time</label><input className={inp} placeholder="18:00" value={form.closeTime} onChange={e => set('closeTime', e.target.value)} /></div>
        </div>
      </Section>

      <Section title="Contact">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className={lbl}>Phone</label><input className={inp} value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
          <div><label className={lbl}>Phone 2</label><input className={inp} value={form.phone2} onChange={e => set('phone2', e.target.value)} /></div>
          <div><label className={lbl}>Phone 3</label><input className={inp} value={form.phone3} onChange={e => set('phone3', e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={lbl}>Website</label><input className={inp} value={form.website} onChange={e => set('website', e.target.value)} /></div>
          <div><label className={lbl}>Facebook</label><input className={inp} value={form.facebookUrl} onChange={e => set('facebookUrl', e.target.value)} /></div>
          <div><label className={lbl}>TikTok</label><input className={inp} value={form.tiktokUrl} onChange={e => set('tiktokUrl', e.target.value)} /></div>
          <div><label className={lbl}>Map URL</label><input className={inp} value={form.mapUrl} onChange={e => set('mapUrl', e.target.value)} /></div>
        </div>
      </Section>

      <Section title="Address">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={lbl}>Address (Myanmar)</label><input className={inp} value={form.address} onChange={e => set('address', e.target.value)} /></div>
          <div><label className={lbl}>Address (English)</label><input className={inp} value={form.addressEn} onChange={e => set('addressEn', e.target.value)} /></div>
          <div><label className={lbl}>State/Region</label><input className={inp} value={form.state} onChange={e => set('state', e.target.value)} /></div>
          <div><label className={lbl}>Township</label><input className={inp} value={form.township} onChange={e => set('township', e.target.value)} /></div>
        </div>
      </Section>

      <Section title="About">
        <div><label className={lbl}>About (Myanmar)</label><textarea rows={3} className={inp} value={form.aboutMm} onChange={e => set('aboutMm', e.target.value)} /></div>
        <div><label className={lbl}>About (English)</label><textarea rows={3} className={inp} value={form.aboutEn} onChange={e => set('aboutEn', e.target.value)} /></div>
      </Section>
    </div>
  );
}
