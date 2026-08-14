import imageCompression from 'browser-image-compression';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB hard cap for any chat attachment

export interface ChatUploadResult { url: string; name: string; type: string; }

/** Images are compressed down into the low-hundreds-of-KB range before upload; other files
 * pass through unchanged as long as they're under the 5MB cap. */
export async function uploadChatAttachment(
  file: File,
  endpoint: string,
  extraFields: Record<string, string> = {},
): Promise<ChatUploadResult> {
  let toUpload: File | Blob = file;

  if (IMAGE_TYPES.includes(file.type) && file.type !== 'image/gif') {
    try {
      toUpload = await imageCompression(file, {
        maxSizeMB: 0.3, // ~300KB target
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        fileType: file.type,
      });
    } catch (err) {
      console.error('Chat image compression failed, uploading original file instead:', err);
      toUpload = file;
    }
  }

  if (toUpload.size > MAX_SIZE) {
    throw new Error('File too large (max 5MB)');
  }

  const fd = new FormData();
  fd.append('file', toUpload, file.name);
  for (const [k, v] of Object.entries(extraFields)) fd.append(k, v);

  let res: Response;
  try {
    res = await fetch(endpoint, { method: 'POST', body: fd });
  } catch (err) {
    console.error('Chat upload network error:', err);
    throw new Error('Network error — check your connection and try again');
  }

  let data: { url?: string; name?: string; type?: string; error?: string };
  try {
    data = await res.json();
  } catch (err) {
    console.error('Chat upload response was not JSON:', res.status, err);
    throw new Error(`Upload failed (server returned ${res.status})`);
  }

  if (!res.ok) {
    console.error('Chat upload rejected by server:', res.status, data.error);
    throw new Error(data.error ?? `Upload failed (${res.status})`);
  }

  return { url: data.url!, name: data.name ?? file.name, type: data.type ?? file.type };
}
