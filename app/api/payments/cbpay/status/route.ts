import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkCbPayStatus } from '@/lib/cbpay';

const RECONCILE_AFTER_MS = 15_000;

/* ── GET /api/payments/cbpay/status?kind=order|appointment&id=... — cheap DB read for the
 * client to poll after being redirected back from the CBPay app. Falls back to a PNV04
 * status check (rate-limited) if the async callback hasn't landed yet. ── */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const kind = searchParams.get('kind');
    const id = searchParams.get('id');
    if ((kind !== 'order' && kind !== 'appointment') || !id) {
      return NextResponse.json({ error: 'kind and id are required.' }, { status: 400 });
    }

    const record = kind === 'order'
      ? await db.order.findUnique({ where: { id }, select: { status: true, cbPayStatus: true, cbPayRefOrder: true, updatedAt: true } })
      : await db.appointment.findUnique({ where: { id }, select: { status: true, cbPayStatus: true, cbPayRefOrder: true, updatedAt: true } });

    if (!record) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

    if (record.cbPayStatus === 'INITIATED' && record.cbPayRefOrder && Date.now() - record.updatedAt.getTime() > RECONCILE_AFTER_MS) {
      const prefixedOrderId = `${kind === 'order' ? 'order' : 'appt'}:${id}`;
      const poll = await checkCbPayStatus({ orderId: prefixedOrderId, generateRefOrder: record.cbPayRefOrder });
      if (!('error' in poll)) {
        if (poll.transactionStatus === 'S') {
          const data = { cbPayStatus: 'SUCCESS' as const, cbPayPaidAt: new Date(), status: 'CONFIRMED' as const };
          if (kind === 'order') await db.order.update({ where: { id }, data });
          else await db.appointment.update({ where: { id }, data });
          record.cbPayStatus = 'SUCCESS';
          record.status = 'CONFIRMED';
        } else if (poll.transactionStatus === 'F' || poll.transactionStatus === 'E') {
          if (kind === 'order') await db.order.update({ where: { id }, data: { cbPayStatus: 'FAILED' } });
          else await db.appointment.update({ where: { id }, data: { cbPayStatus: 'FAILED' } });
          record.cbPayStatus = 'FAILED';
        }
      }
    }

    return NextResponse.json({ cbPayStatus: record.cbPayStatus, status: record.status });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
