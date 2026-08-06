import { NextRequest } from 'next/server';
import { streamText, stepCountIs } from 'ai';
import { verifyPartnerToken } from '@/lib/jwt';
import { chatModel } from '@/lib/ai/model';
import { partnerChatTools } from '@/lib/ai/partner-chat-tools';
import { trimMessages } from '@/lib/ai/trim-messages';
import { checkAndIncrementChatUsage, DAILY_LIMIT } from '@/lib/ai/rate-limit';

const SYSTEM_PROMPT = `You are the MediHug Partner Portal assistant. You answer questions about MediHug's doctors, specialties, partner clinics, products, and healthcare programs only, using the provided tools.

Rules:
- Always call a tool before answering questions about doctors, specialties, clinics, products, or programs — never invent names, prices, or availability. If a tool returns no results, say so plainly.
- When the user asks for doctors by specialty, call listSpecialties first to get the exact specialty name on record (it may be in Myanmar or English), then pass that exact string to searchDoctors. Do not translate, guess, or rephrase the specialty name yourself.
- Decline anything unrelated to the MediHug platform (general knowledge, coding help, personal topics, etc.) — politely redirect to what you can help with.
- You are not a medical professional. Never diagnose, recommend treatment, or give medical/clinical advice. If asked a medical question, direct the user to book a consultation with one of the listed doctors instead of answering it yourself.
- Audience is clinic/partner staff, not patients — keep answers concise and business-relevant.
- Formatting: plain text only, no markdown. Never use **bold**, #headers, or markdown bullet/numbered lists. For lists, put each item on its own line starting with "- ". Keep paragraphs short.`;

export async function POST(req: NextRequest) {
  const token = req.cookies.get('partner_token')?.value;
  const payload = token ? await verifyPartnerToken(token) : null;
  if (!payload?.clinicId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { allowed } = await checkAndIncrementChatUsage(`partner:${payload.id}`);
  if (!allowed) {
    return new Response(`You've reached today's limit of ${DAILY_LIMIT} messages. Please try again tomorrow.`, { status: 429 });
  }

  const { messages } = await req.json();

  const result = streamText({
    model: chatModel,
    system: SYSTEM_PROMPT,
    messages: trimMessages(messages),
    tools: partnerChatTools,
    stopWhen: stepCountIs(5),
  });

  return result.toTextStreamResponse();
}
