import imageCompression from 'browser-image-compression';

const COMPRESS_THRESHOLD = 1 * 1024 * 1024; // compress anything bigger than 1MB

export async function compressAndUpload(
  file: File,
  onStatus: (s: 'compressing' | 'uploading') => void,
  endpoint: string = '/api/admin/upload',
): Promise<string> {
  let toUpload: File | Blob = file;

  if (file.size > COMPRESS_THRESHOLD && file.type !== 'image/gif') {
    onStatus('compressing');
    toUpload = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: file.type,
    });
  }

  onStatus('uploading');
  const fd = new FormData();
  fd.append('file', toUpload, file.name);
  const res  = await fetch(endpoint, { method: 'POST', body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Upload failed');
  return data.url as string;
}
