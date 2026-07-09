import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

/* ── GET /api/admin/doctors ── */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const search      = searchParams.get('search')      ?? '';
    const specialty   = searchParams.get('specialty')   ?? '';
    const isAvailable = searchParams.get('isAvailable') ?? '';
    const isActive    = searchParams.get('isActive')    ?? '';
    const page        = parseInt(searchParams.get('page')     ?? '1');
    const pageSize    = parseInt(searchParams.get('pageSize') ?? '10');

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name:   { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
        { phone:  { contains: search } },
      ];
    }
    if (specialty)            where.specialty   = { contains: specialty, mode: 'insensitive' };
    if (isAvailable !== '')   where.isAvailable = isAvailable === 'true';
    if (isActive    !== '')   where.isActive    = isActive    === 'true';

    const [doctors, total] = await Promise.all([
      db.doctor.findMany({
        where,
        include: { slots: true, user: { select: { phone: true, isActive: true } } },
        orderBy: { createdAt: 'desc' },
        skip:  (page - 1) * pageSize,
        take:  pageSize,
      }),
      db.doctor.count({ where }),
    ]);

    return NextResponse.json({ doctors, total, page, pageSize });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── POST /api/admin/doctors ── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, nameEn, specialty, specialtyEn, bio,
      phone, phoneSecondary, viber, password, imageUrl, experience, price,
      isAvailable, slots, gallery,
    } = body;

    if (!name || !specialty || !phone || !password) {
      return NextResponse.json({ error: 'name, specialty, phone, password are required.' }, { status: 400 });
    }

    // Check phone not already taken
    const existing = await db.user.findUnique({ where: { phone } });
    if (existing) {
      return NextResponse.json({ error: 'ဤဖုန်းနံပါတ်သည် မှတ်ပုံတင်ပြီးသား ဖြစ်သည်။' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create User + Doctor in transaction
    const doctor = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          phone,
          password: hashedPassword,
          role:     'DOCTOR',
          isActive: true,
        },
      });

      const doc = await tx.doctor.create({
        data: {
          userId:      user.id,
          name,
          nameEn:      nameEn      || null,
          specialty,
          specialtyEn: specialtyEn || null,
          bio:         bio         || null,
          phone,
          phoneSecondary: phoneSecondary || null,
          viber:          viber          || null,
          imageUrl:       imageUrl       || null,
          experience:  experience  ?? 0,
          price:       price       ?? 0,
          isAvailable: isAvailable ?? true,
          isActive:    true,
        },
      });

      if (slots && slots.length > 0) {
        await tx.doctorSlot.createMany({
          data: slots.map((s: { dayOfWeek: number; startTime: string; endTime: string; duration: number; maxPerSlot: number }) => ({
            doctorId:   doc.id,
            dayOfWeek:  s.dayOfWeek,
            startTime:  s.startTime,
            endTime:    s.endTime,
            duration:   s.duration   ?? 30,
            maxPerSlot: s.maxPerSlot ?? 1,
          })),
        });
      }

      if (gallery && gallery.length > 0) {
        await tx.doctorGallery.createMany({
          data: gallery.map((g: { imageUrl: string; captionMm?: string; captionEn?: string }, i: number) => ({
            doctorId:  doc.id,
            imageUrl:  g.imageUrl,
            captionMm: g.captionMm ?? '',
            captionEn: g.captionEn ?? '',
            order:     i,
          })),
        });
      }

      return tx.doctor.findUnique({
        where:   { id: doc.id },
        include: { slots: true, gallery: true },
      });
    });

    return NextResponse.json({ doctor }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
