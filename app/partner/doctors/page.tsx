'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Stethoscope, Star } from 'lucide-react';

const PRIMARY = '#3b5bdb';

interface Doctor {
  id: string; name: string; nameEn: string | null;
  specialty: string; specialtyEn: string | null;
  imageUrl: string | null; rating: number; reviewCount: number;
}

export default function PartnerDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/partner/doctors')
      .then(r => r.json())
      .then(d => setDoctors(d.doctors ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto flex flex-col gap-4">
      <h1 className="text-lg font-bold text-gray-800">Doctors</h1>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : doctors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <Stethoscope className="w-8 h-8 mx-auto text-gray-200 mb-2" />
          <p className="text-sm text-gray-400">No doctors linked to this clinic yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map(d => (
            <div key={d.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-3">
              {d.imageUrl ? (
                <Image src={d.imageUrl} alt={d.name} width={48} height={48} className="w-12 h-12 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ backgroundColor: PRIMARY }}>
                  {d.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{d.nameEn ?? d.name}</p>
                <p className="text-xs text-gray-400 truncate">{d.specialtyEn ?? d.specialty}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-xs text-gray-500">{d.rating.toFixed(1)} ({d.reviewCount})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
