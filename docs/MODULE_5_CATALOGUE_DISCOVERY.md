# Module 5 Catalogue Browsing, Search, and Discovery

## Implemented

- Server-authoritative catalogue query supporting search, category, department, availability, size, colour, brand, effective-price range, collection, sorting, and pagination.
- Search normalization and stable canonical query strings for shareable URLs and browser history.
- Public-only query rules prevent inactive, archived, or hidden-category products from leaking into search and collections.
- Popularity is defined as delivered-unit count (`deliveredSalesCount`); the orders module will increment it when an order becomes delivered.
- Responsive `/shop` experience with desktop filters, mobile drawer, sorting, no-results state, product counts, and pagination.
- Search submission and live product suggestions in the storefront header.
- Live new-arrival, featured, best-seller, and sale homepage collections.
- Category product grids, canonical product/catalogue URLs, Open Graph product data, Product JSON-LD, and related products.
- Queries are request-time dynamic so inventory and pricing changes appear without stale cached catalogue results.

## Routes

```text
/shop
/shop?q=linen&size=M&color=Black&availability=in-stock
/shop?collection=new
/shop?collection=featured
/shop?collection=bestsellers
/shop?collection=sale

GET /api/products
GET /api/products/[slug]
```

## Completion checklist

- [x] Database popularity field and supporting index migrated.
- [x] Combined public catalogue filters and stable sorting.
- [x] Effective-price filtering and variant availability filtering.
- [x] Search suggestions and shareable result URLs.
- [x] Responsive filter, sort, pagination, and no-results interfaces.
- [x] Dynamic homepage collections and category grids.
- [x] Canonical metadata, structured data, and related products.
- [x] Full code and browser acceptance gates passed.
