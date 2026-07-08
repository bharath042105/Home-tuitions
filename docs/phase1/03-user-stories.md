# User Stories — MVP

Format: `US-<role>-<n>`: As a <role>, I want to <action>, so that <benefit>. Acceptance criteria (AC) listed below each.

## Student / Parent

**US-STU-01**: As a Student, I want to register/login with email or OTP, so that I can access the platform securely.
- AC: Duplicate email/phone rejected with clear error. OTP expires in 5 min, max 3 verify attempts.

**US-STU-02**: As a Parent, I want to create a profile for my child (Student) and manage it, so that I can book on their behalf.
- AC: Parent account can link 1+ Student sub-profiles; booking/payment attributed to Parent, session attributed to Student.

**US-STU-03**: As a Student, I want to search for tutors near me by subject and price, so that I find relevant, affordable options.
- AC: Search returns results sorted by distance by default; filters (price, rating, mode, subject) combine with AND logic; empty state shown if no match.

**US-STU-04**: As a Student, I want to see a tutor's verified badge, ratings, and reviews before booking, so that I can trust my choice.
- AC: Unverified tutors never appear in search or are bookable.

**US-STU-05**: As a Student, I want to request a booking for a specific date/time and mode, so that I can schedule a session.
- AC: Cannot select a slot outside tutor's declared availability; request shows `PENDING` until tutor responds.

**US-STU-06**: As a Student, I want to pay securely in-app once a tutor accepts, so that the booking is confirmed.
- AC: Payment failure leaves booking `PENDING_PAYMENT`, retry allowed within the 30-min window before auto-release.

**US-STU-07**: As a Student, I want to join my online class via the app at the scheduled time, so that I don't need external tools.
- AC: "Join" button enabled only within [start-10min, end+10min] window.

**US-STU-08**: As a Student, I want to mark attendance after an offline session, so that payment is released to the tutor.
- AC: Attendance prompt appears within 24h post-session; mismatch with tutor's mark raises a dispute.

**US-STU-09**: As a Student, I want to chat with my tutor about a booking, so that we can coordinate details.
- AC: Chat thread scoped to a booking; message history persists after session ends.

**US-STU-10**: As a Student, I want to rate and review my tutor after a completed session, so that I can share feedback and help others choose.
- AC: One review per booking; review only enabled after session marked `COMPLETED`.

**US-STU-11**: As a Student, I want to raise a support ticket if something goes wrong, so that I get help from the platform.

## Tutor

**US-TUT-01**: As a Tutor, I want to create a detailed profile with subjects, rate, and availability, so that students can find and book me.

**US-TUT-02**: As a Tutor, I want to upload my ID and qualification documents for verification, so that I can start receiving bookings.
- AC: Cannot receive booking requests until status = `VERIFIED`; rejected submissions show admin's reason and allow resubmission.

**US-TUT-03**: As a Tutor, I want to accept, reject, or propose a new time for a booking request, so that I control my schedule.
- AC: No action within response window → request auto-expires, visible in tutor's history as `EXPIRED`.

**US-TUT-04**: As a Tutor, I want to see my upcoming and past sessions in one dashboard, so that I can manage my schedule.

**US-TUT-05**: As a Tutor, I want to mark attendance for offline sessions, so that I get paid.

**US-TUT-06**: As a Tutor, I want to see my earnings and payout status, so that I know what I'll be paid and when.

**US-TUT-07**: As a Tutor, I want to chat with my student/parent about a booking, so that I can coordinate.

**US-TUT-08**: As a Tutor, I want to receive push notifications for new booking requests, so that I can respond quickly and not lose the lead.

## Admin

**US-ADM-01**: As an Admin, I want a queue of pending tutor verifications with document previews, so that I can approve/reject efficiently.
- AC: Queue sortable by submission date (oldest first, SLA visibility); approve/reject requires a reason on reject.

**US-ADM-02**: As an Admin, I want to view and suspend any user account, so that I can respond to abuse/fraud reports.

**US-ADM-03**: As an Admin, I want to view all bookings and resolve attendance disputes, so that payment disputes are handled fairly.

**US-ADM-04**: As an Admin, I want a dashboard of key metrics (users, tutors, bookings, revenue), so that I can monitor platform health.

**US-ADM-05**: As an Admin, I want to view and respond to support tickets, so that user issues are resolved.
