import { NextRequest } from 'next/server';
import { verifyAdminToken, AdminTokenPayload } from '@/lib/jwt';

/** Verifies the admin_token cookie, returns the payload or null if missing/invalid. */
export async function requireAdmin(req: NextRequest): Promise<AdminTokenPayload | null> {
  const token = req.cookies.get('admin_token')?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}
