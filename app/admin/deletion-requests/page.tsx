'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Trash2, Check, X, Inbox } from 'lucide-react';

interface DeletionRequest {
  id: string;
  entityType: string;
  entityId: string;
  entityLabel: string | null;
  reason: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  requester: { name: string; phone: string };
  reviewer: { name: string } | null;
}

const STATUS_STYLE: Record<DeletionRequest['status'], { bg: string; text: string; label: string }> = {
  PENDING:  { bg: '#fef3c7', text: '#92400e', label: 'Pending' },
  APPROVED: { bg: '#fee2e2', text: '#991b1b', label: 'Approved & Deleted' },
  REJECTED: { bg: '#f3f4f6', text: '#4b5563', label: 'Rejected' },
};

export default function DeletionRequestsPage() {
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/deletion-requests');
    const data = await res.json();
    setRequests(data.requests ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const review = async (id: string, action: 'approve' | 'reject') => {
    setBusyId(id);
    await fetch(`/api/admin/deletion-requests/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    setBusyId(null);
    load();
  };

  const pending = requests.filter(r => r.status === 'PENDING');
  const reviewed = requests.filter(r => r.status !== 'PENDING');

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Deletion Requests</h1>
        <p className="text-sm text-gray-400 mt-0.5">POS admins can&apos;t delete directly — review and approve their requests here.</p>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 flex flex-col items-center gap-2">
          <Inbox className="w-8 h-8 text-gray-200" />
          <p className="text-sm text-gray-400">No deletion requests yet.</p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Pending ({pending.length})</p>
              {pending.map(r => (
                <div key={r.id} className="bg-white rounded-2xl border-2 p-4 flex items-center gap-4" style={{ borderColor: '#fbbf24' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#fef3c7' }}>
                    <Trash2 className="w-4.5 h-4.5" style={{ color: '#92400e' }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800">
                      {r.entityType}{r.entityLabel ? ` — ${r.entityLabel}` : ''}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Requested by {r.requester.name} ({r.requester.phone}) · {new Date(r.createdAt).toLocaleString()}
                    </p>
                    {r.reason && <p className="text-xs text-gray-500 mt-1 italic">&quot;{r.reason}&quot;</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => review(r.id, 'approve')} disabled={busyId === r.id}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-50"
                      style={{ backgroundColor: '#dc2626' }}>
                      {busyId === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Approve Delete
                    </button>
                    <button onClick={() => review(r.id, 'reject')} disabled={busyId === r.id}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {reviewed.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-2">History</p>
              <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
                {reviewed.map(r => {
                  const s = STATUS_STYLE[r.status];
                  return (
                    <div key={r.id} className="px-4 py-3 flex items-center gap-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: s.bg, color: s.text }}>
                        {s.label}
                      </span>
                      <p className="text-sm text-gray-600 min-w-0 flex-1 truncate">
                        {r.entityType}{r.entityLabel ? ` — ${r.entityLabel}` : ''} · by {r.requester.name}
                        {r.reviewer && ` · reviewed by ${r.reviewer.name}`}
                      </p>
                      <span className="text-xs text-gray-400 shrink-0">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
