import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { effectiveCommissionPercent, computePatientPrice, getPlatformSettings } from '@/lib/commission';
import { requireAdmin } from '@/lib/adminAuth';

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
  _count: { select: { doctors: true } },
  owner: { select: { id: true, phone: true, isActive: true } },
  branches: { orderBy: { order: 'asc' as const } },
};

/** Adds a computed `patientPrice` to each linked doctor without touching the admin-facing raw `price`. */
async function withPatientPrices<T extends { doctors: { doctor: { price: number; commissionPercent: number | null } }[] }>(clinic: T) {
  const settings = await getPlatformSettings();
  return {
    ...clinic,
    doctors: clinic.doctors.map(cd => ({
      ...cd,
      doctor: {
        ...cd.doctor,
        patientPrice: computePatientPrice(cd.doctor.price, effectiveCommissionPercent(cd.doctor.commissionPercent, settings.defaultCommissionPercent)),
      },
    })),
  };
}

/* ── GET /api/admin/clinics/[id] ── */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'partners.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const clinic = await db.clinic.findUnique({ where: { id }, include: INCLUDE });
    if (!clinic) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ clinic: await withPatientPrices(clinic) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── PATCH /api/admin/clinics/[id] ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'partners.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id }  = await params;
    const body    = await req.json();
    const { id: _id, createdAt, updatedAt, doctors, products, branches, _count, ...clinicData } = body;
    void _id; void createdAt; void updatedAt; void _count;

    await db.clinic.update({ where: { id }, data: clinicData });

    if (branches !== undefined) {
      await db.clinicBranch.deleteMany({ where: { clinicId: id } });
      if (branches.length > 0) {
        await db.clinicBranch.createMany({
          data: branches.map((b: { title: string; titleEn?: string; address: string; addressEn?: string; mapUrl?: string }, i: number) => ({
            clinicId:  id,
            title:     b.title,
            titleEn:   b.titleEn || null,
            address:   b.address,
            addressEn: b.addressEn || null,
            mapUrl:    b.mapUrl || null,
            order:     i,
          })),
        });
      }
    }

    if (doctors !== undefined) {
      await db.clinicDoctor.deleteMany({ where: { clinicId: id } });
      if (doctors.length > 0) {
        await db.clinicDoctor.createMany({
          data: doctors.map((d: string) => ({ clinicId: id, doctorId: d })),
          skipDuplicates: true,
        });
      }
    }

    if (products !== undefined) {
      await db.clinicProduct.deleteMany({ where: { clinicId: id } });
      if (products.length > 0) {
        await db.clinicProduct.createMany({
          data: products.map((p: string) => ({ clinicId: id, productId: p })),
          skipDuplicates: true,
        });
      }
    }

    const clinic = await db.clinic.findUnique({ where: { id }, include: INCLUDE });
    if (!clinic) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ clinic: await withPatientPrices(clinic) });
  } catch (e) {
    console.error('PATCH /api/admin/clinics/[id]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── DELETE /api/admin/clinics/[id] ── */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'partners.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    await db.clinic.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
