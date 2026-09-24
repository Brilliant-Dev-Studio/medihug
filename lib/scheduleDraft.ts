/* The date / time slot a patient has picked on a doctor's page, plus a short-lived copy of the
 * doctor itself, kept so coming back from the booking screen (or refreshing) shows the page as it
 * was — same selection, no loading spinner — instead of a blank, refetched one.
 *
 * Both live in memory (survives navigating around the app) and sessionStorage (survives a refresh,
 * gone when the tab closes). */

export interface ScheduleDraft {
  /** Local calendar day picked, yyyy-mm-dd — a day *index* would drift as the days go by. */
  dayKey: string | null;
  hasPickedDate: boolean;
  selectionMode: 'single' | 'range';
  selectedSlot: string | null;
  rangeStart: string | null;
  rangeEnd: string | null;
}

const DRAFT_PREFIX = 'medihug_schedule_draft:';
const DOCTOR_PREFIX = 'medihug_doctor_cache:';
const DRAFT_TTL_MS = 3 * 60 * 60 * 1000;
const DOCTOR_TTL_MS = 30 * 60 * 1000;

const drafts = new Map<string, ScheduleDraft & { savedAt: number }>();
const doctors = new Map<string, { doctor: unknown; savedAt: number }>();

const pad = (n: number) => String(n).padStart(2, '0');

/** yyyy-mm-dd of today + `offset` days, in local time. */
export function dayKeyOf(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Which of the next 7 days (0 = today) a saved day is now, or null if it's already passed / too far out. */
export function offsetOfDayKey(key: string, days = 7): number | null {
  for (let i = 0; i < days; i++) if (dayKeyOf(i) === key) return i;
  return null;
}

function read<T extends { savedAt: number }>(store: Map<string, T>, prefix: string, id: string, ttl: number): T | null {
  const now = Date.now();
  const mem = store.get(id);
  if (mem) {
    if (now - mem.savedAt < ttl) return mem;
    store.delete(id);
  }
  try {
    const raw = sessionStorage.getItem(prefix + id);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as T;
    if (now - parsed.savedAt >= ttl) { sessionStorage.removeItem(prefix + id); return null; }
    return parsed;
  } catch {
    return null;
  }
}

function write<T>(store: Map<string, T & { savedAt: number }>, prefix: string, id: string, value: T) {
  const entry = { ...value, savedAt: Date.now() };
  store.set(id, entry);
  try { sessionStorage.setItem(prefix + id, JSON.stringify(entry)); } catch { /* storage full / blocked — memory copy still works */ }
}

export function loadScheduleDraft(doctorId: string): ScheduleDraft | null {
  return read(drafts, DRAFT_PREFIX, doctorId, DRAFT_TTL_MS);
}
export function saveScheduleDraft(doctorId: string, draft: ScheduleDraft): void {
  write(drafts, DRAFT_PREFIX, doctorId, draft);
}
export function clearScheduleDraft(doctorId: string): void {
  drafts.delete(doctorId);
  try { sessionStorage.removeItem(DRAFT_PREFIX + doctorId); } catch { /* ignore */ }
}

export function loadDoctorCache<T>(doctorId: string): T | null {
  return (read(doctors, DOCTOR_PREFIX, doctorId, DOCTOR_TTL_MS)?.doctor as T | undefined) ?? null;
}
export function saveDoctorCache(doctorId: string, doctor: unknown): void {
  write(doctors, DOCTOR_PREFIX, doctorId, { doctor });
}

/* Which times on a given day were already full a moment ago. Kept for a minute so slots show at once
 * when the patient comes back to the page; the page still re-checks in the background. */
const BOOKED_TTL_MS = 60 * 1000;
const booked = new Map<string, { full: string[]; savedAt: number }>();

export function loadBookedSlots(doctorId: string, dayKey: string): string[] | null {
  const hit = booked.get(`${doctorId}|${dayKey}`);
  return hit && Date.now() - hit.savedAt < BOOKED_TTL_MS ? hit.full : null;
}
export function saveBookedSlots(doctorId: string, dayKey: string, full: string[]): void {
  booked.set(`${doctorId}|${dayKey}`, { full, savedAt: Date.now() });
}
