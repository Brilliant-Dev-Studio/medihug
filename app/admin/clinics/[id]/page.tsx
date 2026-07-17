'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import TimePicker from '@/components/admin/TimePicker';
import {
  ArrowLeft, Loader2, X, ShieldCheck,
  Phone, Globe, Clock, MapPin, Star, CheckCircle2,
  Stethoscope, Package, Building2, Link2, Music2, Map,
} from 'lucide-react';
import ImageDropzone from '@/components/admin/ImageDropzone';

const PRIMARY = '#2ab5ad';

const inp = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ab5ad]/40 focus:border-[#2ab5ad] transition-colors';
const lbl = 'block text-xs font-semibold text-gray-600 mb-1.5';

interface Doctor  { id: string; name: string; nameEn: string | null; imageUrl: string | null; specialty: string; }
interface Product { id: string; name: string; nameEn: string | null; imageUrl: string | null; price: number; }
interface PartnerType { id: string; name: string; nameEn: string | null; }
interface Clinic {
  id: string; name: string; nameEn: string | null;
  type: string; address: string | null; addressEn: string | null;
  state: string | null; township: string | null;
  phone: string | null; phone2: string | null; phone3: string | null; website: string | null;
  facebookUrl: string | null; tiktokUrl: string | null; mapUrl: string | null;
  imageUrl: string | null; coverUrl: string | null;
  openTime: string | null; closeTime: string | null;
  aboutMm: string | null; aboutEn: string | null;
  tagsMm: string[]; tagsEn: string[];
  verified: boolean; rating: number; reviewCount: number;
  isActive: boolean; isPartner: boolean;
  doctors?:  { doctor: Doctor }[];
  products?: { product: Product }[];
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" onClick={() => onChange(!on)} aria-label={label}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${on ? 'bg-[#2ab5ad]' : 'bg-gray-300'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${on ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <h2 className="font-semibold text-gray-700 text-sm flex items-center gap-2">{icon}{title}</h2>
      {children}
    </div>
  );
}

