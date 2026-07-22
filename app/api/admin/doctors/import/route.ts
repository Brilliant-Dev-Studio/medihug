import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { parseCsv } from '@/lib/csv';

function toBool(s: string, fallback: boolean): boolean {
  if (s === '' || s === undefined) return fallback;
  return ['true', '1', 'yes'].includes(s.trim().toLowerCase());
}
function toInt(s: string, fallback: number): number {
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : fallback;
}
function splitList(s: string): string[] {
  return s.split(';').map(x => x.trim()).filter(Boolean);
}

/* ── POST /api/admin/doctors/import — bulk-create doctors from a CSV file ──
 * Expected header row (from /api/admin/doctors/export): name, nameEn, specialty,
 * specialtyEn, phone, phoneSecondary, viber, experience, price, isAvailable, isActive,
 * qualifications, careerMm, careerEn, bio, clinicNote, clinicNoteEn, location, languages,
 * clinicTypesMm, clinicTypesEn, imageUrl.
 * Login password defaults to the phone number (same convention used for patient
 * self-registration elsewhere in this app) since a CSV can't safely carry real passwords. */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    const rows = parseCsv(text);
    if (rows.length === 0) {
      return NextResponse.json({ error: 'CSV has no data rows' }, { status: 400 });
    }

    const created: string[] = [];
    const skipped: { row: number; name: string; reason: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const name = r.name?.trim();
      const specialty = r.specialty?.trim();
      const phone = r.phone?.trim();

      if (!name || !specialty || !phone) {
        skipped.push({ row: i + 2, name: name || '(blank)', reason: 'Missing name, specialty, or phone' });
        continue;
      }

      const existing = await db.user.findUnique({ where: { phone } });
      if (existing) {
        skipped.push({ row: i + 2, name, reason: `Phone ${phone} already registered` });
        continue;
      }

      const hashedPassword = await bcrypt.hash(phone, 12);
      await db.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: { name, phone, password: hashedPassword, role: 'DOCTOR', isActive: true },
        });
        await tx.doctor.create({
          data: {
            userId: user.id,
            name,
            nameEn: r.nameEn || null,
            specialty,
            specialtyEn: r.specialtyEn || null,
            phone,
            phoneSecondary: r.phoneSecondary || null,
            viber: r.viber || null,
            experience: toInt(r.experience, 0),
            price: toInt(r.price, 0),
            isAvailable: toBool(r.isAvailable, true),
            isActive: toBool(r.isActive, true),
            qualifications: r.qualifications || null,
            careerMm: r.careerMm || null,
            careerEn: r.careerEn || null,
            bio: r.bio || null,
            clinicNote: r.clinicNote || null,
            clinicNoteEn: r.clinicNoteEn || null,
            location: r.location || null,
            languages: splitList(r.languages ?? ''),
            clinicTypesMm: splitList(r.clinicTypesMm ?? ''),
            clinicTypesEn: splitList(r.clinicTypesEn ?? ''),
            imageUrl: r.imageUrl || null,
          },
        });
      });
      created.push(name);
    }

    return NextResponse.json({ createdCount: created.length, created, skipped, total: rows.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
