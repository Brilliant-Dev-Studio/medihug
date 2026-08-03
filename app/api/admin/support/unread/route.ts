import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/admin/support/unread — cheap poll target for the sidebar badge ── */
export async function GET() {
  try {
    const count = await db.supportConversation.count({ where: { unreadAdmin: true } });
    return NextResponse.json({ count });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
