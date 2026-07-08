# Software Requirements Specification (SRS)
## Home Tuitions — MVP

Reference: [00-mvp-scope.md](00-mvp-scope.md), [01-prd.md](01-prd.md)

## 1. Functional Requirements

### FR-1 Authentication
- FR-1.1 User can register with email + password (Student, Parent, Tutor roles).
- FR-1.2 User can log in with email/password, receive JWT access token (15 min expiry) + refresh token (7 day expiry, rotated on use).
- FR-1.3 Mobile users can log in/register via OTP sent to phone number (SMS).
- FR-1.4 Passwords stored using BCrypt (cost factor ≥ 12).
- FR-1.5 Refresh tokens are stored server-side (Redis) and revocable (logout, logout-all-devices).
- FR-1.6 Rate limiting on login/OTP endpoints: max 5 attempts / 15 min per IP+identifier.
- FR-1.7 All auth failures and role changes are written to an audit log table.

### FR-2 Profile Management
- FR-2.1 Student/Parent profile: name, photo, contact, address, grade/subjects of interest.
- FR-2.2 Tutor profile: bio, subjects taught, qualifications, experience, hourly rate, teaching mode (online/offline/both), service area (radius from a base location), availability calendar.
- FR-2.3 Tutor must upload ≥1 ID document + ≥1 qualification document before profile can be submitted for verification.
- FR-2.4 Admin reviews tutor submission → Approve / Reject (with reason) / Request more info.
- FR-2.5 Only `VERIFIED` tutors appear in search results or can receive booking requests.

### FR-3 Tutor Discovery
- FR-3.1 Search by subject, price range, rating, teaching mode, availability day/time.
- FR-3.2 Nearby search: given student lat/lng, return verified tutors within their service radius, sorted by distance (PostGIS or Haversine query).
- FR-3.3 Tutor profile page shows rating, review count, verified badge, subjects, rate, response time.

### FR-4 Booking
- FR-4.1 Student/Parent sends a booking request for a specific tutor, subject, date/time, mode (online/offline), duration.
- FR-4.2 Tutor can Accept / Reject / Propose alternate time within a configurable response window (default 24h); unactioned requests auto-expire.
- FR-4.3 On Accept, payment must be completed within 30 minutes to confirm the booking, else it's released.
- FR-4.4 No double-booking: a tutor cannot hold two `CONFIRMED` bookings with overlapping time windows (enforced at DB + application layer).
- FR-4.5 Cancellation policy: student cancels ≥24h before → full refund; <24h → partial per policy; tutor cancels any time → full refund + tutor reliability score impact.

### FR-5 Online Classroom
- FR-5.1 A `CONFIRMED` online booking generates an Agora channel + token, accessible only to the two matched participants, active only during the booked window (+ grace period).
- FR-5.2 Session start/end timestamps recorded automatically for payout/dispute evidence.

### FR-6 Offline Tuition
- FR-6.1 Both tutor and student/parent must mark attendance (present/absent) within 24h of scheduled session end.
- FR-6.2 Mismatch (tutor says present, student says absent, or vice versa) creates a dispute ticket routed to Admin.

### FR-7 Payments
- FR-7.1 Razorpay order created on booking acceptance; payment captured before booking is `CONFIRMED`.
- FR-7.2 Funds held in platform ledger until session marked complete (both-side confirmation or 48h auto-confirm).
- FR-7.3 Tutor payout ledger accrues confirmed-session earnings minus platform commission; manual payout batch processed by admin (MVP).
- FR-7.4 Refunds processed via Razorpay refund API per cancellation policy (FR-4.5).
- FR-7.5 All payment state transitions are logged (audit trail, immutable).

### FR-8 Chat
- FR-8.1 Real-time 1:1 text chat between the two participants of a booking, over WebSocket (STOMP over SockJS), persisted to DB, delivered when offline via FCM push.

### FR-9 Reviews & Ratings
- FR-9.1 Student/Parent can submit a 1–5 star rating + text review after a session is marked complete; one review per booking.
- FR-9.2 Tutor's aggregate rating recalculated on new review (materialized/cached, not computed live on every search).

### FR-10 Notifications
- FR-10.1 Push (FCM) + in-app notification on: booking request/accept/reject, payment success/failure, session reminder (1h before), chat message, verification status change.

### FR-11 Admin Dashboard
- FR-11.1 Tutor verification queue with document viewer, approve/reject actions.
- FR-11.2 User management: view/suspend/reinstate any account.
- FR-11.3 Booking oversight: view all bookings, filter by status, manually resolve disputes.
- FR-11.4 Basic analytics: total users, tutors, bookings, revenue (daily/weekly/monthly counts via Chart.js).
- FR-11.5 Support ticket queue: view, respond, close tickets raised by any role.

## 2. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | P95 API latency < 300ms for read endpoints, < 800ms for write/payment endpoints |
| Availability | 99.5% uptime target for MVP (single-region AWS) |
| Scalability | Stateless backend (JWT, no server session) → horizontally scalable behind ALB/Nginx |
| Security | OWASP Top 10 mitigations; TLS everywhere; secrets in AWS Secrets Manager, not env files in repo |
| Data Privacy | PII (documents, phone, address) encrypted at rest (S3 SSE, DB column-level for sensitive fields); access logged |
| Auditability | All role changes, payment transitions, verification decisions are immutably logged with actor + timestamp |
| Compatibility | Website: latest 2 versions of Chrome/Firefox/Safari/Edge, responsive down to 360px width |
| Localization | English only for MVP; i18n-ready structure (no hardcoded strings in components) |
| Observability | Structured JSON logs, correlation ID per request, metrics exported (Prometheus format) |

## 3. External Interface Requirements

- **Razorpay** — Orders API, Webhooks (payment.captured, payment.failed, refund.processed) — webhook signature verification mandatory.
- **Agora** — token server generates short-lived RTC tokens per session, scoped to channel + uid.
- **Google Maps Platform** — Geocoding API (address → lat/lng), Places Autocomplete (address entry).
- **FCM** — push notification delivery, per-device token registration/rotation.

## 4. Data Retention

- Chat messages: retained indefinitely (dispute evidence), soft-delete only.
- Documents (tutor verification): retained for the duration of the tutor's active account + 1 year post-deactivation (regulatory/dispute window), then purged.
- Audit logs: retained 3 years minimum.
