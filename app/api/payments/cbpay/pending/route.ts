import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { requestCbPayOrder, checkCbPayStatus } from '@/lib/cbpay';

/* ── POST /api/payments/cbpay/pending — starts a CBPay payment BEFORE any Order/Appointment
 * record exists (e.g. the booking flow gates filling the medical intake form behind actual
 * payment success, mirroring how other methods gate it behind the receipt upload). No DB
 * write here — orderId is a throwaway "pending:<uuid>" reference, verified again server-side
 * via PNV04 at the point the real record is created (see app/api/patient/bookings/route.ts). ── */
export async function POST(req: NextRequest) {
  try {
    const { amount, orderDetails } = await req.json();
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'amount is required.' }, { status: 400 });
    }

    const orderId = `pending:${crypto.randomUUID()}`;
    const result = await requestCbPayOrder({ orderId, amount, orderDetails });
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: 502 });

    return NextResponse.json({ orderId, generateRefOrder: result.generateRefOrder, deeplink: result.deeplink });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ── GET /api/payments/cbpay/pending?orderId=&generateRefOrder= — client polls this while
 * waiting for the patient to approve in the CBPay app. Pure passthrough to PNV04, no DB. ── */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const orderId = searchParams.get('orderId');
    const generateRefOrder = searchParams.get('generateRefOrder');
    if (!orderId || !generateRefOrder) {
      return NextResponse.json({ error: 'orderId and generateRefOrder are required.' }, { status: 400 });
    }

    const result = await checkCbPayStatus({ orderId, generateRefOrder });
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: 502 });

    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
