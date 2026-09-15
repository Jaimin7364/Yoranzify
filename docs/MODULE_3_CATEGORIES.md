# Module 3 Category Management

## Implemented

- Hierarchical self-referencing category model with unique slug, description, parent, cover image, display order, visibility, timestamps, and archival state.
- Public category tree and category detail APIs expose only visible, non-archived records.
- Admin create, edit, reorder, show/hide, and archive operations.
- Parent validation walks the full ancestry chain and rejects self-parenting, missing/archived parents, and circular trees.
- Archival is non-destructive. A category with active children must have them moved or archived first; product-reference safeguards will extend this rule when Module 4 owns the product relation.
- Category covers reuse the Module 2 optimized image pipeline and require `CATEGORY` media.
- Responsive hierarchy manager with accessible up/down ordering controls, nested rows, status labels, image upload, and modal editor.
- Store navigation is populated from live top-level categories.
- Public SEO-aware category landing pages show visible subcategories and a styled empty state.

## Routes

```text
/admin/categories
/categories/[slug]
GET /api/categories
GET /api/categories/[slug]
GET/POST /api/admin/categories
PATCH/DELETE /api/admin/categories/[id]
POST /api/admin/categories/reorder
```

## Completion checklist

- [x] Category migration and default department seed.
- [x] Admin-only CRUD, ordering, visibility, and archival APIs.
- [x] Slug uniqueness and circular relationship protection.
- [x] Responsive admin hierarchy UI and category cover uploads.
- [x] Dynamic storefront navigation and category pages.
- [x] Unit tests for slugs, validation, hierarchy, and ordering.
- [x] Full code and browser acceptance gates passed.
