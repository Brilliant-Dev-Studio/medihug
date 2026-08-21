'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2, ClipboardCheck, HeartPulse, Eye } from 'lucide-react';

const PRIMARY = '#2ab5ad';

interface Enrollment {
  id: string;
  createdAt: string;
  user: { name: string; phone: string; profileImage: string | null };
  program: { id: string; titleMm: string; titleEn: string | null; imageUrl: string };
}

export default function DoctorProgramsPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/doctor/programs')
      .then(r => r.json())
      .then(d => setEnrollments(d.enrollments ?? []))
      .finally(() => setLoading(false));
  }, []);

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#e6f7f7' }}>
          <HeartPulse className="w-4.5 h-4.5" style={{ color: PRIMARY }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Program Patients</h1>
          <p className="text-sm text-gray-500 mt-0.5">Approved medical records for programs you&apos;re on · {enrollments.length} patients</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin" style={{ color: PRIMARY }} /></div>
      ) : enrollments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <ClipboardCheck size={40} strokeWidth={1.2} />
          <p className="mt-3 text-sm">No approved program patients yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          {enrollments.map(e => (
            <button key={e.id} onClick={() => router.push(`/doctor/programs/${e.id}`)}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/60 transition-colors text-left">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-gray-100 bg-gray-50">
                <Image src={e.program.imageUrl} alt={e.program.titleMm} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{e.user.name}</p>
                <p className="text-xs text-gray-400 truncate">{e.user.phone} · {e.program.titleEn ?? e.program.titleMm}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <p className="text-xs text-gray-400">{fmtDate(e.createdAt)}</p>
                <Eye size={14} className="text-gray-300" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
