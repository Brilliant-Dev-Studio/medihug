import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAudit } from '@/lib/audit';

/* ── GET /api/admin/finance/payment-methods ── */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const methods = await db.paymentMethodConfig.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] });
  return NextResponse.json({ methods });
}

/** Derives a URL/DB-safe key from a free-typed label — e.g. "UAB Pay" -> "uabpay". */
function slugifyKey(label: string): string {
  return label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 40);
}

/* ── POST /api/admin/finance/payment-methods — free-form create, no fixed key list ── */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req, 'pos.manage');
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { label, kind, accountNumber, accountName, feePercent, feeFixed } = await req.json();
    if (!label?.trim()) {
      return NextResponse.json({ error: 'label is required.' }, { status: 400 });
    }
    if (kind === 'BANK_TRANSFER' && (!accountNumber?.trim() || !accountName?.trim())) {
      return NextResponse.json({ error: 'accountNumber and accountName are required for a bank transfer method.' }, { status: 400 });
    }

    const key = slugifyKey(label);
    if (!key) return NextResponse.json({ error: 'label must contain at least one letter or number.' }, { status: 400 });
    const existing = await db.paymentMethodConfig.findUnique({ where: { key } });
    if (existing) return NextResponse.json({ error: `A payment method with key "${key}" already exists.` }, { status: 409 });

    const count = await db.paymentMethodConfig.count();
    const method = await db.paymentMethodConfig.create({
      data: {
        key, label: label.trim(),
        kind: kind === 'BANK_TRANSFER' ? 'BANK_TRANSFER' : 'WALLET',
        accountNumber: kind === 'BANK_TRANSFER' ? accountNumber.trim() : null,
        accountName:   kind === 'BANK_TRANSFER' ? accountName.trim()   : null,
        feePercent: typeof feePercent === 'number' ? feePercent : 0,
        feeFixed:   typeof feeFixed   === 'number' ? feeFixed   : 0,
        order: count,
      },
    });
    logAudit({ admin, action: 'CREATE', entityType: 'PaymentMethodConfig', entityId: method.id, after: method });
    return NextResponse.json({ method }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
