import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { effectiveCommissionPercent, computePatientPrice, getPlatformSettings } from '@/lib/commission';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const specialty  = searchParams.get('specialty')  ?? '';
    const search     = searchParams.get('search')     ?? '';
    const suggested  = searchParams.get('suggested')  ?? '';
    const categoryId = searchParams.get('categoryId') ?? '';
    const limit      = parseInt(searchParams.get('limit') ?? '20');
    const skip       = parseInt(searchParams.get('skip')  ?? '0');

    const where: Record<string, unknown> = { isActive: true, isAvailable: true };

    if (suggested === 'true') where.isSuggested = true;
    if (specialty) where.specialty = { contains: specialty, mode: 'insensitive' };
    if (categoryId) where.categories = { some: { categoryId } };
    if (search)    where.OR = [
      { name:   { contains: search, mode: 'insensitive' } },
      { nameEn: { contains: search, mode: 'insensitive' } },
      { specialty: { contains: search, mode: 'insensitive' } },
    ];

    const [doctors, settings] = await Promise.all([
      db.doctor.findMany({
        where,
        include: { slots: { orderBy: { dayOfWeek: 'asc' } } },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      getPlatformSettings(),
    ]);

    const withPatientPrice = doctors.map(d => ({
      ...d,
      patientPrice: computePatientPrice(d.price, effectiveCommissionPercent(d.commissionPercent, settings.defaultCommissionPercent)),
    }));

    return NextResponse.json({ doctors: withPatientPrice });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
