# Phase 9 — Payments

Razorpay integration: order creation on tutor acceptance, webhook-driven capture (which
finally completes the `PENDING_PAYMENT → CONFIRMED` transition Phase 8 deliberately left
dangling), refund on cancellation, and the ledger design from Phase 2.

## What was built

### Backend

- **`Payment` and `LedgerEntry` entities**, matching the `payments`/`ledger_entries` tables
  from Phase 2 exactly. Kept as two separate tables per the original design rationale:
  `Payment` mirrors Razorpay's view (one row per payment attempt), `LedgerEntry` is this
  platform's own record of who owes/is owed what — needed for refunds and commission math
  without tangling those concerns into the provider-facing row.
- **Added the official `razorpay-java` SDK** for order creation, refunds, and
  `Utils.verifyWebhookSignature`.
- **`PaymentService`/`Impl`**: `createOrder` (idempotent — if a `Payment` row already
  exists for a booking, returns it instead of creating a second Razorpay order),
  `getOrder` (lets the payer's client re-fetch order details after a page reload),
  `handleWebhookEvent` (signature verification first, then idempotency via
  `razorpay_event_id`'s unique constraint, then `payment.captured`/`payment.failed`
  handling), `refund` (a deliberate no-op, not an error, when no payment was ever
  captured — most cancellations happen before payment), and `release` (implemented per
  the Phase 2 LLD's commission-at-release design, but **has no caller yet** — see the
  scope-boundary note below).
- **`RazorpayWebhookController`**: `POST /api/v1/webhooks/razorpay`, public (Razorpay
  can't hold a JWT — it authenticates via the `X-Razorpay-Signature` HMAC header instead,
  verified inside the service before anything else runs). Takes the body as a raw
  `String`, not a parsed DTO, since re-serializing a parsed object risks a byte-for-byte
  mismatch against what Razorpay actually signed.
- **`PaymentOrderController`**: `GET /api/v1/bookings/{bookingId}/payment-order`, for the
  payer to fetch order details. **Caught and fixed a real IDOR vulnerability while writing
  this**: the first draft left authorization as a comment ("bookingId is an unguessable
  UUID"), which is not an access control — any authenticated user who obtained a bookingId
  could have read another booking's payment amount and order id. Fixed by reusing the same
  student/parent/tutor ownership check `BookingService.cancel()` already enforces, promoted
  to a public `BookingService.isParticipant(bookingId, userId)` method so both call sites
  share one authorization rule instead of two independently-maintained copies.
- **Caught and fixed a circular Spring bean dependency before it could fail at startup**:
  the natural design has `BookingServiceImpl` calling `PaymentService` (to create an order
  on accept, refund on cancel) *and* `PaymentServiceImpl` calling `BookingService` (to
  confirm a booking once payment is captured) — a genuine cycle that Spring's default
  (non-circular-allowing) configuration rejects at boot. Rather than reach for `@Lazy` as a
  band-aid, broke the cycle properly with Spring application events:
  `BookingAcceptedEvent`/`BookingCancelledEvent` are published by `BookingServiceImpl` (no
  compile-time dependency on `payment` at all now) and consumed by a new
  `BookingPaymentEventListener` living in the `payment` module. `PaymentServiceImpl` keeps
  its direct dependency on `BookingService` for `confirmPayment` — that direction alone
  isn't circular. This is also just better architecture for two modules that genuinely need
  to react to each other, not merely a workaround.
- **`GlobalExceptionHandler`** gained an `InvalidWebhookSignatureException` → 400 handler,
  applying the "every new exception type needs an explicit check" habit flagged as a
  recurring gap in Phase 8 — done proactively this time instead of discovered after the fact.
- `app.razorpay.*` (key id/secret, webhook secret) and `app.payment.commission-rate` added
  to `application.yml`.

### Website

- `paymentApi.getOrder()` + a `razorpay-checkout.ts` helper that loads Razorpay's Checkout
  script on demand (only when a payment is actually attempted, not on every page load) and
  opens the modal.
- `PayButton`, shown on `PENDING_PAYMENT` bookings in the shared `BookingList` (student and
  parent views). Deliberately does **not** treat the Checkout `handler` callback firing as
  proof of payment — that callback can fire a few seconds before the backend's webhook
  actually processes `payment.captured` and flips the booking to `CONFIRMED`, so the UI
  shows "Payment received - confirming..." and just invalidates the bookings query, rather
  than optimistically rendering a confirmed state the backend hasn't reached yet.

## Scope boundary with Phase 11/12 (session completion) — read this first

`PaymentService.release()` exists, matches the LLD's commission-at-release design, and is
fully implemented — but **nothing calls it yet**. Release is supposed to fire when a
session is marked complete, and nothing in this codebase can mark a session complete until
Phase 11 (online classroom) or Phase 12 (offline attendance) exists. This mirrors the same
schema-first-sequencing pattern used for the AI/homework tables back in Phase 2 — built
ahead of its caller deliberately, not a loose end.

## Known gaps

- **Payout batching (admin-triggered, per LLD) doesn't exist** — that's Phase 14.
- **`payment.failed` webhook handling doesn't proactively revert the booking** — it marks
  the `Payment` row `FAILED` and lets `BookingExpiryJob` (Phase 8) catch the booking once
  its 30-minute payment window elapses, rather than duplicating that expiry logic here.
- **No idempotency-safe retry UI** if `createOrder`'s Razorpay API call fails mid-accept —
  the whole `respond()` transaction rolls back together (booking stays
  `PENDING_TUTOR_ACTION`), which is correct behavior, but there's no user-facing "retry
  accepting" affordance beyond calling accept again.
- **Refund is always for the full captured amount** — SRS FR-4.5's partial-refund-if-
  cancelled-within-24h policy isn't computed; every refund this phase issues is 100%.
  Worth revisiting once cancellation timing rules are prioritized.
- **No route guards** (recurring gap, Phases 5-8) — still applies to payment-adjacent UI.
