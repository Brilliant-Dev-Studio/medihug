/** Neon's pooled endpoint reaps idle connections server-side, and the underlying compute can
 * be suspended between requests — so the very first query after a quiet spell (e.g. a login
 * attempt after nobody's touched the admin portal in a while) occasionally hits a connection
 * that's already gone, or one still waking up. That surfaces to the caller as a generic
 * "Server error" after several seconds of nothing happening, which reads as the app being
 * broken. One retry after a short pause almost always succeeds.
 *
 * Only wrap read-only queries with this — retrying a write blindly risks re-running it after
 * the first attempt actually succeeded server-side but its response was lost in the drop. */
function isTransientConnectionError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return (
    /Connection terminated unexpectedly/i.test(msg) ||
    /Connection terminated due to connection timeout/i.test(msg) ||
    /timeout exceeded when trying to connect/i.test(msg) ||
    /Client has encountered a connection error/i.test(msg) ||
    /ECONNRESET|ETIMEDOUT|EPIPE/.test(msg) ||
    /P1001|P1002|P1017/.test(msg)
  );
}

export async function withDbRetry<T>(fn: () => Promise<T>, attempts = 2, delayMs = 400): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (!isTransientConnectionError(e) || i === attempts - 1) throw e;
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  throw lastErr;
}
