'use client';

import { useEffect, useState } from 'react';
import { LogIn, ShieldCheck } from 'lucide-react';

interface LoginLog { id: string; ip: string | null; userAgent: string | null; createdAt: string }

/** Best-effort browser/OS label from a raw user-agent string — good enough to tell staff sessions apart, not a full UA parser. */
function briefUA(ua: string | null): string {
  if (!ua) return 'Unknown device';
  const browser = ua.match(/(Chrome|Firefox|Safari|Edg|OPR)\/[\d.]+/)?.[0]?.replace('Edg', 'Edge').replace('OPR', 'Opera') ?? 'Unknown browser';
  const os = ua.match(/Windows|Mac OS X|Android|iPhone|iPad|Linux/)?.[0] ?? '';
  return [os, browser].filter(Boolean).join(' · ');
}

function Skel({ className }: { className: string }) {
  return <div className={`bg-gray-100 rounded-md animate-pulse ${className}`} />;
}

function LoginHistorySkeleton() {
  return (
    <div className="flex flex-col divide-y divide-gray-50">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-3.5">
          <Skel className="w-9 h-9 rounded-xl shrink-0" />
          <div className="min-w-0 flex-1 flex flex-col gap-2">
            <Skel className="h-3.5 w-40" />
            <Skel className="h-3 w-28" />
          </div>
          <Skel className="h-3 w-20 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export default function PartnerLoginHistoryPage() {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/partner/login-logs')
      .then(r => r.json())
      .then(d => setLogs(d.logs ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto flex flex-col gap-5">
      <div>
        <h1 className="text-lg font-bold text-gray-800">Login History</h1>
        <p className="text-xs text-gray-400 mt-0.5">This account is shared by clinic staff — last 50 logins by IP and device.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <LoginHistorySkeleton />
        ) : logs.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-2 text-center">
            <ShieldCheck className="w-8 h-8 text-gray-200" />
            <p className="text-sm text-gray-400">No login activity recorded yet.</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-50">
            {logs.map(l => (
              <div key={l.id} className="flex items-center gap-3 px-5 py-3.5">
                <span className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  <LogIn className="w-4 h-4 text-gray-400" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-700">{new Date(l.createdAt).toLocaleString()}</p>
                  <p className="text-xs text-gray-400 truncate">{briefUA(l.userAgent)}</p>
                </div>
                <span className="text-xs font-mono text-gray-400 shrink-0">{l.ip ?? 'unknown'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
