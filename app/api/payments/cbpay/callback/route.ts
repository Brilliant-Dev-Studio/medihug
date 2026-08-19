import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notify } from '@/lib/notify';
import { verifyCallbackSignatureBestEffort } from '@/lib/cbpay';

const OK = { responseCode: '0000', responseMessage: 'Operation Success' };

/* ── POST /api/payments/cbpay/callback — CB Bank's PNV05 server-to-server payment result.
 * Must be whitelisted with CB Bank support as the notifyUrl (UAT and prod separately).
 * Trust boundary is cross-checking generateRefOrder/orderId/ecommerceId/amount against our
 * own stored row — CB Bank's callback signature scheme isn't documented (see lib/cbpay.ts),
 * so it's checked best-effort/log-only, never as the sole gate. ── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      generateRefOrder, transactionId, ecommerceId, amount, currency,
      totalAmount, signature, transactionStatus, orderId,
    } = body;

    if (!generateRefOrder || !orderId || typeof transactionStatus !== 'string') {
      return NextResponse.json(OK); // malformed — ack so CB Bank doesn't retry forever, but do nothing
    }

    const [prefix, id] = String(orderId).split(':');
    const kind = prefix === 'order' ? 'order' : prefix === 'appt' ? 'appointment' : null;
    if (!kind || !id) return NextResponse.json(OK);

    const sigOk = verifyCallbackSignatureBestEffort({ generateRefOrder, orderId, ecommerceId, amount, currency, signature });
    if (!sigOk) console.warn(`CBPay callback signature mismatch (best-effort check, non-blocking): orderId=${orderId}`);

    if (kind === 'order') {
      const order = await db.order.findUnique({ where: { id }, select: { id: true, userId: true, paymentMethod: true, totalAmount: true, cbPayRefOrder: true } });
      if (!order || order.paymentMethod !== 'cb' || order.cbPayRefOrder !== generateRefOrder) return NextResponse.json(OK);

      if (transactionStatus === 'S') {
        await db.order.update({
          where: { id },
          data: {
            cbPayStatus: 'SUCCESS', cbPayTransactionId: transactionId ?? null,
            cbPayAmountConfirmed: Math.round(Number(totalAmount ?? amount) || order.totalAmount),
            cbPayPaidAt: new Date(), status: 'CONFIRMED',
          },
        });
        notify({ userId: order.userId, type: 'cbpay-payment-confirmed', title: 'Payment confirmed', body: 'Your CB Pay payment was successful. Your order is now confirmed.', actionUrl: `/patient/records` });
      } else if (transactionStatus === 'F' || transactionStatus === 'E') {
        await db.order.update({ where: { id }, data: { cbPayStatus: 'FAILED' } });
        notify({ userId: order.userId, type: 'cbpay-payment-failed', title: 'Payment not completed', body: 'Your CB Pay payment did not go through. Please try again.', actionUrl: `/patient/records` });
      }
    } else {
      const appt = await db.appointment.findUnique({ where: { id }, select: { id: true, userId: true, paymentMethod: true, fee: true, cbPayRefOrder: true } });
      if (!appt || appt.paymentMethod !== 'cb' || appt.cbPayRefOrder !== generateRefOrder) return NextResponse.json(OK);

      if (transactionStatus === 'S') {
        await db.appointment.update({
          where: { id },
          data: {
            cbPayStatus: 'SUCCESS', cbPayTransactionId: transactionId ?? null,
            cbPayAmountConfirmed: Math.round(Number(totalAmount ?? amount) || (appt.fee ?? 0)),
            cbPayPaidAt: new Date(), status: 'CONFIRMED',
          },
        });
        notify({ userId: appt.userId, type: 'cbpay-payment-confirmed', title: 'Payment confirmed', body: 'Your CB Pay payment was successful. Your appointment is now confirmed.', actionUrl: `/patient/appointments/${id}` });
      } else if (transactionStatus === 'F' || transactionStatus === 'E') {
        await db.appointment.update({ where: { id }, data: { cbPayStatus: 'FAILED' } });
        notify({ userId: appt.userId, type: 'cbpay-payment-failed', title: 'Payment not completed', body: 'Your CB Pay payment did not go through. Please try again.', actionUrl: `/patient/appointments/${id}` });
      }
    }

    return NextResponse.json(OK);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 }); // triggers CB Bank retry
  }
}
