import crypto from 'crypto';

/** CB Bank PIN Verification Payment (CBPay) integration.
 * UAT base URL / test merchant creds come from CB Bank's Postman collection —
 * only usable in CBPAY_ENV=uat. Production creds/domain are not yet issued;
 * getConfig() returns null (never a silent UAT fallback) until they're set. */

interface CbPayConfig {
  baseUrl: string;
  authenToken: string;
  ecommerceId: string;
  subMerId: string;
  isUat: boolean;
}

function getConfig(): CbPayConfig | null {
  const baseUrl = process.env.CBPAY_BASE_URL;
  const authenToken = process.env.CBPAY_AUTHEN_TOKEN;
  const ecommerceId = process.env.CBPAY_ECOMMERCE_ID;
  const subMerId = process.env.CBPAY_SUB_MER_ID;
  if (!baseUrl || !authenToken || !ecommerceId || !subMerId) return null;
  return { baseUrl, authenToken, ecommerceId, subMerId, isUat: process.env.CBPAY_ENV !== 'production' };
}

/** signature = SHA2-256(authenToken&ecommerceId&subMerId&orderId&amount&currency) — per
 * CB Bank's "Signature Calculation Model" (PIN Verify API Spec v2.4.0, section 5). */
export function buildPnv01Signature(params: {
  authenToken: string; ecommerceId: string; subMerId: string;
  orderId: string; amount: string; currency: string;
}): string {
  const concat = [params.authenToken, params.ecommerceId, params.subMerId, params.orderId, params.amount, params.currency].join('&');
  return crypto.createHash('sha256').update(concat).digest('hex');
}

type PnvResult<T> = (T & { error?: undefined }) | { error: string };

/** PNV01: Request Payment Order. `orderId` should already carry the `order:`/`appt:` prefix
 * used to disambiguate the callback lookup — see app/api/payments/cbpay/initiate/route.ts. */
export async function requestCbPayOrder(input: {
  orderId: string; amount: number; orderDetails?: string;
}): Promise<PnvResult<{ generateRefOrder: string; deeplink: string }>> {
  const config = getConfig();
  if (!config) return { error: 'CBPAY_NOT_CONFIGURED' };

  const appBaseUrl = process.env.APP_BASE_URL;
  if (!appBaseUrl) return { error: 'CBPAY_NOT_CONFIGURED' };

  const amount = input.amount.toFixed(2);
  const currency = 'MMK';
  const signature = buildPnv01Signature({
    authenToken: config.authenToken, ecommerceId: config.ecommerceId, subMerId: config.subMerId,
    orderId: input.orderId, amount, currency,
  });

  try {
    const res = await fetch(`${config.baseUrl}/orderpayment-api/v1/request-payment-order.service`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authenToken: config.authenToken,
        ecommerceId: config.ecommerceId,
        subMerId: config.subMerId,
        transactionType: '0', // "0" = Web, "1" = native mobile app — this flow runs from a browser deeplink
        orderId: input.orderId,
        orderDetails: input.orderDetails,
        amount,
        currency,
        notifyUrl: `${appBaseUrl}/api/payments/cbpay/callback`,
        signature,
      }),
    });
    const data = await res.json();
    if (!res.ok || data.code !== '0000' || !data.generateRefOrder) {
      return { error: data.msg ?? 'CBPAY_REQUEST_FAILED' };
    }
    const scheme = config.isUat ? 'cbuat' : 'cb';
    return { generateRefOrder: data.generateRefOrder, deeplink: `${scheme}://pay?keyreference=${data.generateRefOrder}` };
  } catch (e) {
    console.error('requestCbPayOrder failed:', e);
    return { error: 'CBPAY_REQUEST_FAILED' };
  }
}

/** PNV04: Check Payment Status — fallback reconciliation when the async callback (PNV05)
 * hasn't landed yet. transactionStatus: P=pending, S=success, F=fail, E=expired. */
export async function checkCbPayStatus(input: {
  orderId: string; generateRefOrder: string;
}): Promise<PnvResult<{ transactionStatus: 'P' | 'S' | 'F' | 'E'; transactionId?: string; totalAmount?: number }>> {
  const config = getConfig();
  if (!config) return { error: 'CBPAY_NOT_CONFIGURED' };

  try {
    const res = await fetch(`${config.baseUrl}/orderpayment-api/v1/checkstatus-webpayment.service`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: input.orderId, ecommerceId: config.ecommerceId, generateRefOrder: input.generateRefOrder }),
    });
    const data = await res.json();
    if (!res.ok || !data.transactionStatus) return { error: data.msg ?? 'CBPAY_STATUS_CHECK_FAILED' };
    return {
      transactionStatus: data.transactionStatus,
      transactionId: data.transactionId ?? undefined,
      totalAmount: typeof data.totalAmount === 'number' ? data.totalAmount : Number(data.totalAmount) || undefined,
    };
  } catch (e) {
    console.error('checkCbPayStatus failed:', e);
    return { error: 'CBPAY_STATUS_CHECK_FAILED' };
  }
}

/** Best-effort callback (PNV05) signature check. CB Bank's docs only publish the PNV01
 * concat-string order, not PNV05's — this guess is UNVERIFIED. Never gate payment
 * acceptance on this alone; the real trust boundary is cross-checking generateRefOrder/
 * orderId/ecommerceId/amount against our own stored Order/Appointment row (done by the
 * caller in app/api/payments/cbpay/callback/route.ts). Log mismatches, don't reject on them. */
export function verifyCallbackSignatureBestEffort(payload: {
  generateRefOrder: string; orderId: string; ecommerceId: string;
  amount: string; currency: string; signature: string;
}): boolean {
  const authenToken = process.env.CBPAY_AUTHEN_TOKEN;
  if (!authenToken) return false;
  const guess = crypto.createHash('sha256')
    .update([authenToken, payload.ecommerceId, payload.orderId, payload.generateRefOrder, payload.amount, payload.currency].join('&'))
    .digest('hex');
  return guess === payload.signature;
}
