# Phase 8 — Booking Module

The booking request lifecycle: create → tutor accept/reject → expiry. This is the module
everything since Phase 5 (tutor profiles, availability, search, parent children) has been
building toward.

## Scope boundary with Phase 9 (Payments) — read this first

The full state machine designed in Phase 2 (`docs/phase2/03-low-level-design.md`  1) goes
`PENDING_TUTOR_ACTION → PENDING_PAYMENT → CONFIRMED → COMPLETED`. **This phase implements
only as far as `PENDING_PAYMENT`.** The `PENDING_PAYMENT → CONFIRMED` transition happens via
a Razorpay webhook handler that doesn't exist until Phase 9 — and that's also exactly where
the double-booking exclusion constraint (`WHERE status = 'CONFIRMED'`) actually matters, since
multiple *pending* requests for the same slot are explicitly allowed by design (the tutor picks
one by accepting; LLD  2.4). Faking a CONFIRMED transition without real payment capture would
have been scope creep dressed up as progress, so it's deliberately left for Phase 9 to wire in.

Practically: after this phase, a tutor can accept a request (→ `PENDING_PAYMENT`), but nothing
ever moves it past that — it will simply expire in 30 minutes. That's expected and correct
for where the build currently stands, not a bug.

## What was built

### Backend

- **`Booking` entity** mapped onto the `bookings` table from Phase 2, including its
  `TSTZRANGE` column — Hibernate has no native Postgres range-type support, so rather than
  writing a custom `UserType` for one column, added `hypersistence-utils-hibernate-63`
  (a well-established library for exactly this) and mapped `timeRange` as
  `Range<OffsetDateTime>`.
- **`BookingStateMachine`**, implemented exactly as designed in the Phase 2 LLD — a static
  allowed-edges map, not a framework, since the graph is small. Every transition writes an
  audit log entry via the existing `AuditLogService`.
- **`BookingService`/`Impl`**: `createRequest` validates the tutor is `VERIFIED`, that the
  requested mode is compatible with the tutor's `teachingMode`, and that the requested time
  falls inside one of the tutor's declared `AvailabilityRule`s (SRS FR-4.1) — reusing
  `AvailabilityService` from Phase 5 rather than re-querying availability data directly.
  `respond` (tutor accept/reject) sets a 30-minute `paymentDeadline` on accept. `cancel` checks
  the caller is the student, the managing parent, or the tutor before allowing it.
- **`BookingController`**: `POST /api/v1/bookings` (role-aware — a `STUDENT` caller always
  books for themselves regardless of what's in the request body; a `PARENT` caller must
  supply `studentProfileId` and it's verified against `ParentStudentLink` before use),
  `GET /api/v1/bookings/me` (role-aware: own bookings for a student, aggregated-across-children
  for a parent, own-tutor's bookings for a tutor), `POST /{id}/respond`, `POST /{id}/cancel`.
- **`BookingExpiryJob`**: a `@Scheduled` job (every 5 min) expiring unanswered requests after
  24h (SRS FR-4.2) and unpaid acceptances after their 30-minute deadline (FR-4.3). Added
  `@EnableScheduling` to `BackendApplication`.
- **Two more `GlobalExceptionHandler` gaps closed** while wiring authorization for
  parent-booking and booking-not-found cases: `IllegalArgumentException` → 400 (previously
  would have 500'd, e.g. a parent omitting `studentProfileId`) — the same shadowing-the-
  framework's-default-handling shape as the `HttpMessageNotReadableException` (Phase 5) and
  `AccessDeniedException` (Phase 7) fixes. This is now the third instance of the same bug
  category in this codebase's exception handling; worth treating as a checklist item
  ("does this new exception type need an explicit handler?") for any future module rather
  than rediscovering it a fourth time.
- **`ParentProfileService`** grew `getById` and `verifyOwnsChild` (extracted from what
  `updateChild` was already doing inline) so the booking module could reuse the same
  parent-owns-this-child check instead of duplicating `ParentStudentLinkRepository` queries.

### Website

- **`BookingRequestForm`**, embedded in the shared `TutorProfileDetail` (replacing the
  disabled placeholder button from Phases 6-7). Students book directly; parents must select
  a linked child first (fetched via `parentApi.listChildren`). Caught and fixed a real bug
  while building this: a `<input type="datetime-local">` value doesn't satisfy the shared
  `createBookingSchema`'s strict ISO-with-offset validation — used a separate, looser
  form-level schema for the widget value, converting to a real ISO string (via
  `Date.toISOString()`) only when constructing the actual API payload, rather than trying to
  force the wire-format schema onto an intermediate form value that was never going to match it.
- **`BookingList`** (shared by `/student/bookings` and `/parent/bookings`) and a distinct
  `/tutor/bookings` page (pending requests with Accept/Decline, plus a read-only list of
  everything else) — the tutor's view needed different actions, so it wasn't forced into
  the shared list component just to avoid one more file.
- Nav updated in all three shells (`TutorShell`, `StudentShell`, `ParentShell`) to add a
  Bookings link.

## Known gaps

- **No payment integration** — by design, see the scope-boundary note above. Phase 9 wires
  the `PENDING_PAYMENT → CONFIRMED` transition.
- **No notifications** — booking creation/accept/reject don't notify anyone yet;
  `NotificationService` doesn't exist until Phase 10, same gap already flagged in Phase 4/5.
- **No chat thread auto-creation** — Phase 10 will create a `ChatThread` lazily when first
  accessed for a booking, not eagerly here.
- **Cancellation has no refund-policy computation** (SRS FR-4.5's "full refund if ≥24h,
  partial if <24h") — moot until Phase 9 payments exist to refund from; a cancel today is
  just a state transition with no money attached to it yet.
- **No route guards** (recurring gap, Phases 5-7) — still applies to the new booking pages.
