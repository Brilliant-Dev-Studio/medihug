'use client';

import { useEffect, useRef, useState } from 'react';
import type QRCodeStyling from 'qr-code-styling';
import type { DotType } from 'qr-code-styling';
import { Download, QrCode, CheckCircle2 } from 'lucide-react';
import { PRIMARY, t } from '@/app/admin/appointments/shared';

const STYLE_OPTIONS: { value: DotType; mm: string; en: string }[] = [
  { value: 'square',         mm: 'ပုံမှန်',        en: 'Square' },
  { value: 'dots',           mm: 'အစက်',          en: 'Dots' },
  { value: 'rounded',        mm: 'အနားဝိုင်း',     en: 'Rounded' },
  { value: 'classy',         mm: 'Classy',         en: 'Classy' },
  { value: 'classy-rounded', mm: 'Classy Rounded', en: 'Classy Rounded' },
  { value: 'extra-rounded',  mm: 'Extra Rounded',  en: 'Extra Rounded' },
];

const PRESET_COLORS = [
  '#2ab5ad', '#3b5bdb', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b',
  '#10b981', '#0d2b6e', '#111827', '#6b7280', '#ffffff',
];

/** Popover color picker: preset swatches + hex input + a native picker for anything off-palette. */
function ColorSwatchPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [hexDraft, setHexDraft] = useState(value);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setHexDraft(value); }, [value]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  function commitHex(v: string) {
    const hex = v.startsWith('#') ? v : `#${v}`;
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) onChange(hex);
  }

  return (
    <div className="relative" ref={boxRef}>
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">{label}</label>
      <button type="button" onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-2.5 py-2 rounded-lg border bg-white w-full transition-colors"
        style={{ borderColor: open ? PRIMARY : '#e5e7eb' }}>
        <span className="w-6 h-6 rounded shrink-0 border border-gray-200" style={{ backgroundColor: value }} />
        <span className="text-xs font-mono text-gray-500 truncate">{value.toUpperCase()}</span>
      </button>

      {open && (
        <div className="absolute z-30 mt-1.5 left-0 bg-white rounded-xl border border-gray-100 shadow-lg p-3 w-56">
          <div className="grid grid-cols-6 gap-1.5 mb-3">
            {PRESET_COLORS.map(c => (
              <button key={c} type="button" onClick={() => { onChange(c); setOpen(false); }}
                className="w-7 h-7 rounded-lg border-2 transition-transform hover:scale-110 shrink-0"
                style={{ backgroundColor: c, borderColor: value.toLowerCase() === c ? PRIMARY : '#e5e7eb' }} />
            ))}
          </div>
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-gray-200 bg-gray-50">
            <label className="w-6 h-6 rounded shrink-0 border border-gray-200 cursor-pointer overflow-hidden relative" style={{ backgroundColor: value }}>
              <input type="color" value={value} onChange={e => onChange(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </label>
            <input
              value={hexDraft}
              onChange={e => setHexDraft(e.target.value)}
              onBlur={() => commitHex(hexDraft)}
              onKeyDown={e => e.key === 'Enter' && commitHex(hexDraft)}
              className="flex-1 min-w-0 text-xs font-mono outline-none bg-transparent"
              placeholder="#RRGGBB"
              maxLength={7}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReferralQRCard({ code, verifiedAt, mm }: { code: string; verifiedAt?: string | null; mm: boolean }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);
  const [color, setColor] = useState(PRIMARY);
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [dotsType, setDotsType] = useState<DotType>('rounded');
  const [showLogo, setShowLogo] = useState(true);

  const [ready, setReady] = useState(false);

  // qr-code-styling touches `document` at module scope — load it client-side only, never at SSR time.
  useEffect(() => {
    let cancelled = false;
    import('qr-code-styling').then(({ default: QRCodeStyling }) => {
      if (cancelled || !boxRef.current) return;
      qrRef.current = new QRCodeStyling({
        width: 200,
        height: 200,
        data: code,
        image: showLogo ? '/medihug-logo.png' : undefined,
        dotsOptions: { color, type: dotsType },
        backgroundOptions: { color: bgColor },
        cornersSquareOptions: { type: dotsType === 'square' ? 'square' : 'extra-rounded', color },
        cornersDotOptions: { type: dotsType === 'square' ? 'square' : 'dot', color },
        imageOptions: { crossOrigin: 'anonymous', margin: 4, imageSize: 0.35 },
      });
      boxRef.current.innerHTML = '';
      qrRef.current.append(boxRef.current);
      setReady(true);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready) return;
    qrRef.current?.update({
      data: code,
      image: showLogo ? '/medihug-logo.png' : undefined,
      dotsOptions: { color, type: dotsType },
      backgroundOptions: { color: bgColor },
      cornersSquareOptions: { type: dotsType === 'square' ? 'square' : 'extra-rounded', color },
      cornersDotOptions: { type: dotsType === 'square' ? 'square' : 'dot', color },
    });
  }, [ready, code, color, bgColor, dotsType, showLogo]);

  return (
    <div className="rounded-xl border p-4 flex flex-col gap-4" style={{ borderColor: `${PRIMARY}30`, backgroundColor: `${PRIMARY}06` }}>
      <p className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: PRIMARY }}>
        <QrCode className="w-3.5 h-3.5" /> {t(mm, { mm: 'ညွှန်းပို့မှု QR', en: 'Referral QR' })}
      </p>

      <div className="flex flex-col items-center gap-2.5">
        <div className="bg-white p-2.5 rounded-lg border border-gray-100">
          <div ref={boxRef} />
        </div>
        <p className="text-[11px] font-mono text-gray-400">{code}</p>
        {verifiedAt ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            <CheckCircle2 className="w-3 h-3" /> {t(mm, { mm: 'ဆေးခန်းက စစ်ဆေးအတည်ပြုပြီး', en: 'Verified by clinic' })}
          </span>
        ) : (
          <span className="text-[11px] font-semibold text-amber-600">{t(mm, { mm: 'မစစ်ဆေးရသေးပါ', en: 'Not yet verified' })}</span>
        )}
      </div>

      {/* Customize */}
      <div className="flex flex-col gap-3 pt-3 border-t" style={{ borderColor: `${PRIMARY}15` }}>
        <div className="grid grid-cols-2 gap-3">
          <ColorSwatchPicker label={t(mm, { mm: 'QR အရောင်', en: 'QR Color' })} value={color} onChange={setColor} />
          <ColorSwatchPicker label={t(mm, { mm: 'နောက်ခံ', en: 'Background' })} value={bgColor} onChange={setBgColor} />
        </div>

        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">{t(mm, { mm: 'ပုံစံ', en: 'Pattern Style' })}</label>
          <div className="grid grid-cols-2 gap-1.5">
            {STYLE_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setDotsType(opt.value)}
                className="px-2.5 py-2 rounded-lg text-xs font-semibold border transition-colors"
                style={{
                  borderColor: dotsType === opt.value ? PRIMARY : '#e5e7eb',
                  backgroundColor: dotsType === opt.value ? `${PRIMARY}0d` : '#fff',
                  color: dotsType === opt.value ? PRIMARY : '#6b7280',
                }}>
                {t(mm, opt)}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer">
          <input type="checkbox" checked={showLogo} onChange={e => setShowLogo(e.target.checked)}
            className="w-4 h-4 rounded accent-current" style={{ color: PRIMARY }} />
          {t(mm, { mm: 'အလယ်တွင် MediHug လိုဂို ပြရန်', en: 'Show MediHug logo in center' })}
        </label>

        <button onClick={() => qrRef.current?.download({ name: code, extension: 'png' })}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: PRIMARY }}>
          <Download className="w-4 h-4" /> {t(mm, { mm: 'QR ဒေါင်းလုဒ်ဆွဲမည်', en: 'Download QR' })}
        </button>
      </div>
    </div>
  );
}
