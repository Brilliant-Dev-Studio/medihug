'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Phone, MapPin, Stethoscope,
  Languages, GraduationCap, Building2, Users, BadgeCheck, MessageCircle,
} from 'lucide-react';

const PRIMARY = '#2ab5ad';
const DARK    = '#1a9990';
const DAYS_MM = ['တနင်္ဂနွေ', 'တနင်္လာ', 'အင်္ဂါ', 'ဗုဒ္ဓဟူး', 'ကြာသပတေး', 'သောကြာ', 'စနေ'];
const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Slot { dayOfWeek: number; startTime: string; endTime: string; duration: number; maxPerSlot: number; }
interface Doctor {
  name: string; nameEn: string | null; specialty: string; bio: string | null;
  phone: string | null; phoneSecondary: string | null; viber: string | null;
  imageUrl: string | null; experience: number; rating: number; reviewCount: number; price: number;
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

export default function DoctorProfilePage() {
  const [doctor, setDoctor]   = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/doctor/profile').then(r => r.json()).then(d => {
      setDoctor(d.doctor ?? null);
      setLoading(false);
    });
  }, []);

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
        <div className="relative h-32 sm:h-40" style={{ background: `linear-gradient(120deg, ${PRIMARY} 0%, ${DARK} 60%, #14625c 100%)` }}>
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.14) 0%, transparent 70%)' }} />
          <div className="absolute -bottom-16 left-1/3 w-56 h-56 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)' }} />

          <span
            className="absolute top-3.5 right-3.5 inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm"
            style={doctor.isAvailable
              ? { backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }
              : { backgroundColor: 'rgba(0,0,0,0.25)', color: 'rgba(255,255,255,0.8)' }}
          >
            {doctor.isAvailable ? 'Available for booking' : 'Unavailable'}
          </span>
        </div>

        {/* Avatar + identity */}
        <div className="px-5 sm:px-8 pb-6">
          <div className="flex items-end gap-4 -mt-12 sm:-mt-14">
            <div className="relative shrink-0">
              {doctor.imageUrl ? (
                <img src={doctor.imageUrl} alt={doctor.name} className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-white shadow-lg" />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-3xl font-bold text-white ring-4 ring-white shadow-lg" style={{ backgroundColor: PRIMARY }}>
                  {doctor.name.charAt(0)}
                </div>
              )}
              <span className="absolute bottom-1 right-1 w-7 h-7 rounded-full flex items-center justify-center ring-4 ring-white" style={{ backgroundColor: PRIMARY }}>
                <BadgeCheck className="w-4 h-4 text-white" />
              </span>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{doctor.name}</h1>
              <BadgeCheck className="w-4.5 h-4.5 shrink-0" style={{ color: PRIMARY }} />
            </div>
            {doctor.nameEn && <p className="text-sm text-gray-400 mt-0.5">{doctor.nameEn}</p>}
            <p className="text-sm font-semibold mt-1.5" style={{ color: PRIMARY }}>{doctor.specialty}</p>
            {doctor.bio && <p className="text-sm text-gray-600 leading-relaxed mt-3 max-w-xl">{doctor.bio}</p>}
            {doctor.location && (
              <p className="flex items-center gap-1.5 text-xs text-gray-400 mt-3">
                <MapPin size={12} /> {doctor.location}
              </p>
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
        This info was set up by MediHug admin. Contact admin to request changes.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Section title="Contact" icon={Phone} index={0}>
          <Row label="Main Phone" value={doctor.phone} />
          <Row label="Secondary Phone" value={doctor.phoneSecondary} />
          <Row label="Viber" value={doctor.viber} />
          <Row label="Location" value={doctor.location} />
        </Section>

        <Section title="Professional" icon={GraduationCap} index={1}>
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
        </Section>

        {(doctor.clinicNote || doctor.clinicNoteEn) && (
          <Section title="Clinic Note" icon={Building2} index={2}>
            {doctor.clinicNote && <p className="text-sm text-gray-600 leading-relaxed">{doctor.clinicNote}</p>}
            {doctor.clinicNoteEn && <p className="text-xs text-gray-400 leading-relaxed italic mt-1">{doctor.clinicNoteEn}</p>}
          </Section>
        )}

        {doctor.clinicTypesMm.length > 0 && (
          <Section title="Services" icon={MessageCircle} index={3}>
            <div className="flex flex-wrap gap-1.5">
              {doctor.clinicTypesMm.map(t => (
                <span key={t} className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: '#e6f7f7', color: DARK }}>{t}</span>
              ))}
            </div>
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
