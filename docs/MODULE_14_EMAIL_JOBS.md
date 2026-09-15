# Module 14 — Email Notifications and Operational Jobs

## Delivered

- [x] Durable, deduplicated email outbox with retry status, attempts, exponential backoff, failure details, and delivery timestamps.
- [x] Branded, HTML-escaped templates for welcome, password reset, order placement, payment confirmation, fulfilment updates, shipment, delivery, and cancellation.
- [x] SMTP transport through Nodemailer with configurable sender and a local/E2E JSON transport.
- [x] Welcome and password-reset messages queued atomically with their owning records.
- [x] COD placement, verified online payment, and admin order-status messages queued with stable deduplication keys.
- [x] Protected operations endpoint for outbox delivery, expired sessions/tokens/rate limits, and expired payment reservations.
- [x] Timing-safe bearer-secret validation with a minimum 32-character configured secret.
- [x] Admin email-outbox visibility with masked recipient addresses and recent failure state.
- [x] Customer-facing password reset confirmation; order messages link to protected order details.

## Operations

Schedule `POST /api/jobs/operations` with `Authorization: Bearer $OPS_JOB_SECRET`. Run it every 5–10 minutes. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM` in production. Never use `SMTP_HOST=json` outside local automated testing.

## Verification

- [x] Database migration applied
- [x] ESLint and TypeScript
- [x] Unit/integration tests
- [x] Production build
- [x] Full desktop and mobile E2E suite

The completion gate is satisfied: critical messages are retryable and observable without blocking checkout or payment.
