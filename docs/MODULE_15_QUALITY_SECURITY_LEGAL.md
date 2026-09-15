# Module 15 — SEO, Performance, Accessibility, Security, and Legal

## Delivered

- [x] Canonical metadata, Open Graph/Twitter cards, web manifest, dynamic sitemap, and restrictive robots rules.
- [x] Organization, Product, and product BreadcrumbList structured data with escaped JSON output.
- [x] Search-engine exclusion and private cache headers for admin, account, cart, and checkout routes.
- [x] Content Security Policy, clickjacking, MIME sniffing, referrer, permissions, cross-origin, and production HSTS headers.
- [x] Terms, Privacy, Shipping, Cancellation, Return/Refund, Contact, and About pages with responsive editorial styling.
- [x] Real policy/footer navigation and accessible skip navigation.
- [x] Keyboard-safe menus, search, cart drawer, carousel, catalogue rail, and focus behavior.
- [x] WCAG contrast corrections while retaining the cream, olive, and editorial fashion palette.
- [x] Existing secure cookies, CSRF/origin validation, authorization guards, rate limits, upload validation, HTML escaping, safe redirects, and redacted operational errors reviewed.

## Quality budgets

- Production compilation must succeed without route-generation errors.
- Public pages must have no serious or critical Axe findings at desktop or mobile viewports.
- Key public pages must provide a title, canonical URL, crawl rules, sitemap entry, and social metadata.
- Private pages must emit `noindex` and must not use public caching.
- Production dependencies must have no high or critical known vulnerabilities.
- Storefront images use responsive sources or Next Image sizing; fonts are local/system based and do not block on a third-party font service.

## Launch notes

Set `NEXT_PUBLIC_APP_URL` to the final HTTPS origin before building production so canonical URLs, sitemap entries, robots host, and structured data use the live domain. Replace the supplied policy wording with business-owner/legal-approved wording if local regulations or operating policies require changes.

## Verification

- [x] ESLint and TypeScript
- [x] Unit/integration tests
- [x] Production build
- [x] Desktop and mobile SEO/security E2E tests
- [x] Desktop and mobile automated accessibility scan
- [x] Production dependency vulnerability audit

The completion gate is satisfied when the final full regression below remains green: no known high/critical production dependency findings and no serious/critical automated accessibility blockers.
