'use client';

import { useState, useEffect, useCallback } from 'react';

type FavKind = 'doctor' | 'product';

function getPatient(): { name: string; phone: string } | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('medihug_patient');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function useFavorites(kind: FavKind) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [needsIdentity, setNeedsIdentity] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    const patient = getPatient();
    if (!patient) return;
    fetch(`/api/patient/favorites/${kind}s?phone=${encodeURIComponent(patient.phone)}`)
      .then(r => r.json())
      .then(d => setFavorites(new Set<string>(d.ids ?? [])))
      .catch(() => {});
  }, [kind]);

  const apply = useCallback((patient: { name: string; phone: string }, id: string, isFav: boolean) => {
    const key = kind === 'doctor' ? 'doctorId' : 'productId';
    setFavorites(prev => {
      const next = new Set(prev);
      isFav ? next.delete(id) : next.add(id);
      return next;
    });
    fetch(`/api/patient/favorites/${kind}s`, {
      method: isFav ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: patient.phone, name: patient.name, [key]: id }),
    }).catch(() => {
      setFavorites(prev => {
        const next = new Set(prev);
        isFav ? next.add(id) : next.delete(id);
        return next;
      });
    });
  }, [kind]);

  const toggle = useCallback((id: string) => {
    const patient = getPatient();
    if (!patient) {
      setPendingId(id);
      setNeedsIdentity(true);
      return;
    }
    apply(patient, id, favorites.has(id));
  }, [favorites, apply]);

  const submitIdentity = useCallback((name: string, phone: string) => {
    localStorage.setItem('medihug_patient', JSON.stringify({ name, phone }));
    setNeedsIdentity(false);
    if (pendingId) {
      const id = pendingId;
      setPendingId(null);
      apply({ name, phone }, id, false);
    }
  }, [pendingId, apply]);

  return {
    favorites,
    toggle,
    needsIdentity,
    closeIdentity: () => { setNeedsIdentity(false); setPendingId(null); },
    submitIdentity,
  };
}
