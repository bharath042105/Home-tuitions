# Phase 14 — Admin Dashboard

Closes out SRS FR-11: tutor verification decisions, user management, booking/dispute
oversight, a new support ticket module, and basic analytics — plus a real login flow for
the admin app itself, which turned out not to exist at all until this phase.

## What was built

### Backend

- **User management** (`auth` module): `UserManagementService` (list/suspend/reinstate).
  Suspending a user now actually takes effect immediately — it calls
  `TokenService.revokeAll()` so existing sessions die at suspension time, not just on
  their next login attempt (the login-time `SUSPENDED` check already existed since Phase 4,
  but a session issued *before* suspension would otherwise keep working until it expired).
- **Verification decisions** (`verification` module): `VerificationService.decide()`
  implements the completeness check flagged as deferred all the way back in Phase 5 — a
  tutor only becomes `VERIFIED` once **both** an `ID_PROOF` and a `QUALIFICATION` document
  are individually `APPROVED`, not on the first approval alone. Any single rejection sends
  the whole profile back to `REJECTED` immediately. `AdminTutorDocumentResponse` includes a
  presigned download URL generated per-request — documents stay private (never a raw S3
  key), consistent with the classification decision from Phase 5.
- **Dispute resolution**: extracted `DisputeService` out of `AttendanceServiceImpl`, which
  had been reaching into `DisputeRepository` directly since Phase 12 — now `classroom`
  module code has one owner for `Dispute` entity logic. Admin resolution drives the same
  `BookingService.completeSession`/`markMutualNoShow` methods Phase 12 already built for
  the automatic dual-confirmation path, so there's exactly one way a booking reaches
  `COMPLETED` or gets treated as a mutual cancellation, whether a human or the attendance
  reconciliation logic triggered it.
- **New `support` module**: `SupportTicket`/`TicketMessage` entities (the schema had sat
  unused since Phase 2's very first migration pass), `SupportService` for both the raiser's
  own view and the admin's, and two controllers (`/api/v1/tickets/**` user-facing,
  `/api/v1/admin/tickets/**` admin-facing) sharing one service with an `isAdmin` flag
  distinguishing "read my own ticket" from "read any ticket."
- **`AdminAnalyticsController`**: the one place in the codebase that legitimately reads
  across five different modules' `Service` interfaces at once (user counts, pending
  verifications, booking count, open disputes, open tickets, released revenue) — still
  respects the module-boundary rule (only `Service` interfaces, never a repository), it
  just does it more times per request than any single-purpose controller does.
- New `BookingRepository`/`LedgerEntryRepository` queries added specifically to support
  admin listing/analytics (`findAllByOrderByCreatedAtDesc`, `sumReleased`, etc.).

### Website (Admin app)

- **Built a real login flow from scratch** — the admin app had zero authentication before
  this phase; every prior placeholder page would have had no way to call an admin-only
  endpoint at all. Mirrors the website's token-handling shape exactly (in-memory access
  token, refresh token in `localStorage`, device id, single-flight refresh-on-401) via a
  parallel `client.ts`/`device-id.ts`, plus a client-side auth guard baked into `AdminShell`
  (redirects to `/login` if no session, bypasses the sidebar chrome on the login page
  itself) and a root `page.tsx` that redirects to `/dashboard` or `/login` — there was no
  page at all for `/`.
- **Verification queue**: rewritten from its Phase 3 placeholder (which assumed one row per
  tutor) to match what the backend actually returns — one row per *document*, with a
  presigned "View" link and Approve/Reject actions.
- **Users, Bookings (+ dispute resolution inline), Tickets (two-pane list/thread), and
  Dashboard** (stat cards + a Chart.js bar chart of users by role) — all built against the
  real endpoints from day one, not stubbed.

## Known gaps

- **No route-level auth guard on individual admin pages beyond the shell-level check** —
  functionally sufficient (every page renders inside `AdminShell`), but a page-level
  `useEffect` guard is a client-side convenience, not a security boundary; the backend's
  `hasRole("ADMIN")` restriction on `/api/v1/admin/**` is what actually protects the data,
  same as the recurring "no route guards" gap noted on the main website since Phase 5.
- **Reject reason on the verification queue is currently a fixed string** ("Document
  unclear or invalid") rather than a text input — a one-line polish item, not a design gap.
- **No pagination anywhere** (users, bookings, tickets) — matches the existing
  no-pagination gap noted for notifications in Phase 10; fine at current expected volume.
- **Revenue metric is "total ever released," not time-windowed** (daily/weekly/monthly, as
  SRS FR-11.4 mentions) — a single running total was the pragmatic first cut; time-series
  aggregation is additive work on top of the same `LedgerEntryRepository`, not a rework.
