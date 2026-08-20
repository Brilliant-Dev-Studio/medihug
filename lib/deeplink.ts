/** Browsers give no direct signal that a custom-scheme deeplink (cbuat://, cb://) actually
 * opened an app — this is the standard workaround: attempt the navigation, then check
 * shortly after whether the page lost visibility (app opened, backgrounding this tab) or
 * is still in the foreground (no app registered for the scheme, nothing happened). */
export function tryOpenDeeplink(url: string, onAppNotFound: () => void, timeoutMs = 1500) {
  let left = false;
  const onVisibility = () => { if (document.hidden) left = true; };
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('blur', onVisibility);

  window.location.href = url;

  setTimeout(() => {
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('blur', onVisibility);
    if (!left && !document.hidden) onAppNotFound();
  }, timeoutMs);
}
