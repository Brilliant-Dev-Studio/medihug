'use client';

import { useEffect, useState } from 'react';
import { Activity, Check, Loader2 } from 'lucide-react';
import { HEALTH_LOG_TYPES, type HealthLogType } from '@/lib/healthLog';

const PRIMARY   = 'var(--color-primary)';
const SECONDARY = 'var(--color-primary-dark)';

interface HealthLog {
  id: string;
  type: HealthLogType;
  loggedAt: string;
  data: Record<string, unknown>;
  note: string | null;
}

export default function HealthLogSection({ phone, mm }: { phone: string; mm: boolean }) {
  const [activeType, setActiveType] = useState<HealthLogType>('WEIGHT');
  const [formData, setFormData]     = useState<Record<string, string | boolean>>({});
  const [note, setNote]             = useState('');
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [error, setError]           = useState('');
  const [logs, setLogs]             = useState<HealthLog[]>([]);
  const [loading, setLoading]       = useState(true);

  const def = HEALTH_LOG_TYPES.find(d => d.type === activeType)!;

  useEffect(() => {
    setFormData({});
    setError('');
    if (!phone) return;
    setLoading(true);
    fetch(`/api/patient/health-logs?phone=${encodeURIComponent(phone)}&type=${activeType}&limit=5`)
      .then(r => r.json())
      .then(d => setLogs(d.logs ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeType, phone]);

  async function handleSubmit() {
    if (!phone) return;
    setError('');
    for (const f of def.fields) {
      if (f.required && !formData[f.key]) {
        setError(mm ? `${f.label.mm} ဖြည့်ပေးပါ` : `${f.label.en} is required.`);
        return;
      }
    }
    setSaving(true);
    try {
      const data: Record<string, unknown> = {};
      for (const f of def.fields) {
        const v = formData[f.key];
        if (v === undefined || v === '') continue;
        data[f.key] = f.type === 'number' ? Number(v) : v;
      }
      const res = await fetch('/api/patient/health-logs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, type: activeType, data, note: note || undefined }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? (mm ? 'အမှားတစ်ခုဖြစ်ပွားသည်' : 'Something went wrong'));
        setSaving(false);
        return;
      }
      const { log } = await res.json();
      setLogs(prev => [log, ...prev].slice(0, 5));
      setFormData({});
      setNote('');
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch {
      setError(mm ? 'ဆာဗာအမှား' : 'Server error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${PRIMARY}12` }}>
          <Activity className="w-4 h-4" style={{ color: PRIMARY }} />
        </div>
        <p className="text-sm font-bold" style={{ color: PRIMARY }}>
          {mm ? 'ကျန်းမာရေး Tracker' : 'Health Trackers'}
        </p>
      </div>

      {/* Tracker type chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4" style={{ scrollbarWidth: 'none' }}>
        {HEALTH_LOG_TYPES.map(d => {
          const active = d.type === activeType;
          return (
            <button
              key={d.type}
              onClick={() => setActiveType(d.type)}
              className="shrink-0 text-xs font-semibold px-3.5 py-2 rounded-full border transition-colors whitespace-nowrap"
              style={{
                backgroundColor: active ? PRIMARY : '#fafafa',
                borderColor: active ? PRIMARY : '#e5e7eb',
                color: active ? '#fff' : '#374151',
              }}
            >
              {mm ? d.label.mm : d.label.en}
            </button>
          );
        })}
      </div>

      {/* Dynamic entry form */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {def.fields.map(f => (
            <div key={f.key} className={f.type === 'text' ? 'sm:col-span-2' : ''}>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">
                {mm ? f.label.mm : f.label.en}{f.required && ' *'}
              </label>
              {f.type === 'select' ? (
                <select
                  value={(formData[f.key] as string) ?? ''}
                  onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full text-sm text-gray-700 rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-gray-300 transition-colors"
                >
                  <option value="">—</option>
                  {f.options?.map(o => (
                    <option key={o.value} value={o.value}>{mm ? o.label.mm : o.label.en}</option>
                  ))}
                </select>
              ) : f.type === 'checkbox' ? (
                <label className="flex items-center gap-2 h-10">
                  <input
                    type="checkbox"
                    checked={(formData[f.key] as boolean) ?? false}
                    onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.checked }))}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: PRIMARY }}
                  />
                  <span className="text-sm text-gray-600">{mm ? 'ဟုတ်ကဲ့' : 'Yes'}</span>
                </label>
              ) : (
                <input
                  type={f.type === 'number' ? 'number' : 'text'}
                  value={(formData[f.key] as string) ?? ''}
                  onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full text-sm text-gray-700 rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-gray-300 transition-colors"
                />
              )}
            </div>
          ))}
        </div>

        {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={saving || !phone}
          className="w-full py-3 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] hover:opacity-90 disabled:opacity-60"
          style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}
        >
          {saving
            ? <><Loader2 className="w-4 h-4 animate-spin" /> {mm ? 'သိမ်းနေသည်...' : 'Saving...'}</>
            : saved
            ? <><Check className="w-4 h-4" /> {mm ? 'သိမ်းပြီး' : 'Saved!'}</>
            : (mm ? 'မှတ်တမ်း ထည့်မည်' : 'Add Entry')}
        </button>
      </div>

      {/* Recent entries */}
      <div className="mt-5 pt-4 border-t border-gray-50">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
          {mm ? 'လတ်တလော မှတ်တမ်းများ' : 'Recent Entries'}
        </p>
        {loading ? (
          <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-gray-300" /></div>
        ) : logs.length === 0 ? (
          <p className="text-xs text-gray-400 py-2">{mm ? 'မှတ်တမ်း မရှိသေးပါ' : 'No entries yet'}</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {logs.map(l => (
              <div key={l.id} className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-gray-50">
                <span className="text-gray-700 font-medium">{def.summarize(l.data)}</span>
                <span className="text-gray-400">{new Date(l.loggedAt).toLocaleDateString(mm ? 'my-MM' : 'en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
