# Module 11 Razorpay Payments

## Delivered

- Added payment attempts and deduplicated webhook-event records with unique Razorpay identifiers.
- Razorpay orders are created server-side from the authoritative checkout total in integer paise.
- Checkout callback signatures use HMAC-SHA256 with the gateway order ID stored by the server.
- A valid browser signature alone never marks an order paid: the server also fetches the payment from Razorpay and requires matching order, amount, and `captured` status.
- The webhook endpoint verifies `X-Razorpay-Signature` over the untouched raw request body and deduplicates `X-Razorpay-Event-Id`.
- Captured, failed, duplicated, delayed, and out-of-order events use safe idempotent state transitions.
- Online orders reserve/decrement inventory for 15 minutes. Failed and expired attempts release coupon usage and restore stock through the exact-once reservation mechanism.
- Added an authenticated payment-status recovery endpoint and an admin-only expired-payment cleanup operation.
- Added Razorpay Checkout UI with loading, close, failure, delayed-confirmation, retry, and success behavior.
- Added an explicit local/E2E simulator. It is disabled in production even if misconfigured.

## Configuration

Set these only with Razorpay test credentials locally and live credentials in production:

```env
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
RAZORPAY_WEBHOOK_SECRET=""
RAZORPAY_MOCK="false"
```

Configure the Razorpay webhook URL as `/api/webhooks/razorpay` and subscribe to `payment.captured`, `payment.failed`, and `order.paid`. Run `POST /api/admin/payments/cleanup` from a protected scheduled operation until the operational-jobs module installs the production scheduler.

## Routes

- `POST /api/payments/razorpay`
- `POST /api/payments/razorpay/verify`
- `POST /api/payments/razorpay/mock-complete` (development only)
- `GET /api/payments/status/[orderId]`
- `POST /api/webhooks/razorpay`
- `POST /api/admin/payments/cleanup`

## Acceptance checklist

- [x] Payment and webhook migration applied.
- [x] Secrets remain server-only and are not logged or returned.
- [x] Signature and raw-body verification have automated coverage.
- [x] Payment capture checks gateway order, amount, and captured status.
- [x] Duplicate webhook/callback processing is idempotent.
- [x] Expired/failed reservations restore inventory and release coupon usage.
- [x] Desktop COD and mobile Razorpay-simulator checkout flows pass.
- [x] Full code and browser regression gates passed.
