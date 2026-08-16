import { NextRequest } from 'next/server';
import { verifyAdminToken, AdminTokenPayload } from '@/lib/jwt';
import { hasPermission, type Permission } from '@/lib/permissions';

/** Verifies the admin_token cookie, returns the payload or null if missing/invalid.
 * Pass `perm` to also require the admin's role to carry that permission — returns null
 * (caller responds 401/403) if the role doesn't have it. Omit `perm` to keep the old
 * behavior of "any valid admin session passes", for routes not yet migrated to the
 * permission model. */
export async function requireAdmin(req: NextRequest, perm?: Permission): Promise<AdminTokenPayload | null> {
  const token = req.cookies.get('admin_token')?.value;
  if (!token) return null;
  const payload = await verifyAdminToken(token);
  if (!payload) return null;
  if (perm && !hasPermission(payload.role, perm)) return null;
  return payload;
}
