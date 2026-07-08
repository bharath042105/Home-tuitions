# Phase 5 — Tutor Module

Backend + website work for tutor profile management, verification document upload, and
availability scheduling. Mobile stays deferred per `docs/phase1/00-mvp-scope.md`
(implementation starts after the web MVP is stable) — auth remains mobile's only fleshed-out
feature.

## What was built

### Backend

- **`user` module**: `TutorProfile` entity (mapped onto the `tutor_profiles` table from
  Phase 2's schema; `base_location`/PostGIS deliberately left unmapped until Phase 6's
  geo-search needs it — no point wiring hibernate-spatial with nothing querying it yet),
  `TutorProfileService`/`Impl`, `TutorController` (`GET/PUT /api/v1/tutors/me`,
  `GET /api/v1/tutors/{id}/profile` public). `TutorProfileService` also grew two methods
  (`markSubmittedForVerification`, `applyVerificationDecision`) that the `verification`
  module calls — this is the module-boundary rule in practice: verification never touches
  `TutorProfileRepository` directly.
- **`common` module**: `StorageService`/`S3StorageService` — presigned-URL issuance only,
  per the architecture doc's "backend never proxies file bytes" rule. Added `app.s3.bucket`/
  `app.s3.region` config.
- **`verification` module**: `TutorDocument` entity, `VerificationService`/`Impl`,
  `TutorVerificationController` (`/api/v1/tutors/me/documents/upload-url`, `POST`/`GET
  /api/v1/tutors/me/documents`). Submitting any document flips the tutor's profile to
  `SUBMITTED` — completeness checking (both ID_PROOF and QUALIFICATION present) is left to
  the admin reviewer in Phase 14, not gated here.
- **`booking` module**: `AvailabilityRule` entity + `AvailabilityService`/`Impl` +
  `TutorAvailabilityController` (`/api/v1/tutors/me/availability`). Availability is owned by
  `booking` per the Phase 2 HLD ownership matrix (it feeds slot-conflict checks at booking
  time), even though tutors reach it through what reads like a profile-management URL.
- **Fixed a latent bug while extending `GlobalExceptionHandler`**: the catch-all
  `@ExceptionHandler(Exception.class)` was shadowing Spring's default 400 handling for
  malformed JSON / DTO compact-constructor validation errors (e.g. `AvailabilityRuleRequest`
  rejecting `endTime <= startTime`), turning them into 500s. Added an explicit
  `HttpMessageNotReadableException` -> 400 handler. Pre-existing gap, not introduced by this
  phase, but this phase's first custom-validating record (`AvailabilityRuleRequest`) is what
  surfaced it.
- Every new `/api/v1/tutors/me/**` endpoint requires the `TUTOR` role
  (`SecurityConfig` now has `hasRole("TUTOR")` on that prefix); the public profile-by-id
  endpoint stays open per the existing `permitAll` list.

### Website

- **Fixed a structural bug inherited from Phase 3**: `(tutor)` was a Next.js *route group*
  (parentheses), which does **not** add a URL prefix — pages placed inside it would have
  resolved to the site root (e.g. `/profile`) and silently collided with `(student)`/
  `(parent)` pages of the same name. Replaced with a real `tutor/` folder (an actual URL
  segment) with its own `layout.tsx`. Left warning notes in `(student)/README.md` and
  `(parent)/README.md` so Phases 6/7 don't repeat it.
- `TutorShell` (top bar + side nav matching the Phase 1 IA's tutor nav) as the layout for
  everything under `/tutor/*`.
- `/tutor/profile` — edit bio/subjects/hourly rate/teaching mode/service radius. The
  subjects field (comma-separated text representing a string array) is wired through
  react-hook-form's `setValue` on blur, not raw DOM manipulation — worth calling out because
  the first draft used `document.getElementById` to sidestep RHF's array-field ergonomics,
  which was a real anti-pattern caught and fixed in this same pass.
- `/tutor/verification` — per-document-type upload cards (ID proof, qualification), each
  showing submission history with a status badge. Upload flow: request a presigned URL,
  `PUT` the file straight to S3 from the browser, then register the resulting key with the
  backend — the browser never sends file bytes through our API.
- `/tutor/availability` — add/remove weekly day+time-range rules.
- New shared package additions: `types/tutor.ts`, `schemas/tutor.ts`, and two color-mapping
  fixes in `design/tokens.ts` — `documentStatusColor` (`PENDING`/`APPROVED`/`REJECTED`) had
  to be added as distinct from `verificationStatusColor` (`NOT_SUBMITTED`/`SUBMITTED`/
  `VERIFIED`/`REJECTED`); an earlier draft of the verification page conflated the two enums
  and would have shown wrong badge colors for "PENDING" and "APPROVED" documents.

## Known gaps

- **No route guards yet.** `/tutor/*` pages assume the caller is an authenticated tutor;
  there's no redirect-if-wrong-role middleware on the website yet (mobile's router has one
  via `go_router` redirects — the website doesn't have an equivalent). Worth adding once
  more than one role's screens exist side by side (Phase 6/7 will make the gap obvious).
- **Admin-side of verification (approve/reject) isn't built** — that's Phase 14. Right now
  a tutor can submit documents and see `SUBMITTED`, but nothing moves them to `VERIFIED`/
  `REJECTED` yet except a direct DB/API call.
- **No avatar upload** — `StorageService` supports it (same presigned-URL pattern), but no
  profile-photo field exists in `TutorProfileRequest`/the edit page yet; deferred until a
  concrete design for avatars across all three roles exists, rather than a one-off for tutors.
- **Mobile tutor screens**: still not started, per the MVP sequencing decision from Phase 1.
