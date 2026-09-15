# Module 9 Coupons and Promotions

## Delivered

- Added coupon, coupon-customer, coupon-usage, promotion, product-target, and category-target tables.
- Added percentage and flat discounts stored and calculated as integer paise.
- Added validity windows, enabled state, minimum spend, maximum discount, first-order flag, customer targeting, and global/per-customer limits.
- Added a centralized pricing engine with deterministic paise rounding and best-promotion selection. Automatic offers do not compound with one another; the best eligible offer is selected for each cart line.
- Added admin-only offer APIs and the responsive `/admin/offers` pricing workspace.
- Added customer coupon apply/remove controls, automatic promotion labels, and a full savings/shipping/total breakdown in the shopping bag.
- Invalid, expired, disabled, minimum-spend, customer-targeting, and usage-limit cases return explicit errors.
- Coupon usage records are ready for transactional reservation/redemption with order creation in Module 10. No usage is consumed merely by applying a code to a cart.

## Routes

- `GET/POST /api/admin/offers`
- `PATCH/DELETE /api/admin/offers/[kind]/[id]`
- `POST/DELETE /api/cart/coupon`
- `/admin/offers`

## Conflict policy

- At most one coupon may be attached to a cart.
- The single best applicable automatic promotion is chosen independently for each line.
- The coupon is calculated after automatic line promotions.
- Automatic offers are not compounded with each other.

## Acceptance checklist

- [x] Database migration applied.
- [x] Admin authorization and same-origin mutation checks are enforced.
- [x] Unit coverage includes rounding, caps, targeting, limits, and date boundaries.
- [x] Customer totals are recalculated by the server and never trusted from the browser.
- [x] Desktop and mobile acceptance flow creates an automatic promotion and coupon, then applies both to a cart.
- [x] Full code and browser regression gates passed.
