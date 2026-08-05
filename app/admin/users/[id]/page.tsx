'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Phone, MapPin, Calendar, Users,
  CheckCircle2, XCircle, Clock, Ban, Stethoscope,
  Activity, Trash2, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/admin/ConfirmModal';

const PRIMARY = '#2ab5ad';

interface Appointment {
  id: string;
  date: string; time: string | null; reason: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  doctor: { name: string } | null;
  clinic: { name: string } | null;
}
interface Patient {
  id: string; name: string; phone: string;
  gender: 'MALE' | 'FEMALE' | null;
  birthday: string | null;
  state: string | null; township: string | null;
  isActive: boolean; createdAt: string;
  appointments: Appointment[];
}

const STATUS_MAP = {
  COMPLETED: { color: '#10b981', bg: '#ecfdf5', icon: CheckCircle2, label: 'Completed' },
  CONFIRMED: { color: '#3b82f6', bg: '#eff6ff', icon: CheckCircle2, label: 'Confirmed' },
  PENDING:   { color: '#f59e0b', bg: '#fffbeb', icon: Clock,        label: 'Pending'   },
  CANCELLED: { color: '#ef4444', bg: '#fef2f2', icon: Ban,          label: 'Cancelled' },
};

function age(birthday: string | null) {
  if (!birthday) return null;
  const b = new Date(birthday);
  const now = new Date();
  let a = now.getFullYear() - b.getFullYear();
  if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) a--;
  return a;
}

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router  = useRouter();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showRemove, setShowRemove] = useState(false);
  const [removing, setRemoving] = useState(false);

  const fetchPatient = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/users/${id}`);
    if (!res.ok) { setNotFound(true); setLoading(false); return; }
    const data = await res.json();
    setPatient(data.user);
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchPatient(); }, [fetchPatient]);

  const confirmRemove = async () => {
    if (!patient) return;
    setRemoving(true);
    try {
      const res = await fetch(`/api/admin/users/${patient.id}`, { method: 'DELETE' });
      if (!res.ok) { toast.error('Failed to delete patient'); return; }
      toast.success('Patient deleted');
      router.push('/admin/users');
    } catch {
      toast.error('Failed to delete patient');
    } finally {
      setRemoving(false);
      setShowRemove(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    );
  }

  if (notFound || !patient) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-lg font-bold text-gray-600">Patient not found</p>
          <button onClick={() => router.back()} className="mt-4 text-sm font-semibold" style={{ color: PRIMARY }}>← Back to list</button>
        </div>
      </div>
    );
  }

  const avatarColors = ['#2ab5ad','#8b5cf6','#f59e0b','#3b82f6','#10b981'];
  const avatarColor  = avatarColors[patient.name.length % avatarColors.length];
  const initials     = patient.name.split(' ').map(w => w[0]).join('').slice(0, 2);
  const patientAge   = age(patient.birthday);

  const appointments = patient.appointments;
  const completed  = appointments.filter(a => a.status === 'COMPLETED').length;
  const pending    = appointments.filter(a => a.status === 'PENDING').length;
  const cancelled  = appointments.filter(a => a.status === 'CANCELLED').length;

  return (
    <div className="flex flex-col gap-5">

      {/* ── Back button ── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-gray-700 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Patients
        </button>
        <button
          onClick={() => setShowRemove(true)}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all hover:border-red-300 hover:text-red-600 hover:bg-red-50"
          style={{ borderColor: '#e5e7eb', color: '#6b7280' }}
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete Patient
        </button>
      </div>

      {/* ── Profile hero card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0"
          style={{ backgroundColor: avatarColor }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg font-bold text-gray-800">{patient.name}</h1>
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${patient.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-400'}`}>
              {patient.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              {patient.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">Joined {new Date(patient.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Left: Info ── */}
        <div className="flex flex-col gap-4">

          {/* Personal Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Personal Info</p>
            <div className="flex flex-col gap-3.5">
              {[
                { icon: Phone,    label: 'Phone',    value: patient.phone },
                { icon: Users,    label: 'Gender',   value: patient.gender ? (patient.gender === 'MALE' ? 'Male' : 'Female') : '—' },
                { icon: Calendar, label: 'Birthday', value: patient.birthday ? new Date(patient.birthday).toLocaleDateString() : '—' },
                { icon: Activity, label: 'Age',      value: patientAge !== null ? `${patientAge} years old` : '—' },
                { icon: MapPin,   label: 'Township', value: patient.township ?? '—' },
                { icon: MapPin,   label: 'State',    value: patient.state ?? '—' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#e6f7f7' }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest leading-none">{label}</p>
                    <p className="text-sm font-semibold text-gray-700 mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Appointment summary */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Appointment Summary</p>
            <div className="flex flex-col gap-2.5">
              {[
                { label: 'Total',     value: appointments.length, color: PRIMARY,   bg: '#e6f7f7' },
                { label: 'Completed', value: completed,           color: '#10b981', bg: '#ecfdf5' },
                { label: 'Pending',   value: pending,             color: '#f59e0b', bg: '#fffbeb' },
                { label: 'Cancelled', value: cancelled,           color: '#ef4444', bg: '#fef2f2' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ backgroundColor: s.bg }}>
                  <p className="text-xs font-semibold" style={{ color: s.color }}>{s.label}</p>
                  <p className="text-sm font-bold" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── Right: Appointment history ── */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <Stethoscope className="w-4 h-4" style={{ color: PRIMARY }} />
            <p className="text-sm font-bold text-gray-700">Appointment History</p>
          </div>

          <div className="divide-y divide-gray-50">
            {appointments.length === 0 ? (
              <p className="px-5 py-10 text-sm text-gray-400 text-center">No appointments yet.</p>
            ) : appointments.map(appt => {
              const s    = STATUS_MAP[appt.status];
              const Icon = s.icon;
              return (
                <div key={appt.id} className="px-5 py-4 hover:bg-gray-50/60 transition-colors">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-gray-700">{appt.doctor?.name ?? '—'}</p>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: s.bg, color: s.color }}>
                          <Icon className="w-3 h-3" />
                          {s.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{appt.clinic?.name ?? '—'}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3 text-gray-400" /> {new Date(appt.date).toLocaleDateString()}
                        </span>
                        {appt.time && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3 text-gray-400" /> {appt.time}
                          </span>
                        )}
                      </div>
                    </div>
                    {appt.reason && (
                      <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-xl shrink-0 border border-gray-100">
                        {appt.reason}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <ConfirmModal
        open={showRemove}
        title="Delete patient permanently?"
        message={`"${patient.name}" and all related data (${appointments.length} appointment(s), favorites, custom time requests) will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={removing}
        onConfirm={confirmRemove}
        onCancel={() => setShowRemove(false)}
      />
    </div>
  );
}
