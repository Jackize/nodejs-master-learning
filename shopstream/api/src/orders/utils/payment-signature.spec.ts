import {
  signPaymentPayload,
  verifyPaymentSignature,
} from './payment-signature';

describe('payment-signature', () => {
  const secret = 'dev-payment-webhook-secret';
  const body = '{"orderId":"507f1f77bcf86cd799439011","result":"paid"}';

  it('accepts valid signature', () => {
    const t = 1_700_000_000;
    const header = signPaymentPayload(secret, body, t);
    expect(() =>
      verifyPaymentSignature({
        rawBody: Buffer.from(body, 'utf8'),
        signatureHeader: header,
        secret,
        nowSec: t,
      }),
    ).not.toThrow();
  });

  it('rejects tampered body', () => {
    const t = 1_700_000_000;
    const header = signPaymentPayload(secret, body, t);
    expect(() =>
      verifyPaymentSignature({
        rawBody: Buffer.from(body.replace('paid', 'failed'), 'utf8'),
        signatureHeader: header,
        secret,
        nowSec: t,
      }),
    ).toThrow('SIGNATURE_MISMATCH');
  });

  it('rejects expired timestamp', () => {
    const t = 1_700_000_000;
    const header = signPaymentPayload(secret, body, t);
    expect(() =>
      verifyPaymentSignature({
        rawBody: Buffer.from(body, 'utf8'),
        signatureHeader: header,
        secret,
        nowSec: t + 301,
      }),
    ).toThrow('TIMESTAMP_EXPIRED');
  });
});
