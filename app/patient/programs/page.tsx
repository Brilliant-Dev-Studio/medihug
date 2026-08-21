'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, HeartPulse } from 'lucide-react';
import { useLang } from '../../lib/LanguageContext';

const PRIMARY = 'var(--color-primary)';

interface Program {
  id: string; imageUrl: string; titleMm: string; titleEn: string | null;
  descMm: string | null; descEn: string | null; price: number;
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
      <div className="h-36 bg-gray-100 animate-pulse" />
      <div className="p-4 flex flex-col gap-2">
        <div className="h-4 bg-gray-100 rounded-lg animate-pulse w-3/4" />
        <div className="h-3 bg-gray-100 rounded-lg animate-pulse w-1/2" />
      </div>
    </div>
  );
}

export default function PatientProgramsPage() {
  const router = useRouter();
  const { lang } = useLang();
  const mm = lang === 'mm';

  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch('/api/healthcare-programs')
      .then(r => r.json())
      .then(d => setPrograms((d.programs ?? []).filter((p: Program) => p.price > 0)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-full bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 lg:px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center shrink-0 transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>
        <div>
          <h1 className="text-base font-bold text-gray-800">{mm ? 'ကျန်းမာရေး အစီအစဉ်များ' : 'Healthcare Programs'}</h1>
          <p className="text-xs text-gray-400">{mm ? 'ဝယ်ယူနိုင်သော အစီအစဉ်များ' : 'Programs you can enroll in'}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : programs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-300 rounded-2xl border border-gray-100 bg-white gap-2">
            <HeartPulse className="w-10 h-10" />
            <p className="text-sm text-gray-400">{mm ? 'ဝယ်ယူနိုင်သော အစီအစဉ် မရှိသေးပါ' : 'No programs available yet'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs.map(p => {
              const title = mm ? p.titleMm : (p.titleEn ?? p.titleMm);
              const desc  = mm ? (p.descMm ?? p.descEn) : (p.descEn ?? p.descMm);
              return (
                <Link key={p.id} href={`/patient/programs/${p.id}`}
                  className="rounded-2xl bg-white border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                  <div className="relative w-full h-36">
                    <Image src={p.imageUrl} alt={title} fill className="object-cover" />
                  </div>
                  <div className="p-4 flex flex-col gap-1.5 flex-1">
                    <h3 className="text-sm font-bold text-gray-800 leading-snug line-clamp-2">{title}</h3>
                    {desc && <p className="text-xs text-gray-400 line-clamp-2">{desc.replace(/[#*_`>~-]/g, '')}</p>}
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <span className="text-sm font-bold" style={{ color: PRIMARY }}>{p.price.toLocaleString()} MMK</span>
                      <span className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: PRIMARY }}>
                        {mm ? 'ဝယ်ယူရန်' : 'Buy Now'} <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
