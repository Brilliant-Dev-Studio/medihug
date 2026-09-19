import { NextRequest, NextResponse } from 'next/server';

// Success acknowledgement returned to the gateway. Adjust to whatever the gateway's spec
// expects (some want a literal "success" body, some a JSON code) once that's known.
const ACK = 'success';

const MAX_LOGGED_CHARS = 4000;

/* ── POST /api/payments/notify — generic server-to-server payment result callback.
 *
 * Deliberately receive-and-log only: it does NOT mark any Order/Appointment paid. An
 * unauthenticated POST must never be able to confirm a payment, and the gateway's signature
 * scheme + our order-reference mapping aren't defined yet. Once the gateway's spec is known,
 * verify the signature here, cross-check orderId/amount against our own stored row, and only
 * then update status (see app/api/payments/cbpay/callback/route.ts for the pattern). ── */
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') ?? '';
    const raw = await req.text();

    let parsed: unknown = raw;
    if (contentType.includes('application/json')) {
      try { parsed = JSON.parse(raw); } catch { /* keep raw text */ }
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      parsed = Object.fromEntries(new URLSearchParams(raw));
    }

    console.info('[payments/notify] callback received', JSON.stringify({
      contentType,
      body: parsed,
    }).slice(0, MAX_LOGGED_CHARS));

    return new NextResponse(ACK, { status: 200, headers: { 'Content-Type': 'text/plain' } });
  } catch (e) {
    console.error('[payments/notify] failed', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 }); // non-2xx makes the gateway retry
  }
}

/* ── GET /api/payments/notify — reachability check some gateways/ops run against the URL ── */
export async function GET() {
  return new NextResponse('ok', { status: 200, headers: { 'Content-Type': 'text/plain' } });
}
