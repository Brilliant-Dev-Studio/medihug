import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { toCsv } from '@/lib/csv';

const COLUMNS = [
  'name', 'nameEn', 'specialty', 'specialtyEn', 'phone', 'phoneSecondary', 'viber',
  'experience', 'price', 'isAvailable', 'isActive', 'qualifications',
  'careerMm', 'careerEn', 'bio', 'clinicNote', 'clinicNoteEn', 'location',
  'languages', 'clinicTypesMm', 'clinicTypesEn', 'imageUrl',
];

/* ── GET /api/admin/doctors/export — full doctor list as a CSV download ── */
export async function GET() {
  try {
    const doctors = await db.doctor.findMany({ orderBy: { createdAt: 'desc' } });

    const rows = doctors.map(d => ({
      name: d.name, nameEn: d.nameEn ?? '', specialty: d.specialty, specialtyEn: d.specialtyEn ?? '',
      phone: d.phone ?? '', phoneSecondary: d.phoneSecondary ?? '', viber: d.viber ?? '',
      experience: d.experience, price: d.price,
      isAvailable: d.isAvailable, isActive: d.isActive,
      qualifications: d.qualifications ?? '', careerMm: d.careerMm ?? '', careerEn: d.careerEn ?? '',
      bio: d.bio ?? '', clinicNote: d.clinicNote ?? '', clinicNoteEn: d.clinicNoteEn ?? '',
      location: d.location ?? '',
      languages: d.languages.join('; '), clinicTypesMm: d.clinicTypesMm.join('; '), clinicTypesEn: d.clinicTypesEn.join('; '),
      imageUrl: d.imageUrl ?? '',
    }));

    const csv = toCsv(rows, COLUMNS);
    const filename = `doctors-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
