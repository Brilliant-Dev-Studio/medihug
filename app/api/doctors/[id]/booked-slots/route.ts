import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseSlotTimes, maxPerSlotFor, dayBounds } from '@/lib/timeSlots';

/* ── GET /api/doctors/[id]/booked-slots?date=ISO ── returns which 15-min slots are fully booked for that day ── */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const dateParam = req.nextUrl.searchParams.get('date');
    if (!dateParam) return NextResponse.json({ error: 'date is required' }, { status: 400 });

    const { start, end } = dayBounds(dateParam);
    const dayOfWeek = start.getDay();

    const [windows, appointments] = await Promise.all([
      db.doctorSlot.findMany({ where: { doctorId: id, dayOfWeek, isActive: true }, select: { startTime: true, endTime: true, maxPerSlot: true } }),
      db.appointment.findMany({ where: { doctorId: id, date: { gte: start, lt: end }, status: { not: 'CANCELLED' } }, select: { time: true } }),
    ]);

    const counts: Record<string, number> = {};
    for (const a of appointments) {
      if (!a.time) continue;
      for (const slot of parseSlotTimes(a.time)) counts[slot] = (counts[slot] ?? 0) + 1;
    }

    const fullTimes = Object.entries(counts)
      .filter(([time, count]) => count >= maxPerSlotFor(time, windows))
      .map(([time]) => time);

    return NextResponse.json({ fullTimes });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
