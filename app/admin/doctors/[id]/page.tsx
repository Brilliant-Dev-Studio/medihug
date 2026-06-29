'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Stethoscope, Phone, Clock, Star, DollarSign,
  CheckCircle2, XCircle, Pencil, Plus, X, Check, Loader2, Save,
  Images, Trash2, GripVertical,
} from 'lucide-react';

const PRIMARY   = '#2ab5ad';
const DAYS      = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_MM   = ['တနင်္ဂနွေ', 'တနင်္လာ', 'အင်္ဂါ', 'ဗုဒ္ဓဟူး', 'ကြာသပတေး', 'သောကြာ', 'စနေ'];
const SLOT_DURATION = 15;
const AVATAR_COLORS = ['#2ab5ad', '#8b5cf6', '#f59e0b', '#3b82f6', '#10b981', '#ef4444'];

interface Slot    { id?: string; dayOfWeek: number; startTime: string; endTime: string; duration: number; maxPerSlot: number; }
interface Gallery { id?: string; imageUrl: string; captionMm: string; captionEn: string; order: number; }
interface Doctor  {
  id: string; name: string; nameEn: string | null;
  specialty: string; bio: string | null; phone: string | null;
  imageUrl: string | null; experience: number; rating: number;
  price: number; isAvailable: boolean; isActive: boolean;
  qualifications: string | null; careerMm: string | null; careerEn: string | null;
  clinicNote: string | null; clinicNoteEn: string | null;
  clinicTypesMm: string[]; clinicTypesEn: string[];
  languages: string[]; location: string | null;
  createdAt: string; slots: Slot[]; gallery: Gallery[];
  user: { phone: string; isActive: boolean } | null;
}

