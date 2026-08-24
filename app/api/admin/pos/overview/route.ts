import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { resolveCommission, classifyOwnership, type RevenueOwnership } from '@/lib/commission';

/* ── GET /api/admin/pos/overview?range=daily|monthly ──
   Platform commission profit, product sales revenue, best-selling products,
   and top doctors by booking count. Only COMPLETED appointments/orders count as realized. */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const range = req.nextUrl.searchParams.get('range') === 'monthly' ? 'monthly' : 'daily';

    const since = new Date();
    if (range === 'daily') {
      since.setDate(since.getDate() - 29);
      since.setHours(0, 0, 0, 0);
    } else {
      since.setMonth(since.getMonth() - 11);
      since.setDate(1);
      since.setHours(0, 0, 0, 0);
    }

    const [
      commissionAgg, productItems, apptFeeAgg,
      seriesAppointments, seriesOrders,
      topDoctorsRaw,
    ] = await Promise.all([
      db.appointment.aggregate({ where: { status: 'COMPLETED' }, _sum: { platformFeeAmount: true } }),
      db.orderItem.findMany({
        where: { order: { status: 'COMPLETED' } },
        select: {
          productId: true, quantity: true, price: true,
          product: { select: { name: true, nameEn: true, imageUrl: true } },
        },
      }),
      db.appointment.aggregate({ where: { status: 'COMPLETED' }, _sum: { fee: true } }),
      db.appointment.findMany({
        where: { status: 'COMPLETED', date: { gte: since } },
        select: { date: true, platformFeeAmount: true },
      }),
      db.order.findMany({
        where: { status: 'COMPLETED', createdAt: { gte: since } },
        select: { createdAt: true, items: { select: { price: true, quantity: true } } },
      }),
      db.appointment.groupBy({
        by: ['doctorId'],
        where: { status: 'COMPLETED' },
        _count: { _all: true },
        _sum: { platformFeeAmount: true },
        orderBy: { _count: { doctorId: 'desc' } },
        take: 10,
      }),
    ]);

    // Best-selling products — OrderItem.price is a per-unit snapshot, not a line total.
    const productMap = new Map<string, { name: string; nameEn: string | null; imageUrl: string | null; qty: number; revenue: number }>();
    for (const item of productItems) {
      const existing = productMap.get(item.productId);
      const revenue = item.price * item.quantity;
      if (existing) {
        existing.qty += item.quantity;
        existing.revenue += revenue;
      } else {
        productMap.set(item.productId, {
          name: item.product.name, nameEn: item.product.nameEn, imageUrl: item.product.imageUrl,
          qty: item.quantity, revenue,
        });
      }
    }
    const bestSellingProducts = [...productMap.entries()]
      .map(([productId, v]) => ({ productId, ...v }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);

    const totalProductRevenue = [...productMap.values()].reduce((sum, p) => sum + p.revenue, 0);

    // Revenue Ownership breakdown — A. Medihug / B. Partner / C. Shared.
    // Doctor consultation revenue (markup + platform fee) is inherently Medihug revenue.
    const ownership: Record<RevenueOwnership, number> = { MEDIHUG: 0, PARTNER: 0, SHARED: 0 };
    ownership.MEDIHUG += apptFeeAgg._sum.fee ?? 0;

    const productClinicLinks = await db.clinicProduct.findMany({
      where: { productId: { in: [...productMap.keys()] } },
      select: { productId: true, clinicId: true },
    });
    const productClinicMap = new Map(productClinicLinks.map(l => [l.productId, l.clinicId]));
    const productClinicIds = [...new Set(productClinicLinks.map(l => l.clinicId))];
    const productPercentByClinic = new Map<string, number>();
    await Promise.all(productClinicIds.map(async clinicId => {
      const { percent } = await resolveCommission({ serviceType: 'PRODUCT', clinicId });
      productPercentByClinic.set(clinicId, percent);
    }));
    for (const [productId, p] of productMap) {
      const clinicId = productClinicMap.get(productId) ?? null;
      const percent = clinicId ? (productPercentByClinic.get(clinicId) ?? 100) : 100;
      ownership[classifyOwnership(clinicId, percent)] += p.revenue;
    }

    const approvedEnrollments = await db.programEnrollment.findMany({
      where: { status: 'APPROVED' },
      select: { amount: true, program: { select: { clinicId: true, doctors: { select: { id: true }, take: 1 } } } },
    });
    for (const en of approvedEnrollments) {
      const clinicId = en.program.clinicId;
      // A partner program with Medihug doctors attached is a shared/co-run offering
      // (per admin's own example: Weight Program run jointly) — no shared doctors means
      // it's purely the partner's own program, referral commission doesn't apply.
      const percent = !clinicId ? 100 : en.program.doctors.length > 0 ? 50 : 0;
      ownership[classifyOwnership(clinicId, percent)] += en.amount;
    }

    const manualRevenueEntries = await db.revenueEntry.findMany({
      select: { amount: true, clinicId: true, platformAmount: true },
    });
    for (const entry of manualRevenueEntries) {
      const percent = entry.clinicId
        ? Math.round(((entry.platformAmount ?? entry.amount) / entry.amount) * 100)
        : 100;
      ownership[classifyOwnership(entry.clinicId, percent)] += entry.amount;
    }

    // Top doctors by booking count
    const doctorIds = topDoctorsRaw.map(d => d.doctorId);
    const doctors = await db.doctor.findMany({
      where: { id: { in: doctorIds } },
      select: { id: true, name: true, nameEn: true, imageUrl: true },
    });
    const doctorMap = new Map(doctors.map(d => [d.id, d]));
    const topDoctorsByBookings = topDoctorsRaw.map(d => ({
      doctor: doctorMap.get(d.doctorId) ?? null,
      bookings: d._count._all,
      commission: d._sum.platformFeeAmount ?? 0,
    }));

    // Bucket into daily (30 days) or monthly (12 months) labeled series
    const buckets: { key: string; label: string; start: Date; end: Date }[] = [];
    if (range === 'daily') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - i);
        const end = new Date(d); end.setDate(end.getDate() + 1);
        buckets.push({ key: d.toISOString(), label: d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }), start: d, end });
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        d.setMonth(d.getMonth() - i);
        const end = new Date(d); end.setMonth(end.getMonth() + 1);
        buckets.push({ key: d.toISOString(), label: d.toLocaleDateString('en-US', { month: 'short' }), start: d, end });
      }
    }

    const series = buckets.map(({ label, start, end }) => {
      const commission = seriesAppointments
        .filter(a => a.date >= start && a.date < end)
        .reduce((sum, a) => sum + (a.platformFeeAmount ?? 0), 0);
      const productRevenue = seriesOrders
        .filter(o => o.createdAt >= start && o.createdAt < end)
        .reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.price * i.quantity, 0), 0);
      return { label, commission, productRevenue };
    });

    return NextResponse.json({
      range,
      totalCommission: commissionAgg._sum.platformFeeAmount ?? 0,
      totalProductRevenue,
      totalAppointmentRevenue: apptFeeAgg._sum.fee ?? 0,
      ownership,
      series,
      bestSellingProducts,
      topDoctorsByBookings,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
