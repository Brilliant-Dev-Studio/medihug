/** SMSPoh V3 gateway (https://v3.smspoh.com) — used for OTP delivery.
 * Credentials read inside the function body, never at module scope, so a missing
 * config surfaces as a clear "not configured" result instead of an import-time crash. */
export async function sendSms(to: string, message: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.SMSPOH_API_KEY;
  const apiSecret = process.env.SMSPOH_API_SECRET;
  const from = process.env.SMSPOH_SENDER_ID;

  if (!apiKey || !apiSecret || !from) {
    console.error('sendSms: SMSPOH_API_KEY / SMSPOH_API_SECRET / SMSPOH_SENDER_ID not configured');
    return { ok: false, error: 'SMS_NOT_CONFIGURED' };
  }

  const token = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

  try {
    const res = await fetch('https://v3.smspoh.com/api/rest/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ to, message, from }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(`sendSms: SMSPoh request failed (${res.status}):`, body);
      return { ok: false, error: 'SMS_SEND_FAILED' };
    }

    return { ok: true };
  } catch (err) {
    console.error('sendSms: network error:', err);
    return { ok: false, error: 'SMS_SEND_FAILED' };
  }
}
