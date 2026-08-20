'use client';

import { useEffect, useState } from 'react';
import { Activity, ChevronUp } from 'lucide-react';
import { HEALTH_LOG_TYPES, type HealthLogType } from '@/lib/healthLog';

const PRIMARY = '#2ab5ad';

interface HealthLog {
  id: string;
  type: HealthLogType;
  loggedAt: string;
  data: Record<string, unknown>;
  note: string | null;
}

/** Read-only viewer for a patient's self-tracked health logs. `endpoint` is the API URL
 * (already carrying the patient identifier) — doctor and admin pages pass their own
 * privacy-scoped route. */
export default function PatientHealthLogsCard({ endpoint, mm }: { endpoint: string; mm: boolean }) {
  const [activeType, setActiveType] = useState<HealthLogType>('WEIGHT');
  const [logs, setLogs]       = useState<HealthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen]       = useState(true);
  const [error, setError]     = useState('');

  const def = HEALTH_LOG_TYPES.find(d => d.type === activeType)!;

  useEffect(() => {
    if (!endpoint) return;
    setLoading(true);
    setError('');
    const sep = endpoint.includes('?') ? '&' : '?';
    fetch(`${endpoint}${sep}type=${activeType}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); setLogs([]); return; }
        setLogs(d.logs ?? []);
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false));
  }, [endpoint, activeType]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-4 py-3 border-b border-gray-50 text-left hover:opacity-80 transition-opacity">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${PRIMARY}12` }}>
          <Activity className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
        </div>
        <span className="text-sm font-bold flex-1" style={{ color: PRIMARY }}>
          {mm ? 'ကျန်းမာရေး Tracker မှတ်တမ်း' : 'Health Trackers'}
        </span>
        <ChevronUp className={`w-4 h-4 text-gray-300 shrink-0 transition-transform ${open ? '' : 'rotate-180'}`} />
      </button>

      {open && (
        <div className="p-4">
          <div className="flex gap-1.5 overflow-x-auto pb-1 mb-3" style={{ scrollbarWidth: 'none' }}>
            {HEALTH_LOG_TYPES.map(d => {
              const active = d.type === activeType;
              return (
                <button
                  key={d.type}
                  onClick={() => setActiveType(d.type)}
                  className="shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap"
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

          {loading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-9 rounded-xl bg-gray-100 animate-pulse" />)}
            </div>
          ) : error ? (
            <p className="text-xs text-gray-400 py-2">{mm ? 'ကြည့်ခွင့်မရှိပါ' : error}</p>
          ) : logs.length === 0 ? (
            <p className="text-xs text-gray-400 py-2">{mm ? 'မှတ်တမ်း မရှိသေးပါ' : 'No entries yet'}</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {logs.map(l => (
                <div key={l.id} className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-gray-50">
                  <span className="text-gray-700 font-medium">{def.summarize(l.data)}</span>
                  <span className="text-gray-400 shrink-0 ml-2">
                    {new Date(l.loggedAt).toLocaleDateString(mm ? 'my-MM' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
