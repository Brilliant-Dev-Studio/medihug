import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAudit } from '@/lib/audit';

const DEFAULT_METHODS = [
  { key: 'kpay', label: 'KPay' },
  { key: 'wavepay', label: 'Wave Pay' },
  { key: 'aya', label: 'AYA Pay' },
  { key: 'cb', label: 'CB Pay' },
];

/* ── GET /api/admin/finance/payment-methods ── */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const count = await db.paymentMethodConfig.count();
  if (count === 0) {
    await db.paymentMethodConfig.createMany({
      data: DEFAULT_METHODS.map((m) => ({ key: m.key, label: m.label })),
      skipDuplicates: true,
    });
  }

  const methods = await db.paymentMethodConfig.findMany({ orderBy: { createdAt: 'asc' } });
  return NextResponse.json({ methods });
}

/* ── POST /api/admin/finance/payment-methods ── */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { key, label, feePercent, feeFixed } = await req.json();
    if (!key || !label) {
      return NextResponse.json({ error: 'key and label are required.' }, { status: 400 });
    }
    const method = await db.paymentMethodConfig.create({
      data: {
        key,
        label,
        feePercent: typeof feePercent === 'number' ? feePercent : 0,
        feeFixed: typeof feeFixed === 'number' ? feeFixed : 0,
      },
    });
    logAudit({ admin, action: 'CREATE', entityType: 'PaymentMethodConfig', entityId: method.id, after: method });
    return NextResponse.json({ method }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
