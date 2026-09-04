'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

/** Copies `${location.origin}${path}` to the clipboard — used to let a doctor/patient
 * share their video call link (e.g. paste it to open on another device). */
export default function CopyLinkButton({
  path, label, copiedLabel, className, style,
}: {
  path: string; label: string; copiedLabel: string;
  className?: string; style?: React.CSSProperties;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button type="button" onClick={copy} className={className} style={style}>
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {copied ? copiedLabel : label}
    </button>
  );
}
