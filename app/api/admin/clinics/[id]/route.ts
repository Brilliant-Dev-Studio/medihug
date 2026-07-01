import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const INCLUDE = {
  doctors: {
    include: {
      doctor: {
        select: {
          id: true, name: true, nameEn: true, imageUrl: true,
          specialty: true, rating: true, price: true,
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
};

/* ── GET /api/admin/clinics/[id] ── */
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const clinic = await db.clinic.findUnique({ where: { id }, include: INCLUDE });
    if (!clinic) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ clinic });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── PATCH /api/admin/clinics/[id] ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id }  = await params;
    const body    = await req.json();
    const { id: _id, createdAt, updatedAt, doctors, products, _count, ...clinicData } = body;
    void _id; void createdAt; void updatedAt; void _count;

    await db.clinic.update({ where: { id }, data: clinicData });

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
    return NextResponse.json({ clinic });
  } catch (e) {
    console.error('PATCH /api/admin/clinics/[id]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── DELETE /api/admin/clinics/[id] ── */
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.clinic.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
