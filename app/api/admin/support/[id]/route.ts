import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';

/* ── GET /api/admin/support/[id] — full thread, marks admin-unread as read ── */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'support.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const convo = await db.supportConversation.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, phone: true, profileImage: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!convo) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (convo.unreadAdmin) {
      await db.supportConversation.update({ where: { id }, data: { unreadAdmin: false } });
    }

    return NextResponse.json({ conversation: convo });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── POST /api/admin/support/[id] — admin reply ── */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req, 'support.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const { body } = await req.json();
    if (!body?.trim()) return NextResponse.json({ error: 'body is required.' }, { status: 400 });

    const convo = await db.supportConversation.findUnique({ where: { id } });
    if (!convo) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const message = await db.supportMessage.create({
      data: { conversationId: id, sender: 'ADMIN', body: body.trim() },
    });
    await db.supportConversation.update({
      where: { id },
      data: { unreadPatient: true, unreadAdmin: false, lastMessageAt: new Date() },
    });

    return NextResponse.json({ message });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
