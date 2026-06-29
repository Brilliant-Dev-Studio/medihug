'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Phone, MapPin, Calendar, Users,
  CheckCircle2, XCircle, Clock, Ban, Stethoscope,
  Activity,
} from 'lucide-react';

const PRIMARY = '#2ab5ad';

/* ─────────────────────────────────────────────
   Shared mock data (would come from API)
───────────────────────────────────────────── */
const PATIENTS = [
  { id: 1,  name: 'Ma Hnin Wai',       phone: '09251234567', gender: 'Female', age: 28, birthday: '1998-03-12', state: 'Yangon',      township: 'Hlaing',         joinedDate: '2026-01-05', status: 'Active'   },
  { id: 2,  name: 'Ko Zaw Lin',        phone: '09261234567', gender: 'Male',   age: 35, birthday: '1991-07-22', state: 'Mandalay',    township: 'Chanmyathazi',   joinedDate: '2026-01-12', status: 'Active'   },
  { id: 3,  name: 'Daw Khin May',      phone: '09791234567', gender: 'Female', age: 52, birthday: '1974-11-05', state: 'Yangon',      township: 'Sanchaung',      joinedDate: '2026-02-03', status: 'Active'   },
  { id: 4,  name: 'Ko Naing Htike',    phone: '09421234567', gender: 'Male',   age: 41, birthday: '1985-01-30', state: 'Bago',        township: 'Bago Township',  joinedDate: '2026-02-18', status: 'Inactive' },
  { id: 5,  name: 'Ma Ei Phyu',        phone: '09501234567', gender: 'Female', age: 24, birthday: '2002-09-14', state: 'Yangon',      township: 'Thingangyun',    joinedDate: '2026-02-25', status: 'Active'   },
  { id: 6,  name: 'U Kyaw Thu',        phone: '09681234567', gender: 'Male',   age: 60, birthday: '1966-04-08', state: 'Sagaing',     township: 'Monywa',         joinedDate: '2026-03-07', status: 'Active'   },
  { id: 7,  name: 'Ma Thida Oo',       phone: '09311234567', gender: 'Female', age: 33, birthday: '1993-06-19', state: 'Mandalay',    township: 'Amarapura',      joinedDate: '2026-03-15', status: 'Active'   },
  { id: 8,  name: 'Ko Min Thura',      phone: '09451234567', gender: 'Male',   age: 29, birthday: '1997-12-01', state: 'Yangon',      township: 'Insein',         joinedDate: '2026-03-22', status: 'Inactive' },
  { id: 9,  name: 'Daw Su Su Myint',   phone: '09211234567', gender: 'Female', age: 47, birthday: '1979-08-25', state: 'Ayeyarwady',  township: 'Pathein',        joinedDate: '2026-04-01', status: 'Active'   },
  { id: 10, name: 'Ko Aung Kyaw',      phone: '09751234567', gender: 'Male',   age: 38, birthday: '1988-02-14', state: 'Yangon',      township: 'Tamwe',          joinedDate: '2026-04-10', status: 'Active'   },
  { id: 11, name: 'Ma Nwe Nwe Oo',     phone: '09551234567', gender: 'Female', age: 22, birthday: '2004-05-07', state: 'Mon',         township: 'Mawlamyine',     joinedDate: '2026-04-18', status: 'Active'   },
  { id: 12, name: 'Ko Pyae Sone',      phone: '09881234567', gender: 'Male',   age: 31, birthday: '1995-10-20', state: 'Yangon',      township: 'Kamayut',        joinedDate: '2026-04-25', status: 'Active'   },
  { id: 13, name: 'Daw Myint Myint',   phone: '09201234567', gender: 'Female', age: 55, birthday: '1971-03-18', state: 'Magway',      township: 'Magway Township',joinedDate: '2026-05-02', status: 'Inactive' },
  { id: 14, name: 'Ko Htet Aung',      phone: '09601234567', gender: 'Male',   age: 26, birthday: '2000-07-11', state: 'Yangon',      township: 'Dagon',          joinedDate: '2026-05-09', status: 'Active'   },
  { id: 15, name: 'Ma Kay Zin Thaw',   phone: '09701234567', gender: 'Female', age: 30, birthday: '1996-11-28', state: 'Naypyidaw',   township: 'Ottarathiri',    joinedDate: '2026-05-16', status: 'Active'   },
  { id: 16, name: 'U Win Naing',       phone: '09401234567', gender: 'Male',   age: 49, birthday: '1977-01-03', state: 'Shan',        township: 'Taunggyi',       joinedDate: '2026-05-22', status: 'Active'   },
  { id: 17, name: 'Ma Phyo Wai',       phone: '09901234567', gender: 'Female', age: 20, birthday: '2006-04-15', state: 'Yangon',      township: 'Shwepyithar',    joinedDate: '2026-06-01', status: 'Active'   },
  { id: 18, name: 'Ko Sithu Kyaw',     phone: '09271234567', gender: 'Male',   age: 44, birthday: '1982-09-09', state: 'Kachin',      township: 'Myitkyina',      joinedDate: '2026-06-08', status: 'Inactive' },
  { id: 19, name: 'Daw Aye Aye Win',   phone: '09811234567', gender: 'Female', age: 58, birthday: '1968-06-30', state: 'Yangon',      township: 'Mingaladon',     joinedDate: '2026-06-15', status: 'Active'   },
  { id: 20, name: 'Ko Thiha Zaw',      phone: '09241234567', gender: 'Male',   age: 37, birthday: '1989-12-22', state: 'Rakhine',     township: 'Sittwe',         joinedDate: '2026-06-22', status: 'Active'   },
];

