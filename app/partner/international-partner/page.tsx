'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Save, Plane, Stethoscope, ArrowUpRight, Plus, Trash2, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import DangerDeleteModal from '@/components/admin/DangerDeleteModal';

const PRIMARY = '#3b5bdb';
const ACCENT  = '#2ab5ad';

const inp = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3b5bdb]/40 focus:border-[#3b5bdb] transition-colors';
const lbl = 'block text-xs font-semibold text-gray-600 mb-1.5';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</p>
      {children}
    </div>
  );
}

interface Clinic {
  name: string; nameEn: string | null; type: string;
  isInternational: boolean;
  country: string | null; countryEn: string | null;
  _count?: { doctors: number };
}

interface SubClinic {
  id: string; name: string; nameEn: string | null; type: string;
  country: string | null; countryEn: string | null;
  _count?: { doctors: number };
}

export default function InternationalPartnerPage() {
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [country, setCountry] = useState('');
  const [countryEn, setCountryEn] = useState('');

  const [subClinics, setSubClinics] = useState<SubClinic[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<SubClinic | null>(null);
  const [deletingSub, setDeletingSub] = useState(false);

  const loadSubClinics = () => fetch('/api/partner/sub-clinics').then(r => r.json()).then(d => setSubClinics(d.subClinics ?? []));

  useEffect(() => {
    fetch('/api/partner/clinic')
      .then(r => r.json())
      .then(d => {
        if (!d.clinic) return;
        setClinic(d.clinic);
        setCountry(d.clinic.country ?? '');
        setCountryEn(d.clinic.countryEn ?? '');
      })
      .finally(() => setLoading(false));
    loadSubClinics();
  }, []);

  const confirmDeleteSub = async () => {
    if (!deleteTarget) return;
    setDeletingSub(true);
    try {
      const res = await fetch(`/api/partner/sub-clinics/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) { toast.error('Delete failed'); return; }
      setSubClinics(prev => prev.filter(s => s.id !== deleteTarget.id));
    } finally {
      setDeletingSub(false);
      setDeleteTarget(null);
    }
  };

  const save = async () => {
    if (!clinic?.isInternational && !country.trim()) {
      toast.error('Country လိုအပ်သည်');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/partner/clinic', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: country || null, countryEn: countryEn || null, isInternational: true }),
      });
      if (!res.ok) throw new Error();
      const d = await res.json();
      setClinic(c => c ? { ...c, isInternational: true, country: d.clinic.country, countryEn: d.clinic.countryEn } : c);
      toast.success(clinic?.isInternational ? 'International Partner info updated' : 'International Partner enabled — you now appear on medihug-tourism');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: PRIMARY }} />
      </div>
    );
  }

  const isEnabled = !!clinic?.isInternational;

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-800">International Partner</h1>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
              style={{ backgroundColor: isEnabled ? `${ACCENT}15` : '#f3f4f6', color: isEnabled ? ACCENT : '#9ca3af' }}>
              <Plane className="w-3 h-3" /> {isEnabled ? 'Enabled' : 'Not enabled yet'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {isEnabled
              ? "Shown to patients on MediHug's medical tourism page"
              : 'Fill in your country below to appear on medihug-tourism'}
          </p>
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
          style={{ backgroundColor: isEnabled ? PRIMARY : ACCENT }}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEnabled ? 'Save' : 'Enable International Partner'}
        </button>
      </div>

      {isEnabled && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/partner/doctors" className="group bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:border-gray-200 hover:shadow-sm transition-all">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${PRIMARY}12` }}>
              <Stethoscope className="w-5 h-5" style={{ color: PRIMARY }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-800">{clinic?._count?.doctors ?? 0} Doctors</p>
              <p className="text-xs text-gray-400">Manage doctors &amp; weekly slots</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
          </Link>

          <a href="/medihug-tourism" target="_blank" rel="noopener noreferrer"
            className="group bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:border-gray-200 hover:shadow-sm transition-all">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${ACCENT}15` }}>
              <Plane className="w-5 h-5" style={{ color: ACCENT }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-800">View Public Listing</p>
              <p className="text-xs text-gray-400">See how you appear on medihug-tourism</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
          </a>
        </div>
      )}

      <Section title="Country">
        <p className="text-xs text-gray-400 -mt-2">The country patients will see next to your name on the tourism page</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Country (Myanmar) *</label>
            <input className={inp} value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g. ထိုင်း" />
          </div>
          <div>
            <label className={lbl}>Country (English)</label>
            <input className={inp} value={countryEn} onChange={e => setCountryEn(e.target.value)} placeholder="e.g. Thailand" />
          </div>
        </div>
      </Section>

      <Section title="Type &amp; Name">
        <p className="text-xs text-gray-400 -mt-2">
          Editable from <Link href="/partner/profile" className="underline font-semibold" style={{ color: PRIMARY }}>Clinic Profile</Link> — name, address, images, and other details are shared with your regular partner profile.
        </p>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <span className="text-sm font-semibold text-gray-700">{clinic?.nameEn ?? clinic?.name}</span>
          {clinic?.type && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-teal-50 text-teal-700">{clinic.type}</span>}
        </div>
      </Section>

      <Section title="Your International Partners">
        <div className="flex items-center justify-between -mt-2">
          <p className="text-xs text-gray-400">Extra International Partner listings you create yourself — same login as your main clinic, no separate password needed</p>
          <Link href="/partner/international-partner/new"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white shrink-0"
            style={{ backgroundColor: ACCENT }}>
            <Plus className="w-3.5 h-3.5" /> Add International Partner
          </Link>
        </div>

        {subClinics.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No International Partners created yet</p>
        ) : (
          <div className="flex flex-col gap-2">
            {subClinics.map(s => (
              <div key={s.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <Link href={`/partner/international-partner/${s.id}`} className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${ACCENT}15` }}>
                    <Building2 className="w-4 h-4" style={{ color: ACCENT }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 truncate">{s.nameEn ?? s.name}</p>
                    <p className="text-xs text-gray-400 truncate">{s.countryEn ?? s.country} · {s._count?.doctors ?? 0} doctors</p>
                  </div>
                </Link>
                <button onClick={() => setDeleteTarget(s)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <DangerDeleteModal
        open={!!deleteTarget}
        title="Delete this International Partner?"
        message="Its doctors will be unlinked from it. This cannot be undone."
        itemName={deleteTarget?.name ?? ''}
        confirmLabel="Yes, Delete"
        loading={deletingSub}
        onConfirm={confirmDeleteSub}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
