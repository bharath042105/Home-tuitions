# Phase 12 — Offline Tuition (Attendance & Disputes)

Dual-confirmation attendance for OFFLINE bookings, dispute creation on mismatch, and —
finally — a real caller for `PaymentService.release()`, which Phase 9 designed and left
unwired on purpose. Phase 11 (online classroom) is still deferred; this phase only covers
the offline completion path (SRS FR-6).

## What was built

### Backend

- **`AttendanceRecord`/`Dispute` entities**, matching the Phase 2 schema.
- **`AttendanceService.markAttendance`**: guards that the booking is `OFFLINE` and
  `CONFIRMED`, and that the caller is a participant (reusing `BookingService.isParticipant`,
  same as chat and the payment-order endpoint). Upserts the caller's own mark, then
  reconciles once both the tutor side and the payer side (parent if managed, else the
  student themselves) have recorded one:
  - **Match, both `PRESENT`** → `BookingService.completeSession()` → publishes
    `SessionCompletedEvent`, which the payment module's listener turns into
    `PaymentService.release()` — closing the loop Phase 9 left open.
  - **Match, both `ABSENT`** → treated as a mutual no-show: `BookingService.markMutualNoShow()`
    transitions to `CANCELLED` and **reuses the existing `BookingCancelledEvent`**, so the
    refund and notification listeners already built in Phases 9-10 fire without a parallel
    no-show-specific code path.
  - **Mismatch** → a `Dispute` row is created (`OPEN`) and the booking moves to `DISPUTED`.
    Resolution is Phase 14's job (admin decides `completeSession` vs. `markMutualNoShow`
    afterward — both methods already support being called from anywhere, not just this module).
- **`PaymentService.release()` refined** (not just wired): its Phase 9 signature took
  `amount` as a parameter, which would have forced this module to already know what was
  actually captured just to release it. Changed to derive the amount from the stored
  `Payment` row itself — a legitimate refinement of a method that had no caller yet, not a
  behavior change to shipped code.
- **`AttendanceExpiryJob`** (every 15 min): SRS FR-6's "48h after session end, if only one
  side marked, auto-confirm the other as PRESENT." Deliberately does nothing if *neither*
  side has marked — the FR's literal trigger condition is "only one side recorded," and
  auto-completing a booking neither party engaged with at all felt like the wrong default
  to invent.
- New `BookingService` methods (`completeSession`, `markMutualNoShow`, `markDisputed`) are
  all system-actor transitions, matching the `confirmPayment` pattern from Phase 9.

### Website

- **`AttendancePanel`**: shown only on `CONFIRMED` + `OFFLINE` bookings (in both the
  shared `BookingList` for student/parent, and the tutor's bookings page). Once the caller
  has marked, it shows what they marked rather than letting them mark again — the backend
  doesn't reject a re-mark, but there's no product reason to invite one.

## Known gaps

- **Dispute resolution has no UI yet** — a `Dispute` sits `OPEN` with no way for anyone to
  act on it until Phase 14's admin dashboard exists. This is the expected shape: Phase 12
  creates disputes, Phase 14 resolves them.
- **No partial-refund computation for the mutual-no-show path** — it reuses the same
  100%-refund `refund()` call as a manual cancellation (Phase 9's existing known gap,
  not a new one introduced here).
- **Online booking completion is still entirely unbuilt** (Phase 11, deferred by explicit
  choice this round) — an `ONLINE` booking has no path to `COMPLETED` at all right now.
- **No route guards** (recurring gap, Phases 5-10) — still applies to the new attendance UI.
