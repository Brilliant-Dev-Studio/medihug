'use client';

import { useRef, useState } from 'react';
import { Loader2, ImagePlus } from 'lucide-react';
import { compressAndUpload } from '@/components/admin/uploadImage';

export default function ImageUploadSlot({ label, url, onChange }: { label: string; url: string | null; onChange: (url: string | null) => void }) {
  const [status, setStatus] = useState<'idle' | 'compressing' | 'uploading'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const uploaded = await compressAndUpload(file, setStatus);
      onChange(uploaded);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setStatus('idle');
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[11px] font-semibold text-gray-500">{label}</p>
      <div className="flex items-center gap-2">
        <div className="w-14 h-14 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
          {status !== 'idle' ? (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          ) : url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={label} className="w-full h-full object-cover" />
          ) : (
            <ImagePlus className="w-4 h-4 text-gray-300" />
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
        <button type="button" onClick={() => inputRef.current?.click()} className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
          {url ? 'Change' : 'Upload'}
        </button>
        {url && (
          <button type="button" onClick={() => onChange(null)} className="text-xs font-semibold px-2 py-1.5 rounded-lg text-red-400 hover:bg-red-50">
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
