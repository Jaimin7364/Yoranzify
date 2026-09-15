# Module 6 Server-Authoritative Cart

## Implemented

- Persistent carts for signed-in customers and secure opaque guest-cart cookies.
- Add, merge duplicate, update quantity, remove, clear, and retrieve operations.
- Deterministic guest-to-customer merge during registration or login, capped by current stock and the per-line limit.
- Every cart read recalculates effective variant price, product/category visibility, stock allowance, subtotal, shipping threshold, shipping charge, and total using integer paise.
- Price-change, stock-change, and unavailable-product messages remain visible instead of silently deleting affected lines.
- Guest carts expire after 30 days; customer carts expire after 180 days. Expired carts are deleted when accessed.
- Interactive product add-to-bag action, global item badge, responsive slide-in bag, quantity/removal controls, clear action, shipping progress, and full `/cart` page.
- Checkout stays intentionally disabled until Module 9, and also remains disabled for unavailable or over-stocked lines.

## Routes

```text
/cart

GET/POST/DELETE /api/cart
PATCH/DELETE /api/cart/items/[id]
```

## Completion checklist

- [x] Cart and cart-item migration with ownership and uniqueness constraints.
- [x] Secure guest identity and private customer ownership.
- [x] Server-authoritative pricing, stock, totals, and shipping calculation.
- [x] Duplicate item merge, quantity limits, remove, and clear.
- [x] Guest-to-user cart merge at authentication.
- [x] Responsive bag drawer and full cart page.
- [x] Unit coverage for merge and integer-money rules.
- [x] Full code and browser acceptance gates passed.
