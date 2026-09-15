# Module 2 Settings and Media Pipeline

## Implemented

- Singleton database-backed store configuration with identity, contact, social, GST, shipping, inventory, COD, and maintenance settings.
- Admin-only settings read/update API and responsive management UI.
- Admin-only media upload for logo, favicon, product, category, banner, and review asset classes.
- JPEG/PNG/WebP content-signature validation, decoded-image validation, 8 MB input limit, 36-megapixel pixel limit, and 6000 × 6000 dimension limit.
- EXIF orientation normalization, proportional resize, WebP conversion, optimized quality, SHA-256 checksum, and collision-safe UUID file names.
- Storage adapter functions rooted under `UPLOAD_DIR`, with traversal protection.
- Stable public media endpoint backed by MySQL metadata and long-lived immutable caching.
- Store shell reads configured name, shipping threshold, contact details, social links, and maintenance state.

## Local storage

Runtime media is saved below `./uploads` locally. The folder is ignored by Git. Production should set `UPLOAD_DIR` to persistent Hostinger storage outside replaceable release artifacts and back it up alongside MySQL.

## Routes

```text
/admin/settings
GET /api/settings
GET/PATCH /api/admin/settings
POST /api/admin/media
GET /api/media/[id]
```

## Completion checklist

- [x] Settings and media schema migrated and seeded.
- [x] Admin authorization on settings and upload mutations.
- [x] Image validation, optimization, metadata, and storage pipeline.
- [x] Responsive admin settings UI with upload previews and operational switches.
- [x] Storefront configuration integration and maintenance page.
- [x] Validator/media helper unit tests.
- [x] Full quality and browser acceptance gates passed.
