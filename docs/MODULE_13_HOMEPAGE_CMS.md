# Module 13 — Banners and Homepage CMS

## Delivered

- [x] Scheduled banner data with desktop/mobile media, accessible alt text, campaign copy, destination, ordering, and enabled state.
- [x] Ordered homepage configuration for hero, categories, new arrivals, trending, best sellers, offers, featured collection, gallery, and testimonials.
- [x] Admin homepage studio with banner upload, preview, create/edit/delete, scheduling, visibility, and section reordering.
- [x] Public content filtering excludes disabled, future, and expired banners using UTC instants.
- [x] Internal destinations and HTTPS external destinations are allowed; unsafe URL schemes are rejected.
- [x] Dynamic storefront composition with responsive campaign images and graceful fallback content.
- [x] Accessible carousel with previous/next controls, arrow-key navigation, focus/hover pause, and explicit pause/play.

## Scheduling rules

- A banner is active when enabled and `startsAt <= now < endsAt`.
- A missing start means immediately available; a missing end means no automatic expiry.
- Browser date/time inputs are converted to ISO UTC instants before saving.
- Banner ordering is deterministic by position and then database ID.

## Verification

- [x] Database migration applied
- [x] ESLint and TypeScript
- [x] Unit/integration tests
- [x] Production build
- [x] Full desktop and mobile E2E suite

The completion gate is satisfied: homepage content, visibility, scheduling, and order can be changed without deployment.
