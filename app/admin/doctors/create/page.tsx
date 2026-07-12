'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X, Clock, Loader2, Check, User, CalendarClock, Copy, Minus, Plus, Images } from 'lucide-react';
import ImageDropzone from '@/components/admin/ImageDropzone';
import GalleryEditor, { type GalleryItem } from '@/components/admin/GalleryEditor';
import SearchableSelect from '@/components/admin/SearchableSelect';

const PRIMARY = '#2ab5ad';

interface Slot {
  id?:        string;
  dayOfWeek:  number;
  startTime:  string;
  endTime:    string;
  duration:   number;
  maxPerSlot: number;
}
interface SpecialtyItem { id: string; name: string; }

const DAYS    = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DAYS_MM = ['တနင်္ဂနွေ','တနင်္လာ','အင်္ဂါ','ဗုဒ္ဓဟူး','ကြာသပတေး','သောကြာ','စနေ'];
const SLOT_DURATION = 15; // default; adjustable per slot via DURATION_OPTIONS
const DURATION_OPTIONS = [10, 15, 20, 30];

const EMPTY_FORM = {
  name:'', nameEn:'', specialty:'', bio:'', phone:'', password:'',
  phoneSecondary:'', viber:'',
  imageUrl:'', experience: 0, price: 0, isAvailable: true,
  qualifications:'', careerMm:'', careerEn:'',
  clinicNote:'', clinicNoteEn:'', location:'',
  languagesRaw:'', clinicTypesMmRaw:'', clinicTypesEnRaw:'',
};

