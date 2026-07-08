# Phase 15 — Testing

Risk-based, not exhaustive: this phase targets the logic where a wrong answer causes
real harm (money moves incorrectly, one user sees/acts on another's data, a booking
reaches an inconsistent state) rather than mechanically adding a test file per class.
Plenty of code in this codebase (DTOs, simple CRUD controllers, mapper methods) has no
test and doesn't need one — see "What deliberately has no test" below.

## Backend (JUnit 5 + Mockito + AssertJ + Testcontainers)

Builds on the handful of tests already written inline during earlier phases
(`OtpServiceImplTest`, `TokenServiceImplTest` from Phase 4) rather than replacing them.

- **`BookingStateMachineTest`**: every edge in the allowed-transition map, both the ones
  that should succeed and a representative set that should be rejected — parameterized
  so adding a new status later means adding a row, not writing a new test method. Also
  verifies a rejected transition doesn't silently mutate the booking's status anyway.
- **`AttendanceServiceImplTest`**: all three reconciliation outcomes (both `PRESENT` →
  complete + release; both `ABSENT` → mutual no-show + refund; mismatch → dispute, not a
  unilateral decision), the `OFFLINE`-only and `CONFIRMED`-only guards, the
  non-participant rejection, and both `autoConfirmMissingSide` behaviors (fills in when
  exactly one side marked; does nothing when neither did). This is the highest-risk
  reconciliation logic in the codebase — it decides whether a tutor gets paid.
- **`PaymentServiceImplTest`**: `refund`/`release` no-op correctly when there's nothing to
  act on (not exceptions — most cancellations happen before any payment exists), the
  commission-deduction math on `release`, and webhook idempotency (an invalid signature
  is rejected before touching the database; an already-seen event id short-circuits
  before looking up the order or touching the booking at all). Deliberately does **not**
  test `createOrder`/`handleCaptured`'s actual Razorpay API calls — mocking the SDK's
  nested client objects (`razorpayClient.orders`, `.payments`) has lower value than the
  business-rule paths above, and risks tests that pass by accident if the mock doesn't
  match the SDK's real shape.
- **`VerificationServiceImplTest`**: the completeness-gated `VERIFIED` transition from
  Phase 14 (approving one doc type doesn't verify the tutor; approving both does; any
  rejection rejects the whole profile regardless of other documents).
- **`ParentProfileServiceImplTest`** and **`BookingServiceImplParticipantTest`**: the
  authorization checks that gate cross-user data access — a parent can't act on a child
  they don't own, and `isParticipant` (which gates cancel, chat, payment-order details,
  and attendance across four different modules) correctly recognizes the student, the
  managing parent, and the tutor, and correctly rejects a stranger even when a parent
  *is* involved in the booking.
- **`BookingExclusionConstraintIT`**: the one integration test in this pass, and the most
  important — the `no_overlapping_confirmed_bookings` exclusion constraint
  (`docs/phase2/05-database-schema.md`) is a *database*-level guarantee that no amount of
  mocking can verify. Runs against a real Postgres via Testcontainers (same
  `postgis/postgis` image as `docker-compose.yml`), proving the constraint actually
  rejects an overlapping `CONFIRMED` booking for the same tutor, allows a back-to-back
  (non-overlapping) one, and allows the same time slot for two *different* tutors.
  **Requires Docker** to run — will not execute in an environment without a container
  runtime (noted directly in the test's Javadoc).

## Website / shared package (Vitest)

No test runner existed on the frontend at all before this phase — added `vitest` to
`packages/shared` and `apps/website`.

- **Shared package**: zod schema validation (`loginSchema`, `registerSchema`,
  `createBookingSchema` — including a regression test for the exact `datetime-local`
  vs. strict-ISO-with-offset mismatch `BookingRequestForm.tsx` had to work around back in
  Phase 8), the theme token resolver (`resolveThemeTokens` falls back to default for an
  unknown/stale preset name rather than throwing — a stale `localStorage` value from a
  removed preset must not break the app) and `themeTokensToCssVars`'s hex-to-RGB-triplet
  conversion.
- **`createApiClient`** (the shared fetch wrapper both website and admin use): the
  single-flight refresh-and-retry behavior from Phase 4 — retries exactly once on a 401,
  does not retry again if the retried request *also* 401s (would otherwise be an
  infinite loop), and correctly fails without retrying when `onUnauthorized` itself
  reports the refresh failed.
- **`cn`** utility: Tailwind class-conflict resolution (last one wins) — the mechanism
  every component's `className` override prop (`Card`'s `interactive`, `Button`'s
  variants) depends on.

## Mobile (flutter_test + mocktail)

- **`AuthController`**: login stores the token and persists the refresh token;
  `tryRefresh` short-circuits without a network call when no refresh token is stored,
  rotates tokens on success, and — importantly — logs out and clears state when the
  refresh call itself fails (a replayed/already-rotated refresh token), rather than
  leaving the app in a half-authenticated state; `logout` clears local state even when
  the network call fails.
- **`LoginScreen`** widget test: renders the expected fields/button, and shows the error
  message on invalid credentials. Does not test the success path (`context.go('/home')`)
  since that needs a full `GoRouter` test harness — a reasonable thing to add once mobile
  screens beyond auth actually exist, not before.

## What deliberately has no test

- Every DTO/response-mapping class (`from()` static factories) — these are one-line field
  copies; a test would just restate the mapping.
- Simple CRUD controllers with no business logic of their own (they delegate everything
  to an already-tested service).
- `createOrder`'s and `handleCaptured`'s actual Razorpay SDK calls (see above).
- Any admin frontend page — same reasoning as the website (functional CRUD screens over
  already-tested API contracts), and no test runner exists in `apps/admin` yet; add one
  if/when admin logic grows past "call an endpoint, render a table."
