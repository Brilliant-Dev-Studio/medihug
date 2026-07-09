'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Check, X, Loader2, ShieldCheck, Trash2, Ban } from 'lucide-react';

const PRIMARY = '#2ab5ad';
const inp = 'flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-teal-400 transition-colors';

interface Admin { id: string; name: string; phone: string; isActive: boolean; createdAt: string; }

export default function AdminSettingsPage() {
  const [admins,  setAdmins]  = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<string | null>(null);

  const [creating,   setCreating]   = useState(false);
  const [name,       setName]       = useState('');
  const [phone,      setPhone]      = useState('');
  const [password,   setPassword]   = useState('');
  const [createError, setCreateError] = useState('');
  const [saving,     setSaving]     = useState(false);
  const [busyId,     setBusyId]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res  = await fetch('/api/admin/admins');
    const data = await res.json();
    setAdmins(data.admins ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    fetch('/api/admin/me').then(r => r.json()).then(d => setMe(d.admin?.id ?? null));
  }, [load]);

  const handleCreate = async () => {
    if (!name.trim() || !phone.trim() || !password.trim()) { setCreateError('Name, phone, password လိုအပ်သည်'); return; }
    setSaving(true); setCreateError('');
    const res  = await fetch('/api/admin/admins', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), phone: phone.trim(), password }),
    });
    const data = await res.json();
    if (!res.ok) { setCreateError(data.error); setSaving(false); return; }
    setName(''); setPhone(''); setPassword(''); setCreating(false); setSaving(false);
    load();
  };

  const toggleActive = async (a: Admin) => {
    setBusyId(a.id);
    await fetch(`/api/admin/admins/${a.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !a.isActive }),
    });
    setBusyId(null);
    load();
  };

  const handleDelete = async (a: Admin) => {
    setBusyId(a.id);
    await fetch(`/api/admin/admins/${a.id}`, { method: 'DELETE' });
    setBusyId(null);
    load();
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Settings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Super Admin accounts</p>
        </div>
        {!creating && (
          <button
            onClick={() => { setCreating(true); setName(''); setPhone(''); setPassword(''); setCreateError(''); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ backgroundColor: PRIMARY }}
          >
            <Plus className="w-4 h-4" /> Create Admin
          </button>
        )}
      </div>

      {/* Create form */}
      {creating && (
        <div className="bg-white rounded-2xl border-2 p-4 flex flex-col gap-3" style={{ borderColor: PRIMARY }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: PRIMARY }}>New Admin</p>
          <div className="flex gap-2">
            <input autoFocus value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false); }}
              placeholder="Name *" className={inp} />
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false); }}
              placeholder="Phone *" className={inp} />
          </div>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false); }}
            placeholder="Password (min 6 chars) *" className={inp} />
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={saving}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center gap-1.5"
              style={{ backgroundColor: PRIMARY }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save
            </button>
            <button onClick={() => setCreating(false)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          {createError && <p className="text-xs text-red-500">{createError}</p>}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest w-8">#</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Created</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="py-16 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" />
                </td></tr>
              ) : admins.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center">
                  <ShieldCheck className="w-8 h-8 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No admins yet.</p>
                </td></tr>
              ) : admins.map((a, i) => (
                <tr key={a.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5 text-xs text-gray-400">{i + 1}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-semibold text-gray-700">{a.name}</span>
                    {a.id === me && <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${PRIMARY}1a`, color: PRIMARY }}>You</span>}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{a.phone}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${a.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-400'}`}>
                      {a.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(a.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 justify-end">
                      <button onClick={() => toggleActive(a)} disabled={busyId === a.id || a.id === me}
                        title={a.isActive ? 'Disable' : 'Enable'}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors disabled:opacity-30">
                        {busyId === a.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => handleDelete(a)} disabled={busyId === a.id || a.id === me}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-400 transition-colors disabled:opacity-30">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
