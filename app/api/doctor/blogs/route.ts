import { NextRequest, NextResponse } from 'next/server';
import { verifyDoctorToken } from '@/lib/jwt';
import { db } from '@/lib/db';

async function requireDoctorId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('doctor_token')?.value;
  if (!token) return null;
  const payload = await verifyDoctorToken(token);
  return payload?.doctorId ?? null;
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base || 'blog';
  let n = 0;
  for (;;) {
    const candidate = n === 0 ? slug : `${slug}-${n}`;
    const existing  = await db.blog.findUnique({ where: { slug: candidate } });
    if (!existing) return candidate;
    n++;
  }
}

/* ── GET /api/doctor/blogs — own blogs only ── */
export async function GET(req: NextRequest) {
  const doctorId = await requireDoctorId(req);
  if (!doctorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const search   = searchParams.get('search') ?? '';
  const page     = Math.max(1, parseInt(searchParams.get('page')     ?? '1'));
  const pageSize = Math.max(1, parseInt(searchParams.get('pageSize') ?? '12'));

  const where: Record<string, unknown> = { authorDoctorId: doctorId };
  if (search) {
    where.OR = [
      { title:   { contains: search, mode: 'insensitive' } },
      { titleEn: { contains: search, mode: 'insensitive' } },
    ];
  }
  const [blogs, total] = await Promise.all([
    db.blog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true, title: true, titleEn: true, slug: true,
        excerpt: true, imageUrl: true, category: true,
        isPublished: true, publishedAt: true, createdAt: true,
      },
    }),
    db.blog.count({ where }),
  ]);

  return NextResponse.json({ blogs, total, page, pageSize });
}

/* ── POST /api/doctor/blogs — create, authored by the logged-in doctor ── */
export async function POST(req: NextRequest) {
  const doctorId = await requireDoctorId(req);
  if (!doctorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { title, titleEn, content, excerpt, imageUrl, category, isPublished } = body;

    if (!title?.trim())   return NextResponse.json({ error: 'Title is required.'   }, { status: 400 });
    if (!content?.trim()) return NextResponse.json({ error: 'Content is required.' }, { status: 400 });

    const slug = await uniqueSlug(toSlug(title));
    const publish = isPublished === true;

    const blog = await db.blog.create({
      data: {
        title: title.trim(), titleEn: titleEn?.trim() || null, slug,
        content: content.trim(), excerpt: excerpt?.trim() || null,
        imageUrl: imageUrl?.trim() || null, category: category?.trim() || null,
        isPublished: publish, publishedAt: publish ? new Date() : null,
        authorDoctorId: doctorId,
      },
    });

    return NextResponse.json({ blog }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
