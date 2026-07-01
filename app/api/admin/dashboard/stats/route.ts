import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const yearParam  = searchParams.get('year');
    const monthParam = searchParams.get('month'); // 0-indexed
    const dayParam   = searchParams.get('day');   // YYYY-MM-DD

    // ─── Appointment date range ───
    let currStart: Date | undefined;
    let currEnd:   Date | undefined;
    let prevStart: Date | undefined;
    let prevEnd:   Date | undefined;

    if (dayParam) {
      const [y, m, d] = dayParam.split('-').map(Number);
      currStart = new Date(Date.UTC(y, m - 1, d));
      currEnd   = new Date(Date.UTC(y, m - 1, d + 1));
      prevStart = new Date(Date.UTC(y, m - 1, d - 1));
      prevEnd   = currStart;
    } else if (yearParam && monthParam !== null) {
      const y  = parseInt(yearParam);
      const mo = parseInt(monthParam!);
      currStart = new Date(Date.UTC(y, mo, 1));
      currEnd   = new Date(Date.UTC(y, mo + 1, 1));
      prevEnd   = currStart;
      prevStart = mo === 0
        ? new Date(Date.UTC(y - 1, 11, 1))
        : new Date(Date.UTC(y, mo - 1, 1));
    } else if (yearParam) {
      const y   = parseInt(yearParam);
      currStart = new Date(Date.UTC(y, 0, 1));
      currEnd   = new Date(Date.UTC(y + 1, 0, 1));
      prevStart = new Date(Date.UTC(y - 1, 0, 1));
      prevEnd   = currStart;
    }

    const hasRange = !!(currStart && currEnd);
    const apptWhere     = hasRange ? { date: { gte: currStart, lt: currEnd } } : {};
    const apptPrevWhere = (hasRange && prevStart && prevEnd) ? { date: { gte: prevStart, lt: prevEnd } } : {};

    // ─── 30-day window for cumulative stat trends ───
    const now    = new Date();
    const d30ago = new Date(now.getTime() - 30 * 86400000);

    const [
      patients, prevPatients,
      doctors,  prevDoctors,
      products, prevProducts,
      blogs,    prevBlogs,
      appointments,     cancelled,
      prevAppointments, prevCancelled,
      latestRaw,
      rawApptDates,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { createdAt: { lt: d30ago } } }),
      db.doctor.count({ where: { isActive: true } }),
      db.doctor.count({ where: { isActive: true, createdAt: { lt: d30ago } } }),
      db.product.count({ where: { isActive: true } }),
      db.product.count({ where: { isActive: true, createdAt: { lt: d30ago } } }),
      db.blog.count(),
      db.blog.count({ where: { createdAt: { lt: d30ago } } }),
      // Appointments: filtered period
      db.appointment.count({ where: apptWhere }),
      db.appointment.count({ where: { ...apptWhere, status: 'CANCELLED' } }),
      // Previous period
      Object.keys(apptPrevWhere).length
        ? db.appointment.count({ where: apptPrevWhere })
        : db.appointment.count({ where: { createdAt: { lt: d30ago } } }),
      Object.keys(apptPrevWhere).length
        ? db.appointment.count({ where: { ...apptPrevWhere, status: 'CANCELLED' } })
        : db.appointment.count({ where: { status: 'CANCELLED', createdAt: { lt: d30ago } } }),
      db.appointment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          user:   { select: { id: true, name: true } },
          doctor: { select: { id: true, name: true } },
        },
      }),
      db.appointment.findMany({ select: { date: true }, orderBy: { date: 'asc' } }),
    ]);

    // ─── Chart data ───
    const appts = await db.appointment.findMany({
      where: apptWhere,
      select: { date: true, status: true },
      orderBy: { date: 'asc' },
    });

    const chartMap = new Map<string, { appointments: number; cancelled: number }>();

    const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    for (const a of appts) {
      let label: string;
      if (dayParam) {
        label = String(a.date.getUTCHours()).padStart(2, '0') + ':00';
      } else if (yearParam && monthParam !== null) {
        label = String(a.date.getUTCDate()).padStart(2, '0');
      } else if (yearParam) {
        label = MON[a.date.getUTCMonth()];
      } else {
        label = String(a.date.getUTCFullYear());
      }
      const cur = chartMap.get(label) ?? { appointments: 0, cancelled: 0 };
      cur.appointments++;
      if (a.status === 'CANCELLED') cur.cancelled++;
      chartMap.set(label, cur);
    }
    const chart = Array.from(chartMap.entries()).map(([label, v]) => ({ label, ...v }));

    // ─── Highlight dates for calendar ───
    const appointmentDates = [...new Set(rawApptDates.map(a => a.date.toISOString().slice(0, 10)))];

    // ─── Available years ───
    const availableYears = [...new Set(rawApptDates.map(a => a.date.getUTCFullYear()))].sort();
    const thisYear = new Date().getUTCFullYear();
    if (!availableYears.includes(thisYear)) availableYears.push(thisYear);
    if (availableYears.length < 2) availableYears.unshift(availableYears[0] - 1);

    // ─── Latest appointments ───
    const latest = latestRaw.map(a => ({
      id:      a.id,
      patient: a.user.name ?? 'Unknown',
      doctor:  a.doctor.name,
      date:    a.date.toISOString().slice(0, 10),
      time:    a.time ?? '',
      status:  a.status.toLowerCase() as string,
    }));

    return NextResponse.json({
      totals: { patients, doctors, products, appointments, cancelled, blogs },
      prev:   { patients: prevPatients, doctors: prevDoctors, products: prevProducts,
                appointments: prevAppointments, cancelled: prevCancelled, blogs: prevBlogs },
      chart,
      latest,
      appointmentDates,
      availableYears,
    });
  } catch (e) {
    console.error('Dashboard stats error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
