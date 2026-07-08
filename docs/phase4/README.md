# Phase 4 — Authentication

Builds real behavior into the `auth` module scaffolded in Phase 3, across backend, website,
and mobile. Matches SRS FR-1.* (`docs/phase2/02-srs.md`) and the token lifecycle design in
`docs/phase2/03-low-level-design.md`  3.

## What was built

### Backend

- **Fixed a real design gap from the Phase 3 scaffold**: `TokenServiceImpl`'s Redis key
  scheme was internally inconsistent — `revoke()`/`revokeAll()` deleted keys that
  `issueRefreshToken()` never actually wrote, making them silent no-ops, and `rotate()`
  had no way to resolve a userId from an opaque presented token. Replaced with a proper
  double index: `refresh:session:{userId}:{deviceId} -> tokenHash` (enables revoke/revokeAll)
  and `refresh:lookup:{tokenHash} -> "{userId}:{deviceId}"` (enables O(1) rotation). Both
  entries are written/deleted together so they can't drift out of sync. Covered by
  `TokenServiceImplTest` (rotation, replay rejection, wrong-device rejection, revoke/revokeAll).
- **OTP login** (FR-1.3/1.6): `OtpService`/`OtpServiceImpl` (Redis-backed code + attempt
  counter, 5 min TTL, max 3 attempts, per SRS), `SmsGateway` interface with a dev-only
  `ConsoleSmsGateway` stub (logs instead of sending — swap for a real provider behind the
  same interface before any non-dev deploy). `POST /api/v1/auth/otp/request` and
  `/otp/verify` find-or-create the user by phone. Covered by `OtpServiceImplTest`.
- **Rate limiting** (FR-1.6): implemented as a Redis fixed-window counter
  (`INCR`+`EXPIRE`) behind a `@RateLimited` annotation + AOP aspect, applied to
  register/login/otp endpoints — **not** Bucket4j as originally sketched in the Phase 2 LLD;
  a fixed window is simpler and sufficient here, so the LLD doc was updated to match what was
  actually built rather than left to drift. Keyed by client IP only for now (the "+identifier"
  refinement from SRS is deferred - noted in the LLD as a documented gap, not a silent one).
- **Audit logging**: `AuthServiceImpl` now records `USER_REGISTERED`, `LOGIN_SUCCEEDED`,
  `LOGIN_FAILED`, and `LOGOUT` via `AuditLogService`, satisfying SRS FR-1.7.
- **Fixed a spoofable-logout bug**: the Phase 3 scaffold's `/logout` endpoint accepted
  `userId` as a request parameter — any authenticated caller could have logged out an
  arbitrary other user by guessing their id. Now reads the caller's identity from the
  validated JWT principal (`Authentication.getName()`), and `SecurityConfig`'s permit-all
  list was narrowed so `/logout` goes through normal JWT authentication like any other
  protected endpoint (only register/login/otp/refresh are actually public).
- New exception handling: `BadCredentialsException` -> 401, `RateLimitExceededException`
  -> 429, added to `GlobalExceptionHandler`.

### Website

- Register page (`/register`) and phone-OTP login page (`/login/otp`, two-step: request
  code -> verify code), both wired through the shared zod schemas.
- Fixed a gap in the Phase 3 scaffold: the shared API client didn't send the `X-Device-Id`
  header the backend requires on login/otp/refresh/logout, and `onUnauthorized` was a no-op
  TODO. Both fixed: `createApiClient` now takes a `getDeviceId()` config and retries a
  request once after a successful refresh; the website supplies a `device-id.ts` helper
  (random id persisted in `localStorage`) and a real `refreshAccessToken()` that calls
  `/api/v1/auth/refresh`, single-flighted so concurrent 401s don't each try to rotate the
  same refresh token (which would invalidate each other).
- Refresh token is now persisted (`localStorage`) so refresh survives a page reload; access
  token stays in-memory only, per the LLD's XSS-blast-radius reasoning.

### Mobile

- Register screen and a two-step OTP login screen, mirroring the website's flows.
- Added `flutter_secure_storage` + `uuid` (not in the original Phase 3 pubspec) for a
  persistent per-install device id and secure refresh-token storage.
- Introduced `AuthController` (`features/auth/presentation/providers/auth_providers.dart`)
  as the single place that orchestrates login/register/OTP/refresh/logout against token
  state + secure storage — the Phase 3 scaffold had screens calling `AuthRepository`
  directly and manually poking `accessTokenProvider`, which doesn't scale past one screen.
- `dio_client.dart`'s interceptor now attaches `X-Device-Id` to every request and performs
  a single-flight refresh-and-retry on 401, matching the website's contract.
- Router updated with `/register` and `/login/otp` routes and a generalized public-route
  check (previously only `/login` was recognized as unauthenticated-accessible).

## Known gaps (carried forward, not silently dropped)

- **Email verification** is not implemented — `register()` creates a user with
  `UNVERIFIED_EMAIL` status but nothing currently transitions them to `ACTIVE`, and no
  endpoint/module sends the verification email yet (`NotificationService` doesn't exist
  until a later phase). The website's register page shows a "check your email" message
  that is currently aspirational.
- **Google/Apple OAuth** remain fast-follow per `docs/phase1/00-mvp-scope.md` — not started.
- **Rate limiting is IP-only**, not IP+identifier as SRS literally specifies — documented
  in the LLD as a deliberate, revisitable simplification, not an oversight.
- **`revokeAll()` uses Redis `KEYS`**, which blocks Redis on a large keyspace. Fine at MVP
  scale (bounded by per-user device count), flagged as a pre-scale TODO in the code.
- Backend tests use Mockito-mocked Redis rather than a real instance (Testcontainers is in
  the `pom.xml` for this purpose but wasn't invoked here) — sufficient to verify the
  business rules (rotation, lockout, replay rejection) without needing Docker in this
  environment; an integration test against real Redis/Postgres would be a reasonable
  addition before shipping.

## Not yet built

Role-specific home screens (still a `LoginScreen` placeholder on mobile's `/home`),
password reset/forgot-password flow, and account suspension enforcement in the login path
beyond a basic status check. These land naturally alongside the Tutor/Student/Parent
modules (Phases 5-7).