export default function DoctorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [doctor,       setDoctor]       = useState<Doctor | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [editInfo,     setEditInfo]     = useState(false);
  const [infoForm,     setInfoForm]     = useState<Partial<Doctor & { clinicTypesMmRaw: string; clinicTypesEnRaw: string; languagesRaw: string }>>({});
  const [savingInfo,   setSavingInfo]   = useState(false);
  const [editSlots,    setEditSlots]    = useState(false);
  const [slots,        setSlots]        = useState<Slot[]>([]);
  const [savingSlots,  setSavingSlots]  = useState(false);
  const [editGallery,  setEditGallery]  = useState(false);
  const [gallery,      setGallery]      = useState<Gallery[]>([]);
  const [savingGallery,setSavingGallery]= useState(false);
  const [newImg,       setNewImg]       = useState({ imageUrl: '', captionMm: '', captionEn: '' });
  const [error,        setError]        = useState('');

  const fetchDoctor = useCallback(async () => {
    setLoading(true);
    const res  = await fetch(`/api/admin/doctors/${id}`);
    const data = await res.json();
    setDoctor(data.doctor);
    setSlots(data.doctor?.slots   ?? []);
    setGallery(data.doctor?.gallery ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchDoctor(); }, [fetchDoctor]);

  /* ── Info edit ── */
  const startEditInfo = () => {
    if (!doctor) return;
    setInfoForm({
      name: doctor.name, nameEn: doctor.nameEn ?? '',
      specialty: doctor.specialty, bio: doctor.bio ?? '',
      phone: doctor.phone ?? '', experience: doctor.experience,
      price: doctor.price, isAvailable: doctor.isAvailable, isActive: doctor.isActive,
      qualifications: doctor.qualifications ?? '',
      careerMm: doctor.careerMm ?? '', careerEn: doctor.careerEn ?? '',
      clinicNote: doctor.clinicNote ?? '', clinicNoteEn: doctor.clinicNoteEn ?? '',
      clinicTypesMmRaw: (doctor.clinicTypesMm ?? []).join('\n'),
      clinicTypesEnRaw: (doctor.clinicTypesEn ?? []).join('\n'),
      languagesRaw: (doctor.languages ?? []).join(', '),
      location: doctor.location ?? '',
    });
    setEditInfo(true);
    setError('');
  };

  const saveInfo = async () => {
    setSavingInfo(true); setError('');
    const payload = {
      name:          infoForm.name,
      nameEn:        infoForm.nameEn,
      specialty:     infoForm.specialty,
      bio:           infoForm.bio,
      phone:         infoForm.phone,
      experience:    infoForm.experience,
      price:         infoForm.price,
      isAvailable:   infoForm.isAvailable,
      isActive:      infoForm.isActive,
      qualifications: infoForm.qualifications,
      careerMm:      infoForm.careerMm,
      careerEn:      infoForm.careerEn,
      clinicNote:    infoForm.clinicNote,
      clinicNoteEn:  infoForm.clinicNoteEn,
      clinicTypesMm: (infoForm.clinicTypesMmRaw ?? '').split('\n').map(s => s.trim()).filter(Boolean),
      clinicTypesEn: (infoForm.clinicTypesEnRaw ?? '').split('\n').map(s => s.trim()).filter(Boolean),
      languages:     (infoForm.languagesRaw ?? '').split(',').map(s => s.trim()).filter(Boolean),
      location:      infoForm.location,
    };
    const res  = await fetch(`/api/admin/doctors/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Error'); setSavingInfo(false); return; }
    setDoctor(data.doctor);
    setEditInfo(false); setSavingInfo(false);
  };

  /* ── Slots edit ── */
  const toggleDay = (day: number) => {
    if (slots.find(s => s.dayOfWeek === day))
      setSlots(s => s.filter(sl => sl.dayOfWeek !== day));
    else
      setSlots(s => [...s, { dayOfWeek: day, startTime: '09:00', endTime: '17:00', duration: SLOT_DURATION, maxPerSlot: 1 }]);
  };

  const updateSlot = (day: number, k: keyof Slot, v: string | number) =>
    setSlots(s => s.map(sl => sl.dayOfWeek === day ? { ...sl, [k]: v } : sl));

  const saveSlots = async () => {
    setSavingSlots(true); setError('');
    const res  = await fetch(`/api/admin/doctors/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slots }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Error'); setSavingSlots(false); return; }
    setDoctor(data.doctor);
    setSlots(data.doctor?.slots ?? []);
    setEditSlots(false); setSavingSlots(false);
  };

  /* ── Gallery edit ── */
  const addGalleryItem = () => {
    if (!newImg.imageUrl.trim()) return;
    setGallery(g => [...g, { imageUrl: newImg.imageUrl.trim(), captionMm: newImg.captionMm, captionEn: newImg.captionEn, order: g.length }]);
    setNewImg({ imageUrl: '', captionMm: '', captionEn: '' });
  };

  const removeGalleryItem = (i: number) =>
    setGallery(g => g.filter((_, idx) => idx !== i).map((item, idx) => ({ ...item, order: idx })));

  const saveGallery = async () => {
    setSavingGallery(true); setError('');
    const res  = await fetch(`/api/admin/doctors/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gallery }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Error'); setSavingGallery(false); return; }
    setDoctor(data.doctor);
    setGallery(data.doctor?.gallery ?? []);
    setEditGallery(false); setSavingGallery(false);
  };

  const inp = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-teal-400 transition-colors';
  const lbl = 'text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block';

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: PRIMARY }} />
    </div>
  );

  if (!doctor) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Stethoscope className="w-12 h-12 text-gray-200" />
      <p className="text-gray-400">Doctor not found.</p>
      <button onClick={() => router.back()} className="text-sm font-semibold" style={{ color: PRIMARY }}>← Back</button>
    </div>
  );

  const initials = doctor.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col gap-5 max-w-4xl">

      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Doctors
      </button>

      {/* Hero card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        {doctor.imageUrl ? (
          <img src={doctor.imageUrl} alt={doctor.name} className="w-20 h-20 rounded-2xl object-cover shrink-0" />
        ) : (
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shrink-0"
            style={{ backgroundColor: AVATAR_COLORS[0] }}>
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-gray-800">{doctor.name}</h1>
            {doctor.nameEn && <span className="text-sm text-gray-400">({doctor.nameEn})</span>}
          </div>
          <p className="text-sm font-semibold mb-2" style={{ color: PRIMARY }}>{doctor.specialty}</p>
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${doctor.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-400'}`}>
              {doctor.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              {doctor.isActive ? 'Active' : 'Inactive'}
            </span>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${doctor.isAvailable ? 'bg-blue-50 text-blue-500' : 'bg-gray-100 text-gray-400'}`}>
              <Star className="w-3 h-3" />
              {doctor.isAvailable ? 'Available' : 'Unavailable'}
            </span>
          </div>
        </div>
        <button onClick={startEditInfo}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-gray-200 text-gray-500 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-all shrink-0">
          <Pencil className="w-4 h-4" /> Edit Info
        </button>
      </div>

      {/* Edit Info Panel */}
      {editInfo && (
        <div className="bg-white rounded-2xl border-2 p-6 flex flex-col gap-4" style={{ borderColor: PRIMARY }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: PRIMARY }}>Edit Doctor Info</p>

          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Name (Myanmar) *</label>
              <input className={inp} value={infoForm.name ?? ''} onChange={e => setInfoForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label className={lbl}>Name (English)</label>
              <input className={inp} value={infoForm.nameEn ?? ''} onChange={e => setInfoForm(f => ({ ...f, nameEn: e.target.value }))} /></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Specialty</label>
              <input className={inp} value={infoForm.specialty ?? ''} onChange={e => setInfoForm(f => ({ ...f, specialty: e.target.value }))} /></div>
            <div><label className={lbl}>Phone</label>
              <input className={inp} value={infoForm.phone ?? ''} onChange={e => setInfoForm(f => ({ ...f, phone: e.target.value }))} /></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Experience (Years)</label>
              <input type="number" min={0} className={inp} value={infoForm.experience ?? 0}
                onChange={e => setInfoForm(f => ({ ...f, experience: parseInt(e.target.value) || 0 }))} /></div>
            <div><label className={lbl}>Price (MMK)</label>
              <input type="number" min={0} className={inp} value={infoForm.price ?? 0}
                onChange={e => setInfoForm(f => ({ ...f, price: parseInt(e.target.value) || 0 }))} /></div>
          </div>

          <div><label className={lbl}>Location</label>
            <input className={inp} value={infoForm.location ?? ''} onChange={e => setInfoForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Yangon" /></div>

          <div><label className={lbl}>Bio</label>
            <textarea rows={3} className={inp + ' resize-none'} value={infoForm.bio ?? ''}
              onChange={e => setInfoForm(f => ({ ...f, bio: e.target.value }))} /></div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Professional Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lbl}>Career Title (Myanmar)</label>
                <input className={inp} value={infoForm.careerMm ?? ''} onChange={e => setInfoForm(f => ({ ...f, careerMm: e.target.value }))} placeholder="e.g. ကလေးအထူးကုဆရာဝန်" /></div>
              <div><label className={lbl}>Career Title (English)</label>
                <input className={inp} value={infoForm.careerEn ?? ''} onChange={e => setInfoForm(f => ({ ...f, careerEn: e.target.value }))} placeholder="e.g. Senior Pediatric Specialist" /></div>
            </div>
          </div>

          <div><label className={lbl}>Qualifications (e.g. M.B.,B.S | DCH | MRCP)</label>
            <input className={inp} value={infoForm.qualifications ?? ''} onChange={e => setInfoForm(f => ({ ...f, qualifications: e.target.value }))} placeholder="M.B.,B.S | DCH | MRCP (UK)" /></div>

          <div><label className={lbl}>Languages (comma-separated, e.g. Myanmar, English)</label>
            <input className={inp} value={infoForm.languagesRaw ?? ''} onChange={e => setInfoForm(f => ({ ...f, languagesRaw: e.target.value }))} placeholder="Myanmar, English" /></div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Clinic Info</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className={lbl}>Clinic Note (Myanmar)</label>
                <textarea rows={2} className={inp + ' resize-none'} value={infoForm.clinicNote ?? ''}
                  onChange={e => setInfoForm(f => ({ ...f, clinicNote: e.target.value }))} /></div>
              <div><label className={lbl}>Clinic Note (English)</label>
                <textarea rows={2} className={inp + ' resize-none'} value={infoForm.clinicNoteEn ?? ''}
                  onChange={e => setInfoForm(f => ({ ...f, clinicNoteEn: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lbl}>Clinic Types Myanmar (one per line)</label>
                <textarea rows={3} className={inp + ' resize-none'} value={infoForm.clinicTypesMmRaw ?? ''}
                  onChange={e => setInfoForm(f => ({ ...f, clinicTypesMmRaw: e.target.value }))}
                  placeholder="ကလေးကျန်းမာရေး ပြသနာများ&#10;ကာကွယ်ဆေးထိုးနှံမှုများ" /></div>
              <div><label className={lbl}>Clinic Types English (one per line)</label>
                <textarea rows={3} className={inp + ' resize-none'} value={infoForm.clinicTypesEnRaw ?? ''}
                  onChange={e => setInfoForm(f => ({ ...f, clinicTypesEnRaw: e.target.value }))}
                  placeholder="Pediatric Health Issues&#10;Immunization Programs" /></div>
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <button onClick={() => setInfoForm(f => ({ ...f, isAvailable: !f.isAvailable }))}
                className="w-10 h-6 rounded-full transition-all relative shrink-0"
                style={{ backgroundColor: infoForm.isAvailable ? PRIMARY : '#d1d5db' }}>
                <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                  style={{ left: infoForm.isAvailable ? '1.25rem' : '0.125rem' }} />
              </button>
              <span className="text-sm text-gray-600">Available</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <button onClick={() => setInfoForm(f => ({ ...f, isActive: !f.isActive }))}
                className="w-10 h-6 rounded-full transition-all relative shrink-0"
                style={{ backgroundColor: infoForm.isActive ? '#10b981' : '#d1d5db' }}>
                <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                  style={{ left: infoForm.isActive ? '1.25rem' : '0.125rem' }} />
              </button>
              <span className="text-sm text-gray-600">Active</span>
            </label>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button onClick={saveInfo} disabled={savingInfo}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
              style={{ backgroundColor: PRIMARY }}>
              {savingInfo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
            <button onClick={() => setEditInfo(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Info cards row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Clock,      label: 'Experience', value: `${doctor.experience} years` },
          { icon: DollarSign, label: 'Price',      value: `${doctor.price.toLocaleString()} MMK` },
          { icon: Star,       label: 'Rating',     value: `${doctor.rating.toFixed(1)} / 5` },
          { icon: Phone,      label: 'Phone',      value: doctor.phone ?? '—' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#e6f7f7' }}>
              <Icon className="w-4 h-4" style={{ color: PRIMARY }} />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-bold text-gray-700">{value}</p>
          </div>
        ))}
      </div>

      {/* Profile details */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
        {doctor.bio && (
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Bio</p>
            <p className="text-sm text-gray-600 leading-relaxed">{doctor.bio}</p>
          </div>
        )}
        {(doctor.careerMm || doctor.careerEn) && (
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Career Title</p>
            <p className="text-sm text-gray-700 font-semibold">{doctor.careerMm}</p>
            {doctor.careerEn && <p className="text-xs text-gray-400">{doctor.careerEn}</p>}
          </div>
        )}
        {doctor.qualifications && (
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Qualifications</p>
            <p className="text-sm text-gray-600">{doctor.qualifications}</p>
          </div>
        )}
        {doctor.languages && doctor.languages.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Languages</p>
            <div className="flex flex-wrap gap-1">
              {doctor.languages.map(l => (
                <span key={l} className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">{l}</span>
              ))}
            </div>
          </div>
        )}
        {doctor.location && (
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Location</p>
            <p className="text-sm text-gray-600">{doctor.location}</p>
          </div>
        )}
        {doctor.clinicTypesMm && doctor.clinicTypesMm.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Clinic Types</p>
            <div className="flex flex-col gap-1">
              {doctor.clinicTypesMm.map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: PRIMARY }} />
                  <span>{t}</span>
                  {doctor.clinicTypesEn?.[i] && <span className="text-gray-400 text-xs">/ {doctor.clinicTypesEn[i]}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
        {(doctor.clinicNote || doctor.clinicNoteEn) && (
          <div className="px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Clinic Note</p>
            {doctor.clinicNote && <p className="text-xs text-gray-500 leading-relaxed">{doctor.clinicNote}</p>}
            {doctor.clinicNoteEn && <p className="text-xs text-gray-400 mt-1 leading-relaxed italic">{doctor.clinicNoteEn}</p>}
          </div>
        )}
      </div>

      {/* Gallery Section */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-700 flex items-center gap-2"><Images className="w-4 h-4" style={{ color: PRIMARY }} /> Gallery</p>
            <p className="text-xs text-gray-400 mt-0.5">{gallery.length} photo{gallery.length !== 1 ? 's' : ''}</p>
          </div>
          {!editGallery ? (
            <button onClick={() => { setEditGallery(true); setError(''); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 text-gray-500 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-all">
              <Pencil className="w-4 h-4" /> Edit Gallery
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={saveGallery} disabled={savingGallery}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{ backgroundColor: PRIMARY }}>
                {savingGallery ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save
              </button>
              <button onClick={() => { setGallery(doctor.gallery ?? []); setEditGallery(false); }}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Existing photos */}
          {gallery.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {gallery.map((g, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-100" style={{ paddingBottom: '66%' }}>
                  <img src={g.imageUrl} alt={g.captionEn || ''} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                  {(g.captionMm || g.captionEn) && (
                    <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 text-[11px] text-white font-semibold bg-black/50">
                      {g.captionMm || g.captionEn}
                    </div>
                  )}
                  {editGallery && (
                    <button onClick={() => removeGalleryItem(i)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {editGallery && (
                    <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add new photo */}
          {editGallery && (
            <div className="border border-dashed border-gray-200 rounded-2xl p-4 flex flex-col gap-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Add Photo</p>
              <input className={inp} placeholder="Image URL (e.g. https://images.unsplash.com/...)"
                value={newImg.imageUrl} onChange={e => setNewImg(n => ({ ...n, imageUrl: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <input className={inp} placeholder="Caption (Myanmar)" value={newImg.captionMm}
                  onChange={e => setNewImg(n => ({ ...n, captionMm: e.target.value }))} />
                <input className={inp} placeholder="Caption (English)" value={newImg.captionEn}
                  onChange={e => setNewImg(n => ({ ...n, captionEn: e.target.value }))} />
              </div>
              {newImg.imageUrl && (
                <div className="h-28 rounded-xl overflow-hidden border border-gray-100">
                  <img src={newImg.imageUrl} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}
              <button onClick={addGalleryItem} disabled={!newImg.imageUrl.trim()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40"
                style={{ backgroundColor: PRIMARY }}>
                <Plus className="w-4 h-4" /> Add to Gallery
              </button>
            </div>
          )}

          {gallery.length === 0 && !editGallery && (
            <div className="text-center py-10">
              <Images className="w-8 h-8 mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">No gallery photos yet.</p>
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </div>

      {/* Weekly Schedule Section */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-700">Weekly Schedule</p>
            <p className="text-xs text-gray-400 mt-0.5">{slots.length} day{slots.length !== 1 ? 's' : ''} · 15 min slots</p>
          </div>
          {!editSlots ? (
            <button onClick={() => { setEditSlots(true); setError(''); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 text-gray-500 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-all">
              <Pencil className="w-4 h-4" /> Edit Slots
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={saveSlots} disabled={savingSlots}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{ backgroundColor: PRIMARY }}>
                {savingSlots ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save
              </button>
              <button onClick={() => { setSlots(doctor?.slots ?? []); setEditSlots(false); }}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col gap-4">
          {editSlots && (
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d, i) => {
                const active = !!slots.find(s => s.dayOfWeek === i);
                return (
                  <button key={d} onClick={() => toggleDay(i)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
                    style={{ backgroundColor: active ? PRIMARY : 'transparent', borderColor: active ? PRIMARY : '#e5e7eb', color: active ? '#fff' : '#9ca3af' }}>
                    {active ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    {DAYS_MM[i]}
                  </button>
                );
              })}
            </div>
          )}

          {slots.length === 0 ? (
            <div className="text-center py-10">
              <Clock className="w-8 h-8 mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">{editSlots ? 'နေ့ရက်တစ်ခုခု ရွေးချယ်ပါ' : 'No slots configured yet.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[...slots].sort((a, b) => a.dayOfWeek - b.dayOfWeek).map(slot => (
                <div key={slot.dayOfWeek} className="rounded-2xl border border-gray-100 p-4 flex flex-col gap-3"
                  style={{ backgroundColor: editSlots ? '#f9fafb' : '#f0fafa' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: PRIMARY }}>
                        {DAYS[slot.dayOfWeek][0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-700">{DAYS_MM[slot.dayOfWeek]}</p>
                        <p className="text-[10px] text-gray-400">{DAYS[slot.dayOfWeek]}</p>
                      </div>
                    </div>
                    {!editSlots && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: PRIMARY }}>
                        {slot.duration} min
                      </span>
                    )}
                  </div>
                  {editSlots ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className={lbl}>Start</label>
                        <input type="time" className={inp} value={slot.startTime}
                          onChange={e => updateSlot(slot.dayOfWeek, 'startTime', e.target.value)} /></div>
                      <div><label className={lbl}>End</label>
                        <input type="time" className={inp} value={slot.endTime}
                          onChange={e => updateSlot(slot.dayOfWeek, 'endTime', e.target.value)} /></div>
                      <div><label className={lbl}>Duration</label>
                        <div className={inp + ' flex items-center gap-2 text-gray-500'}>
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm font-semibold" style={{ color: PRIMARY }}>15 min</span>
                          <span className="text-xs text-gray-400">(fixed)</span>
                        </div>
                      </div>
                      <div><label className={lbl}>Max / Slot</label>
                        <input type="number" min={1} max={10} className={inp} value={slot.maxPerSlot}
                          onChange={e => updateSlot(slot.dayOfWeek, 'maxPerSlot', parseInt(e.target.value) || 1)} /></div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-semibold">{slot.startTime}</span>
                        <span className="text-gray-300">—</span>
                        <span className="font-semibold">{slot.endTime}</span>
                      </div>
                      <div className="text-xs text-gray-400">Max {slot.maxPerSlot}/slot</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </div>

    </div>
  );
}