export default function CreateDoctorPage() {
  const router = useRouter();

  const [form, setForm]               = useState(EMPTY_FORM);
  const [slots, setSlots]             = useState<Slot[]>([]);
  const [gallery, setGallery]         = useState<GalleryItem[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [step, setStep]               = useState<1|2|3>(1);
  const [specialties, setSpecialties] = useState<SpecialtyItem[]>([]);

  useEffect(() => {
    fetch('/api/admin/specialties').then(r => r.json()).then(d => setSpecialties(d.specialties ?? []));
  }, []);

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const toggleDay = (day: number) => {
    if (slots.find(s => s.dayOfWeek === day))
      setSlots(s => s.filter(sl => sl.dayOfWeek !== day));
    else
      setSlots(s => [...s, { dayOfWeek: day, startTime: '09:00', endTime: '17:00', duration: SLOT_DURATION, maxPerSlot: 1 }]);
  };
  const updateSlot = (day: number, k: keyof Slot, v: string | number) =>
    setSlots(s => s.map(sl => sl.dayOfWeek === day ? { ...sl, [k]: v } : sl));

  const applyToAll = (source: Slot) =>
    setSlots(s => s.map(sl => ({ ...sl, startTime: source.startTime, endTime: source.endTime, duration: source.duration, maxPerSlot: source.maxPerSlot })));

  const handleSubmit = async () => {
    if (!form.name || !form.specialty || !form.phone || !form.password) {
      setError('Name, Specialty, Phone, Password လိုအပ်သည်။'); return;
    }
    setError(''); setLoading(true);
    try {
      const { languagesRaw, clinicTypesMmRaw, clinicTypesEnRaw, ...rest } = form;
      const payload = {
        ...rest,
        languages:     languagesRaw.split(',').map(s => s.trim()).filter(Boolean),
        clinicTypesMm: clinicTypesMmRaw.split('\n').map(s => s.trim()).filter(Boolean),
        clinicTypesEn: clinicTypesEnRaw.split('\n').map(s => s.trim()).filter(Boolean),
      };
      const res  = await fetch('/api/admin/doctors', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, slots, gallery }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Error'); setLoading(false); return; }
      router.push('/admin/doctors');
    } catch { setError('Server error'); setLoading(false); }
  };

  const inp = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-teal-400 transition-colors';
  const lbl = 'text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block';

  const STEPS = [
    { n: 1, label: 'Doctor Info',  icon: User },
    { n: 2, label: 'Weekly Slots', icon: CalendarClock },
    { n: 3, label: 'Gallery',      icon: Images },
  ] as const;

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-6.5rem)]">

      {/* Header */}
      <div className="flex items-center gap-3 shrink-0">
        <button onClick={() => router.push('/admin/doctors')}
          className="w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <div>
          <p className="text-lg font-bold text-gray-800">Create Doctor</p>
          <p className="text-xs text-gray-400">Fill in doctor details then set weekly availability</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white rounded-2xl border border-gray-100 px-5 py-3 shrink-0">
        <div className="flex items-center">
          {STEPS.map((s, i) => {
            const done   = step > s.n;
            const active = step === s.n;
            const Icon   = s.icon;
            const clickable = done;
            return (
              <div key={s.n} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => clickable && setStep(s.n)}
                  className="flex items-center gap-2 shrink-0 disabled:cursor-default"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all"
                    style={{
                      backgroundColor: done ? PRIMARY : '#fff',
                      borderColor: done || active ? PRIMARY : '#e5e7eb',
                      boxShadow: active ? `0 0 0 3px ${PRIMARY}1a` : 'none',
                    }}>
                    {done
                      ? <Check className="w-3.5 h-3.5 text-white" />
                      : <Icon className="w-3.5 h-3.5" style={{ color: active ? PRIMARY : '#9ca3af' }} />}
                  </div>
                  <p className="text-xs font-bold whitespace-nowrap" style={{ color: active || done ? '#1f2937' : '#9ca3af' }}>{s.label}</p>
                </button>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-4 rounded-full transition-all" style={{ backgroundColor: done ? PRIMARY : '#e5e7eb' }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-4 flex-1 overflow-y-auto">

        {step === 1 && (<>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Doctor Info</p>

          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Name (Myanmar) *</label>
              <input className={inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="ဒေါ်မြတ်မြတ်" /></div>
            <div><label className={lbl}>Name (English)</label>
              <input className={inp} value={form.nameEn} onChange={e => set('nameEn', e.target.value)} placeholder="Dr. Myat Myat" /></div>
          </div>

          <div><label className={lbl}>Specialty *</label>
            <SearchableSelect
              options={specialties.map(s => ({ id: s.id, label: s.name }))}
              value={form.specialty}
              onChange={v => set('specialty', v)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Experience (Years)</label>
              <input type="number" min={0} className={inp} value={form.experience}
                onChange={e => set('experience', parseInt(e.target.value) || 0)} /></div>
            <div><label className={lbl}>Price (MMK)</label>
              <input type="number" min={0} className={inp} value={form.price}
                onChange={e => set('price', parseInt(e.target.value) || 0)} /></div>
          </div>

          <div><label className={lbl}>Location</label>
            <input className={inp} value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Yangon" /></div>

          <div><label className={lbl}>Bio</label>
            <textarea rows={3} className={inp + ' resize-none'} value={form.bio}
              onChange={e => set('bio', e.target.value)} placeholder="Doctor biography..." /></div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Professional Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lbl}>Career Title (Myanmar)</label>
                <input className={inp} value={form.careerMm} onChange={e => set('careerMm', e.target.value)} placeholder="e.g. ကလေးအထူးကုဆရာဝန်" /></div>
              <div><label className={lbl}>Career Title (English)</label>
                <input className={inp} value={form.careerEn} onChange={e => set('careerEn', e.target.value)} placeholder="e.g. Senior Pediatric Specialist" /></div>
            </div>
          </div>

          <div><label className={lbl}>Qualifications (e.g. M.B.,B.S | DCH | MRCP)</label>
            <input className={inp} value={form.qualifications} onChange={e => set('qualifications', e.target.value)} placeholder="M.B.,B.S | DCH | MRCP (UK)" /></div>

          <div><label className={lbl}>Languages (comma-separated, e.g. Myanmar, English)</label>
            <input className={inp} value={form.languagesRaw} onChange={e => set('languagesRaw', e.target.value)} placeholder="Myanmar, English" /></div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Clinic Info</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className={lbl}>Clinic Note (Myanmar)</label>
                <textarea rows={2} className={inp + ' resize-none'} value={form.clinicNote}
                  onChange={e => set('clinicNote', e.target.value)} /></div>
              <div><label className={lbl}>Clinic Note (English)</label>
                <textarea rows={2} className={inp + ' resize-none'} value={form.clinicNoteEn}
                  onChange={e => set('clinicNoteEn', e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lbl}>Clinic Types Myanmar (one per line)</label>
                <textarea rows={3} className={inp + ' resize-none'} value={form.clinicTypesMmRaw}
                  onChange={e => set('clinicTypesMmRaw', e.target.value)}
                  placeholder="ကလေးကျန်းမာရေး ပြသနာများ&#10;ကာကွယ်ဆေးထိုးနှံမှုများ" /></div>
              <div><label className={lbl}>Clinic Types English (one per line)</label>
                <textarea rows={3} className={inp + ' resize-none'} value={form.clinicTypesEnRaw}
                  onChange={e => set('clinicTypesEnRaw', e.target.value)} /></div>
            </div>
          </div>

          <ImageDropzone label="Profile Image" value={form.imageUrl} onChange={v => set('imageUrl', v)} aspect="square" />

          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-sm text-gray-600 flex-1">Available for appointments</span>
            <button onClick={() => set('isAvailable', !form.isAvailable)}
              className="w-10 h-6 rounded-full transition-all relative"
              style={{ backgroundColor: form.isAvailable ? PRIMARY : '#d1d5db' }}>
              <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                style={{ left: form.isAvailable ? '1.25rem' : '0.125rem' }} />
            </button>
          </div>

          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">Contact</p>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Main Phone *</label>
              <input type="tel" className={inp} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="09XXXXXXXXX" /></div>
            <div><label className={lbl}>Secondary Phone</label>
              <input type="tel" className={inp} value={form.phoneSecondary} onChange={e => set('phoneSecondary', e.target.value)} placeholder="09XXXXXXXXX" /></div>
          </div>
          <div><label className={lbl}>Viber</label>
            <input type="tel" className={inp} value={form.viber} onChange={e => set('viber', e.target.value)} placeholder="09XXXXXXXXX (Viber)" /></div>

          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">Login Account</p>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Login Phone *</label>
              <input type="tel" value={form.phone} readOnly className={inp + ' bg-gray-100 text-gray-400 cursor-not-allowed'} /></div>
            <div><label className={lbl}>Password *</label>
              <input type="password" className={inp} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 6 chars" /></div>
          </div>
        </>)}

        {step === 2 && (<>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Weekly Slots</p>
              <p className="text-xs text-gray-400 mt-0.5">ရုံးနေ့ရက်တွေကို ရွေးပြီး အချိန်သတ်မှတ်ပါ</p>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100 text-gray-500">
              {slots.length} day{slots.length !== 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {DAYS.map((d, i) => {
              const active = !!slots.find(s => s.dayOfWeek === i);
              return (
                <button key={d} onClick={() => toggleDay(i)}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all"
                  style={{
                    backgroundColor: active ? `${PRIMARY}0d` : '#fff',
                    borderColor: active ? PRIMARY : '#e5e7eb',
                  }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    style={{ backgroundColor: active ? PRIMARY : '#f3f4f6', color: active ? '#fff' : '#9ca3af' }}>
                    {d[0]}
                  </div>
                  <span className="text-[11px] font-semibold" style={{ color: active ? PRIMARY : '#9ca3af' }}>{d}</span>
                </button>
              );
            })}
          </div>

          {slots.length > 0 && (
            <div className="flex flex-col gap-3 mt-1">
              {[...slots].sort((a,b) => a.dayOfWeek - b.dayOfWeek).map((slot, si) => (
                <div key={slot.dayOfWeek} className="rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100" style={{ backgroundColor: `${PRIMARY}08` }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-white" style={{ backgroundColor: PRIMARY }}>
                        {DAYS[slot.dayOfWeek][0]}
                      </div>
                      <p className="text-sm font-bold text-gray-700">{DAYS_MM[slot.dayOfWeek]} <span className="text-gray-400 font-normal">({DAYS[slot.dayOfWeek]})</span></p>
                    </div>
                    <div className="flex items-center gap-1">
                      {si === 0 && slots.length > 1 && (
                        <button onClick={() => applyToAll(slot)} title="Apply this time to all selected days"
                          className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg hover:bg-white transition-colors" style={{ color: PRIMARY }}>
                          <Copy className="w-3 h-3" /> Apply to all
                        </button>
                      )}
                      <button onClick={() => toggleDay(slot.dayOfWeek)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-white transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div><label className={lbl}>Start Time</label>
                      <input type="time" className={inp} value={slot.startTime} onChange={e => updateSlot(slot.dayOfWeek,'startTime',e.target.value)} /></div>
                    <div><label className={lbl}>End Time</label>
                      <input type="time" className={inp} value={slot.endTime} onChange={e => updateSlot(slot.dayOfWeek,'endTime',e.target.value)} /></div>
                    <div><label className={lbl}>Duration</label>
                      <select className={inp} value={slot.duration}
                        onChange={e => updateSlot(slot.dayOfWeek, 'duration', parseInt(e.target.value))}>
                        {DURATION_OPTIONS.map(d => <option key={d} value={d}>{d} min</option>)}
                      </select>
                    </div>
                    <div><label className={lbl}>Max per Slot</label>
                      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                        <button type="button" onClick={() => updateSlot(slot.dayOfWeek,'maxPerSlot', Math.max(1, slot.maxPerSlot - 1))}
                          className="w-8 h-full py-2.5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors shrink-0">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input type="number" min={1} value={slot.maxPerSlot} readOnly
                          className="flex-1 min-w-0 bg-transparent text-center text-sm font-semibold text-gray-700 outline-none" />
                        <button type="button" onClick={() => updateSlot(slot.dayOfWeek,'maxPerSlot', slot.maxPerSlot + 1)}
                          className="w-8 h-full py-2.5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors shrink-0">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {slots.length === 0 && (
            <div className="text-center py-14 text-gray-300 border border-dashed border-gray-200 rounded-2xl">
              <Clock className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">နေ့ရက်တစ်ခုခု ရွေးချယ်ပါ</p>
            </div>
          )}
        </>)}

        {step === 3 && (<>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Gallery</p>
          <p className="text-xs text-gray-400 -mt-2">Clinic/work photos shown on the doctor profile (optional)</p>
          <GalleryEditor items={gallery} onChange={setGallery} />
        </>)}

        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-500">{error}</div>}
      </div>

      {/* Footer */}
      <div className="flex gap-3 shrink-0">
        {step > 1 && (
          <button onClick={() => setStep(s => (s - 1) as 1 | 2)}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
            ← Back
          </button>
        )}
        {step === 1 && (
          <button onClick={() => setStep(2)}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ backgroundColor: PRIMARY }}>
            Next: Slots →
          </button>
        )}
        {step === 2 && (
          <button onClick={() => setStep(3)}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ backgroundColor: PRIMARY }}>
            Next: Gallery →
          </button>
        )}
        {step === 3 && (
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: PRIMARY }}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create Doctor'}
          </button>
        )}
      </div>
    </div>
  );
}
