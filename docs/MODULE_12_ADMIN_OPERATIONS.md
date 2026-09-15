# Module 12 — Admin Operations

## Delivered

- [x] Live dashboard for paid, non-cancelled revenue, monthly orders, catalogue/customer counts, stock alerts, seven-day revenue, order statuses, top products, and recent orders.
- [x] Searchable and filterable order list with safe CSV export.
- [x] Order detail with customer, delivery, items, totals, payment data, status timeline, internal notes, courier, and tracking data.
- [x] Validated order progression from placed through delivered, including tracking requirements and audit history.
- [x] Searchable customer list with paid order count/spend, latest order, and account enable/disable controls.
- [x] Disabling a customer revokes their existing sessions; sensitive operations create admin audit records.
- [x] Responsive admin layouts for desktop and mobile.

## Business rules

- Dashboard revenue includes only orders whose payment status is `PAID` and whose order status is not `CANCELLED`.
- Shipping requires both a courier and tracking number.
- Delivery records the delivery timestamp. COD orders become paid when delivered.
- Only the next allowed fulfilment state can be selected; cancelled orders cannot re-enter fulfilment.
- CSV values are quoted and spreadsheet formula prefixes are neutralized.

## Verification

- [x] TypeScript compilation
- [x] ESLint
- [x] Unit/integration tests
- [x] Production build
- [x] Full desktop and mobile E2E suite

The completion gate is satisfied: staff can manage the post-purchase workflow without database access or code changes.
