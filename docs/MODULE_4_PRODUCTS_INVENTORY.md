# Module 4 Products, Variants, Images, and Inventory

## Implemented

- Product catalogue with category, department, descriptions, brand, GST/HSN, regular/sale price in integer paise, flags, status, SEO, and non-destructive archive state.
- Ordered product images backed by validated Module 2 media assets, with primary-image position, alt text, reorder, and removal controls.
- Reusable colours and ordered sizes.
- Variant-level unique colour/size combinations, SKU, price override, stock, threshold, weight, and active state.
- Atomic product/variant/image transactions and automatic immutable initial/correction inventory movements.
- Atomic inventory adjustment that refuses any operation producing negative stock.
- Admin product table, three-stage product editor, archive/restore actions, and inventory dashboard.
- Customer homepage catalogue cards and SEO-aware product-detail pages with interactive colour/size selection, SKU, price, quantity, and stock state.

## Routes

```text
/admin/products
/admin/products/new
/admin/products/[id]/edit
/admin/inventory
/products/[slug]

GET/POST /api/admin/products
GET/PATCH/DELETE /api/admin/products/[id]
POST /api/admin/products/[id]/restore
POST /api/admin/inventory/[variantId]
GET /api/products/[slug]
```

## Completion checklist

- [x] Product, image, colour, size, variant, and inventory migration.
- [x] Standard colours/sizes seeded.
- [x] Transactional product CRUD and archive/restore.
- [x] Atomic non-negative stock adjustments with immutable movement ledger.
- [x] Responsive admin catalogue/editor/inventory UI.
- [x] Interactive public product cards and detail view.
- [x] Unit tests for pricing and product/variant validation.
- [x] Full code and browser acceptance gates passed.
