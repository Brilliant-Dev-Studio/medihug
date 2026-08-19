import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requestCbPayOrder } from '@/lib/cbpay';

type Kind = 'order' | 'appointment';

/* ── POST /api/payments/cbpay/initiate — creates the CBPay PNV01 request for an
 * already-created Order/Appointment and stores the resulting generateRefOrder.
 * Idempotent: re-calling on an already-INITIATED record just re-returns its stored deeplink
 * instead of calling CB Bank again. ── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { kind, id }: { kind: Kind; id: string } = body;

    if ((kind !== 'order' && kind !== 'appointment') || !id) {
      return NextResponse.json({ error: 'kind and id are required.' }, { status: 400 });
    }

    const record = kind === 'order'
      ? await db.order.findUnique({ where: { id }, select: { id: true, paymentMethod: true, totalAmount: true, cbPayStatus: true, cbPayRefOrder: true } })
      : await db.appointment.findUnique({ where: { id }, select: { id: true, paymentMethod: true, fee: true, cbPayStatus: true, cbPayRefOrder: true } });

    if (!record) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    if (record.paymentMethod !== 'cb') {
      return NextResponse.json({ error: 'This record is not set up for CB Pay.' }, { status: 400 });
    }

    if (record.cbPayStatus === 'INITIATED' && record.cbPayRefOrder) {
      const scheme = process.env.CBPAY_ENV === 'production' ? 'cb' : 'cbuat';
      return NextResponse.json({ generateRefOrder: record.cbPayRefOrder, deeplink: `${scheme}://pay?keyreference=${record.cbPayRefOrder}` });
    }

    const amount = kind === 'order' ? (record as { totalAmount: number }).totalAmount : (record as { fee: number | null }).fee;
    if (!amount) return NextResponse.json({ error: 'No payable amount on this record.' }, { status: 400 });

    const prefixedOrderId = `${kind === 'order' ? 'order' : 'appt'}:${id}`;
    const result = await requestCbPayOrder({
      orderId: prefixedOrderId,
      amount,
      orderDetails: kind === 'order' ? 'Medihug product order' : 'Medihug consultation booking',
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    if (kind === 'order') {
      await db.order.update({ where: { id }, data: { cbPayStatus: 'INITIATED', cbPayRefOrder: result.generateRefOrder } });
    } else {
      await db.appointment.update({ where: { id }, data: { cbPayStatus: 'INITIATED', cbPayRefOrder: result.generateRefOrder } });
    }

    return NextResponse.json({ generateRefOrder: result.generateRefOrder, deeplink: result.deeplink });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
