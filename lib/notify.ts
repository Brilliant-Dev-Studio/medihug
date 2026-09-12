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

/** Medi Record step-change push — notifies a single clinic's owner (partner login),
 * a silent no-op if the clinic has no ownerId (no partner account set up yet). */
export async function notifyClinicOwner(clinicId: string, input: Omit<NotifyInput, 'userId'>): Promise<void> {
  const clinic = await db.clinic.findUnique({ where: { id: clinicId }, select: { ownerId: true } });
  if (!clinic?.ownerId) return;
  await notify({ ...input, userId: clinic.ownerId });
}

/** Medi Record step-change push for an Order — an order can mix products from several
 * partner clinics (no clinicId on Order itself), so this resolves every distinct clinic
 * touching the given products and notifies each owner once. */
export async function notifyClinicOwnersForProducts(productIds: string[], input: Omit<NotifyInput, 'userId'>): Promise<void> {
  if (productIds.length === 0) return;
  const links = await db.clinicProduct.findMany({ where: { productId: { in: productIds } }, select: { clinicId: true }, distinct: ['clinicId'] });
  if (links.length === 0) return;
  const clinics = await db.clinic.findMany({ where: { id: { in: links.map(l => l.clinicId) } }, select: { ownerId: true } });
  const ownerIds = new Set(clinics.map(c => c.ownerId).filter((id): id is string => !!id));
  await Promise.all([...ownerIds].map(userId => notify({ ...input, userId })));
}
