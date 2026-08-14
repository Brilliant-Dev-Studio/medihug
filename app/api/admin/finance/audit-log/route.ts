import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';

/* ── GET /api/admin/finance/audit-log?entityType=&from=&to= ── */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const entityType = searchParams.get('entityType');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const logs = await db.auditLog.findMany({
    where: {
      ...(entityType && { entityType }),
      ...((from || to) && {
        createdAt: {
          ...(from && { gte: new Date(from) }),
          ...(to && { lte: new Date(to) }),
        },
      }),
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  return NextResponse.json({ logs });
}
