# MVP Scope Definition

This document is the source of truth for what "MVP" means across every later Phase 1 doc. Everything else in the original spec is deferred, not discarded — see "Deferred to Post-MVP" below.

## In Scope for MVP

**Roles:** Student, Parent, Tutor, Admin (all four — the marketplace has no value with only one side built)

**Core flows:**
1. Auth — email/password + OTP (mobile) login/signup, JWT + refresh token, role-based access
2. Profile management — Student/Parent/Tutor profiles, Tutor verification (document upload + admin approval)
3. Tutor discovery — nearby search (Google Maps geolocation), subject/price/rating/mode filters
4. Booking — request a session (online or offline), tutor accepts/rejects, scheduling, cancellation policy
5. Online classroom — Agora-based video session, linked to a booking
6. Offline tuition tracking — attendance marking, session confirmation (no GPS spoofing prevention in MVP — logged as a known gap)
7. Payments — Razorpay checkout for bookings, payment status tracking, tutor payout ledger (manual payout in MVP, no auto payout)
8. Chat — 1:1 text chat between student/parent and tutor, tied to a booking
9. Reviews & ratings — post-session review by student/parent
10. Notifications — push (FCM) + in-app, for booking/payment/chat events
11. Admin dashboard — tutor verification queue, user management, booking oversight, basic analytics (counts, revenue), support ticket handling

**Platforms:** Backend (Spring Boot), Website (Next.js — student/parent/tutor facing + marketing), Admin Dashboard (Next.js). Flutter mobile app is planned but built after the web + backend MVP is stable, reusing the same API.

## Fast-Follow Tier — AI & Classroom Content (built right after core MVP, before mobile app / admin polish)

This tier exists because the four AI features were explicitly requested back into scope, and two of them have hard prerequisites:

- **Homework module** (submission + grading) — required before AI Homework Solver can exist
- **Exams module** (question banks, quizzes) — required before AI Test Generator can exist
- **AI Study Assistant** — LLM-backed chat Q&A for students, independent of the above (needs only an AI service + usage metering)
- **AI Tutor Recommendation** — replaces MVP's rule-based ranking (distance/rating/price) with a learned/heuristic scoring model once there's enough booking/review data to rank against
- **AI Homework Solver** — built on top of the Homework module once it exists
- **AI Test Generator** — built on top of the Exams module once it exists

Design implication for Phase 2 (architecture): the backend gets a dedicated **AI Service module** from the start (isolated from core domain logic, calls out to an LLM API, handles rate limiting/usage cost tracking) even though it isn't wired to endpoints until this phase — so we don't have to retrofit auth/logging/quota plumbing later. See Phase 2 architecture doc for the service boundary.

## Deferred to Post-MVP (still out of scope, no near-term commitment)

- Wallet (stored-value balance) — payments go direct via Razorpay only
- Coupons / discount engine
- Referral program
- Blogs / CMS
- Google Login / Apple Login (email + OTP only for MVP; social login added once auth core is stable)
- Advanced analytics/BI dashboards (Chart.js gets basic counts only in MVP)
- Audit log UI (audit logging infra is included from day one for compliance, but no dedicated UI yet)

## Why this cut

A marketplace's core value is: tutors are discoverable and verifiable, bookings actually happen, sessions actually occur (online or offline), and money moves safely. Everything deferred is a retention/growth multiplier, not a day-one necessity — adding them before the core loop works is wasted surface area.
