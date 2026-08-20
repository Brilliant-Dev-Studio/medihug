'use client';

import { useSyncExternalStore, useState } from 'react';
import { Bug, X, Trash2 } from 'lucide-react';
import { getLogs, subscribeLogs, clearLogs } from '@/lib/debugLog';

/** Floating debug panel — shows request/response logs pushed via lib/debugLog.ts.
 * Exists so payment-flow issues can be inspected on mobile where devtools aren't available. */
export default function DebugLogPanel() {
  const logs = useSyncExternalStore(subscribeLogs, getLogs, getLogs);
  const [open, setOpen] = useState(false);

  if (logs.length === 0 && !open) return null;

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-24 left-4 z-[70] w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-white"
        style={{ backgroundColor: '#111827' }}
      >
        <Bug className="w-4.5 h-4.5" />
        {logs.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: '#ef4444' }}>
            {logs.length}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex flex-col justify-end bg-black/40" onClick={() => setOpen(false)}>
          <div className="bg-gray-950 rounded-t-2xl max-h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 shrink-0">
              <p className="text-sm font-bold text-white flex items-center gap-2"><Bug className="w-4 h-4" /> Debug Log</p>
              <div className="flex items-center gap-2">
                <button onClick={clearLogs} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-800">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-800">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto px-4 py-3 flex flex-col gap-2">
              {logs.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-8">No logs yet</p>
              ) : logs.map(l => (
                <div key={l.id} className="rounded-lg bg-gray-900 border border-gray-800 p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-teal-400">{l.label}</span>
                    <span className="text-[10px] text-gray-500">{l.time}</span>
                  </div>
                  <pre className="text-[10px] text-gray-300 whitespace-pre-wrap break-all">{JSON.stringify(l.data, null, 2)}</pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
