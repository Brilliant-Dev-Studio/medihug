import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/admin/support — inbox list, newest activity first ── */
export async function GET() {
  try {
    const conversations = await db.supportConversation.findMany({
      orderBy: { lastMessageAt: 'desc' },
      include: {
        user: { select: { name: true, phone: true, profileImage: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    return NextResponse.json({ conversations });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
