'use client';

import { useState, useCallback } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { UploadCloud, Loader2, X } from 'lucide-react';
import { compressAndUpload } from './uploadImage';

const PRIMARY = '#2ab5ad';

export default function ImageDropzone({ label, value, onChange, aspect }: {
  label: string; value: string; onChange: (v: string) => void; aspect: 'square' | 'wide';
}) {
  const [status, setStatus] = useState<'idle' | 'compressing' | 'uploading'>('idle');
  const [error, setError]   = useState('');

  const upload = useCallback(async (file: File) => {
    setError('');
    try {
      const url = await compressAndUpload(file, setStatus);
      onChange(url);
    } catch { setError('Upload failed'); }
    finally { setStatus('idle'); }
  }, [onChange]);

  const onDrop = useCallback((accepted: File[], rejected: FileRejection[]) => {
    if (rejected.length > 0) { setError(rejected[0].errors[0]?.message ?? 'File rejected'); return; }
    if (accepted[0]) upload(accepted[0]);
  }, [upload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [], 'image/gif': [] },
    maxSize: 15 * 1024 * 1024,
    multiple: false,
    disabled: status !== 'idle',
  });

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>

      {value ? (
        <div className="relative group">
          <img
            src={value} alt="preview"
            className={`w-full rounded-xl object-cover border border-gray-100 ${aspect === 'wide' ? 'h-36' : 'h-40'}`}
          />
          <button type="button" onClick={() => onChange('')}
            className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors">
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className="rounded-xl border-2 border-dashed px-4 py-8 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-colors"
          style={{
            borderColor: isDragActive ? PRIMARY : '#d1d5db',
            backgroundColor: isDragActive ? `${PRIMARY}0d` : '#f9fafb',
          }}
        >
          <input {...getInputProps()} />
          {status !== 'idle'
            ? <Loader2 size={22} className="animate-spin" style={{ color: PRIMARY }} />
            : <UploadCloud size={22} style={{ color: isDragActive ? PRIMARY : '#9ca3af' }} />}
          <p className="text-xs font-medium text-gray-500">
            {status === 'compressing' ? 'Compressing...'
              : status === 'uploading' ? 'Uploading...'
              : isDragActive ? 'Drop image here' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-[10px] text-gray-400">JPG, PNG, WEBP, GIF · max 15MB (auto-compressed over 1MB)</p>
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
