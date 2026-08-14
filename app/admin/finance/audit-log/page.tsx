'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import { History, Loader2, ChevronDown } from 'lucide-react';

const PRIMARY = '#2ab5ad';

interface Log {
  id: string; adminId: string | null; adminName: string | null; action: string;
  entityType: string; entityId: string; before: unknown; after: unknown; createdAt: string;
}

const ENTITY_TYPES = ['CommissionRule', 'PaymentMethodConfig', 'Expense', 'Budget', 'Refund', 'RevenueEntry', 'Appointment', 'Order'];

const ACTION_STYLE: Record<string, { bg: string; color: string }> = {
  CREATE: { bg: '#f0fdf4', color: '#16a34a' },
  UPDATE: { bg: '#eff6ff', color: '#3b82f6' },
  DELETE: { bg: '#fef2f2', color: '#dc2626' },
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async (type?: string) => {
    setLoading(true);
    const qs = type ? `?entityType=${type}` : '';
    const res = await fetch(`/api/admin/finance/audit-log${qs}`);
    const data = await res.json();
    setLogs(data.logs ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(filterType || undefined); }, [load, filterType]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#e6f7f7' }}>
          <History className="w-4.5 h-4.5" style={{ color: PRIMARY }} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Audit Log</h1>
          <p className="text-sm text-gray-500 mt-0.5">Immutable trail of who changed what, and when — commission rules, fees, budgets, refunds, status changes</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => setFilterType('')}
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: !filterType ? PRIMARY : '#f3f4f6', color: !filterType ? '#fff' : '#6b7280' }}>All</button>
        {ENTITY_TYPES.map(t => (
          <button key={t} onClick={() => setFilterType(t)}
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: filterType === t ? PRIMARY : '#f3f4f6', color: filterType === t ? '#fff' : '#6b7280' }}>{t}</button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Entity</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" /></td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="py-16 text-center">
                  <History className="w-8 h-8 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No audit entries yet.</p>
                </td></tr>
              ) : logs.map(l => {
                const s = ACTION_STYLE[l.action] ?? { bg: '#f3f4f6', color: '#6b7280' };
                const expanded = expandedId === l.id;
                return (
                  <Fragment key={l.id}>
                    <tr className="hover:bg-gray-50/60 transition-colors cursor-pointer" onClick={() => setExpandedId(expanded ? null : l.id)}>
                      <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(l.createdAt).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-700">{l.adminName ?? '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>{l.action}</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{l.entityType} <span className="text-gray-300">#{l.entityId.slice(-6)}</span></td>
                      <td className="px-5 py-3.5 text-right">
                        <ChevronDown className={`w-4 h-4 text-gray-300 inline-block transition-transform ${expanded ? 'rotate-180' : ''}`} />
                      </td>
                    </tr>
                    {expanded && (
                      <tr>
                        <td colSpan={5} className="px-5 py-4 bg-gray-50/60">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Before</p>
                              <pre className="text-[11px] text-gray-600 bg-white rounded-lg p-3 overflow-x-auto border border-gray-100">{l.before ? JSON.stringify(l.before, null, 2) : '—'}</pre>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">After</p>
                              <pre className="text-[11px] text-gray-600 bg-white rounded-lg p-3 overflow-x-auto border border-gray-100">{l.after ? JSON.stringify(l.after, null, 2) : '—'}</pre>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
