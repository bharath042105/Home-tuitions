# Product Requirements Document (PRD)
## Home Tuitions — Online & Offline Tutor Marketplace

Scope for this document: MVP as defined in [00-mvp-scope.md](00-mvp-scope.md).

## 1. Vision

A trusted marketplace connecting students/parents with verified tutors for both online (live video) and offline (in-person, home) tuition — combining the discovery model of UrbanPro/Superprof with the live-class delivery of Vedantu.

## 2. Problem Statement

- Parents/students struggle to find *verified*, *nearby*, *subject-matched* tutors and default to word-of-mouth.
- Tutors lack a professional platform to list services, manage bookings, get paid reliably, and run classes (online or offline) without juggling WhatsApp + cash + spreadsheets.
- Existing platforms are either pure-lead-gen (UrbanPro: no in-app payment/session delivery) or online-only (Vedantu: no offline support). No dominant player in India does both well.

## 3. Goals & Success Metrics

| Goal | Metric | MVP Target |
|---|---|---|
| Tutors get discovered | Tutor profile views → booking request conversion | ≥ 8% |
| Bookings complete successfully | Booking → session-completed rate | ≥ 70% |
| Payments are trusted | Payment success rate | ≥ 95% |
| Platform is safe | % tutors verified before first booking | 100% (hard gate) |
| Retention | Repeat booking rate (same student, 2nd booking within 60 days) | ≥ 30% |

## 4. Target Users

- **Student** — school/college learner seeking subject help, exam prep, or skill tutoring.
- **Parent** — books and pays on behalf of a minor student, monitors progress.
- **Tutor** — independent educator or coaching professional offering paid sessions.
- **Admin** — platform operator: verifies tutors, resolves disputes, monitors health.

## 5. Non-Goals (MVP)

- Not a full LMS (no course authoring, no curriculum marketplace).
- Not handling tutor payroll/taxes — payout is manual bank transfer confirmed by admin in MVP.
- Not supporting group classes at launch — 1:1 only (group sessions are a fast-follow).

## 6. Key Differentiators

1. **Verified tutors only** — document + background-check gate before a tutor can be booked, unlike lead-gen sites where anyone lists.
2. **Both modes, one platform** — online (Agora) and offline (GPS-tagged attendance) under one booking + payment flow.
3. **In-app payments with escrow-like hold** — Razorpay payment is captured on booking, released to tutor after session confirmation, reducing no-show/fraud risk for both sides.

## 7. Assumptions & Constraints

- Initial launch market: India (Razorpay, INR, Indian phone OTP via SMS gateway). Stripe/international payments deferred.
- Tutors self-onboard; admin is the verification bottleneck — must design queue UX so this doesn't throttle growth.
- Offline sessions cannot be technically verified (no hard proof of physical presence) — MVP relies on mutual confirmation (student + tutor both mark attendance) with dispute escalation to admin.

## 8. Release Plan (maps to build Phases 4–16)

1. **Alpha** — Auth, Profiles, Tutor search/filters (Phases 4–6)
2. **Beta** — Booking, Payments, Chat (Phases 8–10)
3. **Launch** — Online classroom, Offline tuition tracking, Admin dashboard (Phases 11–12, 14)
4. **Post-launch fast-follow** — Mobile app, AI features, Wallet, Referrals (deferred phases)

## 9. Risks

| Risk | Mitigation |
|---|---|
| Tutor verification bottleneck stalls supply growth | Admin dashboard prioritizes verification queue with SLA tracking; add auto-checks (doc format/expiry) to cut manual load |
| Offline session disputes (no-show claims) | Dual confirmation + evidence upload (photo/note) + admin arbitration workflow |
| Payment/booking race conditions (double-booking a tutor slot) | DB-level unique constraint + pessimistic lock on slot booking (see SRS/LLD) |
| Low trust in new marketplace | Reviews/ratings surfaced prominently; verified badge; refund policy transparent |
