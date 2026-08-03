'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Calendar, Stethoscope, ShoppingBag, Building2 } from 'lucide-react';

const PRIMARY = '#3b5bdb';

interface Clinic { id: string; name: string; nameEn: string | null; imageUrl: string | null; }

export default function PartnerDashboardPage() {
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [counts, setCounts] = useState({ appointments: 0, doctors: 0, products: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/partner/me').then(r => r.json()),
      fetch('/api/partner/appointments?page=1&pageSize=1').then(r => r.json()),
      fetch('/api/partner/doctors').then(r => r.json()),
      fetch('/api/partner/products').then(r => r.json()),
    ]).then(([me, appts, docs, prods]) => {
      setClinic(me.clinic ?? null);
      setCounts({
        appointments: appts.total ?? 0,
        doctors: (docs.doctors ?? []).length,
        products: (prods.products ?? []).length,
      });
    }).finally(() => setLoading(false));
  }, []);

  const cards = [
    { icon: Calendar,    label: 'Appointments', num: counts.appointments, href: '/partner/appointments' },
    { icon: Stethoscope, label: 'Doctors',      num: counts.doctors,      href: '/partner/doctors' },
    { icon: ShoppingBag, label: 'Products',     num: counts.products,     href: '/partner/products' },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto flex flex-col gap-5">
      <div className="rounded-2xl p-6 flex items-center gap-4" style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #22308f 100%)` }}>
        <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-white/15 overflow-hidden">
          {clinic?.imageUrl ? (
            <Image src={clinic.imageUrl} alt={clinic.name} fill sizes="56px" className="object-cover" />
          ) : (
            <Building2 className="w-6 h-6 text-white" />
          )}
        </div>
        <div>
          <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">ကြိုဆိုပါသည်</p>
          <h1 className="text-white text-xl font-bold">{loading ? '...' : (clinic?.nameEn ?? clinic?.name ?? 'Partner')}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map(c => (
          <a key={c.label} href={c.href} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${PRIMARY}14` }}>
              <c.icon className="w-5 h-5" style={{ color: PRIMARY }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{loading ? '—' : c.num}</p>
              <p className="text-xs text-gray-400">{c.label}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
