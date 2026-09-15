# Module 7 Customer Wishlist

## Implemented

- One private wishlist per signed-in customer with product-level or optional variant-level saved entries.
- Idempotent add, list, remove, and move-to-bag backend operations with ownership checks on every item mutation.
- Variant ownership validation prevents attaching an option from a different product.
- Archived, hidden, inactive, and out-of-stock pieces remain saved with an explicit unavailable state instead of disappearing.
- Product catalogue cards and product-detail pages use persistent wishlist hearts.
- Guests receive a sign-in prompt and cannot create anonymous wishlist data.
- `/account/wishlist` provides a responsive saved-piece grid, removal, availability status, and move-to-bag behavior.
- Moving a product-level save chooses the best available active variant; variant-level saves retain the selected option.

## Routes

```text
/account/wishlist

GET/POST /api/wishlist
DELETE /api/wishlist/[id]
POST /api/wishlist/[id]/move-to-cart
```

## Completion checklist

- [x] Wishlist and wishlist-item migration with private ownership.
- [x] Product and optional variant persistence.
- [x] Idempotent add and protected remove APIs.
- [x] Unavailable saved-item preservation.
- [x] Product card and detail-page controls.
- [x] Responsive account wishlist and move-to-bag behavior.
- [x] Full code and browser acceptance gates passed.
