import { db } from '@/lib/db';

/** Fire-and-forget append to the immutable admin audit trail — never fails the parent request. */
export async function logAudit(params: {
  admin: { id: string; name: string };
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
}): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        adminId: params.admin.id,
        adminName: params.admin.name,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        before: params.before === undefined ? undefined : (params.before as object),
        after: params.after === undefined ? undefined : (params.after as object),
      },
    });
  } catch (e) {
    console.error('logAudit failed:', e);
  }
}
