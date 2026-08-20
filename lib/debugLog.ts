/** Tiny in-memory debug log so payment-flow request/response data can be inspected on mobile,
 * where devtools aren't available. Not persisted — cleared on page reload. */

export interface DebugLogEntry {
  id: string;
  time: string;
  label: string;
  data: unknown;
}

let logs: DebugLogEntry[] = [];
let listeners: (() => void)[] = [];

export function pushLog(label: string, data: unknown) {
  logs = [{ id: `${Date.now()}-${Math.random()}`, time: new Date().toLocaleTimeString(), label, data }, ...logs].slice(0, 50);
  listeners.forEach(l => l());
}

export function getLogs(): DebugLogEntry[] {
  return logs;
}

export function clearLogs() {
  logs = [];
  listeners.forEach(l => l());
}

export function subscribeLogs(fn: () => void): () => void {
  listeners.push(fn);
  return () => { listeners = listeners.filter(l => l !== fn); };
}
