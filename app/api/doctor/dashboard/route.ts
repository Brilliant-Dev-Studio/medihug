import { NextRequest, NextResponse } from 'next/server';
import { verifyDoctorToken } from '@/lib/jwt';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('doctor_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyDoctorToken(token);
  const doctorId = payload?.doctorId;
  if (!doctorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);

  const [todayAppointments, statusCounts, weekAppointments] = await Promise.all([
    db.appointment.findMany({
      // Doctors only ever see admin-approved appointments.
      where: { doctorId, date: { gte: todayStart, lte: todayEnd }, status: { in: ['CONFIRMED', 'COMPLETED'] } },
      include: { user: { select: { name: true, phone: true } } },
      orderBy: { time: 'asc' },
    }),
    db.appointment.groupBy({ by: ['status'], where: { doctorId }, _count: { _all: true } }),
    db.appointment.findMany({
      where: { doctorId, date: { gte: weekStart, lte: todayEnd } },
      select: { date: true },
    }),
  ]);

  const counts = { PENDING: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0 } as Record<string, number>;
  for (const c of statusCounts) counts[c.status] = c._count._all;

  // Bucket appointments into the last 7 calendar days
  const days: { key: string; label: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayStart);
    d.setDate(d.getDate() - i);
    days.push({ key: d.toDateString(), label: d.toLocaleDateString('en-US', { weekday: 'short' }) });
  }
  const weekly = days.map(({ key, label }) => ({
    day: label,
    appointments: weekAppointments.filter(a => a.date.toDateString() === key).length,
  }));

  return NextResponse.json({ today: todayAppointments, counts, weekly });
}
