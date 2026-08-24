import { createHmac, timingSafeEqual } from 'crypto';

// Cửa sổ 5 phút — chống replay thô (timestamp quá cũ/mới → reject)
const MAX_SKEW_SEC = 300;

/**
 * Verify header: x-payment-signature: t=<unix>,v1=<hex>
 * Signed payload: `${t}.${rawBody}` — tinh thần Stripe
 * Docs: https://docs.stripe.com/webhooks/signatures
 */
export function verifyPaymentSignature(params: {
  rawBody: Buffer | undefined;
  signatureHeader: string | undefined;
  secret: string;
  nowSec?: number;
}): void {
  const { rawBody, signatureHeader, secret } = params;
  const nowSec = params.nowSec ?? Math.floor(Date.now() / 1000);

  if (!rawBody || rawBody.length === 0) throw new Error('MISSING_RAW_BODY');

  if (!signatureHeader) throw new Error('MISSING_SIGNATURE');

  // "t=1700000000,v1=abc..." -> { t: "...", v1: "..." }
  const parts = Object.fromEntries(
    signatureHeader.split(',').map((p) => {
      const [key, value] = p.split('=');
      return [key.trim(), value];
    }),
  ) as { t?: string; v1?: string };

  if (!parts.t || !parts.v1) throw new Error('MALFORMED_SIGNATURE');

  const t = Number(parts.t);
  if (!Number.isFinite(t)) throw new Error('MALFORMED_SIGNATURE');
  if (Math.abs(nowSec - t) > MAX_SKEW_SEC) throw new Error('TIMESTAMP_EXPIRED');

  const expected = createHmac('sha256', secret)
    .update(`${t}.${rawBody.toString('utf-8')}`)
    .digest('hex');

  const a = Buffer.from(expected, 'utf-8');
  const b = Buffer.from(parts.v1, 'utf-8');
  // timingSafeEqual yêu cầu cùng length — check trước để không throw RangeError
  if (a.length !== b.length || !timingSafeEqual(a, b))
    throw new Error('SIGNATURE_MISMATCH');
}

/** Chỉ dùng cho unit test / script curl — không gọi trong production handler */
export function signPaymentPayload(
  secret: string,
  rawBody: string,
  t = Math.floor(Date.now() / 1000),
): string {
  const v1 = createHmac('sha256', secret)
    .update(`${t}.${rawBody}`)
    .digest('hex');
  return `t=${t},v1=${v1}`;
}
