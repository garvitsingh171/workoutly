# Security

This document is a repository-backed review, not a penetration test. Runtime, dependency, and cloud-platform security were not verified during this documentation task.

## Scope And Assets

Protected assets include user accounts, password hashes, JWT secrets, refresh-token cookies, workout routines, completed sessions, goals, records, custom exercises, uploaded image URLs, MongoDB connection strings, and Cloudinary credentials.

## Trust Boundaries

```text
Browser localStorage/cookies
-> Express API and Socket.IO handshake
-> MongoDB
-> Cloudinary
-> Deployment platform environment variables
```

## Authentication

Workoutly uses email/password authentication. Registration hashes passwords with bcrypt. Login compares the submitted password and returns a JWT access token. Refresh-token support exists through an httpOnly cookie if `JWT_REFRESH_SECRET` is configured.

Evidence: `server/src/services/authService.js`, `server/src/utils/token.js`, `server/src/controllers/authController.js`, `client/src/context/AuthContext.jsx`, `client/src/services/api.js`.

## Password Security

Passwords are hashed with bcrypt and `select:false` in the `User` model. Minimum password length is 6. No password complexity, breach checking, password reset, or MFA was found.

## Token And Session Security

Access tokens are stored in `localStorage` and sent as `Authorization: Bearer`. The client clears auth when tokens are expired or protected requests remain unauthorized after refresh. Refresh cookies are httpOnly; in production they are `secure` and `sameSite:'strict'`.

Gaps: access tokens in localStorage are exposed to XSS, refresh tokens are not persisted server-side for revocation, and logout cannot invalidate already issued access tokens.

## Authorization And User Ownership

Protected APIs use `protect` middleware. Ownership checks are implemented for profile access, workout CRUD/duplicate, session creation, session reads, goals, records, and custom exercise visibility. No admin role exists.

## Input Validation

`express-validator` protects auth, user, and workout payloads. Sessions, goals, and exercises use manual validation. Mongoose schemas enforce required fields, enums, and min/max constraints. Client-side validation improves UX but is not treated as a security boundary.

## NoSQL Injection Considerations

Most route code builds explicit filters from trusted `req.user._id` and sanitized strings. Regex searches escape user-provided text in sessions, records, exercises, and progress. No global NoSQL sanitization middleware was found, so future object-based query parameters should be handled carefully.

## File Upload Security

Uploads are protected by auth, handled in memory by multer, limited to 5MB, and restricted to JPEG, PNG, WebP, and GIF MIME types. Files are streamed to Cloudinary. The app does not scan file contents, validate image dimensions, strip metadata, or store public IDs on workouts for cleanup.

## CORS

`CLIENT_URL` controls allowed origins, with local development defaults included outside production or when local origins are configured. Credentials are enabled for refresh cookies. Incorrect production `CLIENT_URL` will break browser calls or over-open origins.

## Environment Variables And Secrets

Required secrets are shown as placeholders in `.env.example` files. Actual `.env` files should not be committed. Sensitive variables include `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.

## Error Messages And Logging

The backend normalizes unexpected errors to a generic message but logs error message, status, path, and method. Validation and authorization messages are returned to clients. Avoid logging request bodies, tokens, cookies, or secrets in future changes.

## Dependency Security

No dependency audit output was found in the repository. Dependencies include Express, Mongoose, JWT, bcrypt, Cloudinary, multer, Socket.IO, Axios, React, and testing tools. Run dependency audit as a release step, but do not claim it is currently automated.

## Rate Limiting

Auth endpoints use `express-rate-limit`: 20 attempts per 15 minutes outside tests, 1000 in tests. Other endpoints do not have rate limits.

## Secure Headers And HTTPS

No Helmet or custom secure-header middleware was found. HTTPS is assumed to be provided by deployment platforms in production but is not enforced by app code.

## Frontend Storage Risks

Access tokens and user objects are stored in `localStorage`. This improves refresh persistence but increases impact of XSS. The app should avoid injecting untrusted HTML and should consider cookie-only auth if production security requirements rise.

## Risk Table

| Risk | Current protection | Remaining gap | Severity | Recommended action |
| --- | --- | --- | --- | --- |
| XSS steals access token | React escaping and no dangerouslySetInnerHTML found | Token in localStorage | High | Add security review, consider cookie-only access tokens or shorter lifetimes |
| Brute-force login | Auth rate limiter | No account lockout or MFA | Medium | Keep rate limit, add monitoring and optional MFA later |
| Unauthorized data access | Ownership checks and user filters | Future routes may miss checks | High | Add ownership tests for every new route |
| Refresh token misuse | httpOnly cookie, sameSite/secure in production | No server-side revocation list | Medium | Persist refresh token IDs or rotate tokens for production |
| Malicious uploads | MIME allowlist and 5MB limit | No content scanning or metadata stripping | Medium | Add upload tests and Cloudinary transformation/security policy |
| Orphaned image assets | None beyond storing URL | Public ID not stored on workout | Low/Medium | Store public ID and cleanup on replace/delete |
| NoSQL injection | Escaped regex strings in key queries | No global sanitization | Medium | Avoid passing raw request objects into Mongo filters; consider sanitization middleware |
| Missing secure headers | None found | Clickjacking/MIME/referrer policies absent | Medium | Add Helmet configuration after testing |
| Leaked secrets | `.env.example` placeholders | Real env values depend on operator | High | Use deployment secret stores; never commit `.env` |
| Dependency vulnerabilities | package-locks exist | No audit evidence | Medium | Run `npm audit` in release checklist |
| Overbroad CORS | Allowlist function | Misconfigured `CLIENT_URL` could over-allow | Medium | Keep exact production origins |
| Inconsistent validation | Validators plus manual checks | Sessions/goals/exercises less standardized | Medium | Add validators for all route groups |

## Recommended Improvements

Prioritize upload tests, ownership regression tests, Helmet secure headers, documented secret rotation, dependency audits, Cloudinary cleanup, and a decision on localStorage token risk before claiming production readiness.

