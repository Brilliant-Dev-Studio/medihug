import { db } from '@/lib/db';

const DAILY_LIMIT = 10;

function today(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD", UTC
}

/** Returns whether this identifier is still under today's message limit, and increments its count if so. */
export async function checkAndIncrementChatUsage(identifier: string): Promise<{ allowed: boolean; remaining: number }> {
  const date = today();
  const existing = await db.aiChatUsage.findUnique({ where: { identifier_date: { identifier, date } } });

  if (existing && existing.count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  const updated = await db.aiChatUsage.upsert({
    where: { identifier_date: { identifier, date } },
    update: { count: { increment: 1 } },
    create: { identifier, date, count: 1 },
  });

  return { allowed: true, remaining: Math.max(0, DAILY_LIMIT - updated.count) };
}

export { DAILY_LIMIT };
