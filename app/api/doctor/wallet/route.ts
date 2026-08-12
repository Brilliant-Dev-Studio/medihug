import { NextRequest, NextResponse } from 'next/server';
import { verifyDoctorToken } from '@/lib/jwt';
import { db } from '@/lib/db';

/* ── GET /api/doctor/wallet — earnings summary, own appointments only. Doctor's own slot fee
   (doctorPayoutAmount), never the platform-commission-marked-up patient price. ── */
export async function GET(req: NextRequest) {
  const token = req.cookies.get('doctor_token')?.value;
  const payload = token ? await verifyDoctorToken(token) : null;
  if (!payload?.doctorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const appointments = await db.appointment.findMany({
    where: { doctorId: payload.doctorId, status: { in: ['CONFIRMED', 'COMPLETED'] } },
    select: {
      id: true, date: true, time: true, status: true,
      fee: true, doctorPayoutAmount: true,
      user: { select: { name: true } },
    },
    orderBy: { date: 'desc' },
  });

  // Appointments booked before the commission feature shipped have no doctorPayoutAmount
  // snapshot — back then `fee` WAS the doctor's full amount (no platform markup existed yet),
  // so it's the correct fallback for those older rows.
  const payout = (a: { doctorPayoutAmount: number | null; fee: number | null }) => a.doctorPayoutAmount ?? a.fee ?? 0;

  const completed = appointments.filter(a => a.status === 'COMPLETED');
  const upcoming  = appointments.filter(a => a.status === 'CONFIRMED');

  const totalEarned   = completed.reduce((sum, a) => sum + payout(a), 0);
  const upcomingTotal = upcoming.reduce((sum, a) => sum + payout(a), 0);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthEarned = completed
    .filter(a => new Date(a.date) >= monthStart)
    .reduce((sum, a) => sum + payout(a), 0);

  return NextResponse.json({
    totalEarned,
    upcomingTotal,
    thisMonthEarned,
    completedCount: completed.length,
    appointments,
  });
}
