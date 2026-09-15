# Module 10 Checkout, Orders, COD, and Inventory Reservation

## Delivered

- Added orders, immutable order-item snapshots, status history, inventory reservations, and coupon-to-order usage records.
- Added retry-safe order creation with a unique idempotency key and generated `YRZ` order numbers.
- Added server-owned checkout pricing; browser-provided prices and totals are never accepted.
- Added transactional COD placement using serializable MySQL transactions and retry handling for write conflicts.
- Stock is atomically checked and decremented with the order. Failed transactions roll back the order, stock, coupon usage, and cart changes together.
- Added exact-once cancellation/restock using consumed/released reservation states and inventory movement audit records.
- Added the order journey: `PLACED`, `CONFIRMED`, `PACKED`, `SHIPPED`, `OUT_FOR_DELIVERY`, `DELIVERED`, and `CANCELLED`.
- Added owned customer order APIs, admin status operations, and customer access isolation.
- Added a responsive four-step checkout, COD availability handling, order success state, customer order list/detail, price/tax breakdown, timeline, cancellation, and admin fulfilment list.

## Inventory policy

COD stock is consumed immediately when an order is placed. A consumed reservation records why that stock is unavailable. Cancelling while an order is `PLACED` or `CONFIRMED` releases each reservation and restores stock exactly once.

## Routes

- `/checkout`
- `/account/orders`
- `/account/orders/[id]`
- `/admin/orders`
- `GET/POST /api/checkout`
- `GET /api/account/orders`
- `GET/DELETE /api/account/orders/[id]`
- `PATCH /api/admin/orders/[id]/status`

## Acceptance checklist

- [x] MySQL migration applied.
- [x] Checkout revalidates address ownership, COD setting, product state, stock, promotions, coupons, shipping, and totals.
- [x] Duplicate submission returns the original owned order.
- [x] Customer order queries are scoped by authenticated user.
- [x] Cancellation and status-transition rules are enforced server-side.
- [x] Unit coverage includes input validation, tax rounding, and status transitions.
- [x] Desktop/mobile flow places a COD order, clears the cart, displays the timeline, cancels, and verifies restored inventory.
- [x] Full code and browser regression gates passed.
