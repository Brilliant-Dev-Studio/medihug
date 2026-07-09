'use client';

import { useState, useCallback } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { UploadCloud, Loader2, X } from 'lucide-react';
import { compressAndUpload } from './uploadImage';

const PRIMARY = '#2ab5ad';

export default function ImageDropzoneMulti({ label, values, onChange, max = 5 }: {
  label: string; values: string[]; onChange: (v: string[]) => void; max?: number;
}) {
  const [status, setStatus] = useState<'idle' | 'compressing' | 'uploading'>('idle');
  const [error, setError]   = useState('');
  const slotsLeft = max - values.length;

  const uploadMany = useCallback(async (files: File[]) => {
    setError('');
    const batch = files.slice(0, slotsLeft);
    try {
      for (const file of batch) {
        const url = await compressAndUpload(file, setStatus);
        onChange([...values, url]);
      }
    } catch { setError('Upload failed'); }
    finally { setStatus('idle'); }
  }, [values, onChange, slotsLeft]);

  const onDrop = useCallback((accepted: File[], rejected: FileRejection[]) => {
    if (rejected.length > 0) { setError(rejected[0].errors[0]?.message ?? 'File rejected'); return; }
    if (accepted.length > 0) uploadMany(accepted);
  }, [uploadMany]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [], 'image/gif': [] },
    maxSize: 15 * 1024 * 1024,
    multiple: true,
    disabled: status !== 'idle' || slotsLeft <= 0,
  });

  const removeAt = (i: number) => onChange(values.filter((_, idx) => idx !== i));

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-semibold text-gray-600">{label}</label>
        <span className="text-[11px] font-semibold text-gray-400">{values.length}/{max}</span>
      </div>

      {values.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-2">
          {values.map((v, i) => (
            <div key={v + i} className="relative group aspect-square">
              <img src={v} alt={`image ${i + 1}`} className="w-full h-full rounded-xl object-cover border border-gray-100" />
              <button type="button" onClick={() => removeAt(i)}
                className="absolute top-1 right-1 w-6 h-6 rounded-lg bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors">
                <X size={12} />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white/90 text-gray-600">Cover</span>
              )}
            </div>
          ))}
        </div>
      )}

      {slotsLeft > 0 && (
        <div
          {...getRootProps()}
          className="rounded-xl border-2 border-dashed px-4 py-6 flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer transition-colors"
          style={{
            borderColor: isDragActive ? PRIMARY : '#d1d5db',
            backgroundColor: isDragActive ? `${PRIMARY}0d` : '#f9fafb',
          }}
        >
          <input {...getInputProps()} />
          {status !== 'idle'
            ? <Loader2 size={20} className="animate-spin" style={{ color: PRIMARY }} />
            : <UploadCloud size={20} style={{ color: isDragActive ? PRIMARY : '#9ca3af' }} />}
          <p className="text-xs font-medium text-gray-500">
            {status === 'compressing' ? 'Compressing...'
              : status === 'uploading' ? 'Uploading...'
              : isDragActive ? 'Drop images here' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-[10px] text-gray-400">Up to {slotsLeft} more · max 15MB each (auto-compressed over 1MB)</p>
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