type ApptStatus = 'Completed' | 'Pending' | 'Cancelled';
interface Appointment {
  id:      number;
  doctor:  string;
  clinic:  string;
  date:    string;
  time:    string;
  reason:  string;
  status:  ApptStatus;
}

/* Per-patient appointment history (seeded by patient id) */
function getAppointments(patientId: number): Appointment[] {
  const doctors = ['Dr. Aung Ko', 'Dr. Su Su Khin', 'Dr. Thida Myint', 'Dr. Kyaw Zin', 'Dr. Win Htun'];
  const clinics  = ['City Medical Center', 'Asia Royal Hospital', 'Pun Hlaing Hospital', 'Sanpya Hospital'];
  const reasons  = ['General Checkup', 'Fever & Headache', 'Blood Pressure', 'Follow-up Visit', 'Skin Rash', 'Back Pain'];
  const statuses: ApptStatus[] = ['Completed', 'Completed', 'Completed', 'Pending', 'Cancelled'];
  const base = 2026;
  return Array.from({ length: 5 }, (_, i) => ({
    id:     patientId * 100 + i + 1,
    doctor: doctors[(patientId + i) % doctors.length],
    clinic: clinics[(patientId + i) % clinics.length],
    date:   `${base}-${String(Math.max(1, (patientId + i) % 12 + 1)).padStart(2,'0')}-${String((i * 7 + patientId) % 28 + 1).padStart(2,'0')}`,
    time:   `${String((9 + i * 2) % 12 || 12).padStart(2,'0')}:${i % 2 === 0 ? '00' : '30'} ${9 + i * 2 < 12 ? 'AM' : 'PM'}`,
    reason: reasons[(patientId + i) % reasons.length],
    status: statuses[i % statuses.length],
  })).sort((a, b) => b.date.localeCompare(a.date));
}

/* ─────────────────────────────────────────────
   Status badge config
───────────────────────────────────────────── */
const STATUS_MAP = {
  Completed: { color: '#10b981', bg: '#ecfdf5', icon: CheckCircle2 },
  Pending:   { color: '#f59e0b', bg: '#fffbeb', icon: Clock        },
  Cancelled: { color: '#ef4444', bg: '#fef2f2', icon: Ban          },
};

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router  = useRouter();

  const patient     = PATIENTS.find(p => p.id === Number(id));
  const appointments = patient ? getAppointments(patient.id) : [];

  if (!patient) {
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
  const avatarColor  = avatarColors[patient.id % avatarColors.length];
  const initials     = patient.name.split(' ').map(w => w[0]).join('').slice(0, 2);

  const completed  = appointments.filter(a => a.status === 'Completed').length;
  const pending    = appointments.filter(a => a.status === 'Pending').length;
  const cancelled  = appointments.filter(a => a.status === 'Cancelled').length;

  return (
    <div className="flex flex-col gap-5">

      {/* ── Back button ── */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-gray-700 transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Patients
      </button>

      {/* ── Profile hero card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0"
          style={{ backgroundColor: avatarColor }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg font-bold text-gray-800">{patient.name}</h1>
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${patient.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-400'}`}>
              {patient.status === 'Active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              {patient.status}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">Patient #{String(patient.id).padStart(4, '0')} · Joined {patient.joinedDate}</p>
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
                { icon: Users,    label: 'Gender',   value: patient.gender },
                { icon: Calendar, label: 'Birthday', value: `${patient.birthday}` },
                { icon: Activity, label: 'Age',      value: `${patient.age} years old` },
                { icon: MapPin,   label: 'Township', value: patient.township },
                { icon: MapPin,   label: 'State',    value: patient.state },
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
            {appointments.map(appt => {
              const s       = STATUS_MAP[appt.status];
              const Icon    = s.icon;
              return (
                <div key={appt.id} className="px-5 py-4 hover:bg-gray-50/60 transition-colors">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-gray-700">{appt.doctor}</p>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: s.bg, color: s.color }}>
                          <Icon className="w-3 h-3" />
                          {appt.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{appt.clinic}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3 text-gray-400" /> {appt.date}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3 text-gray-400" /> {appt.time}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-xl shrink-0 border border-gray-100">
                      {appt.reason}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