export default function ClinicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [clinic, setClinic]     = useState<Clinic | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [allDoctors, setAllDoctors]   = useState<Doctor[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [partnerTypes, setPartnerTypes] = useState<PartnerType[]>([]);

  const [form, setForm] = useState({
    name: '', nameEn: '', type: '',
    phone: '', phone2: '', phone3: '', website: '',
    facebookUrl: '', tiktokUrl: '', mapUrl: '',
    openTime: '', closeTime: '',
    address: '', addressEn: '', state: '', township: '',
    aboutMm: '', aboutEn: '',
    tagsMmRaw: '', tagsEnRaw: '',
    tagsMm: [] as string[], tagsEn: [] as string[],
    imageUrl: '', coverUrl: '',
    verified: false, isPartner: true, isActive: true,
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/clinics/${id}`).then(r => r.json()),
      fetch('/api/admin/doctors?pageSize=200').then(r => r.json()),
      fetch('/api/admin/products?pageSize=200&isActive=true').then(r => r.json()),
      fetch('/api/admin/partner-types').then(r => r.json()),
    ]).then(([cd, dd, pd, ptd]) => {
      setPartnerTypes(ptd.partnerTypes ?? []);
      const c: Clinic = cd.clinic;
      setClinic(c);
      setForm({
        name: c.name, nameEn: c.nameEn ?? '', type: c.type,
        phone: c.phone ?? '', phone2: c.phone2 ?? '', phone3: c.phone3 ?? '', website: c.website ?? '',
        facebookUrl: c.facebookUrl ?? '', tiktokUrl: c.tiktokUrl ?? '', mapUrl: c.mapUrl ?? '',
        openTime: c.openTime ?? '', closeTime: c.closeTime ?? '',
        address: c.address ?? '', addressEn: c.addressEn ?? '',
        state: c.state ?? '', township: c.township ?? '',
        aboutMm: c.aboutMm ?? '', aboutEn: c.aboutEn ?? '',
        tagsMmRaw: '', tagsEnRaw: '',
        tagsMm: c.tagsMm ?? [], tagsEn: c.tagsEn ?? [],
        imageUrl: c.imageUrl ?? '', coverUrl: c.coverUrl ?? '',
        verified: c.verified, isPartner: c.isPartner, isActive: c.isActive,
      });
      setAllDoctors(dd.doctors ?? []);
      setAllProducts(pd.products ?? []);
      setLoading(false);
    });
  }, [id]);

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const addTag = (lang: 'Mm' | 'En') => {
    const raw     = lang === 'Mm' ? form.tagsMmRaw : form.tagsEnRaw;
    const list    = lang === 'Mm' ? form.tagsMm    : form.tagsEn;
    const rawKey  = lang === 'Mm' ? 'tagsMmRaw'   : 'tagsEnRaw';
    const listKey = lang === 'Mm' ? 'tagsMm'       : 'tagsEn';
    const v = raw.trim();
    if (v && !list.includes(v)) set(listKey, [...list, v]);
    set(rawKey, '');
  };
  const removeTag = (lang: 'Mm' | 'En', t: string) => {
    const listKey = lang === 'Mm' ? 'tagsMm' : 'tagsEn';
    const list    = lang === 'Mm' ? form.tagsMm : form.tagsEn;
    set(listKey, list.filter(x => x !== t));
  };

  const saveInfo = async () => {
    if (!form.name.trim()) { setError('Partner name လိုအပ်သည်။'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch(`/api/admin/clinics/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, nameEn: form.nameEn || null, type: form.type,
          phone: form.phone || null, phone2: form.phone2 || null, phone3: form.phone3 || null,
          website: form.website || null,
          facebookUrl: form.facebookUrl || null, tiktokUrl: form.tiktokUrl || null, mapUrl: form.mapUrl || null,
          openTime: form.openTime || null, closeTime: form.closeTime || null,
          address: form.address || null, addressEn: form.addressEn || null,
          state: form.state || null, township: form.township || null,
          aboutMm: form.aboutMm || null, aboutEn: form.aboutEn || null,
          tagsMm: form.tagsMm, tagsEn: form.tagsEn,
          imageUrl: form.imageUrl || null, coverUrl: form.coverUrl || null,
          verified: form.verified, isPartner: form.isPartner, isActive: form.isActive,
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Error'); return; }
      const d = await res.json();
      setClinic(d.clinic);
    } finally { setSaving(false); }
  };

  const toggleDoctor = async (doctorId: string) => {
    const current = (clinic?.doctors ?? []).map(d => d.doctor.id);
    const next    = current.includes(doctorId) ? current.filter(x => x !== doctorId) : [...current, doctorId];
    const res  = await fetch(`/api/admin/clinics/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctors: next }),
    });
    const d = await res.json();
    setClinic(d.clinic);
  };

  const toggleProduct = async (productId: string) => {
    const current = (clinic?.products ?? []).map(p => p.product.id);
    const next    = current.includes(productId) ? current.filter(x => x !== productId) : [...current, productId];
    const res  = await fetch(`/api/admin/clinics/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products: next }),
    });
    const d = await res.json();
    setClinic(d.clinic);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <Loader2 size={28} className="animate-spin text-[#2ab5ad]" />
    </div>
  );
  if (!clinic) return (
    <div className="flex items-center justify-center h-[60vh] text-gray-400">Partner မတွေ့ပါ</div>
  );

  const linkedDoctorIds  = (clinic.doctors  ?? []).map(d => d.doctor.id);
  const linkedProductIds = (clinic.products ?? []).map(p => p.product.id);


  return (
    <div className="p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => router.push('/admin/clinics')} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 flex-shrink-0">
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-800 truncate">{clinic.name}</h1>
              {clinic.verified && <ShieldCheck size={16} className="text-[#2ab5ad] flex-shrink-0" />}
              <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 bg-teal-50 text-teal-700">
                {clinic.type}
              </span>
            </div>
            {clinic.nameEn && <p className="text-xs text-gray-400">{clinic.nameEn}</p>}
          </div>
        </div>
        <button onClick={saveInfo} disabled={saving}
          className="flex-shrink-0 px-5 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60 hover:opacity-90"
          style={{ backgroundColor: PRIMARY }}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : null}
          {saving ? 'သိမ်းနေသည်...' : 'ပြောင်းလဲမှုများ သိမ်းဆည်း'}
        </button>
      </div>

      {/* Clinic hero */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-28 bg-gradient-to-br from-teal-50 to-teal-100 relative">
          {clinic.coverUrl
            ? <img src={clinic.coverUrl} alt="cover" className="w-full h-full object-cover" />
            : <div className="flex items-center justify-center h-full"><Building2 size={36} className="text-teal-300" /></div>}
          {clinic.imageUrl && (
            <img src={clinic.imageUrl} alt={clinic.name}
              className="absolute bottom-0 left-5 translate-y-1/2 h-14 w-14 rounded-2xl object-cover border-2 border-white shadow-md" />
          )}
        </div>
        <div className="px-5 pt-10 pb-4">
          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            {clinic.phone    && <span className="flex items-center gap-1"><Phone size={12}/>{clinic.phone}</span>}
            {clinic.phone2   && <span className="flex items-center gap-1"><Phone size={12}/>{clinic.phone2}</span>}
            {clinic.phone3   && <span className="flex items-center gap-1"><Phone size={12}/>{clinic.phone3}</span>}
            {clinic.website  && <a href={clinic.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[#2ab5ad]"><Globe size={12}/>Website</a>}
            {clinic.facebookUrl && <a href={clinic.facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[#2ab5ad]"><Link2 size={12}/>Facebook</a>}
            {clinic.tiktokUrl   && <a href={clinic.tiktokUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[#2ab5ad]"><Music2 size={12}/>TikTok</a>}
            {clinic.mapUrl      && <a href={clinic.mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[#2ab5ad]"><Map size={12}/>Google Map</a>}
            {clinic.openTime && clinic.closeTime && <span className="flex items-center gap-1"><Clock size={12}/>{clinic.openTime}–{clinic.closeTime}</span>}
            {clinic.address  && <span className="flex items-center gap-1"><MapPin size={12}/>{clinic.address}</span>}
            {!!clinic.rating && <span className="flex items-center gap-1"><Star size={12} className="text-amber-400" fill="currentColor" />{clinic.rating} ({clinic.reviewCount})</span>}
          </div>
          {(clinic.tagsMm?.length > 0) && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {clinic.tagsMm.map(t => (
                <span key={t} className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-xs font-medium">{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>}

      {/* 3-column layout */}
      <div className="grid grid-cols-3 gap-5">

        {/* COL 1 — basic info + location + about */}
        <div className="space-y-5">
          <Section title="အချက်အလက်အခြေခံ">
            {/* Type */}
            <div className="flex flex-wrap gap-2">
              {partnerTypes.map(t => (
                <button key={t.id} type="button" onClick={() => set('type', t.name)}
                  className={`flex-1 min-w-20 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${form.type === t.name ? 'border-[#2ab5ad] bg-teal-50 text-[#2ab5ad]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                  {t.name}
                </button>
              ))}
            </div>
            <div><label className={lbl}>နာမည် (မြန်မာ) *</label><input className={inp} value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div><label className={lbl}>Name (English)</label><input className={inp} value={form.nameEn} onChange={e => set('nameEn', e.target.value)} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className={lbl}>ဖုန်း ၁</label><input className={inp} value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
              <div><label className={lbl}>ဖုန်း ၂</label><input className={inp} value={form.phone2} onChange={e => set('phone2', e.target.value)} /></div>
              <div><label className={lbl}>ဖုန်း ၃</label><input className={inp} value={form.phone3} onChange={e => set('phone3', e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TimePicker label="ဖွင့်ချိန်" value={form.openTime}  onChange={v => set('openTime', v)}  />
              <TimePicker label="ပိတ်ချိန်" value={form.closeTime} onChange={v => set('closeTime', v)} />
            </div>
          </Section>

          <Section title="Links">
            <div><label className={lbl}>Website</label><input className={inp} value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://..." /></div>
            <div><label className={lbl}>Facebook</label><input className={inp} value={form.facebookUrl} onChange={e => set('facebookUrl', e.target.value)} placeholder="https://facebook.com/..." /></div>
            <div><label className={lbl}>TikTok</label><input className={inp} value={form.tiktokUrl} onChange={e => set('tiktokUrl', e.target.value)} placeholder="https://tiktok.com/@..." /></div>
            <div><label className={lbl}>Google Map Link</label><input className={inp} value={form.mapUrl} onChange={e => set('mapUrl', e.target.value)} placeholder="https://maps.google.com/..." /></div>
          </Section>

          <Section title="တည်နေရာ">
            <div><label className={lbl}>လိပ်စာ (မြန်မာ)</label><input className={inp} value={form.address} onChange={e => set('address', e.target.value)} /></div>
            <div><label className={lbl}>Address (English)</label><input className={inp} value={form.addressEn} onChange={e => set('addressEn', e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lbl}>တိုင်း/ပြည်နယ်</label><input className={inp} value={form.state} onChange={e => set('state', e.target.value)} /></div>
              <div><label className={lbl}>မြို့နယ်</label><input className={inp} value={form.township} onChange={e => set('township', e.target.value)} /></div>
            </div>
          </Section>

          <Section title="အကြောင်းအရာ">
            <div><label className={lbl}>အကြောင်း (မြန်မာ)</label><textarea className={inp + ' resize-none'} rows={5} value={form.aboutMm} onChange={e => set('aboutMm', e.target.value)} /></div>
            <div><label className={lbl}>About (English)</label><textarea className={inp + ' resize-none'} rows={5} value={form.aboutEn} onChange={e => set('aboutEn', e.target.value)} /></div>
          </Section>
        </div>

        {/* COL 2 — images + tags + settings */}
        <div className="space-y-5">
          <Section title="ဓာတ်ပုံများ">
            <p className="text-xs text-gray-400 -mt-2">S3 upload လာမည် — ယာယီ URL သုံးနိုင်</p>
            <ImageDropzone label="Logo / ဓာတ်ပုံ (1:1)" value={form.imageUrl} onChange={v => set('imageUrl', v)} aspect="square" />
            <ImageDropzone label="Cover Image (16:6)" value={form.coverUrl} onChange={v => set('coverUrl', v)} aspect="wide" />
          </Section>

          <Section title="Tags">
            {/* Tags Myanmar */}
            <div>
              <label className={lbl}>Tags (မြန်မာ)</label>
              <div className="flex gap-2">
                <input className={inp} value={form.tagsMmRaw}
                  onChange={e => set('tagsMmRaw', e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag('Mm'); } }}
                  placeholder="tag ရိုက်ပြီး Enter" />
                <button type="button" onClick={() => addTag('Mm')}
                  className="px-4 py-2.5 rounded-xl text-white text-sm font-medium flex-shrink-0"
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
                  placeholder="type tag, press Enter" />
                <button type="button" onClick={() => addTag('En')}
                  className="px-4 py-2.5 rounded-xl text-white text-sm font-medium flex-shrink-0"
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

          <Section title="ဆက်တင်များ">
            <div className="space-y-2">
              {[
                { key: 'verified',  label: 'Verified ✓',  desc: 'Verified badge ပြမည်' },
                { key: 'isPartner', label: 'Partner',      desc: 'Partner clinic' },
                { key: 'isActive',  label: 'Active',       desc: 'Patient ဘက်မှာ ပြ/မပြ' },
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
        </div>

        {/* COL 3 — doctors + products */}
        <div className="space-y-5">
          <Section title={`ဆရာဝန်များ (${linkedDoctorIds.length})`} icon={<Stethoscope size={14} />}>
            <div className="max-h-72 overflow-y-auto space-y-1.5 -mx-1 px-1">
              {linkedDoctorIds.length === 0
                ? <p className="text-xs text-gray-400 text-center py-6">ဆရာဝန် မချိတ်ဆက်ရသေးပါ</p>
                : allDoctors.filter(d => linkedDoctorIds.includes(d.id)).map(d => (
                    <div key={d.id} onClick={() => toggleDoctor(d.id)}
                      className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors border bg-teal-50 border-teal-200 hover:bg-red-50 hover:border-red-200 group">
                      {d.imageUrl
                        ? <img src={d.imageUrl} alt={d.name} className="h-8 w-8 rounded-full object-cover flex-shrink-0" />
                        : <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">{d.name[0]}</div>}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{d.name}</p>
                        <p className="text-xs text-gray-400 truncate">{d.specialty}</p>
                      </div>
                      <CheckCircle2 size={15} className="text-[#2ab5ad] flex-shrink-0 group-hover:text-red-400" />
                    </div>
                  ))}
            </div>
            {/* Add more doctors */}
            <details className="mt-1">
              <summary className="text-xs font-semibold cursor-pointer" style={{ color: PRIMARY }}>+ ဆရာဝန် ထပ်ထည့်ရန်</summary>
              <div className="mt-2 space-y-1">
                {allDoctors.filter(d => !linkedDoctorIds.includes(d.id)).map(d => (
                  <div key={d.id} onClick={() => toggleDoctor(d.id)}
                    className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer border border-gray-100 hover:bg-teal-50 hover:border-teal-200 transition-colors">
                    {d.imageUrl
                      ? <img src={d.imageUrl} alt={d.name} className="h-7 w-7 rounded-full object-cover flex-shrink-0" />
                      : <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400 flex-shrink-0">{d.name[0]}</div>}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">{d.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{d.specialty}</p>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </Section>

          <Section title={`ဆေးပစ္စည်းများ (${linkedProductIds.length})`} icon={<Package size={14} />}>
            <div className="max-h-72 overflow-y-auto space-y-1.5 -mx-1 px-1">
              {linkedProductIds.length === 0
                ? <p className="text-xs text-gray-400 text-center py-6">Product မချိတ်ဆက်ရသေးပါ</p>
                : allProducts.filter(p => linkedProductIds.includes(p.id)).map(p => (
                    <div key={p.id} onClick={() => toggleProduct(p.id)}
                      className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors border bg-teal-50 border-teal-200 hover:bg-red-50 hover:border-red-200 group">
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt={p.name} className="h-8 w-8 rounded-xl object-cover flex-shrink-0" />
                        : <div className="h-8 w-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0"><Package size={13} className="text-gray-400" /></div>}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.price.toLocaleString()} Ks</p>
                      </div>
                      <CheckCircle2 size={15} className="text-[#2ab5ad] flex-shrink-0 group-hover:text-red-400" />
                    </div>
                  ))}
            </div>
            <details className="mt-1">
              <summary className="text-xs font-semibold cursor-pointer" style={{ color: PRIMARY }}>+ Product ထပ်ထည့်ရန်</summary>
              <div className="mt-2 space-y-1">
                {allProducts.filter(p => !linkedProductIds.includes(p.id)).map(p => (
                  <div key={p.id} onClick={() => toggleProduct(p.id)}
                    className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer border border-gray-100 hover:bg-teal-50 hover:border-teal-200 transition-colors">
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={p.name} className="h-7 w-7 rounded-xl object-cover flex-shrink-0" />
                      : <div className="h-7 w-7 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0"><Package size={11} className="text-gray-400" /></div>}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">{p.name}</p>
                      <p className="text-[10px] text-gray-400">{p.price.toLocaleString()} Ks</p>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </Section>
        </div>
      </div>

      {/* Bottom save bar */}
      <div className="flex justify-end gap-3 pb-2">
        <button onClick={saveInfo} disabled={saving}
          className="px-8 py-3 rounded-xl text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60 hover:opacity-90"
          style={{ backgroundColor: PRIMARY }}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : null}
          {saving ? 'သိမ်းနေသည်...' : 'ပြောင်းလဲမှုများ သိမ်းဆည်း'}
        </button>
      </div>
    </div>
  );
}
