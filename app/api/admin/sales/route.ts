import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/app/generated/prisma/client';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';

type SourceType = 'CONSULTATION' | 'PROGRAM' | 'PRODUCT';

/* ── GET /api/admin/sales?search=&sourceType=&paymentMethod=&from=&to=&page= ──
 * Unified read-only report of every completed transaction (product order, consultation,
 * program enrollment), one row per RevenueLedger entry — the ledger is written exactly
 * once per completed transaction (unique on sourceType+sourceId) and already carries the
 * Medihug/Partner share split, so this endpoint only needs to join in patient/service/
 * discount/payment-method/points context, batched by sourceType to avoid N+1 queries. */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = req.nextUrl;
    const search        = searchParams.get('search')?.trim() ?? '';
    const sourceType     = (searchParams.get('sourceType') ?? '') as SourceType | '';
    const paymentMethod  = searchParams.get('paymentMethod') ?? '';
    const from           = searchParams.get('from') ?? '';
    const to             = searchParams.get('to') ?? '';
    const page  = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = 20;
    const skip  = (page - 1) * limit;

    const wantProduct      = !sourceType || sourceType === 'PRODUCT';
    const wantConsultation = !sourceType || sourceType === 'CONSULTATION';
    const wantProgram      = !sourceType || sourceType === 'PROGRAM';
    const needsResolve = !!search || !!paymentMethod;

    // RevenueLedger has no direct patient/paymentMethod field of its own — resolve which
    // Order/Appointment/ProgramEnrollment rows match first, then filter the ledger by
    // sourceType+sourceId. This keeps count()/pagination accurate (vs. filtering in memory
    // after the page is fetched, which would break total/totalPages).
    const userSearchOr: Prisma.UserWhereInput[] | undefined = search
      ? [{ name: { contains: search, mode: 'insensitive' } }, { phone: { contains: search } }]
      : undefined;

    const [matchedOrders, matchedAppointments, matchedEnrollments] = needsResolve
      ? await Promise.all([
          wantProduct
            ? db.order.findMany({
                where: { ...(paymentMethod && { paymentMethod }), ...(userSearchOr && { user: { OR: userSearchOr } }) },
                select: { id: true },
              })
            : Promise.resolve([]),
          wantConsultation
            ? db.appointment.findMany({
                where: { ...(paymentMethod && { paymentMethod }), ...(userSearchOr && { user: { OR: userSearchOr } }) },
                select: { id: true },
              })
            : Promise.resolve([]),
          wantProgram
            ? db.programEnrollment.findMany({
                where: { ...(paymentMethod && { paymentMethod }), ...(userSearchOr && { user: { OR: userSearchOr } }) },
                select: { id: true },
              })
            : Promise.resolve([]),
        ])
      : [[], [], []];

    const and: Prisma.RevenueLedgerWhereInput[] = [];
    if (sourceType) and.push({ sourceType });
    if (from || to) {
      and.push({
        createdAt: {
          ...(from && { gte: new Date(`${from}T00:00:00`) }),
          ...(to && { lte: new Date(`${to}T23:59:59.999`) }),
        },
      });
    }
    if (needsResolve) {
      and.push({
        OR: [
          ...(wantProduct ? [{ sourceType: 'PRODUCT' as const, sourceId: { in: matchedOrders.map(o => o.id) } }] : []),
          ...(wantConsultation ? [{ sourceType: 'CONSULTATION' as const, sourceId: { in: matchedAppointments.map(a => a.id) } }] : []),
          ...(wantProgram ? [{ sourceType: 'PROGRAM' as const, sourceId: { in: matchedEnrollments.map(e => e.id) } }] : []),
        ],
      });
    }
    const where: Prisma.RevenueLedgerWhereInput = and.length ? { AND: and } : {};

    const [entries, total, totals] = await Promise.all([
      db.revenueLedger.findMany({
        where, orderBy: { createdAt: 'desc' }, skip, take: limit,
        include: { clinic: { select: { name: true, nameEn: true } } },
      }),
      db.revenueLedger.count({ where }),
      db.revenueLedger.aggregate({ where, _sum: { patientPaid: true, medihugShareAmount: true, partnerShareAmount: true } }),
    ]);

    const orderIds       = entries.filter(e => e.sourceType === 'PRODUCT').map(e => e.sourceId);
    const appointmentIds = entries.filter(e => e.sourceType === 'CONSULTATION').map(e => e.sourceId);
    const enrollmentIds  = entries.filter(e => e.sourceType === 'PROGRAM').map(e => e.sourceId);

    const [orders, appointments, enrollments, pointsRows] = await Promise.all([
      orderIds.length
        ? db.order.findMany({
            where: { id: { in: orderIds } },
            select: {
              id: true, paymentMethod: true, pointsDiscountAmount: true, voucherDiscountAmount: true,
              user: { select: { name: true, phone: true } },
              items: { select: { product: { select: { name: true, nameEn: true } } } },
            },
          })
        : Promise.resolve([]),
      appointmentIds.length
        ? db.appointment.findMany({
            where: { id: { in: appointmentIds } },
            select: {
              id: true, paymentMethod: true, pointsDiscountAmount: true, voucherDiscountAmount: true,
              user: { select: { name: true, phone: true } },
              doctor: { select: { name: true, nameEn: true, specialty: true, specialtyEn: true } },
            },
          })
        : Promise.resolve([]),
      enrollmentIds.length
        ? db.programEnrollment.findMany({
            where: { id: { in: enrollmentIds } },
            select: {
              id: true, paymentMethod: true, pointsDiscountAmount: true, voucherDiscountAmount: true,
              user: { select: { name: true, phone: true } },
              program: { select: { titleMm: true, titleEn: true } },
            },
          })
        : Promise.resolve([]),
      entries.length
        ? db.pointsLedger.findMany({
            where: { voidedAt: null, OR: entries.map(e => ({ sourceType: e.sourceType, sourceId: e.sourceId })) },
            select: { sourceType: true, sourceId: true, type: true, points: true },
          })
        : Promise.resolve([]),
    ]);

    const orderMap = new Map(orders.map(o => [o.id, o]));
    const apptMap  = new Map(appointments.map(a => [a.id, a]));
    const enrMap   = new Map(enrollments.map(e => [e.id, e]));

    const pointsMap = new Map<string, { earned: number; redeemed: number }>();
    for (const p of pointsRows) {
      const key = `${p.sourceType}:${p.sourceId}`;
      const cur = pointsMap.get(key) ?? { earned: 0, redeemed: 0 };
      if (p.type === 'EARNED') cur.earned = p.points;
      else cur.redeemed = Math.abs(p.points);
      pointsMap.set(key, cur);
    }

    const sales = entries.map(e => {
      const pts = pointsMap.get(`${e.sourceType}:${e.sourceId}`) ?? { earned: 0, redeemed: 0 };
      const clinicLabel = e.clinic ? (e.clinic.nameEn ?? e.clinic.name) : 'Medihug Direct';

      if (e.sourceType === 'PRODUCT') {
        const o = orderMap.get(e.sourceId);
        return {
          id: e.id, sourceType: e.sourceType, createdAt: e.createdAt,
          patient: o?.user ?? null,
          service: o?.items.map(i => i.product.nameEn ?? i.product.name).join(', ') || '—',
          amount: e.patientPaid,
          discount: (o?.pointsDiscountAmount ?? 0) + (o?.voucherDiscountAmount ?? 0),
          paymentMethod: o?.paymentMethod ?? null,
          partnerOrDoctor: clinicLabel,
          medihugShareAmount: e.medihugShareAmount, partnerShareAmount: e.partnerShareAmount,
          pointsEarned: pts.earned, pointsRedeemed: pts.redeemed,
        };
      }
      if (e.sourceType === 'CONSULTATION') {
        const a = apptMap.get(e.sourceId);
        const doctorName = a?.doctor ? (a.doctor.nameEn ?? a.doctor.name) : null;
        const specialty  = a?.doctor ? (a.doctor.specialtyEn ?? a.doctor.specialty) : null;
        return {
          id: e.id, sourceType: e.sourceType, createdAt: e.createdAt,
          patient: a?.user ?? null,
          service: doctorName ? `Dr. ${doctorName}${specialty ? ` · ${specialty}` : ''}` : '—',
          amount: e.patientPaid,
          discount: (a?.pointsDiscountAmount ?? 0) + (a?.voucherDiscountAmount ?? 0),
          paymentMethod: a?.paymentMethod ?? null,
          partnerOrDoctor: doctorName ?? clinicLabel,
          medihugShareAmount: e.medihugShareAmount, partnerShareAmount: e.partnerShareAmount,
          pointsEarned: pts.earned, pointsRedeemed: pts.redeemed,
        };
      }
      // PROGRAM
      const en = enrMap.get(e.sourceId);
      return {
        id: e.id, sourceType: e.sourceType, createdAt: e.createdAt,
        patient: en?.user ?? null,
        service: en?.program ? (en.program.titleEn ?? en.program.titleMm) : '—',
        amount: e.patientPaid,
        discount: (en?.pointsDiscountAmount ?? 0) + (en?.voucherDiscountAmount ?? 0),
        paymentMethod: en?.paymentMethod ?? null,
        partnerOrDoctor: clinicLabel,
        medihugShareAmount: e.medihugShareAmount, partnerShareAmount: e.partnerShareAmount,
        pointsEarned: pts.earned, pointsRedeemed: pts.redeemed,
      };
    });

    return NextResponse.json({
      sales, total, page, totalPages: Math.ceil(total / limit),
      totals: {
        amount: totals._sum.patientPaid ?? 0,
        medihugShareAmount: totals._sum.medihugShareAmount ?? 0,
        partnerShareAmount: totals._sum.partnerShareAmount ?? 0,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
