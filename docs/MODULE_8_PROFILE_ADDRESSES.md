# Module 8 Customer Profile and Addresses

## Implemented

- Customer profile editing for full name, email, and Indian mobile number.
- Ownership-protected address list, create, edit, delete, and make-default operations.
- Reusable address form containing recipient, mobile, two address lines, landmark, city, state, PIN, country, type, and default-shipping choice.
- India-first validation accepts normalized `+91` mobile numbers and valid six-digit Indian PIN codes while retaining an extensible country field.
- The first address automatically becomes the shipping default.
- Default changes are transactional; deleting the default promotes the oldest remaining address.
- Retry handling protects default transitions from transient MySQL write conflicts during parallel requests.
- Responsive `/account` profile editor and `/account/addresses` management experience.
- Unique email/mobile conflicts return a safe customer-facing response.

## Routes

```text
/account
/account/addresses

PATCH /api/account/profile
GET/POST /api/account/addresses
PATCH/DELETE /api/account/addresses/[id]
POST /api/account/addresses/[id]/default
```

## Completion checklist

- [x] Address migration and customer relationship.
- [x] Indian mobile and PIN validation.
- [x] Profile update with unique-account protection.
- [x] Private address CRUD and ownership checks.
- [x] Transactional single-default behavior and delete replacement.
- [x] Reusable responsive address form.
- [x] Unit tests for normalization and validation.
- [x] Full code and browser acceptance gates passed.
