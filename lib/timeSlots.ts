function toMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

/** Expands an appointment's stored `time` label ("09:00" or "09:00 → 09:30 (30 min)") into its 15-min slot units. */
export function parseSlotTimes(label: string): string[] {
  const matches = label.match(/\d{2}:\d{2}/g);
  if (!matches || matches.length === 0) return [];
  if (matches.length === 1) return matches;

  const [a, b] = matches;
  const lo = Math.min(toMin(a), toMin(b));
  const hi = Math.max(toMin(a), toMin(b));
  const out: string[] = [];
  for (let t = lo; t <= hi; t += 15) {
    out.push(`${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`);
  }
  return out;
}

interface SlotWindow { startTime: string; endTime: string; maxPerSlot: number }

/** Capacity for a given 15-min slot value, based on which DoctorSlot weekly window it falls in. Defaults to 1 if outside any window. */
export function maxPerSlotFor(time: string, windows: SlotWindow[]): number {
  const t = toMin(time);
  const win = windows.find(w => t >= toMin(w.startTime) && t < toMin(w.endTime));
  return win?.maxPerSlot ?? 1;
}

export function dayBounds(dateIso: string): { start: Date; end: Date } {
  const d = new Date(dateIso);
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}
