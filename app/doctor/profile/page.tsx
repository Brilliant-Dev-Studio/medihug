'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Phone, MapPin, Stethoscope,
  Languages, GraduationCap, Building2, Users, BadgeCheck, MessageCircle,
  Camera, Loader2, Pencil, Check, X,
} from 'lucide-react';
import { compressAndUpload } from '@/components/admin/uploadImage';

const PRIMARY = '#2ab5ad';
const DARK    = '#1a9990';
const DAYS_MM = ['တနင်္ဂနွေ', 'တနင်္လာ', 'အင်္ဂါ', 'ဗုဒ္ဓဟူး', 'ကြာသပတေး', 'သောကြာ', 'စနေ'];
const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Slot { dayOfWeek: number; startTime: string; endTime: string; duration: number; maxPerSlot: number; }
interface Doctor {
  name: string; nameEn: string | null; specialty: string; bio: string | null;
  phone: string | null; phoneSecondary: string | null; viber: string | null;
  imageUrl: string | null; coverUrl: string | null; experience: number; rating: number; reviewCount: number; price: number;
  isAvailable: boolean; qualifications: string | null; careerMm: string | null; careerEn: string | null;
  clinicNote: string | null; clinicNoteEn: string | null; location: string | null;
  languages: string[]; clinicTypesMm: string[]; clinicTypesEn: string[];
  slots: Slot[];
}

function Section({ title, icon: Icon, children, index = 0 }: { title: string; icon: React.ElementType; children: React.ReactNode; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)] p-6 space-y-4"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#e6f7f7' }}>
          <Icon className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
        </div>
        <h2 className="font-bold text-gray-700 text-sm">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <p className="text-xs text-gray-400 shrink-0">{label}</p>
      <p className="text-sm text-gray-700 font-medium text-right">{value}</p>
    </div>
  );
}

function StatColumn({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center px-4 sm:px-6">
      <p className="text-lg sm:text-xl font-bold text-gray-800 tabular-nums leading-none">{value}</p>
      <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1.5 uppercase tracking-wide font-semibold">{label}</p>
    </div>
  );
}

function Skel({ className }: { className: string }) {
  return <div className={`bg-gray-100 rounded-md animate-pulse ${className}`} />;
}

function ProfileSkeleton() {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <Skel className="h-32 sm:h-40 rounded-none" />
        <div className="px-5 sm:px-8 pb-6">
          <div className="-mt-12 sm:-mt-14 mb-4">
            <Skel className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-white" />
          </div>
          <Skel className="w-40 h-5 mb-2" />
          <Skel className="w-28 h-3 mb-3" />
          <Skel className="w-full max-w-md h-3 mb-1.5" />
          <Skel className="w-2/3 max-w-sm h-3" />
          <div className="flex items-center divide-x divide-gray-100 mt-5 -ml-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 px-4 sm:px-6">
                <Skel className="w-8 h-5" />
                <Skel className="w-12 h-2.5" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <Skel className="w-7 h-7 rounded-lg" />
              <Skel className="w-24 h-3.5" />
            </div>
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="flex items-center justify-between gap-4">
                <Skel className="w-20 h-2.5" />
                <Skel className="w-24 h-2.5" />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Skel className="w-7 h-7 rounded-lg" />
          <Skel className="w-32 h-3.5" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skel key={i} className="h-16 rounded-xl" />)}
        </div>
      </div>
    </div>
  );
}

interface EditForm {
  bio: string; phoneSecondary: string; viber: string; location: string;
  careerMm: string; careerEn: string; qualifications: string;
  clinicNote: string; clinicNoteEn: string;
  languagesRaw: string; clinicTypesMmRaw: string; clinicTypesEnRaw: string;
}

function toForm(d: Doctor): EditForm {
  return {
    bio: d.bio ?? '', phoneSecondary: d.phoneSecondary ?? '', viber: d.viber ?? '', location: d.location ?? '',
    careerMm: d.careerMm ?? '', careerEn: d.careerEn ?? '', qualifications: d.qualifications ?? '',
    clinicNote: d.clinicNote ?? '', clinicNoteEn: d.clinicNoteEn ?? '',
    languagesRaw: d.languages.join(', '),
    clinicTypesMmRaw: d.clinicTypesMm.join('\n'), clinicTypesEnRaw: d.clinicTypesEn.join('\n'),
  };
}

