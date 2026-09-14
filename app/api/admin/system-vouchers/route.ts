import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { SYSTEM_VOUCHERS } from '@/lib/systemVouchers';

/* ── GET /api/admin/system-vouchers — the two fixed platform-wide discount codes.
 * Lazily creates them on first access (idempotent — `update: {}` never overwrites an
 * admin's existing active/expiresAt choice); saving is done via the existing
 * PATCH /api/admin/vouchers/[id]. ── */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    for (const def of SYSTEM_VOUCHERS) {
      await db.voucher.upsert({
        where: { code: def.code },
        create: {
          code: def.code,
          label: def.enLabel,
          serviceType: def.serviceType,
          discountType: def.discountType,
          discountValue: def.discountValue,
          active: true,
        },
        update: {},
      });
    }

    const vouchers = await db.voucher.findMany({
      where: { code: { in: SYSTEM_VOUCHERS.map(v => v.code) } },
    });
    return NextResponse.json({ vouchers });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
