'use client';

import { useEffect, useState } from 'react';

/** Client hook for the logged-in admin's role, used to swap delete buttons into the
 * request-approval flow for POS_ADMIN (who has no direct delete rights). */
export function useAdminRole(): { role: string | null; loading: boolean } {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/me')
      .then(r => r.json())
      .then(d => setRole(d.admin?.role ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { role, loading };
}

/** POST a deletion request instead of deleting directly. Returns true on success. */
export async function requestDeletion(entityType: string, entityId: string, entityLabel?: string, reason?: string): Promise<boolean> {
  const res = await fetch('/api/admin/deletion-requests', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entityType, entityId, entityLabel, reason }),
  });
  return res.ok;
}
