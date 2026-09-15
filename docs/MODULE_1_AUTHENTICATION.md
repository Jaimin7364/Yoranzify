# Module 1 Authentication

## Implemented security model

- Credentials are normalized and validated with Zod on the server.
- Passwords are hashed with bcrypt cost factor 12.
- Sessions use 256-bit opaque random tokens. Only SHA-256 token hashes are stored in MySQL.
- The browser receives an `HttpOnly`, `SameSite=Lax`, path-wide cookie; `Secure` is enabled in production.
- Sessions expire after 30 days and are revoked by logout and password changes/resets.
- Password reset tokens are random, hashed at rest, expire after 30 minutes, and are single-use.
- Login, registration, forgotten-password, and reset endpoints have database-backed rate limits.
- Cookie-authenticated mutations reject cross-site origins using Origin and Fetch Metadata checks.
- Admin pages perform a server-side role check. Return URLs accept only safe same-site absolute paths.
- Password-reset requests use a generic response to prevent account enumeration.

## Local admin

The initial administrator is created only by `prisma db seed` using ignored environment values. No public endpoint can promote a user.

```text
Email: admin@yoranzify.local
Password: configured in .env
```

Change these credentials before any shared or production deployment.

## Development password reset

SMTP belongs to Module 14. Until then, a valid reset request in non-production mode logs a development reset token and presents a development-only link in the UI. Production never returns the token.

## Routes

```text
/login
/register
/forgot-password
/reset-password?token=...
/account
/admin (ADMIN only)

/api/auth/register
/api/auth/login
/api/auth/logout
/api/auth/me
/api/auth/forgot-password
/api/auth/reset-password
/api/auth/change-password
```

## Completion checklist

- [x] User, Session, PasswordResetToken, and RateLimit schema/migration.
- [x] Registration, login, logout, current user, reset, and change-password APIs.
- [x] Secure session lifecycle and password hashing.
- [x] Server-side customer/admin authorization.
- [x] Interactive responsive account forms and profile shell.
- [x] Initial admin seeded through environment configuration.
- [x] Validation/helper unit tests.
- [x] Full lint, typecheck, unit, build, and desktop/mobile E2E gate passed.
