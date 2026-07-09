import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToS3 } from '@/lib/s3-upload';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const result = await uploadImageToS3(file);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ url: result.url });
  } catch (err) {
    console.error('S3 upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
