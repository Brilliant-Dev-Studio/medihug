import { NextRequest, NextResponse } from 'next/server';
import { verifyDoctorToken } from '@/lib/jwt';
import { db } from '@/lib/db';
import { summarizeIntake } from '@/lib/ai/summarize-intake';
import { checkAndIncrementChatUsage, DAILY_LIMIT } from '@/lib/ai/rate-limit';
import type { IntakeData } from '@/app/patient/booking/IntakeForm';

/* ── POST /api/doctor/appointments/[id]/summary — (re)generate the AI intake summary, own appointments only ── */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get('doctor_token')?.value;
  const payload = token ? await verifyDoctorToken(token) : null;
  if (!payload?.doctorId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const appointment = await db.appointment.findUnique({ where: { id } });
  if (!appointment || appointment.doctorId !== payload.doctorId || !['CONFIRMED', 'COMPLETED'].includes(appointment.status)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (!appointment.intake) {
    return NextResponse.json({ error: 'No pre-consultation form submitted for this appointment.' }, { status: 400 });
  }

  const { allowed } = await checkAndIncrementChatUsage(`doctor-summary:${payload.doctorId}`);
  if (!allowed) {
    return NextResponse.json({ error: `You've reached today's limit of ${DAILY_LIMIT} AI summaries. Please try again tomorrow.` }, { status: 429 });
  }

  const { lang } = await req.json().catch(() => ({ lang: 'en' }));

  try {
    const summary = await summarizeIntake(appointment.intake as unknown as IntakeData, appointment.reason, appointment.note, lang === 'mm' ? 'mm' : 'en');
    await db.appointment.update({ where: { id }, data: { aiSummary: summary } });
    return NextResponse.json({ summary });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'AI summary generation failed. Please try again.' }, { status: 500 });
  }
}
