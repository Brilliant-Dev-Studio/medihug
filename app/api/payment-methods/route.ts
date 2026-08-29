import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ── GET /api/payment-methods — public, active-only, ordered. Powers the checkout payment
 * method dropdown. Fee fields are deliberately omitted — that's internal P&L data. ── */
export async function GET() {
  try {
    const methods = await db.paymentMethodConfig.findMany({
      where: { active: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, key: true, label: true, kind: true, accountNumber: true, accountName: true },
    });
    return NextResponse.json({ methods });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
