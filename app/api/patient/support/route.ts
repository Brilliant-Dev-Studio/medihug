import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

/* ── GET /api/patient/support?phone=xxx — poll the thread. Pass markRead=1 when the
 * widget is actually open on screen to clear the unread-from-admin flag. ── */
export async function GET(req: NextRequest) {
  try {
    const phone    = req.nextUrl.searchParams.get('phone') ?? '';
    const markRead = req.nextUrl.searchParams.get('markRead') === '1';
    if (!phone) return NextResponse.json({ error: 'phone is required.' }, { status: 400 });

    const user = await db.user.findUnique({ where: { phone } });
    if (!user) return NextResponse.json({ messages: [], unreadPatient: false });

    const convo = await db.supportConversation.findUnique({
      where: { userId: user.id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!convo) return NextResponse.json({ messages: [], unreadPatient: false });

    if (markRead && convo.unreadPatient) {
      await db.supportConversation.update({ where: { id: convo.id }, data: { unreadPatient: false } });
    }

    return NextResponse.json({ messages: convo.messages, unreadPatient: markRead ? false : convo.unreadPatient });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── POST /api/patient/support — send a message, creating the user/conversation on first contact ── */
export async function POST(req: NextRequest) {
  try {
    const { phone, name, body } = await req.json();
    if (!phone || !name || !body?.trim()) {
      return NextResponse.json({ error: 'phone, name, body are required.' }, { status: 400 });
    }

    let user = await db.user.findUnique({ where: { phone } });
    if (!user) {
      const hashedPassword = await bcrypt.hash(phone, 12);
      user = await db.user.create({ data: { name, phone, password: hashedPassword, role: 'PATIENT' } });
    }

    const convo = await db.supportConversation.upsert({
      where: { userId: user.id },
      create: { userId: user.id, unreadAdmin: true, lastMessageAt: new Date() },
      update: { unreadAdmin: true, lastMessageAt: new Date() },
    });

    const message = await db.supportMessage.create({
      data: { conversationId: convo.id, sender: 'PATIENT', body: body.trim() },
    });

    return NextResponse.json({ message });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
