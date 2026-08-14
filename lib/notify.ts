import { db } from '@/lib/db';
import { publish } from '@/lib/realtime';

interface NotifyInput {
  userId: string;
  type: string;
  title: string;
  body: string;
  actionUrl?: string;
  actorName?: string;
  actorAvatar?: string | null;
}

/** Creates a Notification row and live-pushes it over the user's WebSocket channel.
 * Fire-and-forget — a notification failure never blocks the caller's primary DB write. */
export async function notify(input: NotifyInput): Promise<void> {
  try {
    const notification = await db.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        actionUrl: input.actionUrl ?? null,
        actorName: input.actorName ?? null,
        actorAvatar: input.actorAvatar ?? null,
      },
    });
    await publish(`user:${input.userId}`, { kind: 'notification', notification });
  } catch (err) {
    console.error(`notify() failed (userId=${input.userId}, type=${input.type}):`, err);
  }
}
