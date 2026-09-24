import type { IntakeDraft } from '@/app/patient/booking/IntakeForm';

/* What a patient has already picked/typed while booking a doctor, kept so going back a step,
 * leaving the page, or refreshing doesn't throw it away.
 *
 * Text and choices go to sessionStorage (survives a refresh, cleared when the tab closes).
 * Files — the payment receipt and medical-record photos — can't be serialised, so they live only
 * in memory: they survive navigating back and forth inside the app, but not a full refresh. */

export interface BookingDraft {
  payMethod: string;
  discount: { pointsToRedeem: number; voucherCode: string | null; discountAmount: number; partnerName?: string };
  note: string;
  cbProof: { orderId: string; generateRefOrder: string } | null;
  intake: IntakeDraft | null;
  receipt: { file: File; url: string } | null;
  medFiles: { file: File; url: string; type: 'record' | 'film' }[];
}

interface Stored extends Omit<BookingDraft, 'receipt' | 'medFiles'> { savedAt: number }

const TTL_MS = 3 * 60 * 60 * 1000;
const PREFIX = 'medihug_booking_draft:';
const memory = new Map<string, BookingDraft & { savedAt: number }>();

/** One draft per doctor + date + time, so picking a different slot starts clean. */
export function draftKey(parts: { doctorId: string; dateIso: string; start: string; end: string }): string {
  return `${PREFIX}${parts.doctorId}|${parts.dateIso}|${parts.start}|${parts.end}`;
}

export function loadDraft(key: string): BookingDraft | null {
  const now = Date.now();
  const inMemory = memory.get(key);
  if (inMemory) {
    if (now - inMemory.savedAt < TTL_MS) return inMemory;
    memory.delete(key);
  }
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const stored = JSON.parse(raw) as Stored;
    if (now - stored.savedAt >= TTL_MS) { sessionStorage.removeItem(key); return null; }
    return { ...stored, receipt: null, medFiles: [] };
  } catch {
    return null;
  }
}

export function saveDraft(key: string, draft: BookingDraft): void {
  const savedAt = Date.now();
  memory.set(key, { ...draft, savedAt });
  try {
    const { receipt: _r, medFiles: _m, ...serialisable } = draft;
    void _r; void _m;
    sessionStorage.setItem(key, JSON.stringify({ ...serialisable, savedAt } satisfies Stored));
  } catch {
    // Storage full / blocked (private mode): the in-memory copy still covers in-app navigation.
  }
}

export function clearDraft(key: string): void {
  memory.delete(key);
  try { sessionStorage.removeItem(key); } catch { /* ignore */ }
}
