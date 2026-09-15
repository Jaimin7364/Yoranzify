# Module 0 Foundation Decisions

## Brand direction

- Working name: **Yoranzify**.
- Positioning: accessible premium contemporary fashion for modern Indian customers.
- Visual language: editorial, calm, expressive, and tactile rather than discount-led.
- Palette: warm ivory (`#F6F3EC`), ink (`#171814`), muted olive (`#59624A`), clay (`#A65E46`).
- Typography: high-contrast serif display paired with a clean sans-serif UI face. System-safe fonts are used initially to avoid a blocking font dependency.
- Photography: warm neutral studio campaigns with honest fabric texture and generous negative space.
- Motion: restrained hover, reveal, menu, search, and ticker motion; `prefers-reduced-motion` is respected.

## Working business assumptions

- Departments: Women, Men, and Accessories. Kids can be enabled later through category data.
- Currency: INR; money will be stored in paise.
- Tax display: customer prices are assumed GST-inclusive, pending business confirmation.
- Shipping: complimentary above ₹1,999, pending business confirmation.
- Returns: a 7-day return message is used as placeholder copy, pending approved policy.
- Checkout: customers must sign in before final order placement.
- Roles: `CUSTOMER` and `ADMIN`.

## Information architecture

### Customer store

```text
Home
├── New In
├── Women
├── Men
├── Accessories
├── Sale
├── Search
├── Wishlist
├── Cart / Checkout
└── Account
    ├── Profile
    ├── Addresses
    └── Orders
```

### Admin

```text
Dashboard
├── Products
├── Categories
├── Orders
├── Inventory
├── Customers
├── Coupons / Promotions
├── Banners / Homepage
├── Analytics
└── Settings
```

## Domain conventions

- Order states: `PLACED`, `CONFIRMED`, `PACKED`, `SHIPPED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`, with return states added in Phase 2.
- Payment states: `INITIATED`, `AUTHORIZED`, `CAPTURED`, `FAILED`, `EXPIRED`, `REFUNDED`.
- Promotion MVP: at most one coupon; use the single best automatic promotion per item; no compounding.
- SKU: uppercase ASCII segments separated by hyphens, for example `TSH-BLK-XL`.
- Slugs: lowercase ASCII words separated by hyphens; slugs are unique within their entity.
- URLs: stable nouns (`/products/[slug]`, `/categories/[slug]`, `/account/orders/[orderNumber]`).
- Dates: stored in UTC and displayed in `Asia/Kolkata` by default.

## Screen intent

- Desktop store: announcement bar, three-part editorial header, immersive campaign hero, horizontal collection navigation, product grids, brand story, newsletter, and structured footer.
- Mobile store: compact sticky header, full-screen navigation, bottom-weighted hero copy, swipeable product rails, and touch targets of at least 40px.
- Admin: dark persistent desktop rail, calm neutral workspace, glanceable metric cards, responsive data panels, and task-oriented navigation.

## Module 0 acceptance record

- [x] Next.js + strict TypeScript foundation.
- [x] Tailwind and reusable visual tokens/components.
- [x] Prisma/MySQL schema and seed foundation.
- [x] Health endpoint, structured logger, and shared error format.
- [x] Security response headers.
- [x] Store shell, admin shell, responsive navigation, search, footer, and state pages.
- [x] Vitest/component and Playwright smoke-test configuration.
- [x] Environment variable inventory.
- [x] Brand direction, information architecture, and domain conventions recorded.
- [x] MySQL migration/seed verified against the local development database; separate test and shadow databases are configured.
- [x] Playwright browser binaries installed and desktop/mobile smoke tests executed.
