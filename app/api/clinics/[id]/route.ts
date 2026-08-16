import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { effectiveCommissionPercent, computePatientPrice, getPlatformSettings } from '@/lib/commission';

const INCLUDE = {
  doctors: {
    include: {
      doctor: {
        select: {
          id: true, name: true, nameEn: true, imageUrl: true,
          specialty: true, rating: true, price: true, commissionPercent: true,
          experience: true, isAvailable: true,
        },
      },
    },
  },
  products: {
    include: {
      product: {
        select: { id: true, name: true, nameEn: true, imageUrl: true, price: true, packSize: true },
      },
    },
  },
  branches: { orderBy: { order: 'asc' as const } },
};

/* ── GET /api/clinics/[id] — public clinic detail, active partner clinics only ── */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [clinic, settings] = await Promise.all([
      db.clinic.findUnique({ where: { id, isActive: true }, include: INCLUDE }),
      getPlatformSettings(),
    ]);
    if (!clinic) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const withPrices = {
      ...clinic,
      doctors: clinic.doctors.map(cd => ({
        ...cd,
        doctor: {
          ...cd.doctor,
          patientPrice: computePatientPrice(cd.doctor.price, effectiveCommissionPercent(cd.doctor.commissionPercent, settings.defaultCommissionPercent)),
        },
      })),
    };

    return NextResponse.json({ clinic: withPrices });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