const inp = 'w-full text-sm text-gray-700 placeholder-gray-300 rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-teal-400 transition-colors';
const lbl = 'text-xs text-gray-400 mb-1 block';

export default function DoctorProfilePage() {
  const [doctor, setDoctor]   = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState<EditForm | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUploading, setCoverUploading]   = useState(false);
  const [availToggling, setAvailToggling]     = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/doctor/profile').then(r => r.json()).then(d => {
      setDoctor(d.doctor ?? null);
      setLoading(false);
    });
  }, []);

  const set = (k: keyof EditForm, v: string) => setForm(f => f ? { ...f, [k]: v } : f);

  // Safe response parsing — a server error (e.g. 500 with no body) shouldn't crash the page.
  async function patchProfile(body: Record<string, unknown>): Promise<Doctor | null> {
    const res = await fetch('/api/doctor/profile', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    let data: { doctor?: Doctor; error?: string } = {};
    try { data = await res.json(); } catch { /* empty/non-JSON body */ }
    if (!res.ok) { console.error('Profile update failed:', data.error ?? res.status); return null; }
    return data.doctor ?? null;
  }

  const startEdit = () => { if (doctor) { setForm(toForm(doctor)); setEditing(true); } };
  const cancelEdit = () => { setEditing(false); setForm(null); };

  const saveEdit = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const updated = await patchProfile({
        bio: form.bio || null,
        phoneSecondary: form.phoneSecondary || null,
        viber: form.viber || null,
        location: form.location || null,
        careerMm: form.careerMm || null,
        careerEn: form.careerEn || null,
        qualifications: form.qualifications || null,
        clinicNote: form.clinicNote || null,
        clinicNoteEn: form.clinicNoteEn || null,
        languages: form.languagesRaw.split(',').map(s => s.trim()).filter(Boolean),
        clinicTypesMm: form.clinicTypesMmRaw.split('\n').map(s => s.trim()).filter(Boolean),
        clinicTypesEn: form.clinicTypesEnRaw.split('\n').map(s => s.trim()).filter(Boolean),
      });
      if (updated) { setDoctor(updated); setEditing(false); setForm(null); }
    } finally { setSaving(false); }
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setAvatarUploading(true);
    try {
      const url = await compressAndUpload(file, () => {});
      const updated = await patchProfile({ imageUrl: url });
      if (updated) setDoctor(updated);
    } finally { setAvatarUploading(false); }
  };

  const handleCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setCoverUploading(true);
    try {
      const url = await compressAndUpload(file, () => {});
      const updated = await patchProfile({ coverUrl: url });
      if (updated) setDoctor(updated);
    } finally { setCoverUploading(false); }
  };

  const toggleAvailable = async () => {
    if (!doctor) return;
    setAvailToggling(true);
    const next = !doctor.isAvailable;
    try {
      const updated = await patchProfile({ isAvailable: next });
      if (updated) setDoctor(updated);
    } finally { setAvailToggling(false); }
  };

  if (loading) return <ProfileSkeleton />;
  if (!doctor) return (
    <div className="flex items-center justify-center h-[60vh] text-gray-400">Profile not found</div>
  );

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5">
      {/* Profile card — cover + overlapping avatar, social-profile style */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)] overflow-hidden"
      >
        {/* Cover */}
        <div className="relative h-32 sm:h-40 overflow-hidden" style={!doctor.coverUrl ? { background: `linear-gradient(120deg, ${PRIMARY} 0%, ${DARK} 60%, #14625c 100%)` } : undefined}>
          {doctor.coverUrl ? (
            <>
              <img src={doctor.coverUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 100%)' }} />
            </>
          ) : (
            <>
              <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.14) 0%, transparent 70%)' }} />
              <div className="absolute -bottom-16 left-1/3 w-56 h-56 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)' }} />
            </>
          )}

          {coverUploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}

          <button
            onClick={toggleAvailable}
            disabled={availToggling}
            className="absolute top-3.5 right-3.5 inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm disabled:opacity-60 transition-opacity"
            style={doctor.isAvailable
              ? { backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }
              : { backgroundColor: 'rgba(0,0,0,0.25)', color: 'rgba(255,255,255,0.8)' }}
          >
            {availToggling ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
            {doctor.isAvailable ? 'Available for booking' : 'Unavailable'}
          </button>

          <button onClick={() => coverFileRef.current?.click()} disabled={coverUploading}
            className="absolute bottom-3.5 right-3.5 inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-full backdrop-blur-sm disabled:opacity-50 transition-opacity"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
            <Camera className="w-3.5 h-3.5" /> Edit Banner
          </button>
          <input ref={coverFileRef} type="file" accept="image/*" className="hidden" onChange={handleCover} />
        </div>

        {/* Avatar + identity */}
        <div className="px-5 sm:px-8 pb-6">
          <div className="flex items-end justify-between gap-4 -mt-12 sm:-mt-14">
            <div className="relative shrink-0">
              {doctor.imageUrl ? (
                <img src={doctor.imageUrl} alt={doctor.name} className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-white shadow-lg" />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-3xl font-bold text-white ring-4 ring-white shadow-lg" style={{ backgroundColor: PRIMARY }}>
                  {doctor.name.charAt(0)}
                </div>
              )}
              {avatarUploading && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
              <button onClick={() => fileRef.current?.click()} disabled={avatarUploading}
                className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center disabled:opacity-50">
                <Camera className="w-4 h-4" style={{ color: PRIMARY }} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            </div>

            {!editing ? (
              <button onClick={startEdit}
                className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shrink-0">
                <Pencil className="w-3.5 h-3.5" /> Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={cancelEdit} disabled={saving}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50">
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
                <button onClick={saveEdit} disabled={saving}
                  className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl text-white disabled:opacity-60"
                  style={{ backgroundColor: PRIMARY }}>
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
                </button>
              </div>
            )}
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{doctor.name}</h1>
              <BadgeCheck className="w-4.5 h-4.5 shrink-0" style={{ color: PRIMARY }} />
            </div>
            {doctor.nameEn && <p className="text-sm text-gray-400 mt-0.5">{doctor.nameEn}</p>}
            <p className="text-sm font-semibold mt-1.5" style={{ color: PRIMARY }}>{doctor.specialty}</p>

            {editing && form ? (
              <textarea rows={3} className={inp + ' mt-3 max-w-xl resize-none'} placeholder="Bio"
                value={form.bio} onChange={e => set('bio', e.target.value)} />
            ) : (
              doctor.bio && <p className="text-sm text-gray-600 leading-relaxed mt-3 max-w-xl">{doctor.bio}</p>
            )}

            {editing && form ? (
              <input className={inp + ' mt-3 max-w-xs'} placeholder="Location" value={form.location} onChange={e => set('location', e.target.value)} />
            ) : (
              doctor.location && (
                <p className="flex items-center gap-1.5 text-xs text-gray-400 mt-3">
                  <MapPin size={12} /> {doctor.location}
                </p>
              )
            )}
          </div>

          {/* Stats row — social-profile style */}
          <div className="flex items-center divide-x divide-gray-100 mt-5 -ml-1">
            <StatColumn value={doctor.rating.toFixed(1)} label="Rating" />
            <StatColumn value={String(doctor.reviewCount)} label="Reviews" />
            <StatColumn value={`${doctor.experience}y`} label="Experience" />
            <StatColumn value={`${doctor.price.toLocaleString()}`} label="Fee (Ks)" />
          </div>
        </div>
      </motion.div>

      <p className="text-xs text-gray-400 px-1">
        {editing
          ? 'Name, specialty, fee, experience and weekly schedule are set by MediHug admin — everything else here is yours to edit.'
          : 'Tap "Edit Profile" to update your bio, contact info, qualifications and services.'}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Section title="Contact" icon={Phone} index={0}>
          <Row label="Main Phone" value={doctor.phone} />
          {editing && form ? (
            <>
              <div><label className={lbl}>Secondary Phone</label><input className={inp} value={form.phoneSecondary} onChange={e => set('phoneSecondary', e.target.value)} /></div>
              <div><label className={lbl}>Viber</label><input className={inp} value={form.viber} onChange={e => set('viber', e.target.value)} /></div>
            </>
          ) : (
            <>
              <Row label="Secondary Phone" value={doctor.phoneSecondary} />
              <Row label="Viber" value={doctor.viber} />
            </>
          )}
          <Row label="Location" value={doctor.location} />
        </Section>

        <Section title="Professional" icon={GraduationCap} index={1}>
          {editing && form ? (
            <div className="flex flex-col gap-3">
              <div><label className={lbl}>Career Title (Myanmar)</label><input className={inp} value={form.careerMm} onChange={e => set('careerMm', e.target.value)} /></div>
              <div><label className={lbl}>Career Title (English)</label><input className={inp} value={form.careerEn} onChange={e => set('careerEn', e.target.value)} /></div>
              <div><label className={lbl}>Qualifications</label><input className={inp} value={form.qualifications} onChange={e => set('qualifications', e.target.value)} placeholder="M.B.,B.S | DCH | MRCP" /></div>
              <div><label className={lbl}>Languages (comma-separated)</label><input className={inp} value={form.languagesRaw} onChange={e => set('languagesRaw', e.target.value)} placeholder="Myanmar, English" /></div>
            </div>
          ) : (
            <>
              <Row label="Career Title" value={doctor.careerMm} />
              <Row label="Career Title (EN)" value={doctor.careerEn} />
              <Row label="Qualifications" value={doctor.qualifications} />
              {doctor.languages.length > 0 && (
                <div className="flex items-start justify-between gap-4 py-1.5">
                  <p className="text-xs text-gray-400 shrink-0 flex items-center gap-1"><Languages size={12} /> Languages</p>
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    {doctor.languages.map(l => (
                      <span key={l} className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-50 text-gray-600">{l}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </Section>

        {(editing || doctor.clinicNote || doctor.clinicNoteEn) && (
          <Section title="Clinic Note" icon={Building2} index={2}>
            {editing && form ? (
              <div className="flex flex-col gap-3">
                <div><label className={lbl}>Note (Myanmar)</label><textarea rows={3} className={inp + ' resize-none'} value={form.clinicNote} onChange={e => set('clinicNote', e.target.value)} /></div>
                <div><label className={lbl}>Note (English)</label><textarea rows={3} className={inp + ' resize-none'} value={form.clinicNoteEn} onChange={e => set('clinicNoteEn', e.target.value)} /></div>
              </div>
            ) : (
              <>
                {doctor.clinicNote && <p className="text-sm text-gray-600 leading-relaxed">{doctor.clinicNote}</p>}
                {doctor.clinicNoteEn && <p className="text-xs text-gray-400 leading-relaxed italic mt-1">{doctor.clinicNoteEn}</p>}
              </>
            )}
          </Section>
        )}

        {(editing || doctor.clinicTypesMm.length > 0) && (
          <Section title="Services" icon={MessageCircle} index={3}>
            {editing && form ? (
              <div className="flex flex-col gap-3">
                <div><label className={lbl}>Services (Myanmar, one per line)</label><textarea rows={4} className={inp + ' resize-none'} value={form.clinicTypesMmRaw} onChange={e => set('clinicTypesMmRaw', e.target.value)} /></div>
                <div><label className={lbl}>Services (English, one per line)</label><textarea rows={4} className={inp + ' resize-none'} value={form.clinicTypesEnRaw} onChange={e => set('clinicTypesEnRaw', e.target.value)} /></div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {doctor.clinicTypesMm.map(t => (
                  <span key={t} className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: '#e6f7f7', color: DARK }}>{t}</span>
                ))}
              </div>
            )}
          </Section>
        )}
      </div>

      {/* Weekly schedule */}
      <Section title="Weekly Schedule" icon={Users} index={4}>
        {doctor.slots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <Stethoscope size={28} strokeWidth={1.2} />
            <p className="mt-2 text-xs">No weekly slots set yet — contact admin to set up your schedule.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[...doctor.slots].sort((a, b) => a.dayOfWeek - b.dayOfWeek).map(slot => (
              <div key={slot.dayOfWeek} className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: PRIMARY }}>
                  {DAYS_EN[slot.dayOfWeek][0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-700">{DAYS_MM[slot.dayOfWeek]} · {DAYS_EN[slot.dayOfWeek]}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{slot.startTime} – {slot.endTime} · {slot.duration} min · max {slot.maxPerSlot}/slot</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
