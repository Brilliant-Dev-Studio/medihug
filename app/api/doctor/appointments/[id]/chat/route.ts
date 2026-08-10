import { NextRequest } from 'next/server';
import { streamText, stepCountIs } from 'ai';
import { verifyDoctorToken } from '@/lib/jwt';
import { db } from '@/lib/db';
import { chatModel, chatModelMm } from '@/lib/ai/model';
import { formatIntakeForPrompt } from '@/lib/ai/summarize-intake';
import { trimMessages } from '@/lib/ai/trim-messages';
import { checkAndIncrementChatUsage, DAILY_LIMIT } from '@/lib/ai/rate-limit';
import type { IntakeData } from '@/app/patient/booking/IntakeForm';

/* ── POST /api/doctor/appointments/[id]/chat — Q&A scoped to ONE patient's intake form, own appointments only ── */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get('doctor_token')?.value;
  const payload = token ? await verifyDoctorToken(token) : null;
  if (!payload?.doctorId) return new Response('Unauthorized', { status: 401 });

  const { id } = await params;
  const appointment = await db.appointment.findUnique({ where: { id } });
  if (!appointment || appointment.doctorId !== payload.doctorId || !['CONFIRMED', 'COMPLETED'].includes(appointment.status)) {
    return new Response('Not found', { status: 404 });
  }
  if (!appointment.intake) {
    return new Response('No pre-consultation form submitted for this appointment.', { status: 400 });
  }

  const { allowed } = await checkAndIncrementChatUsage(`doctor-summary:${payload.doctorId}`);
  if (!allowed) {
    return new Response(`You've reached today's limit of ${DAILY_LIMIT} AI requests. Please try again tomorrow.`, { status: 429 });
  }

  const { messages, lang } = await req.json();
  const isMm = lang === 'mm';
  const intakeContext = formatIntakeForPrompt(appointment.intake as unknown as IntakeData, appointment.reason, appointment.note);

  const SYSTEM_PROMPT = `You help a doctor on the MediHug platform understand ONE specific patient's pre-consultation intake form, right before their appointment.

This patient's intake form data:
${intakeContext}

Rules:
- Only discuss THIS patient — their form data, symptoms, history, allergies, medications, reason for visit, and clinical reasoning about what those findings could mean for this patient. You're allowed to reason through possible explanations, ask clarifying angles, or flag what stands out — the doctor is a licensed clinician using this as a thinking aid, not a patient asking for a diagnosis.
- Decline anything NOT about this patient: general medical knowledge unrelated to their form, other patients, coding, or any unrelated topic. Politely redirect to asking about this patient instead.
- This is patient-reported and unverified — say so when relevant, and make clear final judgment and diagnosis is the doctor's call, not yours.
- If asked about something the form doesn't cover, say plainly that the form doesn't include that.
- Formatting: plain text only, no markdown. Keep answers short and direct.
- Language: always reply in the same language the doctor's message is written in (Myanmar or English).${isMm ? ' Use Myanmar (Burmese) script only — never mix in Chinese, Korean, Japanese, Cyrillic, Thai, or any other non-Myanmar, non-Latin script; if unsure how to say something in Myanmar, use plain English words instead.' : ''}`;

  try {
    const result = streamText({
      model: isMm ? chatModelMm : chatModel,
      system: SYSTEM_PROMPT,
      messages: trimMessages(messages),
      stopWhen: stepCountIs(3),
    });
    return result.toTextStreamResponse();
  } catch (e) {
    console.error(e);
    return new Response('AI request failed. Please try again.', { status: 500 });
  }
}
