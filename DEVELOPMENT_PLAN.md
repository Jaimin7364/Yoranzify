# Yoranzify E-commerce Development Plan

## 1. Purpose

This document is the implementation roadmap for the Yoranzify fashion e-commerce website described in `idea.txt`. Development will use one Next.js application for the customer store, admin panel, backend APIs, and authentication, with Prisma and MySQL.

Each business module must be completed as a tested vertical slice before the next module begins:

1. Confirm requirements and acceptance criteria.
2. Add or update the database schema and migration.
3. Implement backend services, validation, authorization, and API/server actions.
4. Write and pass backend unit/integration tests.
5. Implement the customer and/or admin frontend.
6. Write and pass component and end-to-end tests.
7. Perform manual acceptance testing and close the module.

A module is not complete merely because its screens look finished. Its migrations, authorization, validation, error states, automated tests, and acceptance criteria must also pass.

---

## 2. Product and Technical Decisions

### Application stack

| Area | Choice |
| --- | --- |
| Application | Next.js (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Backend | Next.js Route Handlers and Server Actions |
| Database | MySQL |
| ORM | Prisma |
| Authentication | Custom credentials, bcrypt password hashing, database-backed sessions in HTTP-only cookies |
| Validation | Zod schemas shared where appropriate |
| Unit/integration tests | Vitest |
| Component tests | React Testing Library |
| End-to-end tests | Playwright |
| Payments | Razorpay plus Cash on Delivery |
| Email | SMTP/Hostinger Email |
| Images | Local filesystem in development; persistent Hostinger filesystem in production |
| Deployment | Hostinger Node.js hosting |

### Important implementation rules

- Store money as integer paise, never floating-point rupees.
- Store dates in UTC and display them in the configured store timezone.
- Keep stock at product-variant level (for example, Black + XL), not product level.
- Store only image paths and metadata in MySQL, not image binary data.
- Never trust price, discount, shipping fee, or order total received from the browser; calculate them on the server.
- Use database transactions for stock changes, coupon usage, payment confirmation, and order creation.
- Soft-delete or archive products/categories referenced by orders instead of physically deleting them.
- Snapshot product name, SKU, variant, price, tax, and discount in each order item so old orders remain accurate.
- Protect all `/admin` routes and admin mutations using server-side role checks.
- Verify Razorpay signatures server-side and make webhook processing idempotent.
- Add indexes for slugs, SKUs, email, mobile, order number, status, and common product filters.

---

## 3. Delivery Scope

### MVP (first production release)

- Store setup and site settings
- Customer/admin authentication
- Categories
- Products, images, colors, sizes, variants, and inventory
- Store catalogue, product details, search, filtering, and sorting
- Cart and wishlist
- Customer addresses
- Coupons and basic promotions
- Checkout with COD and Razorpay
- Orders and order tracking
- Admin dashboard and customer management
- Banners and configurable homepage sections
- Transactional emails
- Deployment, backup, monitoring, security, and final QA

### Phase 2 (after stable launch)

- Product reviews and customer review images
- Returns/refunds workflow
- Shiprocket/other courier integration
- WhatsApp notifications
- Abandoned-cart messaging
- Advanced analytics and product recommendations
- Object storage/CDN migration

---

## 4. Environments and Quality Gates

Use separate environment files and databases for local development, automated tests, staging, and production. Never run tests against production data.

### Standard checks for every module

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

Exact scripts can be added during project setup. CI must run linting, type checking, unit/integration tests, and a production build on every pull request. Relevant Playwright tests must pass before a module is closed.

### Definition of Done for every module

- Database migration is committed and can run on an empty database.
- Seed/test fixtures are updated when needed.
- Backend validates input and returns consistent typed errors.
- Authentication and role authorization are tested.
- Success, empty, loading, validation, forbidden, and server-error UI states exist.
- Unit/integration/component/E2E tests required by the module pass.
- Accessibility basics pass: labels, keyboard use, focus, contrast, and semantic controls.
- Responsive behavior is manually checked on mobile, tablet, and desktop.
- No secrets or personal data are written to logs.
- Acceptance criteria are demonstrated on staging.

---

## 5. Module-by-Module Build Order

## Module 0 — Discovery, UX, and Project Foundation

**Goal:** Establish decisions and infrastructure needed by every later module.

### Requirements/design

- Confirm brand name, logo/colors/fonts, supported genders/departments, tax display, shipping rules, return/cancellation policy, and legal pages.
- Produce store and admin navigation maps plus mobile/desktop wireframes.
- Define roles (`CUSTOMER`, `ADMIN`), order states, payment states, promotion priority, SKU rules, and URL/slug rules.
- Create an environment variable inventory without committing secret values.

### Backend/foundation implementation

- Scaffold Next.js with strict TypeScript, Tailwind, shadcn/ui, ESLint, and formatting.
- Configure Prisma and MySQL connection handling.
- Add health endpoint, structured logging, central error mapping, Zod validation convention, and security headers.
- Establish `src/app/(store)`, `src/app/admin`, `src/app/api`, `src/components`, `src/lib`, `src/services`, `src/types`, `src/utils`, and `prisma` boundaries.
- Create base CI, test database reset/seed utilities, and fixtures/factories.

### Backend tests

- Health endpoint returns success when application dependencies are available.
- Validation and error helpers produce the agreed response shape.
- Prisma can migrate, seed, read, and roll back test data in isolation.

### Frontend implementation

- Build responsive store and admin shells, navigation, footer, typography, buttons, forms, dialogs, tables, toasts, loading skeletons, and error boundaries.
- Add placeholder 404, unauthorized, and generic error pages.

### Frontend tests

- Component tests cover the common form controls and navigation.
- Playwright smoke tests load store/admin shells at mobile and desktop widths.
- Run an initial accessibility smoke scan.

### Completion gate

- CI is green, production build succeeds, test data can be reset reliably, and agreed wireframes/decisions are recorded.

---

## Module 1 — Authentication and Authorization

**Goal:** Secure customer accounts and admin access before protected business modules are built.

### Database/backend implementation

- Add `users`, `sessions`, and password-reset token models.
- Enforce unique normalized email and mobile values.
- Implement registration, login, logout, current-session lookup, forgotten password, reset password, and password change.
- Hash passwords with bcrypt using an appropriate work factor.
- Set opaque session tokens in `HttpOnly`, `Secure` (production), `SameSite=Lax` cookies; store only a hash of the session token in the database.
- Add session expiry, rotation/revocation, CSRF protection for cookie-authenticated mutations, login rate limiting, and admin role guards.
- Seed the initial admin through a secure deployment procedure, not a public endpoint.

### Backend tests

- Registration validates names, email/mobile format, password strength, confirmation, and duplicates.
- Login accepts correct credentials and rejects incorrect/inactive accounts without account enumeration.
- Cookies use the expected security attributes; logout and password reset revoke sessions.
- Expired/reset tokens cannot be reused.
- Customer requests to admin endpoints return forbidden; unauthenticated requests return unauthorized.
- Rate limits activate after repeated attempts.

### Frontend implementation

- Create registration, login, forgot/reset password, logout, and account navigation UI.
- Add admin login and protected route behavior.
- Preserve a safe intended destination after login; never allow open redirects.

### Frontend/E2E tests

- Register → login → refresh → remain logged in → logout.
- Forgot password with test email transport → reset → old password rejected → new password accepted.
- Customer cannot open admin pages; admin can.
- Forms expose accessible validation and server errors.

### Completion gate

- Authentication flows and role boundaries pass automated and manual testing.

---

## Module 2 — Site Settings and Media Pipeline

**Goal:** Provide reusable store configuration and safe image handling before catalogue features.

### Database/backend implementation

- Add `site_settings` and media metadata models or an equivalent typed settings design.
- Support store name, logo, favicon, contact details, social links, address, GST number, shipping charge, free-shipping threshold, COD toggle, currency, low-stock threshold, and maintenance mode.
- Implement admin-only settings read/update operations with validation and audit timestamps.
- Implement image upload for products, categories, banners, and later reviews.
- Validate MIME type by file contents, extension, dimensions, and size; generate collision-safe names.
- Resize/compress and convert appropriate uploads to WebP using Sharp; prevent path traversal.
- Keep storage behind an adapter so local/Hostinger storage can later be replaced with S3/R2.

### Backend tests

- Only admins can mutate settings or upload media.
- Invalid, oversized, spoofed, and unsupported files are rejected.
- Valid files are processed and metadata/path are saved.
- Replacement/deletion does not remove a file still referenced elsewhere.
- Shipping settings and maintenance mode validation works.

### Frontend implementation

- Build admin settings forms and image upload/crop/preview controls.
- Connect the store shell to configured logo, contacts, social links, and maintenance status.

### Frontend/E2E tests

- Admin updates settings and sees changes in the storefront.
- Upload progress, preview, validation errors, retry, and replacement work.
- Non-admins cannot access settings UI.

### Completion gate

- Settings survive restart/deployment and uploaded images are served from persistent storage.

---

## Module 3 — Category Management

**Goal:** Create the hierarchical catalogue structure used by products and navigation.

### Database/backend implementation

- Add `categories` with parent relation, name, unique slug, image, description, display order, visibility, timestamps, and archive status.
- Implement admin create/read/update/reorder/show-hide/archive operations.
- Implement public visible-category tree and category-by-slug operations.
- Prevent circular parent relations and define behavior when a category contains products or children.

### Backend tests

- Slugs are normalized and unique; parent/child trees are returned in display order.
- Circular relationships and invalid parents are rejected.
- Hidden/archived categories do not appear publicly.
- Categories referenced by products cannot be destructively deleted.
- Authorization is enforced for every mutation.

### Frontend implementation

- Admin category list/tree, add/edit form, image upload, visibility toggle, ordering, and archive confirmation.
- Store navigation and category landing page with empty state.

### Frontend/E2E tests

- Admin creates Men → T-Shirts, reorders it, hides it, and edits it.
- Store navigation and URLs update correctly.
- Archived/hidden categories are absent from public pages.

### Completion gate

- A multi-level category tree is manageable without code changes and is correctly rendered on the store.

---

## Module 4 — Products, Variants, Images, and Inventory

**Goal:** Build the central fashion catalogue with variant-level stock.

### Database/backend implementation

- Add products, product images, colors, sizes, product variants, inventory movements, and related indexes.
- Product fields: name, slug, SKU family/reference, descriptions, category, brand, gender, regular/sale price, GST, HSN, status, featured/best-seller/new-arrival flags, SEO title/description, and archive timestamps.
- Variant fields: product, color, size, unique SKU, optional price override, stock quantity, low-stock threshold override, active state, and optional weight.
- Implement product CRUD, image ordering/alt text, variant matrix creation, archive/restore, pagination, admin filters, and public queries.
- Record stock adjustments as immutable inventory movements with reason, quantity delta, actor, and reference.
- Calculate displayed discount server-side and validate `salePrice < regularPrice` when a sale price exists.
- Prevent negative stock and SKU duplication.

### Backend tests

- Product validation covers prices, GST/HSN, category, slug, images, and required fields.
- A Black/M and Black/L variant keep independent stock.
- Concurrent stock adjustments never create negative stock or lost updates.
- Archived/inactive products and variants are excluded publicly but remain available to historical orders/admin.
- Image position and primary-image behavior are deterministic.
- Low-stock and out-of-stock queries respect configured thresholds.

### Frontend implementation

- Admin product table with search, filters, pagination, status controls, archive/restore, and bulk visibility actions.
- Multi-step product editor for details, SEO, images, colors/sizes, variant matrix, prices, and stock.
- Admin inventory table with low/out-of-stock views and adjustment dialog.
- Basic customer product card and product-detail page with image gallery, variant selector, price/discount, and stock state.

### Frontend/E2E tests

- Admin creates a product with multiple colors/sizes and independent stock, edits it, and archives it.
- Image upload, reorder, alt text, and removal work.
- Customer changing color/size updates SKU, price, availability, and images as designed.
- Out-of-stock variants cannot proceed to purchase actions.

### Completion gate

- A complete garment with multiple variant combinations can be managed and viewed accurately.

---

## Module 5 — Catalogue Browsing, Search, Filters, and Homepage Product Sections

**Goal:** Make the catalogue discoverable and SEO-friendly.

### Backend implementation

- Implement paginated product listing by category, gender, availability, size, color, brand, and price range.
- Implement search across product name, SKU, category, and brand using indexed MySQL capabilities suitable for MVP.
- Implement sort by newest, price low/high, and popularity; clearly define popularity (initially delivered sales count).
- Add APIs/server queries for featured, new-arrival, best-seller, and sale collections.
- Use canonical query parameter rules and cache/invalidation appropriate for inventory and pricing.

### Backend tests

- Combined filters return only matching active variants/products.
- Pagination and each sort order are stable and deterministic.
- Search handles case/spacing and safely escapes input.
- Hidden products/categories cannot leak through search or collections.
- Price filtering uses the effective server-calculated price.

### Frontend implementation

- Product listing grid, breadcrumbs, pagination/load-more decision, mobile filter drawer, desktop filters, sorting, search suggestions/results, and clear-filter controls.
- Complete product detail SEO metadata, structured data, canonical URLs, image gallery, related items, and responsive behavior.
- Render new-arrival, featured, best-seller, and sale sections from live data.

### Frontend/E2E tests

- Search, multiple filters, sort, clear, pagination, browser back/forward, and shareable URL state work.
- No-results and unavailable-product states are clear.
- Product/category metadata and canonical URLs are correct.
- Basic accessibility and mobile browsing journeys pass.

### Completion gate

- A customer can reliably find a product and select an available variant from a shareable URL.

---

## Module 6 — Cart

**Goal:** Maintain a server-authoritative shopping cart for guests and signed-in customers.

### Database/backend implementation

- Add carts and cart items keyed to customer or secure guest-cart identifier.
- Implement add, update quantity, remove, clear, retrieve, and guest-to-user merge.
- Recalculate current price, availability, allowed quantity, discounts, and shipping preview on the server.
- Define cart expiry/cleanup and a deterministic merge rule for duplicate variants.

### Backend tests

- Adding the same variant merges quantities within available stock.
- Invalid, inactive, or out-of-stock variants cannot be added.
- Quantity and price are revalidated after an admin stock/price change.
- Guest cart merges correctly at login without cross-user data exposure.
- Cart totals use integer money and correct rounding.

### Frontend implementation

- Add-to-cart controls, cart drawer/page, quantity controls, remove/clear actions, totals, shipping progress, and stock/price-change messages.
- Disable purchase controls when variant selection is incomplete.

### Frontend/E2E tests

- Guest adds several variants, refreshes, edits quantity, logs in, and retains the merged cart.
- Price and stock changes are visibly reconciled.
- Mobile and keyboard interactions work.

### Completion gate

- Cart contents persist safely and all displayed totals match server calculations.

---

## Module 7 — Wishlist

**Goal:** Let signed-in customers save products or variants for later.

### Database/backend implementation

- Add wishlist and wishlist item models with a unique customer/item constraint.
- Implement list, add, remove, and move-to-cart operations.
- Decide that wishlist stores a product plus optional selected variant; preserve unavailable entries with a clear status instead of silently deleting them.

### Backend tests

- Duplicate adds are idempotent.
- Users can access only their own wishlist.
- Archived or unavailable items are marked correctly.
- Move-to-cart validates variant stock.

### Frontend implementation

- Wishlist controls on cards/details and account wishlist page.
- Add sign-in prompt for guests and move-to-cart behavior.

### Frontend/E2E tests

- Add/remove from listing and detail pages, persistence after login, and move-to-cart.
- Unavailable wishlisted items show the correct state.

### Completion gate

- Wishlist state is private, persistent, and consistent across store pages.

---

## Module 8 — Customer Profile and Addresses

**Goal:** Collect and manage reliable checkout/contact information.

### Database/backend implementation

- Add addresses with full name, mobile, lines, landmark, city, state, postal code, country, type, and default flag.
- Implement profile read/update and address CRUD/default selection.
- Validate Indian mobile numbers and PIN codes for the initial India-only release; keep the model extensible.
- Ensure exactly one default shipping address per customer where addresses exist.

### Backend tests

- Ownership checks prevent access to another user's profile/address.
- Invalid fields are rejected and default-address transitions are transactional.
- Deleting the default address assigns a sensible replacement.

### Frontend implementation

- Account overview, profile editor, password change link, and address list/add/edit/delete/default UI.
- Reuse address form in checkout.

### Frontend/E2E tests

- Customer edits profile and performs full address lifecycle.
- Validation, confirmation dialogs, keyboard operation, and mobile layout pass.

### Completion gate

- Customers can maintain valid addresses and select one reliably during checkout.

---

## Module 9 — Coupons and Promotions

**Goal:** Apply controlled discounts consistently without manually editing product prices.

### Database/backend implementation

- Add coupons, coupon usage, promotions, targets (product/category), and supporting enums.
- Support percentage/flat discounts, minimum spend, maximum discount, first-order/customer-specific rules, validity dates, usage limits, and enabled status.
- Support promotion targets for products/categories with percentage/flat discounts.
- Define conflict policy for MVP: at most one coupon; choose the single best applicable automatic promotion per line; do not compound discounts unless explicitly enabled later.
- Centralize pricing in one server-side pricing service used by product display, cart, checkout, and orders.
- Reserve/increment limited coupon usage only as part of successful order/payment rules; prevent concurrent overuse.

### Backend tests

- Boundary dates, minimum spend, cap, first-order, customer restrictions, and global/per-user limits.
- Category/product targeting and conflict precedence.
- Expired/disabled coupons and cancelled/failed orders behave according to policy.
- Concurrent final redemptions do not exceed limits.
- Rounding is correct in paise.

### Frontend implementation

- Admin coupon/promotion list, create/edit forms, scheduling, target selector, enable/disable, and usage display.
- Customer coupon apply/remove UI and transparent discount breakdown.

### Frontend/E2E tests

- Admin creates future/current/expired offers.
- Eligible customer applies a coupon; invalid/ineligible cases explain why.
- Totals remain consistent from cart through checkout.

### Completion gate

- A promotion/coupon produces the same total everywhere and cannot exceed its defined rules.

---

## Module 10 — Checkout, Orders, COD, and Inventory Reservation

**Goal:** Create accurate orders without overselling.

### Database/backend implementation

- Add orders, order items, status history, inventory reservations/movements, and order number generation.
- Snapshot delivery address, product/variant details, price, tax, discount, shipping, and totals.
- Implement checkout preview and order creation using a database transaction.
- Revalidate cart, stock, active state, coupon, shipping, and totals at submission.
- For COD, create a placed order and decrement/reserve stock atomically according to the chosen inventory policy.
- Define cancellation permissions and restock exactly once using idempotent inventory movements.
- Store a timeline for `PLACED`, `CONFIRMED`, `PACKED`, `SHIPPED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`, and later return states.

### Backend tests

- Server ignores manipulated browser prices/totals.
- Two customers competing for the final unit cannot both order it.
- Order creation either fully commits or fully rolls back.
- Order snapshots remain unchanged after product edits.
- Cancellation/restock is idempotent and follows allowed status transitions.
- Customers can read only their own orders; admins can query all.

### Frontend implementation

- Multi-step checkout: cart review → address → shipping/payment → final review.
- COD option controlled by site settings.
- Order success/failure pages, account order list, detail, item breakdown, and status timeline.
- Provide retry-safe submission UI to prevent duplicate clicks.

### Frontend/E2E tests

- Complete guest-to-login/customer COD checkout and verify cart clear, stock decrease, and order timeline.
- Out-of-stock race, stale coupon, invalid address, duplicate submission, and server error recovery.
- Customer cannot access another customer's order URL.

### Completion gate

- COD orders are transactional, auditable, correctly totaled, and cannot oversell stock.

---

## Module 11 — Razorpay Payments

**Goal:** Add secure online payment without trusting client callbacks.

### Database/backend implementation

- Add payments and webhook event records with unique gateway identifiers and idempotency keys.
- Create Razorpay orders server-side using the authoritative payable amount.
- Verify checkout signatures server-side.
- Implement authenticated Razorpay webhooks with raw-body signature verification, event deduplication, retry tolerance, and safe state transitions.
- Define order/payment states for initiated, authorized/captured, failed, expired, and refunded payment.
- Define stock reservation expiry for abandoned payment attempts and a scheduled cleanup procedure.
- Never mark an order paid only because the browser says payment succeeded.

### Backend tests

- Mock Razorpay order creation and signature verification.
- Invalid signatures, replayed webhooks, out-of-order events, duplicate events, amount mismatch, and network failures.
- Paid order finalization and failed/expired reservation release are idempotent.
- Secrets and payment details are not exposed in responses/logs.

### Frontend implementation

- Razorpay checkout option, loading/cancel/failure/success states, safe retry, and payment status page.
- Recover status from the server after refresh or browser close.

### Frontend/E2E tests

- Use Razorpay test mode/mocks for success, user cancellation, failure, delayed webhook, refresh, and retry journeys.
- Verify a duplicate callback does not create a duplicate order or charge record.

### Completion gate

- Test-mode payments reconcile through verified server/webhook state and recovery paths are proven.

---

## Module 12 — Admin Orders, Shipping, Customers, and Dashboard

**Goal:** Give store staff the operational tools needed after launch.

### Database/backend implementation

- Implement admin order search/filter/detail, validated status transitions, internal notes, courier/tracking data, and CSV export if needed.
- Implement customer list/detail, total orders/spend, last order, and account enable/disable.
- Implement aggregate dashboard queries: sales today/total, order counts, customers/products, low/out-of-stock, daily/monthly revenue, orders by status, and top products.
- Base revenue on the agreed paid/delivered status definition and document it.
- Add audit records for sensitive admin actions.

### Backend tests

- Illegal status transitions are rejected; valid transitions append history once.
- Tracking data validation and customer-account disable behavior work.
- Dashboard totals match known fixtures and exclude cancelled/failed orders as defined.
- CSV output prevents formula injection and respects filters.
- All operations require admin role.

### Frontend implementation

- Admin dashboard cards/charts and low-stock shortcuts.
- Order table/detail/timeline, status update, courier/tracking fields, and printable packing/invoice view if required.
- Customer table/detail with disable/enable action.

### Frontend/E2E tests

- Admin finds an order, progresses it through allowed states, adds tracking, and customer sees changes.
- Invalid transition is blocked with useful feedback.
- Dashboard numbers/charts render correct seeded data.
- Disabled customer cannot create a new session/order under the agreed policy.

### Completion gate

- Staff can manage the complete post-purchase workflow without database access or code changes.

---

## Module 13 — Banners and Homepage CMS

**Goal:** Let admins operate the storefront homepage without deployment.

### Database/backend implementation

- Add banners and homepage-section configuration.
- Banner fields: image/alt text, title, subtitle, button text/URL, position, start/end dates, enabled state, and optional mobile image.
- Homepage sections: hero, categories, new arrivals, trending, best sellers, offers, featured collection, gallery, and testimonials/reviews; allow enable/disable and ordering.
- Validate internal/external link policy and return only currently active banners publicly.

### Backend tests

- Scheduling respects UTC/store timezone boundaries.
- Disabled, expired, and future banners are excluded.
- Ordering is deterministic and unsafe URLs are rejected.
- Only admins can modify content.

### Frontend implementation

- Admin banner CRUD, preview, scheduling, ordering, and section configuration.
- Dynamic storefront homepage carousel/sections with responsive images and accessible controls.

### Frontend/E2E tests

- Admin schedules/reorders/disables banners and changes appear at the proper time.
- Carousel supports keyboard controls, pause behavior, readable alt text, and mobile images.
- Disabled homepage sections disappear without breaking layout.

### Completion gate

- Homepage content and order can be changed through admin and scheduling behaves predictably.

---

## Module 14 — Email Notifications and Operational Jobs

**Goal:** Reliably notify customers and run required background maintenance.

### Backend implementation

- Configure SMTP transport and branded templates for welcome/password reset, order placed, payment confirmation/failure where useful, status changes, shipment/tracking, delivery, and cancellation.
- Add an email/outbox model or retryable job approach so business transactions do not depend on immediate SMTP success.
- Add protected scheduled jobs for expired sessions/tokens, stale carts, expired stock reservations, and optional low-stock alerts.
- Redact personal data and secrets from logs.

### Backend tests

- Templates render correct sanitized data and links.
- Failed sends retry without duplicating business operations.
- Duplicate status/webhook events do not send duplicate messages.
- Job endpoints require an unguessable secret or platform authentication.

### Frontend implementation

- Add clear confirmation states telling customers when email has been sent.
- Add admin visibility into recent notification failures if operationally required.

### Frontend/E2E tests

- Use a test mailbox/SMTP catcher to verify password reset and order lifecycle messages.
- Confirm links lead to valid protected/public pages as appropriate.

### Completion gate

- Critical emails are retryable, observable, and do not block orders or payments.

---

## Module 15 — SEO, Performance, Accessibility, Security, and Legal

**Goal:** Harden the completed MVP before release.

**Status:** Complete. See `docs/MODULE_15_QUALITY_SECURITY_LEGAL.md` for the implementation and verification record.

### Implementation

- Add dynamic metadata, canonical URLs, sitemap, robots rules, Open Graph data, and Product/Breadcrumb/Organization structured data.
- Optimize images, fonts, server/client component boundaries, cache rules, and database queries.
- Add Terms, Privacy, Shipping, Cancellation, Return/Refund, Contact, and About pages with approved business content.
- Add CSP/security headers, rate limits, secure cookie review, input/output sanitization, upload protections, dependency audit, error redaction, and least-privilege database credentials.
- Ensure admin/indexing rules prevent search engines from indexing private pages.

### Tests

- Lighthouse checks on key mobile/desktop pages with agreed budgets.
- Automated accessibility scan plus keyboard/screen-reader manual checks for navigation, forms, dialogs, carousel, filters, checkout, and admin workflows.
- Authorization matrix testing for customer/admin endpoints.
- OWASP-focused tests for injection, XSS, CSRF, insecure direct object reference, upload abuse, brute force, open redirects, and sensitive data exposure.
- Validate sitemap, robots, structured data, 404/500 behavior, and noindex rules.

### Completion gate

- No critical/high security findings; accessibility blockers are closed; agreed performance and SEO budgets pass.

---

## Module 16 — Deployment, Backups, Monitoring, and Release

**Goal:** Launch safely on Hostinger with a tested recovery process.

### Infrastructure implementation

- Verify Hostinger plan supports the required Node.js version, persistent writable storage, MySQL, SSL, process restart, environment variables, cron/scheduled jobs, and Razorpay webhooks.
- Create staging and production configurations with separate databases and gateway credentials.
- Define deployment steps: install locked dependencies, generate Prisma client, back up, run migrations, build, restart, health check, and smoke test.
- Persist `/uploads` outside replaceable build artifacts and map it through the storage adapter.
- Schedule encrypted MySQL and uploads backups with retention and off-server copies.
- Add application/error logging, uptime checks, disk-space monitoring, database monitoring, and alerts for payment/webhook/email failures.
- Write migration rollback/forward-fix and incident procedures.

### Release tests

- Restore a MySQL plus uploads backup into a clean staging environment and verify products/images/orders.
- Run complete staging regression for admin product creation through customer order delivery.
- Run Razorpay test-mode webhook through the public staging URL.
- Confirm HTTPS, secure cookies, email deliverability, upload persistence after redeploy/restart, scheduled jobs, and maintenance mode.
- Perform production smoke test without placing an unintended live charge.

### Completion gate

- Signed release checklist, verified restore, green regression suite, monitoring active, and rollback/forward-fix procedure ready.

---

## 6. Phase 2 Modules

Build these using the same backend → backend tests → frontend → E2E → acceptance sequence.

### Reviews and moderation

- Allow verified purchasers to submit one rating/review per delivered order item.
- Moderate approve/reject/delete; optionally support processed customer images.
- Test ownership, verification, moderation, averages, pagination, and abusive uploads/content.

### Returns and refunds

- Define eligibility windows/reasons, return requests, approval/rejection, pickup, received/inspected, refund, and restock policy.
- Integrate Razorpay refunds idempotently and preserve a full audit trail.

### Shipping provider integration

- Add Shiprocket/other provider behind a shipping adapter.
- Handle shipment creation, labels, tracking webhooks, retries, deduplication, and reconciliation.

### Growth features

- WhatsApp notifications with consent and approved templates.
- Abandoned-cart reminders with opt-out and expiry rules.
- Advanced analytics, recommendations, and object storage/CDN migration.

---

## 7. Core Data Model Checklist

The final names may change during schema design, but the domain should include:

```text
User, Session, PasswordResetToken, Address
SiteSetting, MediaAsset
Category
Product, ProductImage, Color, Size, ProductVariant, InventoryMovement
Cart, CartItem
Wishlist, WishlistItem
Coupon, CouponUsage, Promotion, PromotionTarget
Order, OrderItem, OrderStatusHistory, InventoryReservation
Payment, PaymentWebhookEvent
Banner, HomepageSection
EmailOutbox, AuditLog
Review (Phase 2)
ReturnRequest, Refund (Phase 2)
```

Required database constraints—not only application checks—should cover unique emails/mobiles, slugs, SKUs, gateway IDs, webhook event IDs, and appropriate composite uniqueness for cart/wishlist/coupon usage.

---

## 8. End-to-End Regression Journeys

Keep these journeys green as modules accumulate:

1. **Admin catalogue:** Admin logs in → creates category → uploads images → creates product and variants → adjusts stock → product appears publicly.
2. **Guest conversion:** Guest browses/searches/filters → selects variant → adds to cart → registers/logs in → cart merges → adds address → places COD order.
3. **Online payment:** Customer checks out → Razorpay test payment succeeds → verified webhook marks payment/order correctly → refresh shows success once.
4. **Operations:** Admin finds order → confirms/packs/ships with tracking → customer sees timeline and receives email → admin marks delivered.
5. **Offers:** Admin schedules promotion/banner → eligible customer sees it and gets correct price → ineligible/expired use is rejected.
6. **Inventory race:** Two sessions attempt the last unit → one succeeds → one receives an actionable stock error → inventory never becomes negative.
7. **Security boundaries:** Guest/customer/admin attempt protected resources → each receives only the access and data allowed to that role.

---

## 9. Recommended Milestones

| Milestone | Included modules | Demonstrable outcome |
| --- | --- | --- |
| Foundation | 0–2 | Secure app shell, auth, settings, and uploads |
| Catalogue | 3–5 | Admin-managed, searchable product catalogue |
| Shopping | 6–9 | Cart, wishlist, account, addresses, and offers |
| Commerce | 10–11 | Transactional COD and Razorpay ordering |
| Operations | 12–14 | Orders, customers, dashboard, CMS, and email |
| Launch | 15–16 | Hardened, backed-up, monitored production release |

Complete and demonstrate each milestone on staging before beginning high-risk work in the next one. Small UI refinements can overlap, but the module quality gates must not be skipped.

---

## 10. Decisions Required Before Their Modules Begin

Record the answers in the project documentation; unresolved choices should not be silently invented during implementation.

- Exact brand/design assets and departments (Men/Women/Kids/Accessories).
- India-only delivery at launch and serviceable PIN-code policy.
- GST inclusive/exclusive display and invoice requirements.
- Shipping fee and free-shipping calculation basis (before or after discounts).
- Guest checkout versus login-required checkout (the plan currently assumes login is required before final order placement).
- Inventory behavior during Razorpay payment: reservation duration and release schedule.
- COD eligibility limits or PIN-code restrictions.
- Promotion stacking/priority (the plan proposes non-stacking MVP rules).
- Customer cancellation cutoff and stock restoration rules.
- Revenue definition used on the admin dashboard.
- Whether invoice PDF/printing and CSV export are required for MVP.
- Approved legal, privacy, shipping, cancellation, and return wording.
- Backup retention, recovery-time target, and recovery-point target.

---

## 11. First Development Sprint

Start only with Module 0. The first sprint deliverable should be a deployable skeleton—not product CRUD yet—with:

- Confirmed scope/decisions and wireframes.
- Next.js/TypeScript project and store/admin shells.
- MySQL/Prisma local and test database workflow.
- Test runners and CI.
- Shared UI primitives and error/validation conventions.
- Health check and production build.

After its completion gate passes, begin Module 1 authentication. This order avoids rebuilding every later screen around changing security, validation, storage, and testing foundations.
