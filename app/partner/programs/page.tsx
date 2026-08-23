'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HeartPulse, Plus } from 'lucide-react';

interface Program {
  id: string; imageUrl: string; titleMm: string; titleEn: string | null; price: number; isActive: boolean;
}

function Skel({ className }: { className: string }) {
  return <div className={`bg-gray-100 rounded-md animate-pulse ${className}`} />;
}

function ProgramsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <Skel className="aspect-square rounded-none" />
          <div className="p-3 flex flex-col gap-2">
            <Skel className="h-3.5 w-3/4" />
            <Skel className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PartnerProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/partner/programs')
      .then(r => r.json())
      .then(d => setPrograms(d.programs ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-800">Healthcare Programs</h1>
        <Link href="/partner/programs/new"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#3b5bdb' }}>
          <Plus size={16} /> New Program
        </Link>
      </div>

      {loading ? (
        <ProgramsSkeleton />
      ) : programs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <HeartPulse className="w-8 h-8 mx-auto text-gray-200 mb-2" />
          <p className="text-sm text-gray-400 mb-4">You haven&apos;t listed any programs yet.</p>
          <Link href="/partner/programs/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#3b5bdb' }}>
            <Plus size={16} /> List your first program
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {programs.map(p => {
            const name = p.titleEn ?? p.titleMm;
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="relative aspect-square bg-gray-50">
                  <Image src={p.imageUrl} alt={name} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" className="object-cover" />
                  {!p.isActive && (
                    <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-800/80 text-white">Hidden</span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
                  <p className="text-xs font-bold mt-1" style={{ color: '#3b5bdb' }}>{p.price.toLocaleString()} MMK</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
