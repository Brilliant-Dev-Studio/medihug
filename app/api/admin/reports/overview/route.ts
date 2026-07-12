import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/admin/reports/overview ── */
export async function GET() {
  try {
    const since = new Date();
    since.setMonth(since.getMonth() - 5);
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    const [statusCounts, revenueAgg, monthly, topDoctors, recent] = await Promise.all([
      db.appointment.groupBy({ by: ['status'], _count: { _all: true } }),
      db.appointment.aggregate({ where: { status: 'COMPLETED' }, _sum: { fee: true } }),
      db.appointment.findMany({
        where: { date: { gte: since } },
        select: { date: true, fee: true, status: true },
      }),
      db.appointment.groupBy({
        by: ['doctorId'],
        where: { status: 'COMPLETED' },
        _count: { _all: true },
        _sum: { fee: true },
        orderBy: { _sum: { fee: 'desc' } },
        take: 5,
      }),
      db.appointment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { user: { select: { name: true } }, doctor: { select: { name: true, nameEn: true } } },
      }),
    ]);

    const doctorIds = topDoctors.map(d => d.doctorId);
    const doctors = await db.doctor.findMany({
      where: { id: { in: doctorIds } },
      select: { id: true, name: true, nameEn: true, imageUrl: true },
    });
    const doctorMap = new Map(doctors.map(d => [d.id, d]));

    // Bucket appointments into month labels for the last 6 months
    const months: { key: string; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('en-US', { month: 'short' }) });
    }
    const monthlyData = months.map(({ key, label }) => {
      const [y, m] = key.split('-').map(Number);
      const inMonth = monthly.filter(a => a.date.getFullYear() === y && a.date.getMonth() === m);
      return {
        month: label,
        appointments: inMonth.length,
        revenue: inMonth.filter(a => a.status === 'COMPLETED').reduce((sum, a) => sum + (a.fee ?? 0), 0),
      };
    });

    const counts = { PENDING: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0 } as Record<string, number>;
    for (const c of statusCounts) counts[c.status] = c._count._all;

    return NextResponse.json({
      totalRevenue: revenueAgg._sum.fee ?? 0,
      counts,
      totalAppointments: Object.values(counts).reduce((a, b) => a + b, 0),
      monthly: monthlyData,
      topDoctors: topDoctors.map(d => ({
        doctor: doctorMap.get(d.doctorId) ?? null,
        appointments: d._count._all,
        revenue: d._sum.fee ?? 0,
      })),
      recent: recent.map(r => ({
        id: r.id, date: r.date, status: r.status, fee: r.fee,
        patient: r.user.name, doctor: r.doctor.nameEn ?? r.doctor.name,
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
