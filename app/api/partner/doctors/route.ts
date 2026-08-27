import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { verifyPartnerToken } from '@/lib/jwt';
import { db } from '@/lib/db';
import { notify } from '@/lib/notify';

/* ── GET /api/partner/doctors — read-only, doctors attached to own clinic ── */
export async function GET(req: NextRequest) {
  const token = req.cookies.get('partner_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyPartnerToken(token);
  if (!payload?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const links = await db.clinicDoctor.findMany({
    where: { clinicId: payload.clinicId },
    include: { doctor: true },
  });
  return NextResponse.json({ doctors: links.map(l => l.doctor) });
}

/* ── POST /api/partner/doctors — create a doctor + login account, auto-linked to this
 * clinic only (no clinic picker — a partner can never attach a doctor to someone else's
 * clinic). Mirrors /api/admin/doctors' creation shape; activates immediately like the admin
 * flow, and notifies every admin so there's visibility into partner-created accounts. ── */
export async function POST(req: NextRequest) {
  const token = req.cookies.get('partner_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyPartnerToken(token);
  if (!payload?.clinicId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const {
      name, nameEn, specialty, specialtyEn, bio,
      phone, phoneSecondary, viber, password, imageUrl, experience, price,
      isAvailable, slots, gallery,
      qualifications, careerMm, careerEn, clinicNote, clinicNoteEn, location,
      clinicTypesMm, clinicTypesEn, languages,
    } = body;

    if (!name || !specialty || !phone || !password) {
      return NextResponse.json({ error: 'name, specialty, phone, password are required.' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { phone } });
    if (existing) {
      return NextResponse.json({ error: 'ဤဖုန်းနံပါတ်သည် မှတ်ပုံတင်ပြီးသား ဖြစ်သည်။' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const doctor = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name, phone, password: hashedPassword, role: 'DOCTOR', isActive: true },
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
          qualifications: qualifications || null,
          careerMm:       careerMm       || null,
          careerEn:       careerEn       || null,
          clinicNote:     clinicNote     || null,
          clinicNoteEn:   clinicNoteEn   || null,
          location:       location       || null,
          clinicTypesMm:  clinicTypesMm  ?? [],
          clinicTypesEn:  clinicTypesEn  ?? [],
          languages:      languages      ?? [],
        },
      });

      // The whole point of this endpoint: auto-link to the partner's own clinic, never a
      // clinic picker — a partner can only ever create doctors for their own shop.
      await tx.clinicDoctor.create({ data: { clinicId: payload.clinicId!, doctorId: doc.id } });

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

    if (doctor) {
      const clinic = await db.clinic.findUnique({ where: { id: payload.clinicId }, select: { name: true, nameEn: true, imageUrl: true } });
      const clinicName = clinic?.nameEn ?? clinic?.name ?? 'A partner clinic';
      const admins = await db.user.findMany({
        where:  { role: 'SUPER_ADMIN', isActive: true },
        select: { id: true },
      });
      for (const admin of admins) {
        notify({
          userId: admin.id,
          type: 'partner-doctor-created',
          title: clinicName,
          body: `created a new doctor: ${doctor.nameEn ?? doctor.name}.`,
          actionUrl: `/admin/doctors/${doctor.id}`,
          actorName: clinicName,
          actorAvatar: clinic?.imageUrl ?? null,
        });
      }
    }

    return NextResponse.json({ doctor }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
