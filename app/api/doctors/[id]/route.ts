import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { effectiveCommissionPercent, computePatientPrice, getPlatformSettings } from '@/lib/commission';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [doctor, settings] = await Promise.all([
      db.doctor.findUnique({
        where:   { id, isActive: true },
        include: {
          slots:   { orderBy: { dayOfWeek: 'asc' } },
          gallery: { orderBy: { order: 'asc' } },
        },
      }),
      getPlatformSettings(),
    ]);
    if (!doctor) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const patientPrice = computePatientPrice(doctor.price, effectiveCommissionPercent(doctor.commissionPercent, settings.defaultCommissionPercent));
    return NextResponse.json({ doctor: { ...doctor, patientPrice } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
