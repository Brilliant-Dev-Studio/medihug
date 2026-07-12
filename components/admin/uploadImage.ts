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
    try {
      toUpload = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: file.type,
      });
    } catch (err) {
      console.error('Image compression failed, uploading original file instead:', err);
      toUpload = file;
    }
  }

  onStatus('uploading');
  const fd = new FormData();
  fd.append('file', toUpload, file.name);

  let res: Response;
  try {
    res = await fetch(endpoint, { method: 'POST', body: fd });
  } catch (err) {
    console.error('Upload network error:', err);
    throw new Error('Network error — check your connection and try again');
  }

  let data: { url?: string; error?: string };
  try {
    data = await res.json();
  } catch (err) {
    console.error('Upload response was not JSON:', res.status, err);
    throw new Error(`Upload failed (server returned ${res.status})`);
  }

  if (!res.ok) {
    console.error('Upload rejected by server:', res.status, data.error);
    throw new Error(data.error ?? `Upload failed (${res.status})`);
  }
  return data.url as string;
}
