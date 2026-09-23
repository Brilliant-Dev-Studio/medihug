import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patientWhere } from '@/lib/roleAccess';

export async function GET() {
  try {
    const [doctorCount, patientCount, ratingAgg] = await Promise.all([
      db.doctor.count({ where: { isActive: true } }),
      db.user.count({ where: patientWhere }),
      db.doctor.aggregate({
        where: { isActive: true, reviewCount: { gt: 0 } },
        _avg: { rating: true },
      }),
    ]);

    return NextResponse.json({
      doctorCount,
      patientCount,
      avgRating: ratingAgg._avg.rating ?? 0,
    });
  } catch (e) {
    console.error('Public stats error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
