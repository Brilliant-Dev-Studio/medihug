import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 15 * 1024 * 1024; // 15MB — compression happens client-side before this

export async function uploadImageToS3(file: File): Promise<{ url: string } | { error: string; status: number }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: 'Unsupported file type', status: 400 };
  }
  if (file.size > MAX_SIZE) {
    return { error: 'File too large (max 15MB)', status: 400 };
  }

  const ext = file.type.split('/')[1];
  const key = `uploads/${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await s3.send(new PutObjectCommand({
    Bucket:      process.env.S3_BUCKET_NAME,
    Key:         key,
    Body:        buffer,
    ContentType: file.type,
  }));

  return { url: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}` };
}
